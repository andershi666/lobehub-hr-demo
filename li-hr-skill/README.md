## 🎯 这是什么？

HR Skills 是一套专业的 Claude Code 技能库，将 25 个 HR 专业领域转化为 AI 助手。无论你是 HRBP、招聘专员、薪酬专家还是 HR 负责人，这些技能都能在日常工作中为你提供**专业级的咨询建议**。

### 它能帮你做什么？

✅ **5分钟完成**原本需要2小时的战略规划文档
✅ **自动生成**专业的招聘方案、绩效评估、培训计划
✅ **数据驱动**的离职预测、人才分析、ROI 计算
✅ **合规保障**的薪酬核算、劳动合同、隐私评估
✅ **最佳实践**的反模式清单，避开常见错误

---

## 🚀 5分钟快速开始

### 第一步：安装技能库（1分钟）

```bash
# 将技能库拷贝到 Claude Code 的插件目录
~/.claude/plugins/

# Windows (PowerShell)
Copy-Item -Recurse -Force li-hr-skills $env:USERPROFILE\.claude\plugins\li-hr-skills

# macOS / Linux
cp -r li-hr-skills ~/.claude/plugins/li-hr-skills
```

### 第二步：重新加载（10秒）

在 Claude Code 中执行：
```
/reload-skills
```

### 第三步：试一试（2分钟）

随便试试这些场景：

**场景1：战略人才规划**
```
"我们公司计划2026年Q2进军东南亚市场，目前团队200人，
需要在3个月内扩充50%人力。帮我制定人才战略规划。"
```
→ 自动触发 `strategic-talent-planning` 技能

**场景2：招聘方案设计**
```
"急需招聘5名高级Java工程师，要求3年以上经验，
熟悉微服务架构。帮我制定完整的招聘方案。"
```
→ 自动触发 `recruitment-execution` 技能

**场景3：绩效目标分解**
```
"帮我将公司Q2目标'营收从1亿增长到1.5亿'分解到产品部，
我们产品部有研发、产品、运营三个团队，共50人。"
```
→ 自动触发 `goal-alignment` 技能

**看到输出了吗？** 🎉 恭喜你已经成功开始使用！

---

## 🎬 从业务场景开始

不知道该用哪个技能？**从你的实际工作场景出发**，下面是8个最常见的 HR 工作场景：

### 场景1：💼 新业务/市场扩张

**典型情况**：公司要进入新市场、开拓新业务线、启动新项目

**完整技能链**：
```
1. strategic-talent-planning（战略人才规划）
   → 将业务目标映射为人才需求

2. workforce-budgeting（人力成本管理）
   → 创建 HC 预算和投资计划

3. recruitment-execution（招聘执行）
   → 执行招聘活动

4. flexible-workforce（弹性用工）
   → 规划临时用工方案
```

**实际案例**：
```
"我们公司计划Q2进军东南亚市场，预计建立50人团队。
现在北京总部200人，主要是研发和销售。需要制定完整的人才战略。

包括：
- 需要哪些关键岗位？本地招聘还是外派？
- 人力成本预算多少？
- 招聘时间线和里程碑？
- 用什么组织架构？"
```
→ 技能会自动协作，输出完整方案

---

### 场景2：📈 季度/年度绩效周期

**典型情况**：Q1设定目标、Q2/Q3过程辅导、Q4绩效评估

**完整技能链**：
```
1. goal-alignment（目标对齐）
   → Q初：设定和分解 OKR/KPI

2. performance-coaching（绩效辅导）
   → Q中：提供反馈和辅导

3. performance-review（绩效评估）
   → Q末：评估校准和结果应用

4. performance-value-attribution（价值归因）
   → 计算 HR 举措对业务的影响
```

**实际案例**：
```
"现在是Q1，需要做2026年Q2的绩效目标设定。

公司层面目标：
- 营收从1亿增长到1.5亿（+50%）
- 新签客户从500家到800家（+60%）
- NPS 从65分提升到75分

请帮我：
1. 分解到产品、研发、销售、客户成功四个部门
2. 确保目标对齐，不冲突
3. 给出每个部门的3-5个 OKR"
```
→ 输出完整的目标分解树和对齐地图

---

### 场景3：🎓 培训与发展项目

**典型情况**：需要提升团队能力、设计培训项目

