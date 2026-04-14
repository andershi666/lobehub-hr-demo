#!/usr/bin/env node
'use strict';
/**
 * seed.js  —  HR Agent 注入主脚本
 * ──────────────────────────────────────────────────────────────
 * 执行流程：
 *   1. 等待 PostgreSQL 连接就绪（retry 30次，每次 2s）
 *   2. 等待 LobeHub 数据库迁移完成（agents 表出现）
 *   3. 自省 agents 表实际列名（兼容不同 LobeHub 版本）
 *   4. 等待第一个用户注册（自动轮询，最多 10 分钟）
 *   5. 批量 UPSERT 8 个 HR Agents（幂等，可重复执行）
 *
 * 使用：
 *   DATABASE_URL=postgresql://... node seed.js
 *   或由 start.sh 自动调用
 */

const { Client } = require('pg');
const path       = require('path');
const { buildAgentData } = require('./build-prompt');

// ─── 配置 ─────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://postgres:HrAI_DB_2024_SecurePass!@localhost:5432/hr_lobechat';

const AGENTS_BASE = path.resolve(__dirname, '../../hr-agents');
const AGENT_DIRS  = [
  '01-hr-strategy',
  '02-talent-acquisition',
  '03-performance',
  '04-total-rewards',
  '05-learning-development',
  '06-employee-experience',
  '07-compliance-risk',
  '08-hr-analytics',
];

// ─── 工具函数 ─────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function fmt(msg, style = '') {
  const styles = { ok: '\x1b[32m', warn: '\x1b[33m', err: '\x1b[31m', dim: '\x1b[2m', bold: '\x1b[1m' };
  return `${styles[style] || ''}${msg}\x1b[0m`;
}

async function withRetry(fn, { retries = 30, delay = 2000, label = '' } = {}) {
  for (let i = 1; i <= retries; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === retries) throw e;
      process.stdout.write(`  ⏳ ${label} (${i}/${retries})...\r`);
      await sleep(delay);
    }
  }
}

// ─── 数据库连接 ───────────────────────────────────────────────

async function waitForDatabase() {
  console.log('\n' + fmt('  📦 等待数据库连接...', 'bold'));
  await withRetry(async () => {
    const c = new Client({ connectionString: DATABASE_URL, connectionTimeoutMillis: 3000 });
    await c.connect();
    await c.query('SELECT 1');
    await c.end();
  }, { retries: 30, delay: 2000, label: 'PostgreSQL' });
  console.log(fmt('  ✅ 数据库连接成功', 'ok'));
}

async function createClient() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  return client;
}

// ─── Schema 自省 ──────────────────────────────────────────────

