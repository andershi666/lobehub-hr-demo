import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosInstance } from "axios";
import * as dotenv from "dotenv";

dotenv.config();

// ===== 飞书 API Client =====
class FeishuClient {
  private client: AxiosInstance;
  private accessToken: string = "";
  private tokenExpiry: number = 0;

  constructor(
    private appId: string,
    private appSecret: string
  ) {
    this.client = axios.create({
      baseURL: "https://open.feishu.cn/open-apis",
      timeout: 10000,
    });
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    const res = await this.client.post("/auth/v3/tenant_access_token/internal", {
      app_id: this.appId,
      app_secret: this.appSecret,
    });
    this.accessToken = res.data.tenant_access_token;
    this.tokenExpiry = Date.now() + (res.data.expire - 60) * 1000;
    return this.accessToken;
  }

  async get(path: string, params?: Record<string, string>) {
    const token = await this.getAccessToken();
    const res = await this.client.get(path, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  }

  async post(path: string, data: Record<string, unknown>) {
    const token = await this.getAccessToken();
    const res = await this.client.post(path, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }
}

const feishu = new FeishuClient(
  process.env.FEISHU_APP_ID || "",
  process.env.FEISHU_APP_SECRET || ""
);

// ===== MCP Server =====
const server = new McpServer({
  name: "feishu-hr",
  version: "1.0.0",
});

// ----- 工具：获取员工信息 -----
server.tool(
  "get_employee_info",
  "获取飞书员工的详细信息，包括姓名、部门、职级、入职日期等HR核心字段",
  {
    user_id: z.string().describe("飞书用户ID（user_id 或 open_id）"),
    user_id_type: z.enum(["user_id", "open_id", "union_id"]).default("open_id"),
  },
  async ({ user_id, user_id_type }) => {
    const data = await feishu.get(`/contact/v3/users/${user_id}`, {
      user_id_type,
    });
    const user = data.data?.user;
    if (!user) return { content: [{ type: "text", text: "未找到该员工" }] };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              open_id: user.open_id,
              name: user.name,
              email: user.email,
              mobile: user.mobile,
              department_ids: user.department_ids,
              job_title: user.job_title,
              employee_no: user.employee_no,
              employee_type: user.employee_type,
              status: user.status,
              join_time: user.join_time,
              city: user.city,
              avatar: user.avatar?.avatar_240,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ----- 工具：获取组织架构 -----
server.tool(
  "get_department_tree",
  "获取飞书组织架构树，支持按部门ID获取子部门列表，用于组织设计和汇报分析",
  {
    department_id: z.string().default("0").describe("父部门ID，0表示根部门"),
    fetch_child: z.boolean().default(true).describe("是否递归获取子部门"),
  },
  async ({ department_id, fetch_child }) => {
    const data = await feishu.get("/contact/v3/departments", {
      parent_department_id: department_id,
      fetch_child: String(fetch_child),
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.data?.items || [], null, 2),
        },
      ],
    };
  }
);

// ----- 工具：搜索员工 -----
server.tool(
  "search_employees",
  "按关键词搜索飞书员工（支持姓名、工号、邮箱），适用于招聘内推查重、绩效对象查找等场景",
  {
    query: z.string().describe("搜索关键词（姓名/工号/邮箱）"),
    department_id: z.string().optional().describe("限定部门范围"),
    page_size: z.number().default(10).describe("返回条数，最大50"),
  },
  async ({ query, department_id, page_size }) => {
    const params: Record<string, string> = {
      query,
      page_size: String(page_size),
    };
    if (department_id) params.department_id = department_id;

    const data = await feishu.get("/contact/v3/users/find_by_department", params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.data?.items || [], null, 2),
        },
      ],
    };
  }
);

// ----- 工具：获取考勤记录 -----
server.tool(
  "get_attendance_records",
  "获取指定员工在日期范围内的考勤打卡记录，用于考勤分析、加班统计、绩效过程管理",
  {
    user_ids: z.array(z.string()).describe("员工open_id列表，最多50个"),
    start_date: z.string().describe("开始日期，格式 YYYYMMDD"),
    end_date: z.string().describe("结束日期，格式 YYYYMMDD"),
  },
  async ({ user_ids, start_date, end_date }) => {
    const data = await feishu.post("/attendance/v1/user_flows/query", {
      user_ids,
      check_date_from: parseInt(start_date),
      check_date_to: parseInt(end_date),
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.data || {}, null, 2),
        },
      ],
    };
  }
);

// ----- 工具：获取假期余额 -----
server.tool(
  "get_leave_balance",
  "查询员工的假期余额（年假/病假/调休等），支持HR做假期管理和员工关怀",
  {
    user_id: z.string().describe("员工open_id"),
    leave_type_ids: z
      .array(z.string())
      .optional()
      .describe("假期类型ID列表，不填返回所有类型"),
  },
  async ({ user_id, leave_type_ids }) => {
    const body: Record<string, unknown> = {
      user_id,
      user_id_type: "open_id",
    };
    if (leave_type_ids) body.leave_type_ids = leave_type_ids;

    const data = await feishu.post("/attendance/v1/leave_accrual_record/query", body);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.data || {}, null, 2),
        },
      ],
    };
  }
);

// ----- 工具：发送HR通知消息 -----
server.tool(
  "send_hr_message",
  "通过飞书向员工发送HR通知消息（如入职提醒、绩效评估提醒、合规培训通知等）",
  {
    user_id: z.string().describe("接收者的open_id"),
    content: z.string().describe("消息内容（支持Markdown格式）"),
    msg_type: z.enum(["text", "post"]).default("text").describe("消息类型"),
  },
  async ({ user_id, content, msg_type }) => {
    const msgContent =
      msg_type === "text"
        ? JSON.stringify({ text: content })
        : JSON.stringify({
            post: {
              zh_cn: {
                title: "HR通知",
                content: [[{ tag: "text", text: content }]],
              },
            },
          });

    const data = await feishu.post("/im/v1/messages", {
      receive_id: user_id,
      receive_id_type: "open_id",
      msg_type,
      content: msgContent,
    });

    return {
      content: [
        {
          type: "text",
          text: data.code === 0 ? "消息发送成功" : `发送失败: ${data.msg}`,
        },
      ],
    };
  }
);

// ----- 工具：查询审批实例 -----
server.tool(
  "get_approval_instances",
  "查询飞书审批实例（请假/晋升/调薪/离职等），用于HR流程跟踪和审批状态监控",
  {
    approval_code: z.string().describe("审批定义Code（如请假=LEAVE，晋升=PROMOTION）"),
    start_time: z.string().describe("开始时间戳（毫秒）"),
    end_time: z.string().describe("结束时间戳（毫秒）"),
    status: z
      .enum(["PENDING", "APPROVED", "REJECTED", "CANCELED", "DELETED"])
      .optional()
      .describe("审批状态筛选"),
  },
  async ({ approval_code, start_time, end_time, status }) => {
    const params: Record<string, string> = {
      approval_code,
      start_time,
      end_time,
    };
    if (status) params.status = status;

    const data = await feishu.get("/approval/v4/instances", params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.data || {}, null, 2),
        },
      ],
    };
  }
);

// ===== 启动服务 =====
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("飞书HR MCP Server 已启动");
}

main().catch(console.error);