**完整技能链**：
```
1. capability-assessment（能力诊断）
   → 诊断技能差距

2. learning-design（学习设计）
   → 设计培训课程

3. talent-development（人才发展）
   → 构建人才梯队
```

**实际案例**：
```
"我们研发团队50人，去年业务增长很快但代码质量下降，
技术债累积。想做一个技术能力提升项目。

现状：
- 高级工程师10人，中级30人，初级10人
- 主要问题：架构设计能力弱、代码规范不统一、测试覆盖率低
- 预算：30万，时间：Q2-Q3（6个月）

请帮我设计完整的培训方案，包括课程、导师制、实战项目。"
```
→ 输出培训方案、课程大纲、效果评估

---

### 场景4：👥 招聘与入职全流程

**典型情况**：有紧急招聘需求，从 JD 到 onboarding

**完整技能链**：
```
1. recruitment-execution（招聘执行）
   → 完整招聘流程

2. employment-compliance（雇佣合规）
   → 检查法律合规

3. onboarding-experience（入职体验）
   → 设计入职旅程

4. goal-alignment（目标对齐）
   → 设定初始目标
```

**实际案例**：
```
"急需招聘3名高级产品经理，负责B端SaaS产品。

要求：
- 5年以上B端产品经验
- 有0-1产品经验优先
- 熟悉企业服务行业
- 薪资预算：40-60K/月

现在的问题：
1. 现有JD投递量很低
2. 面试通过率不到20%
3. Offer接受率只有50%

请帮我：
1. 优化JD
2. 制定sourcing策略（去哪儿找人？）
3. 设计面试流程和评估标准
4. 设计有吸引力的Offer方案"
```
→ 输出完整的招聘解决方案

---

### 场景5：📊 数据驱动决策

**典型情况**：需要分析 HR 数据、预测趋势、证明价值

**完整技能链**：
```
1. hr-analytics（数据分析）
   → 分析人力数据

2. talent-prediction（趋势预测）
   → 预测离职风险

3. business-impact（业务影响）
   → 计算 HR ROI
```

**实际案例**：
```
"我们公司今年离职率突然上升到25%（去年是15%），
HR总监让我分析原因并提出解决方案。

现有数据：
- 员工花名册（200人，含部门、职级、司龄、薪酬）
- 离职记录（今年已离职50人，含离职原因）
- 绩效数据（最近两年）

请帮我：
1. 分析离职的主要原因和高风险群体
2. 预测下半年还会有多少人离职
3. 计算离职成本
4. 提出3-5个改进措施，并计算每个措施的ROI"
```
→ 输出完整的分析报告和行动计划

---

### 场景6：🚨 高离职率问题诊断

**典型情况**：某部门/岗位离职率异常，需要快速定位和解决

**诊断决策树**：
```
1. hr-analytics（数据分析）
   → 分析离职模式

2. talent-prediction（风险预测）
   → 识别高风险员工

3. 根因分析 → 选择解决方案：

   ├─ 薪酬问题 → compensation-compliance
   │              （市场对标、调薪方案）
   │
   ├─ 发展问题 → talent-development + career-development
   │              （培养计划、职业规划）
   │
   ├─ 管理问题 → performance-coaching
   │              （管理者培训、反馈机制）
   │
   └─ 体验问题 → employee-service
                 （员工关怀、工作环境）
```

**实际案例**：
```
"销售部门（50人）今年离职率35%，远高于公司平均15%。

已知信息：
- 离职员工中60%是1-2年司龄的销售
- 离职面谈提到：目标压力大、底薪低、晋升慢
- 销售总监换了3任（不到2年）

请帮我：
1. 深度分析离职的根本原因
2. 预测如果不干预，Q2-Q4还会离职多少人
3. 设计综合解决方案（薪酬、管理、发展）
4. 计算每个方案的成本和预期效果"
```
→ 输出诊断报告和多维度解决方案

---

### 场景7：⚖️ 合规审查/审计准备

**典型情况**：劳动监察、财务审计、数据合规检查

**完整技能链**：
```
1. employment-compliance（雇佣合规）
   → 审查劳动合同和离职流程

2. compensation-compliance（薪酬合规）
   → 审计工资社保个税

3. data-privacy（数据隐私）
   → 评估数据保护措施
```

