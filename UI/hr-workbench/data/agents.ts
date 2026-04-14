// HR 工作台 - Agent 配置数据
// 将此文件放入 lobe-chat 项目后，路径应为: src/features/hr/data/agents.ts

export interface HRAgent {
  id: string;
  identifier: string;   // 对应 JSON 配置中的 identifier
  title: string;
  description: string;
  avatar: string;
  tags: string[];
  color: string;        // 卡片主题色
  bgColor: string;      // 卡片背景色
  scenarios: string[];  // 典型使用场景（快捷提问）
}

export const HR_AGENTS: HRAgent[] = [
  {
    id: "01",
    identifier: "hr-strategy-agent",
    title: "HR战略与组织设计",
    description: "CHRO级战略合伙人，业务战略解码→人才规划→组织架构设计",
    avatar: "🏛️",
    tags: ["战略规划", "组织设计", "编制预算"],
    color: "#6366f1",
    bgColor: "#eef2ff",
    scenarios: [
      "帮我制定下半年的人才战略规划",
      "设计一个新业务部门的组织架构",
      "分析我们公司的人力编制，哪些部门人效最低？",
      "如何构建公司文化体系？",
    ],
  },
  {
    id: "02",
    identifier: "talent-acquisition-agent",
    title: "招聘与人才获取",
    description: "全链路招聘专家，JD优化→渠道策略→面试设计→Offer管理",
    avatar: "🎯",
    tags: ["招聘", "JD优化", "灵活用工"],
    color: "#0ea5e9",
    bgColor: "#f0f9ff",
    scenarios: [
      "帮我优化这个高级产品经理的JD",
      "为技术团队制定校园招聘方案",
      "分析一下我们最近3个月的招聘漏斗",
      "如何提高Offer接受率？",
    ],
  },
  {
    id: "03",
    identifier: "performance-agent",
    title: "绩效管理专家",
    description: "端到端绩效专家，OKR设定→过程辅导→评估校准→结果应用",
    avatar: "📊",
    tags: ["OKR", "绩效辅导", "目标分解"],
    color: "#10b981",
    bgColor: "#f0fdf4",
    scenarios: [
      "帮我设计Q3的OKR目标体系",
      "如何给一个绩效不达标的员工写PIP？",
      "组织一次绩效校准会议，流程是什么？",
      "用STAR方法帮我写一个绩效反馈",
    ],
  },
  {
    id: "04",
    identifier: "total-rewards-agent",
    title: "全面薪酬与激励",
    description: "薪酬体系架构师，薪酬对标→调薪方案→长期激励→福利设计",
    avatar: "💰",
    tags: ["薪酬设计", "奖金方案", "股权激励"],
    color: "#f59e0b",
    bgColor: "#fffbeb",
    scenarios: [
      "帮我做一个市场薪酬对标分析",
      "设计年度调薪方案，如何与绩效联动？",
      "我们想给核心员工做股权激励，怎么设计？",
      "如何建立弹性福利积分制度？",
    ],
  },
  {
    id: "05",
    identifier: "learning-development-agent",
    title: "学习与人才发展",
    description: "组织能力构建专家，能力诊断→培训设计→高潜培养→继任规划",
    avatar: "🎓",
    tags: ["培训设计", "高潜人才", "继任计划"],
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
    scenarios: [
      "帮我做一个新任管理者培训方案",
      "如何做人才九宫格盘点？",
      "制定一个高潜人才发展加速计划",
      "如何评估培训效果（柯氏四级）？",
    ],
  },
  {
    id: "06",
    identifier: "employee-experience-agent",
    title: "员工体验与关系",
    description: "员工全旅程设计者，入职体验→日常服务→敬业度→离职管理",
    avatar: "❤️",
    tags: ["员工体验", "敬业度", "入职设计"],
    color: "#ec4899",
    bgColor: "#fdf2f8",
    scenarios: [
      "帮我设计新员工入职90天体验方案",
      "如何提升员工敬业度（eNPS）？",
      "处理一个员工投诉管理者的申诉案例",
      "分析最近的离职面谈，找出主要离职原因",
    ],
  },
  {
    id: "07",
    identifier: "compliance-risk-agent",
    title: "HR合规与风控",
    description: "用工风险防火墙，劳动合同→薪酬合规→数据隐私→风险预警",
    avatar: "⚖️",
    tags: ["劳动法", "合规审查", "风险预警"],
    color: "#ef4444",
    bgColor: "#fef2f2",
    scenarios: [
      "解除劳动合同需要满足哪些法律条件？",
      "我们想裁员10人，法律程序是什么？",
      "检查一下我们的员工手册是否有合规问题",
      "如何确保员工数据处理符合个人信息保护法？",
    ],
  },
  {
    id: "08",
    identifier: "hr-analytics-agent",
    title: "HR数据分析",
    description: "HR数据洞察引擎，数据分析→离职预测→ROI计算→仪表盘设计",
    avatar: "📈",
    tags: ["数据分析", "离职预测", "HR ROI"],
    color: "#06b6d4",
    bgColor: "#ecfeff",
    scenarios: [
      "分析过去6个月的离职数据，找出规律",
      "哪些员工是高离职风险？给出预警名单",
      "计算我们年度培训项目的ROI",
      "设计一个给CHRO汇报的HR价值仪表盘",
    ],
  },
];

// HR 核心指标（工作台看板展示）
export interface HRMetric {
  label: string;
  value: string;
  change: number;     // 同比变化百分比，正数为增长
  unit?: string;
  icon: string;
  description: string;
}

export const HR_METRICS_PLACEHOLDERS: HRMetric[] = [
  {
    label: "在职人数",
    value: "—",
    change: 0,
    unit: "人",
    icon: "👥",
    description: "当前在职员工总数（含试用期）",
  },
  {
    label: "本月新入职",
    value: "—",
    change: 0,
    unit: "人",
    icon: "🆕",
    description: "当月新员工入职人数",
  },
  {
    label: "月度离职率",
    value: "—",
    change: 0,
    unit: "%",
    icon: "📉",
    description: "本月自愿离职人数/月初在职人数",
  },
  {
    label: "开放招聘岗位",
    value: "—",
    change: 0,
    unit: "个",
    icon: "🎯",
    description: "当前进行中的招聘需求",
  },
  {
    label: "培训完成率",
    value: "—",
    change: 0,
    unit: "%",
    icon: "📚",
    description: "本季度必修课程完成率",
  },
  {
    label: "员工 eNPS",
    value: "—",
    change: 0,
    unit: "",
    icon: "💚",
    description: "员工净推荐值（-100到+100）",
  },
];
