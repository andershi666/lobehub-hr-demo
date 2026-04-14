# HR AI 系统 - 本地私有化部署指南

基于 [LobeHub](https://lobehub.com) 私有化部署，预置 8 个专业 HR Agent（35个Skills）。

## 目录结构

```
deployment/
├── docker-compose.yml     # 完整服务栈（LobeHub + PG + Redis + RustFS）
├── .env.example           # 环境变量模板
├── .env                   # 实际配置（git忽略）
├── start.sh               # 一键启动 + 自动注入 Agent
├── stop.sh                # 停止所有服务
├── scripts/
│   ├── package.json       # 依赖：仅需 pg（node-postgres）
│   ├── seed.js            # 主脚本：等待就绪 → 注入8个Agent
│   └── build-prompt.js    # 读取 AGENT.md + SKILL.md → 构建 systemRole
└── data/                  # 持久化数据（自动创建）
    ├── postgresql/
    ├── redis/
    └── rustfs/
```

## 快速开始

### 前置要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Docker Desktop | >= 24.0 | 运行所有服务 |
| Node.js | >= 18.0 | 执行 Agent 注入脚本 |

### 第一步：配置环境变量

```bash
cd deployment
cp .env.example .env
```

编辑 `.env`，**必填项只有一个**：

```env
# 必填：至少配置一个 AI API Key
ANTHROPIC_API_KEY=sk-ant-xxxx    # 推荐（HR Agent 默认使用 Claude）
# OPENAI_API_KEY=sk-xxxx         # 或者 OpenAI
```

其他配置（密码、端口等）已预设默认值，本地开发可直接使用。

### 第二步：一键启动

```bash
chmod +x start.sh stop.sh
./start.sh
```

脚本自动完成：
1. 拉取 Docker 镜像
2. 启动所有服务（LobeHub + PostgreSQL + Redis + RustFS）
3. 等待服务健康检查通过
4. 运行 Agent 注入脚本

### 第三步：注册账号

打开浏览器访问 **http://localhost:3210**，完成首次账号注册。

> 注入脚本会自动检测到账号创建，将 8 个 HR Agent 写入你的账号下。

### 第四步：开始使用

访问「助手」列表，即可看到预置的 8 个 HR Agent：

| Agent | 图标 | 核心Skills |
|-------|------|-----------|
| HR战略与组织设计 | 🏛️ | strategic-talent-planning, workforce-budgeting, org-design, culture-strategy |
| 招聘与人才获取 | 🎯 | recruitment-execution, flexible-workforce, talent-mobility, employer-brand |
| 绩效管理 | 📈 | goal-alignment, performance-coaching, performance-review, performance-value-attribution, attendance-intelligence |
| 全面薪酬与激励 | 💰 | promotion-salary-review, payroll-processing, compensation-compliance, benefits-design, long-term-incentive |
| 学习与人才发展 | 🎓 | capability-assessment, learning-design, talent-development, career-development, knowledge-management |
| 员工体验与关系 | 🌟 | onboarding-experience, employee-service, offboarding-alumni, culture-engagement, conflict-mediation |
| HR合规与风控 | ⚖️ | employment-compliance, compensation-compliance, data-privacy, risk-early-warning |
| HR数据分析与决策支持 | 📊 | hr-analytics, talent-prediction, business-impact, hr-dashboard |

## 手动注入（如需重新注入）

```bash
cd deployment/scripts
npm install
DATABASE_URL="postgresql://postgres:HrAI_DB_2024_SecurePass!@localhost:5432/hr_lobechat" node seed.js
```

## 常用运维命令

```bash
# 查看主应用日志
docker logs -f hr-lobehub

# 查看所有服务状态
docker compose ps

# 重启主应用
docker compose restart lobehub

# 更新到最新版本
docker compose pull && docker compose up -d

# 停止所有服务（保留数据）
./stop.sh

# 完全清除（包括数据）⚠️ 不可恢复
docker compose down -v && rm -rf data/
```

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| HR AI 系统 | http://localhost:3210 | 主应用入口 |
| S3 控制台 | http://localhost:9001 | 文件存储管理 |

## 端口占用说明

| 端口 | 服务 |
|------|------|
| 3210 | LobeHub 主应用 |
| 9000 | RustFS S3 API |
| 9001 | RustFS 控制台 |

如有端口冲突，在 `.env` 中修改 `LOBE_PORT`、`S3_PORT`、`S3_CONSOLE_PORT`。

## 升级 HR Agent 内容

当 `hr-agents/` 或 `li-hr-skill/` 下的内容更新后，重新运行注入脚本即可（支持幂等更新）：

```bash
cd deployment/scripts && node seed.js
```