**实际案例**：
```
"下个月要接受劳动监察检查，需要全面自查。

公司情况：
- 200人，其中50人是劳务派遣
- 有10人试用期超过6个月（原因是疫情期间延长）
- 部分员工社保按最低基数缴纳
- 去年有3起劳动仲裁（都是加班费纠纷）

请帮我：
1. 全面检查潜在的合规风险
2. 优先级排序（哪些是P0必须立即整改的）
3. 给出整改方案和时间表
4. 准备审计材料清单"
```
→ 输出合规检查报告和整改计划

---

### 场景8：🎯 HR 价值证明/预算申请

**典型情况**：需要向管理层证明 HR 的价值、申请预算

**完整技能链**：
```
1. business-impact（业务影响归因）
   → 计算 HR 举措的 ROI

2. hr-analytics（数据分析）
   → 提供支撑数据

3. strategic-talent-planning（战略规划）
   → 制定未来投资计划
```

**实际案例**：
```
"CEO质疑HR部门的价值，问'HR到底为公司创造了什么价值？
为什么今年还要增加50万培训预算？'

需要准备一份商业案例：

去年HR主要工作：
- 招聘了80人（成本300万）
- 做了5次管理培训（成本50万）
- 优化了绩效体系（投入人力成本3人月）

公司业务数据：
- 营收从8000万增长到1.2亿（+50%）
- 人均产能从40万提升到60万（+50%）
- 离职率从20%下降到15%（-25%）

请帮我：
1. 计算这些HR举措的ROI
2. 建立因果关系（不只是相关性）
3. 用业务语言讲一个价值故事
4. 论证今年50万培训预算的必要性"
```
→ 输出商业案例和价值故事

---

## 📚 完整技能清单（25个）

### 价值流零：战略规划 (2个)

| 技能名称 | 适用场景 | 生成产物 |
|---------|---------|---------|
| **strategic-talent-planning**<br/>战略人才规划 | 业务扩张、组织变革、市场进入 | 人才战略规划书、招聘预算、组织架构图 |
| **workforce-budgeting**<br/>人力成本管理 | 年度预算、成本控制、投资决策 | 人力成本模型、HC 预算、ROI 分析 |

### 价值流一：人才供给 (3个)

| 技能名称 | 适用场景 | 生成产物 |
|---------|---------|---------|
| **recruitment-execution**<br/>招聘执行与管理 | JD 优化、渠道选择、面试流程 | 招聘方案、JD、面试评分表、Offer |
| **flexible-workforce**<br/>弹性用工配置 | 临时用工、项目外包、合规管理 | 弹性用工方案、供应商评估、合规清单 |
| **talent-mobility**<br/>员工异动管理 | 晋升、调岗、轮岗、借调 | 异动方案、评估标准、沟通计划 |

### 价值流二：绩效驱动 (5个)

| 技能名称 | 适用场景 | 生成产物 |
|---------|---------|---------|
| **goal-alignment**<br/>目标对齐与分解 | OKR/KPI 设定、目标拆解 | 目标分解树、对齐地图、协同清单 |
| **performance-coaching**<br/>绩效辅导与反馈 | 1对1辅导、反馈对话、PIP设计 | STAR/SBI 反馈脚本、辅导计划、PIP |
| **performance-review**<br/>绩效评估与应用 | 绩效评估、校准会议、结果应用 | 评估报告、校准方案、激励方案 |
| **performance-value-attribution**<br/>绩效价值归因 | 绩效-业务关联、因果分析 | 归因模型、相关性分析、业务影响报告 |
| **attendance-intelligence**<br/>考勤智能管理 | 考勤分析、弹性工作、效率优化 | 考勤洞察报告、弹性工作方案、预警 |

### 价值流三：能力发展 (3个)

| 技能名称 | 适用场景 | 生成产物 |
|---------|---------|---------|
| **capability-assessment**<br/>能力诊断与评估 | 能力盘点、差距分析、评估设计 | 胜任力模型、能力评估报告、IDP |
| **learning-design**<br/>学习项目设计 | 培训需求分析、课程设计、效果评估 | 培训方案、课程大纲、评估工具 |
| **talent-development**<br/>关键人才发展 | 高潜识别、继任规划、加速培养 | 高潜池名单、继任计划、发展路径 |

### 价值流四：员工体验 (5个)