/** 等待 LobeHub 迁移完成（agents 表出现） */
async function waitForMigrations(client) {
  console.log('\n' + fmt('  🔄 等待 LobeHub 数据库迁移完成...', 'bold'));
  await withRetry(async () => {
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'agents'
    `);
    if (rows.length === 0) throw new Error('agents table not ready');
  }, { retries: 60, delay: 3000, label: 'LobeHub migrations' });
  console.log(fmt('  ✅ 数据库表就绪', 'ok'));
}

/** 获取 agents 表实际列名（用于兼容不同版本） */
async function introspectAgents(client) {
  const { rows } = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agents'
    ORDER BY ordinal_position
  `);
  const schema = {};
  for (const r of rows) {
    schema[r.column_name] = { type: r.data_type, nullable: r.is_nullable === 'YES' };
  }
  console.log(fmt(`  📋 agents 表共 ${rows.length} 列: ${Object.keys(schema).join(', ')}`, 'dim'));
  return schema;
}

/** 查找用户表（兼容 better-auth / next-auth 不同命名） */
async function findUserTable(client) {
  const candidates = ['users', 'user', 'lobe_users', 'accounts'];
  for (const t of candidates) {
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    `, [t]);
    if (rows.length > 0) return t;
  }
  return null;
}

// ─── 用户等待 ─────────────────────────────────────────────────

/** 等待第一个用户注册，返回其 ID */
async function waitForFirstUser(client) {
  const userTable = await findUserTable(client);

  if (!userTable) {
    console.log(fmt('  ⚠️  未找到用户表，将使用 NULL user_id（系统级 Agent）', 'warn'));
    return null;
  }

  // 立即检查是否已有用户
  const { rows: existing } = await client.query(`SELECT id FROM ${userTable} LIMIT 1`);
  if (existing.length > 0) {
    console.log(fmt(`  ✅ 已找到用户 ID: ${existing[0].id.substring(0, 12)}...`, 'ok'));
    return existing[0].id;
  }

  // 等待用户注册
  console.log('\n' + '═'.repeat(62));
  console.log(fmt('  👤 尚未检测到用户账号', 'warn'));
  console.log('  📌 请打开浏览器访问 ' + fmt('http://localhost:3210', 'bold'));
  console.log('     完成首次账号注册后，本脚本将自动继续...');
  console.log('═'.repeat(62) + '\n');

  for (let i = 0; i < 120; i++) {       // 最多等待 10 分钟
    await sleep(5000);
    const { rows } = await client.query(`SELECT id FROM ${userTable} LIMIT 1`);
    if (rows.length > 0) {
      console.log(fmt(`\n  ✅ 用户已注册！ID: ${rows[0].id.substring(0, 12)}...`, 'ok'));
      return rows[0].id;
    }
    if (i > 0 && i % 12 === 0) {
      console.log(fmt(`  ⏳ 等待注册中... 已等待 ${Math.round(i * 5 / 60)} 分钟`, 'dim'));
    }
  }
  throw new Error('等待用户注册超时（10 分钟）');
}

// ─── Agent 写入 ───────────────────────────────────────────────

/** 检查 Agent 是否已存在（幂等） */
async function agentExists(client, identifier, userId, schema) {
  if (schema['identifier']) {
    const clause = userId ? 'AND user_id = $2' : "AND (user_id IS NULL OR user_id = '')";
    const vals   = userId ? [identifier, userId] : [identifier];
    const { rows } = await client.query(
      `SELECT id FROM agents WHERE identifier = $1 ${clause} LIMIT 1`, vals
    );
    return rows.length > 0;
  }
  // fallback: check by title
  const { rows } = await client.query(
    `SELECT id FROM agents WHERE title = $1 LIMIT 1`, [identifier]
  );
  return rows.length > 0;
}

/**
 * 动态构建 INSERT 语句，只使用 agents 表中实际存在的列。
 * 支持 LobeHub v1 / v2 的不同 schema。
 */
async function upsertAgent(client, data, schema) {
  // 候选列名 → 值 的映射（覆盖 LobeHub 各版本常见列名）
  const candidates = {
    id:             data.id,
    user_id:        data.userId,
    identifier:     data.identifier,
    title:          data.title,
    description:    data.description,
    avatar:         data.avatar,
    tags:           JSON.stringify(data.tags),
    system_role:    data.systemRole,
    // LobeHub v2 可能用 systemRole (camelCase in JSONB)
    model:          data.model,
    provider:       data.provider,
    temperature:    data.temperature,
    max_tokens:     data.maxTokens,
    top_p:          1.0,
    history_count:  20,
    enabled_knowledge_base: false,
    created_at:     new Date(),
    updated_at:     new Date(),
  };

  // 只保留表中实际存在的列
  let cols = Object.keys(candidates).filter(k => schema[k]);

  // 如果 user_id 不可空且值为 null，移除该列
  if (!data.userId && schema['user_id'] && !schema['user_id'].nullable) {
    cols = cols.filter(c => c !== 'user_id');
  }

  const vals   = cols.map(k => candidates[k]);
  const phs    = cols.map((_, i) => `$${i + 1}`);
  const updateSet = cols
    .filter(c => !['id', 'user_id', 'identifier', 'created_at'].includes(c))
    .map(c => `${c} = EXCLUDED.${c}`)
    .join(', ');

  const conflictCol = schema['identifier'] ? 'identifier' : 'id';

  const sql = `
    INSERT INTO agents (${cols.join(', ')})
    VALUES (${phs.join(', ')})
    ON CONFLICT (${conflictCol})
    DO UPDATE SET ${updateSet || 'updated_at = EXCLUDED.updated_at'}
  `;

  await client.query(sql, vals);
}

// ─── 主函数 ───────────────────────────────────────────────────

async function main() {
  console.log('\n' + fmt('████████████████████████████████████████████████', 'bold'));
  console.log(fmt('  🌟 HR AI Agent 注入脚本  v1.0', 'bold'));
  console.log(fmt('████████████████████████████████████████████████\n', 'bold'));

  // 1. 等待 PostgreSQL
  await waitForDatabase();

  const client = await createClient();

  try {
    // 2. 等待迁移
    await waitForMigrations(client);

    // 3. 自省 schema
    console.log('\n' + fmt('  🔍 读取 agents 表结构...', 'bold'));
    const schema = await introspectAgents(client);

    // 4. 等待用户
    console.log('\n' + fmt('  👥 检查用户状态...', 'bold'));
    const userId = await waitForFirstUser(client);

    // 5. 注入 Agents
    console.log('\n' + fmt('  🚀 开始注入 HR Agents...', 'bold') + '\n');
    let seeded = 0, skipped = 0, failed = 0;

    for (const dir of AGENT_DIRS) {
      const dirPath = path.join(AGENTS_BASE, dir);
      process.stdout.write(`  ⚙️  ${dir} ... `);

      try {
        const agentData = buildAgentData(dirPath, userId);

        const exists = await agentExists(client, agentData.identifier, userId, schema);
        if (exists) {
          console.log(fmt('已存在，执行更新', 'dim'));
          await upsertAgent(client, agentData, schema);   // 仍然 UPSERT（更新内容）
          skipped++;
        } else {
          await upsertAgent(client, agentData, schema);
          console.log(fmt(`✅ "${agentData.title}"`, 'ok'));
          seeded++;
        }
      } catch (err) {
        console.log(fmt(`❌ 失败: ${err.message}`, 'err'));
        failed++;
      }
    }

    // ── 结果汇总 ──────────────────────────────────────────
    console.log('\n' + '═'.repeat(62));
    console.log(fmt('  ✅ Agent 注入完成', 'ok'));
    console.log(`     • 新增：  ${fmt(String(seeded),  'ok')}`);
    console.log(`     • 更新：  ${fmt(String(skipped), 'dim')}`);
    console.log(`     • 失败：  ${failed > 0 ? fmt(String(failed), 'err') : '0'}`);
    console.log('\n  🌐 ' + fmt('http://localhost:3210', 'bold') + '  → 助手列表 → 查看 8 个 HR Agent');
    console.log('═'.repeat(62) + '\n');

    if (failed > 0) process.exit(1);

  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('\n' + fmt(`❌ 脚本执行失败: ${err.message}`, 'err'));
  console.error(err.stack);
  process.exit(1);
});
