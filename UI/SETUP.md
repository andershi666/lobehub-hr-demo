# HR AI 系统 - 快速启动指南

## 目录结构

```
UI/
├── .env.example              ← 环境变量模板（复制为 .env.local）
├── hr-agent-configs/         ← 8个 HR Agent 的 Lobe-chat 导入配置
│   ├── 01-hr-strategy.json
│   ├── 02-talent-acquisition.json
│   ├── 03-performance.json
│   ├── 04-total-rewards.json
│   ├── 05-learning-development.json
│   ├── 06-employee-experience.json
│   ├── 07-compliance-risk.json
│   └── 08-hr-analytics.json
├── mcp-hr-tools/             ← MCP 数据集成工具服务器
│   ├── feishu-hr/            ← 飞书 HR（推荐优先接入）
│   ├── dingtalk-hr/          ← 钉钉 HR
│   └── sap-hr/               ← SAP HCM / SuccessFactors
└── hr-workbench/             ← HR 工作台 UI 组件
    ├── index.html            ← 工作台静态预览（直接双击打开）
    └── data/agents.ts        ← Agent 配置数据（集成到 Lobe-chat 使用）
```

---

## Phase 1：部署 Lobe-chat（30分钟）

### 1.1 克隆项目

```bash
# 在 UI/ 目录下执行（注意末尾的 . ）
cd "D:/shixiaoguang/Documents/LI Project/Agent-demo/UI"
git clone https://github.com/lobehub/lobe-chat.git .
```

### 1.2 安装依赖

```bash
# 需要 Node.js >= 18，推荐 Node 20
node -v

# 安装 pnpm（如未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 1.3 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，至少填入：
# 1. OPENAI_API_KEY（通义千问 API Key）
# 2. OPENAI_BASE_URL（通义千问兼容地址）
```

> **获取通义千问 API Key**：访问 https://dashscope.console.aliyun.com/ 注册后免费获取

### 1.4 初始化数据库并启动

```bash
# 初始化数据库
pnpm run db:push

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3010 ✅

---

## Phase 2：导入 8 个 HR Agent（15分钟）

### 方式一：通过 Lobe-chat 界面导入（推荐）

1. 访问 http://localhost:3010
2. 左侧栏 → 「助手」→「添加助手」→「从文件导入」
3. 依次导入 `hr-agent-configs/` 下的 8 个 JSON 文件

### 方式二：通过 API 批量导入

```bash
# 使用 Lobe-chat 的助手导入 API
for file in hr-agent-configs/*.json; do
  curl -X POST http://localhost:3010/api/agents/import \
    -H "Content-Type: application/json" \
    -d @"$file"
done
```

### 验证导入成功

导入后在「助手」列表中应看到：
- 🏛️ HR战略与组织设计
- 🎯 招聘与人才获取
- 📊 绩效管理专家
- 💰 全面薪酬与激励
- 🎓 学习与人才发展
- ❤️ 员工体验与关系
- ⚖️ HR合规与风控
- 📈 HR数据分析

---

## Phase 3：接入外部系统（飞书优先）

### 3.1 安装 MCP 工具依赖

```bash
# 安装飞书 HR MCP 依赖
cd mcp-hr-tools/feishu-hr
pnpm install
pnpm build

# 验证构建成功
ls dist/index.js
```

### 3.2 配置飞书 App

1. 访问 https://open.feishu.cn/ 创建企业自建应用
2. 申请以下权限：
   - `contact:user.base:readonly` 获取用户基本信息
   - `contact:department.base:readonly` 获取部门信息
   - `attendance:record:readonly` 读取考勤记录
   - `approval:instance:readonly` 查询审批实例
   - `im:message:create_as_bot` 发送消息
3. 将 App ID 和 App Secret 填入 `.env.local`

### 3.3 在 Lobe-chat 中注册 MCP 服务器

在 Lobe-chat 设置 → 工具 → MCP 服务器，添加：

```json
{
  "name": "飞书HR",
  "transport": "stdio",
  "command": "node",
  "args": ["../mcp-hr-tools/feishu-hr/dist/index.js"],
  "env": {
    "FEISHU_APP_ID": "your-app-id",
    "FEISHU_APP_SECRET": "your-app-secret"
  }
}
```

---

## Phase 4：HR 工作台预览

### 立即预览静态工作台

```bash
# 直接在浏览器打开
start hr-workbench/index.html

# 或通过本地服务器
npx serve hr-workbench -p 8080
```

### 集成到 Lobe-chat（需修改源码）

将 `hr-workbench/index.html` 的布局和 `data/agents.ts` 集成方式：

1. 在 `src/app/(main)/` 下新建 `hr-workbench/` 路由目录
2. 创建 `page.tsx` 参照 `hr-workbench/index.html` 的布局
3. 在侧边栏导航中添加工作台入口

---

## Phase 5：导入 HR 知识库

1. Lobe-chat → 知识库 → 新建知识库「HR专业知识」
2. 上传以下文件：
   - `../01人力资源管理全景.md`
   - `../li-hr-skill/` 下的所有 SKILL.md 文件（25个）
3. 为每个 HR Agent 绑定知识库：Agent 设置 → 知识库 → 选择「HR专业知识」

---

## 常见问题

**Q: 通义千问 API 限速怎么办？**
A: 在 Lobe-chat 设置中开启「请求合并」，或切换到 `qwen-plus`（更快速）模型

**Q: MCP 工具连接失败？**
A: 检查 `mcp-hr-tools/` 下是否已执行 `pnpm build`，以及日志路径是否正确

**Q: 飞书权限不足？**
A: 飞书企业自建应用需要管理员审批权限，确保 App 已通过审核并在企业内发布

**Q: 如何切换到钉钉 HR？**
A: 在 `.env.local` 中设置钉钉 App Key/Secret，然后在 Lobe-chat MCP 设置中改为 `dingtalk-hr`

---

## 技术栈

| 组件 | 技术 |
|------|------|
| 主框架 | Lobe-chat (Next.js 14 + React) |
| 大模型 | 通义千问 (qwen-max) / 智谱 / 文心 |
| 数据库 | SQLite（开发）/ PostgreSQL（生产）|
| MCP 工具 | @modelcontextprotocol/sdk + TypeScript |
| 外部集成 | 飞书 OpenAPI / 钉钉 OpenAPI / SAP OData |