| 技能名称 | 适用场景 | 生成产物 |
|---------|---------|---------|
| **onboarding-experience**<br/>入职融入体验 | 新员工入职、融入体验设计 | 入职计划、培训清单、融入评估 |
| **employee-service**<br/>日常员工服务 | HR 咨询、政策解读、问题路由 | 服务指南、FAQ、流程图 |
| **career-development**<br/>职业发展规划 | 职业规划、发展路径、IDP | 职业诊断报告、发展路径图、IDP |
| **offboarding-alumni**<br/>离职与校友管理 | 离职面谈、知识交接、校友管理 | 离职分析报告、交接清单、校友方案 |
| **promotion-salary-review**<br/>人才晋升与调薪 | 晋升评估、调薪决策、跨流程协同 | 晋升方案、薪酬方案、沟通脚本 |

### 价值流五：合规风控 (4个)

| 技能名称 | 适用场景 | 生成产物 |
|---------|---------|---------|
| **employment-compliance**<br/>雇佣合规管理 | 劳动合同、试用期、离职管理 | 合规清单、合同模板、风险评估 |
| **compensation-compliance**<br/>薪酬福利合规 | 工资计算、社保缴纳、个税申报 | 计算模板、合规检查清单、审计材料 |
| **data-privacy**<br/>数据安全与隐私 | GDPR/PIPL 合规、PIA、数据分类 | PIA 报告、数据分类表、合规方案 |
| **payroll-processing**<br/>薪酬核算与发放 | 薪酬核算、多系统集成、准确性校验 | 规则引擎、校验流程、对账报告 |

### 价值流六：数据洞察 (3个)

| 技能名称 | 适用场景 | 生成产物 |
|---------|---------|---------|
| **hr-analytics**<br/>人力资源数据分析 | 指标设计、根因分析、诊断洞察 | 分析报告、可视化图表、改进建议 |
| **talent-prediction**<br/>人才趋势预测 | 离职预测、需求预测、风险预警 | 预测模型、风险清单、应对方案 |
| **business-impact**<br/>业务影响归因 | HR ROI 计算、价值归因、商业故事 | ROI 模型、归因分析、价值故事 |

---

## 🎯 按职能快速查找

不同 HR 职能最常用的技能组合：

### 👔 HRBP（业务伙伴）

**核心技能**：
- `strategic-talent-planning` - 制定业务部门的人才战略
- `goal-alignment` - 辅助业务部门设定和分解目标
- `performance-coaching` - 教练业务主管进行绩效辅导
- `hr-analytics` - 分析部门人力数据和趋势
- `talent-mobility` - 管理内部调动和晋升

**典型工作流**：
```
季度初：goal-alignment（目标设定）
季度中：performance-coaching（辅导支持）
季度末：performance-review（评估应用）
全年度：strategic-talent-planning（战略规划）
        + hr-analytics（数据洞察）
```

---

### 👥 招聘专员/Recruiter

**核心技能**：
- `recruitment-execution` - 端到端招聘流程管理
- `flexible-workforce` - 临时用工和外包管理
- `onboarding-experience` - 新员工入职体验设计
- `talent-mobility` - 内部推荐和转岗
- `employment-compliance` - 招聘合规检查

**典型工作流**：
```
需求分析 → recruitment-execution（JD优化、渠道选择）
面试评估 → recruitment-execution（结构化面试）
发放Offer → employment-compliance（合规检查）
入职准备 → onboarding-experience（入职流程）
```

---

### 💰 薪酬福利专员/C&B

**核心技能**：
- `workforce-budgeting` - 人力成本预算和控制
- `compensation-compliance` - 薪酬核算和合规管理
- `payroll-processing` - 薪酬发放流程
- `promotion-salary-review` - 晋升调薪方案设计
- `business-impact` - 薪酬投资回报分析

**典型工作流**：
```
年度：workforce-budgeting（预算规划）
月度：payroll-processing（薪酬核算）
      + compensation-compliance（合规检查）
晋升季：promotion-salary-review（调薪方案）
审计期：compensation-compliance（审计准备）
```

---

### 📚 培训发展专员/L&D

**核心技能**：
- `capability-assessment` - 能力诊断和差距分析
- `learning-design` - 培训课程设计和实施
- `talent-development` - 高潜人才培养计划
- `performance-coaching` - 辅导技能培训
- `career-development` - 职业发展咨询

