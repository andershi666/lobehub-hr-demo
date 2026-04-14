# HR Agent 体系

基于《人力资源管理全景》三层架构与19个业务场景，将25个已有Skills + 10个新建Skills，
组织为 **8个专业HR Agent**，形成可协同运作的HR智能体系统。

## 目录结构

```
hr-agents/
├── README.md                        ← 本文件
├── 01-hr-strategy/                  ← HR战略与组织设计Agent
│   ├── AGENT.md
│   └── skills/
│       ├── org-design/SKILL.md
│       └── culture-strategy/SKILL.md
├── 02-talent-acquisition/           ← 招聘与人才获取Agent
│   ├── AGENT.md
│   └── skills/
│       └── employer-brand/SKILL.md
├── 03-performance/                  ← 绩效管理Agent（5个Skills已完整）
│   └── AGENT.md
├── 04-total-rewards/                ← 全面薪酬与激励Agent
│   ├── AGENT.md
│   └── skills/
│       ├── benefits-design/SKILL.md
│       └── long-term-incentive/SKILL.md
├── 05-learning-development/         ← 学习与人才发展Agent
│   ├── AGENT.md
│   └── skills/
│       └── knowledge-management/SKILL.md
├── 06-employee-experience/          ← 员工体验与关系Agent
│   ├── AGENT.md
│   └── skills/
│       ├── culture-engagement/SKILL.md
│       └── conflict-mediation/SKILL.md
├── 07-compliance-risk/              ← HR合规与风控Agent
│   ├── AGENT.md
│   └── skills/
│       └── risk-early-warning/SKILL.md
└── 08-hr-analytics/                 ← HR数据分析与决策支持Agent
    ├── AGENT.md
    └── skills/
        └── hr-dashboard/SKILL.md
```

已有Skills 来源：`../li-hr-skill/`（25个）
新建Skills 位置：各Agent下的 `skills/` 子目录（10个）

## 8个Agent概览

| Agent | 定位 | 复用Skills | 新建Skills |
|-------|------|-----------|-----------|
| 01-hr-strategy | CHRO级战略伙伴 | strategic-talent-planning, workforce-budgeting | org-design, culture-strategy |
| 02-talent-acquisition | 全链路招聘专家 | recruitment-execution, flexible-workforce, talent-mobility | employer-brand |
| 03-performance | 端到端绩效专家 | goal-alignment, performance-coaching, performance-review, performance-value-attribution, attendance-intelligence | — |
| 04-total-rewards | 薪酬体系架构师 | promotion-salary-review, payroll-processing, compensation-compliance | benefits-design, long-term-incentive |
| 05-learning-development | 组织能力构建专家 | capability-assessment, learning-design, talent-development, career-development | knowledge-management |
| 06-employee-experience | 全旅程体验设计者 | onboarding-experience, employee-service, offboarding-alumni | culture-engagement, conflict-mediation |
| 07-compliance-risk | 用工风险防火墙 | employment-compliance, compensation-compliance, data-privacy | risk-early-warning |
| 08-hr-analytics | HR数据洞察引擎 | hr-analytics, talent-prediction, business-impact | hr-dashboard |

## Agent 协同链路

**新业务扩张**：01战略规划 → 02招聘执行 → 06入职体验 → 03绩效对齐 → 05能力培养

**绩效周期**：03目标设定 → 04薪酬激励设计 → 05培训需求 → 08数据归因

**人才保留危机**：08预警信号 → 03绩效干预 + 05发展加速 + 06关怀介入 + 07合规核查
