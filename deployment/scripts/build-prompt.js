'use strict';
/**
 * build-prompt.js
 * ────────────────────────────────────────────────────────────────
 * 读取 hr-agents/ 下的 AGENT.md 及引用的 SKILL.md，
 * 构建每个 HR Agent 的完整 systemRole（系统提示词）。
 *
 * systemRole 结构：
 *   1. AGENT.md 正文（角色定位 + 技能矩阵 + 协同关系 + 注意事项）
 *   2. ── 技能工作手册 ──（每个 SKILL.md 的精华提炼）
 *      每个 Skill 包含：角色职责 / 工作步骤 / 主要产出 / 关键反模式
 */

const fs   = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// ─── Agent 视觉 & 模型配置 ────────────────────────────────────
const AGENT_PROFILES = {
  '01-hr-strategy':          { avatar: '🏛️', model: 'claude-sonnet-4-6', provider: 'anthropic', temperature: 0.7 },
  '02-talent-acquisition':   { avatar: '🎯', model: 'claude-sonnet-4-6', provider: 'anthropic', temperature: 0.7 },
  '03-performance':          { avatar: '📈', model: 'claude-sonnet-4-6', provider: 'anthropic', temperature: 0.6 },
  '04-total-rewards':        { avatar: '💰', model: 'claude-sonnet-4-6', provider: 'anthropic', temperature: 0.5 },
  '05-learning-development': { avatar: '🎓', model: 'claude-sonnet-4-6', provider: 'anthropic', temperature: 0.7 },
  '06-employee-experience':  { avatar: '🌟', model: 'claude-sonnet-4-6', provider: 'anthropic', temperature: 0.8 },
  '07-compliance-risk':      { avatar: '⚖️', model: 'claude-sonnet-4-6', provider: 'anthropic', temperature: 0.3 },
  '08-hr-analytics':         { avatar: '📊', model: 'claude-sonnet-4-6', provider: 'anthropic', temperature: 0.4 },
};

// ─── Markdown 解析工具 ────────────────────────────────────────

/**
 * 从 Markdown 文件中解析 YAML frontmatter。
 * 返回 { name, description, skills: [relPath, ...] }
 */
function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { skills: [] };

  const yaml = m[1];
  const result = { skills: [] };

  const nameM = yaml.match(/^name:\s*(.+)$/m);
  if (nameM) result.name = nameM[1].trim();

  // 解析 skills 列表（支持行内 # 注释）
  const block = yaml.match(/^skills:\s*\n([\s\S]*?)(?=\n\S|$)/m);
  if (block) {
    result.skills = block[1]
      .split('\n')
      .filter(l => /^\s+-\s+/.test(l))
      .map(l => l.replace(/^\s+-\s+/, '').split('#')[0].trim())
      .filter(Boolean);
  }

  return result;
}

/** 返回 frontmatter 之后的正文内容 */
function getBody(content) {
  const m = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return m ? content.slice(m[0].length).trim() : content.trim();
}

/**
 * 提取指定标题的 ## 章节内容（返回空字符串如果不存在）。
 */
function extractSection(md, title) {
  const esc = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re  = new RegExp(`(?:^|\n)## ${esc}\\s*\n([\\s\\S]*?)(?=\n## |\n# |$)`, 'i');
  const m   = md.match(re);
  return m ? m[1].trim() : '';
}

// ─── Skill 精华提炼 ───────────────────────────────────────────

/**
 * 将一个 SKILL.md 压缩为 ~500 词的精华摘要，
 * 保留：角色职责 / 工作步骤标题 / 产出物 / 关键反模式标题。
 */
