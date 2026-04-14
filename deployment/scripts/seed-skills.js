#!/usr/bin/env node
'use strict';
/**
 * seed-skills.js — 批量导入 SKILL.md 到 LobeHub agent_skills 表
 *
 * 执行流程：
 *   1. 扫描所有 SKILL.md（li-hr-skill + hr-agents 各 Agent 的 skills/）
 *   2. 解析 frontmatter（name、description）+ 正文（content）
 *   3. UPSERT 到 agent_skills 表
 *   4. 按 AGENT.md 的 skills 列表，更新 agents.agency_config 关联技能
 */

const { Client } = require('pg');
const fs   = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://postgres:HrAI2024!@localhost:5432/hr_lobechat';

const BASE = path.resolve(__dirname, '../..');

// 所有 SKILL.md 的扫描根目录
const SKILL_ROOTS = [
  path.join(BASE, 'li-hr-skill'),
  path.join(BASE, 'hr-agents'),
];

// 8 个 Agent 目录（用于读取 skills 列表）
const AGENT_DIRS = [
  '01-hr-strategy',
  '02-talent-acquisition',
  '03-performance',
  '04-total-rewards',
  '05-learning-development',
  '06-employee-experience',
  '07-compliance-risk',
  '08-hr-analytics',
];

// ─── 工具 ────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const yaml = m[1];
  const get  = (key) => {
    const r = yaml.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    return r ? r[1].trim().replace(/^['"]|['"]$/g, '') : null;
  };
  return { name: get('name'), description: get('description') };
}

function getBody(content) {
  const m = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return m ? content.slice(m[0].length).trim() : content.trim();
}

/** 递归查找目录下所有 SKILL.md */
function findSkillFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSkillFiles(full));
    } else if (entry.name === 'SKILL.md') {
      results.push(full);
    }
  }
  return results;
}