**典型工作流**：
```
需求分析 → capability-assessment（能力诊断）
方案设计 → learning-design（课程设计）
实施跟踪 → talent-development（培养项目）
效果评估 → business-impact（ROI计算）
```

---

### 📊 HR 数据分析师/HRIS

**核心技能**：
- `hr-analytics` - 人力资源数据分析和报表
- `talent-prediction` - 离职预测和趋势分析
- `business-impact` - HR 价值归因和 ROI 计算
- `performance-value-attribution` - 绩效与业务关联分析
- `attendance-intelligence` - 考勤数据智能分析

**典型工作流**：
```
日常：hr-analytics（指标监控、报表生成）
月度：talent-prediction（风险预警）
季度：business-impact（价值证明）
专项：performance-value-attribution（深度归因）
```

---

### ⚖️ 员工关系/合规专员

**核心技能**：
- `employment-compliance` - 劳动合同和离职管理
- `data-privacy` - 员工数据隐私保护
- `employee-service` - 员工咨询和问题处理
- `offboarding-alumni` - 离职流程和校友管理
- `compensation-compliance` - 薪酬合规审查

**典型工作流**：
```
入职：employment-compliance（合同审查）
日常：employee-service（员工咨询）
      + data-privacy（数据保护）
离职：offboarding-alumni（离职流程）
审计：employment-compliance + compensation-compliance
```

---

### 🎖️ HR 负责人

**核心技能**：
- `strategic-talent-planning` - 公司级人才战略
- `workforce-budgeting` - 人力成本总预算
- `business-impact` - HR 价值证明和 ROI
- `talent-prediction` - 人才风险预警
- `performance-review` - 绩效校准和激励

**典型工作流**：
```
战略层：strategic-talent-planning（年度人才战略）
        + workforce-budgeting（年度预算）

运营层：talent-prediction（风险监控）
        + hr-analytics（数据看板）

决策层：business-impact（价值证明）
        + performance-review（人才决策）
```

---

## 🧭 快速决策树

**不确定该用哪个技能？** 根据你的工作目标快速定位：

```
你需要做什么？
│
├─ 📋 规划未来
│  ├─ 制定战略 → strategic-talent-planning
│  ├─ 预算管理 → workforce-budgeting
│  └─ 能力评估 → capability-assessment
│
├─ 👥 获取人才
│  ├─ 外部招聘 → recruitment-execution
│  ├─ 临时用工 → flexible-workforce
│  └─ 内部异动 → talent-mobility
│
├─ 📈 管理绩效
│  ├─ 设定目标 → goal-alignment
│  ├─ 反馈辅导 → performance-coaching
│  ├─ 评估应用 → performance-review
│  ├─ 价值归因 → performance-value-attribution
│  └─ 考勤管理 → attendance-intelligence
│
├─ 🎓 发展能力
│  ├─ 诊断差距 → capability-assessment
│  ├─ 设计培训 → learning-design
│  ├─ 培养人才 → talent-development
│  └─ 职业规划 → career-development
│
├─ 😊 优化体验
│  ├─ 新人入职 → onboarding-experience
│  ├─ 日常服务 → employee-service
│  ├─ 职业咨询 → career-development
│  ├─ 员工离职 → offboarding-alumni
│  └─ 晋升调薪 → promotion-salary-review
│
├─ ⚖️ 确保合规
│  ├─ 劳动法规 → employment-compliance
│  ├─ 薪酬福利 → compensation-compliance
│  ├─ 数据隐私 → data-privacy
│  └─ 薪酬核算 → payroll-processing
│
└─ 📊 分析预测
   ├─ 数据分析 → hr-analytics
   ├─ 趋势预测 → talent-prediction
   └─ 价值证明 → business-impact
```

---

## 💡 使用技巧

### 技巧1：提供丰富的上下文

技能是**通用型设计**，会根据你提供的公司信息动态调整建议。

❌ **不好的提示：**
```
"帮我设计一个绩效管理流程"
```

✅ **好的提示：**
```
"帮我设计一个绩效管理流程。公司背景：
- 200人的互联网公司，以研发为主
- 采用季度 OKR 制度
- 远程办公为主，团队分布在北上深
- 现有绩效流程问题：目标不清晰、反馈不及时、结果应用单一"
```

### 技巧2：组合使用多个技能

很多 HR 工作需要多个技能协同：