function condenseSkill(skillContent, skillDirName) {
  const fm      = parseFrontmatter(skillContent);
  const body    = getBody(skillContent);
  const name    = fm.name || skillDirName;

  // 1. 角色职责（前 600 字符）
  const role = (
    extractSection(body, '你的角色与职责') ||
    extractSection(body, 'Role & Responsibilities') ||
    body.split('\n\n').slice(1, 3).join('\n\n')
  ).substring(0, 600);

  // 2. 工作流程：只取 ### 标题（不含模板/代码块）
  const workflowSteps = extractSection(body, '工作流程')
    .split('\n')
    .filter(l => /^###\s/.test(l))
    .slice(0, 6)
    .join('\n');

  // 3. 产出物（前 300 字符）
  const deliverables = extractSection(body, '输出交付物').substring(0, 300);

  // 4. 反模式：只取 ### 标题
  const antiPatterns = extractSection(body, '❌ NEVER Do')
    .split('\n')
    .filter(l => /^###\s/.test(l))
    .slice(0, 5)
    .join('\n');

  const parts = [
    `### 🔧 ${name}`,
    role,
    workflowSteps  ? `**工作步骤**：\n${workflowSteps}` : '',
    deliverables   ? `**主要产出**：\n${deliverables}` : '',
    antiPatterns   ? `**关键注意事项（NEVER Do）**：\n${antiPatterns}` : '',
  ].filter(Boolean);

  return parts.join('\n\n');
}

// ─── 主导出函数 ───────────────────────────────────────────────

/**
 * 读取 agentDirPath 下的 AGENT.md，
 * 解析引用的所有 SKILL.md，构建完整的 systemRole，
 * 返回可直接写入数据库的 Agent 数据对象。
 *
 * @param {string} agentDirPath - Agent 目录绝对路径
 * @param {string|null} userId  - LobeHub 用户 ID（null = 系统 Agent）
 * @returns {object} agentData
 */
function buildAgentData(agentDirPath, userId) {
  const agentId     = path.basename(agentDirPath);
  const agentMdPath = path.join(agentDirPath, 'AGENT.md');

  if (!fs.existsSync(agentMdPath)) {
    throw new Error(`AGENT.md not found at: ${agentMdPath}`);
  }

  const content = fs.readFileSync(agentMdPath, 'utf-8');
  const fm      = parseFrontmatter(content);
  const body    = getBody(content);

  // ── 提取 title（AGENT.md 正文第一个 H1）
  const titleM = body.match(/^#\s+(.+)$/m);
  const title  = titleM ? titleM[1].trim() : (fm.name || agentId);

  // ── 提取 description（H1 后第一段，最多 200 字符）
  const afterTitle = body.replace(/^#\s+.+\n+/, '').trim();
  const description = afterTitle
    .split(/\n\n/)[0]
    .replace(/\n/g, ' ')
    .replace(/\*\*/g, '')
    .trim()
    .substring(0, 200);

  // ── 构建 systemRole ──────────────────────────────────────
  // Part 1：Agent 完整定义（AGENT.md 正文）
  let systemRole = body;

  // Part 2：各 Skill 精华（SKILL.md 压缩版）
  const skillSummaries = [];
  for (const relPath of fm.skills) {
    const absPath = path.resolve(agentDirPath, relPath);
    if (!fs.existsSync(absPath)) {
      process.stdout.write(`    ⚠️  Skill not found: ${relPath}\n`);
      continue;
    }
    const skillContent = fs.readFileSync(absPath, 'utf-8');
    const skillDir     = path.basename(path.dirname(absPath));
    skillSummaries.push(condenseSkill(skillContent, skillDir));
  }

  if (skillSummaries.length > 0) {
    systemRole +=
      '\n\n---\n\n## 🔧 技能工作手册\n\n' +
      '以下是你可以调用的每个专业技能的操作指引：\n\n' +
      skillSummaries.join('\n\n---\n\n');
  }

  // ── 元数据 ──────────────────────────────────────────────
  const profile = AGENT_PROFILES[agentId] || {
    avatar: '🤖', model: 'claude-sonnet-4-6', provider: 'anthropic', temperature: 0.7,
  };

  const tagWords = agentId
    .replace(/^\d+-/, '')
    .split('-')
    .map(w => w[0].toUpperCase() + w.slice(1));

  return {
    id:          randomUUID().replace(/-/g, '').substring(0, 24),
    userId,
    identifier:  fm.name || agentId,
    title,
    description,
    avatar:      profile.avatar,
    tags:        ['HR', tagWords.join(' ')],
    systemRole,
    model:       profile.model,
    provider:    profile.provider,
    temperature: profile.temperature,
    maxTokens:   8192,
  };
}

module.exports = { buildAgentData };