/** 解析 AGENT.md frontmatter 的 skills 列表 */
function parseAgentSkills(agentDir) {
  const agentMd = path.join(agentDir, 'AGENT.md');
  if (!fs.existsSync(agentMd)) return [];
  const content = fs.readFileSync(agentMd, 'utf-8');
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return [];
  const yaml = m[1];

  // 逐行解析 skills 块（收集所有 "  - path" 行）
  const lines = yaml.split('\n');
  let inSkills = false;
  const skillPaths = [];
  for (const line of lines) {
    if (/^skills:\s*$/.test(line)) { inSkills = true; continue; }
    if (inSkills) {
      if (/^\S/.test(line)) break; // 遇到非缩进行，结束
      const skillMatch = line.match(/^\s+-\s+([^#]+)/);
      if (skillMatch) {
        const relPath = skillMatch[1].trim();
        skillPaths.push(path.resolve(agentDir, relPath));
      }
    }
  }
  return skillPaths;
}

function fmt(msg, style = '') {
  const styles = { ok: '\x1b[32m', warn: '\x1b[33m', err: '\x1b[31m', dim: '\x1b[2m', bold: '\x1b[1m' };
  return `${styles[style] || ''}${msg}\x1b[0m`;
}

// ─── 主函数 ───────────────────────────────────────────────────────

async function main() {
  console.log('\n' + fmt('════════════════════════════════════════════════', 'bold'));
  console.log(fmt('  🔧 HR Skill 导入脚本  v1.0', 'bold'));
  console.log(fmt('════════════════════════════════════════════════\n', 'bold'));

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    // ── 1. 获取用户 ID ──────────────────────────────────────────
    const { rows: users } = await client.query('SELECT id FROM users LIMIT 1');
    if (!users.length) throw new Error('未找到用户，请先在 LobeHub 注册账号');
    const userId = users[0].id;
    console.log(fmt(`  👤 用户 ID: ${userId.substring(0, 16)}...`, 'dim'));

    // ── 2. 扫描所有 SKILL.md ────────────────────────────────────
    const allSkillFiles = [];
    for (const root of SKILL_ROOTS) {
      allSkillFiles.push(...findSkillFiles(root));
    }
    // 去重（按绝对路径）
    const uniqueFiles = [...new Set(allSkillFiles)];
    console.log(fmt(`\n  📂 发现 ${uniqueFiles.length} 个 SKILL.md\n`, 'bold'));

    // ── 3. 导入到 agent_skills ──────────────────────────────────
    const skillIdentifierMap = {}; // filePath → identifier
    let imported = 0, skipped = 0, failed = 0;

    for (const filePath of uniqueFiles) {
      const content  = fs.readFileSync(filePath, 'utf-8');
      const fm       = parseFrontmatter(content);
      const body     = getBody(content);
      const dirName  = path.basename(path.dirname(filePath));
      const name     = fm.name || dirName;
      const desc     = fm.description || name;
      const identifier = dirName; // 用目录名作为唯一标识符

      process.stdout.write(`  ⚙️  ${identifier.padEnd(35)} ... `);

      try {
        // 检查是否已存在
        const { rows: existing } = await client.query(
          'SELECT id, identifier FROM agent_skills WHERE identifier = $1 AND user_id = $2',
          [identifier, userId]
        );

        const skillId = existing.length > 0
          ? existing[0].id
          : randomUUID().replace(/-/g, '').substring(0, 24);

        await client.query(`
          INSERT INTO agent_skills (id, name, description, identifier, source, manifest, content, user_id, created_at, updated_at, accessed_at)
          VALUES ($1, $2, $3, $4, 'user', $5::jsonb, $6, $7, NOW(), NOW(), NOW())
          ON CONFLICT (user_id, name)
          DO UPDATE SET
            description = EXCLUDED.description,
            content     = EXCLUDED.content,
            manifest    = EXCLUDED.manifest,
            updated_at  = NOW()
        `, [
          skillId,
          name,
          desc,
          identifier,
          JSON.stringify({ name, description: desc, version: '1.0.0', author: 'HR AI System' }),
          body,
          userId,
        ]);

      skillIdentifierMap[path.normalize(filePath)] = identifier;
        console.log(fmt(`✅ ${name}`, 'ok'));
        if (existing.length > 0) skipped++; else imported++;

      } catch (err) {
        console.log(fmt(`❌ ${err.message}`, 'err'));
        failed++;
      }
    }

    // ── 4. 关联 Agents ──────────────────────────────────────────
    console.log(fmt('\n  🔗 关联 Agents 与 Skills...\n', 'bold'));

    // Agent 目录名 → title 关键词映射
    const AGENT_TITLE_KEYWORDS = {
      '01-hr-strategy':          'HR战略',
      '02-talent-acquisition':   '招聘',
      '03-performance':          '绩效',
      '04-total-rewards':        '薪酬',
      '05-learning-development': '学习',
      '06-employee-experience':  '员工体验',
      '07-compliance-risk':      '合规',
      '08-hr-analytics':         '数据分析',
    };

    for (const agentDirName of AGENT_DIRS) {
      const agentDir = path.join(BASE, 'hr-agents', agentDirName);
      const skillPaths = parseAgentSkills(agentDir);
      const keyword = AGENT_TITLE_KEYWORDS[agentDirName] || agentDirName;

      const { rows: agentRows } = await client.query(
        "SELECT id, title, agency_config FROM agents WHERE title LIKE $1",
        [`%${keyword}%`]
      );

      if (!agentRows.length) {
        console.log(fmt(`  ⚠️  找不到 Agent: ${agentDirName}`, 'warn'));
        continue;
      }

      const agent = agentRows[0];
      const skillIdentifiers = skillPaths
        .map(p => skillIdentifierMap[path.normalize(p)] || path.basename(path.dirname(p)))
        .filter(Boolean);

      // 查询这些 skill 的实际 ID
      const { rows: skillRows } = await client.query(
        'SELECT id, identifier FROM agent_skills WHERE identifier = ANY($1) AND user_id = $2',
        [skillIdentifiers, userId]
      );

      if (!skillRows.length) {
        console.log(fmt(`  ⚠️  ${agent.title}: 未找到关联 Skills`, 'warn'));
        continue;
      }

      // 更新 agency_config（存储 skill ID 列表）
      const existingConfig = agent.agency_config || {};
      const updatedConfig  = {
        ...existingConfig,
        skills: skillRows.map(s => ({ id: s.id, identifier: s.identifier })),
      };

      await client.query(
        'UPDATE agents SET agency_config = $1::jsonb, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(updatedConfig), agent.id]
      );

      console.log(fmt(`  ✅ ${agent.title}`, 'ok') +
        fmt(` → ${skillRows.length} 个 Skills`, 'dim'));
    }

    // ── 汇总 ────────────────────────────────────────────────────
    console.log('\n' + fmt('════════════════════════════════════════════════', 'bold'));
    console.log(fmt('  ✅ 导入完成', 'ok'));
    console.log(`     • 新增：  ${fmt(String(imported), 'ok')}`);
    console.log(`     • 更新：  ${fmt(String(skipped),  'dim')}`);
    console.log(`     • 失败：  ${failed > 0 ? fmt(String(failed), 'err') : '0'}`);
    console.log('\n  🌐 http://localhost:3210/settings/skill  → 查看导入的 Skills');
    console.log(fmt('════════════════════════════════════════════════\n', 'bold'));

    if (failed > 0) process.exit(1);

  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('\n' + fmt(`❌ 脚本执行失败: ${err.message}`, 'err'));
  process.exit(1);
});