**新员工招聘全流程：**
1. `recruitment-execution` → 设计招聘方案、优化 JD
2. `onboarding-experience` → 设计入职体验流程
3. `goal-alignment` → 设定新员工的 OKR/KPI

**季度绩效管理周期：**
1. `goal-alignment` → 季初设定目标
2. `performance-coaching` → 季中辅导反馈
3. `performance-review` → 季末评估应用

**离职问题诊断与改进：**
1. `hr-analytics` → 分析离职数据
2. `talent-prediction` → 预测高风险人员
3. `business-impact` → 计算离职成本和改进 ROI

### 技巧3：学习反模式清单

每个技能都包含 **❌ NEVER Do** 章节，总结了常见的致命错误：

- **为什么错**：深入分析错误的根本原因
- **正确做法**：详细的改进方案和最佳实践
- **具体案例**：真实场景的对比示例

**示例（来自 goal-alignment）：**
```
❌ 错误：把任务（Task）当作目标（Objective）

错误示例：
KR: 完成 3 次用户访谈
KR: 上线新功能
KR: 开 5 次会议

为什么错：
- 任务关注"做了什么"，目标关注"达成了什么结果"
- 完成任务不等于达成目标

正确做法：
✅ KR: 基于 30 次用户访谈，识别并验证 3 个核心痛点
✅ KR: 新功能用户采用率达到 40%，NPS 提升 10 分
✅ KR: 跨部门对齐机制建立，决策周期从 2 周缩短到 3 天
```

### 技巧4：明确指定技能（可选）

如果自动触发不准确，可以明确指定：

```
"使用 strategic-talent-planning 技能，帮我..."
"用 goal-alignment，将这个目标分解..."
"调用 hr-analytics 分析这份离职数据"
```

---

## 🎓 学习路径

### 新手（第1周）：熟悉5个核心技能

| Day | 技能 | 练习场景 | 预期用时 |
|-----|------|---------|----------|
| 1 | recruitment-execution | 优化一个真实 JD | 15分钟 |
| 2 | goal-alignment | 分解一个部门目标 | 20分钟 |
| 3 | onboarding-experience | 设计新员工第一周流程 | 15分钟 |
| 4 | performance-coaching | 准备一次辅导对话 | 20分钟 |
| 5 | hr-analytics | 分析你的离职数据 | 20分钟 |

### 进阶（第2周）：尝试场景组合

| 场景 | 技能组合 | 预期用时 |
|------|---------|----------|
| 新员工招聘 | recruitment-execution → onboarding-experience → goal-alignment | 1小时 |
| 绩效周期 | goal-alignment → performance-coaching → performance-review | 1.5小时 |
| 离职分析 | hr-analytics → talent-prediction → business-impact | 1小时 |

### 专家（第3-4周）：深度使用专业技能

根据你的职能选择深度学习：

- **HRBP**：strategic-talent-planning, performance-coaching, hr-analytics, business-impact
- **招聘专员**：recruitment-execution, flexible-workforce, talent-mobility, onboarding-experience
- **薪酬专员**：workforce-budgeting, payroll-processing, compensation-compliance, promotion-salary-review
- **培训专员**：capability-assessment, learning-design, talent-development, career-development
- **HRIS/HR运营**：data-privacy, employment-compliance, employee-service, attendance-intelligence

---

## ⚙️ 技术特性

### 智能触发机制

技能使用 Claude Code 的自动触发机制，无需手动调用：

- **场景关键词**：技能描述包含丰富的触发关键词
- **上下文理解**：Claude 根据对话上下文自动判断
- **多技能协同**：可在同一对话中自动切换技能

### 专业输出标准

每个技能都遵循统一的输出规范：

- **结构化文档**：使用 Markdown 表格、清单、流程图
- **可执行模板**：生成的文档可直接使用或微调
- **计算公式**：涉及数据分析的技能包含具体计算方法
- **决策框架**：提供判断标准和评估维度

### 最佳实践内置

- **工作流导向**：每个技能包含分步骤的工作流程
- **时间估算**：每个步骤标注预期用时
- **反模式清单**：每个技能包含 5+ 个常见错误案例
- **理论支撑**：基于 OKR、STAR/SBI、70-20-10 等 HR 框架

---



## 📄 许可协议

MIT License - 详见 LICENSE 文件

---