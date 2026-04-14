import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosInstance } from "axios";
import * as dotenv from "dotenv";
import * as crypto from "crypto";

dotenv.config();

// ===== 钉钉 API Client =====
class DingTalkClient {
  private client: AxiosInstance;
  private accessToken: string = "";
  private tokenExpiry: number = 0;

  constructor(
    private appKey: string,
    private appSecret: string
  ) {
    this.client = axios.create({
      baseURL: "https://oapi.dingtalk.com",
      timeout: 10000,
    });
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    const res = await this.client.get("/gettoken", {
      params: { appkey: this.appKey, appsecret: this.appSecret },
    });
    this.accessToken = res.data.access_token;
    this.tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  async get(path: string, params?: Record<string, string>) {
    const token = await this.getAccessToken();
    const res = await this.client.get(path, {
      params: { access_token: token, ...params },
    });
    return res.data;
  }

  async post(path: string, data: Record<string, unknown>) {
    const token = await this.getAccessToken();
    const res = await this.client.post(path, data, {
      params: { access_token: token },
    });
    return res.data;
  }
}

const dingtalk = new DingTalkClient(
  process.env.DINGTALK_APP_KEY || "",
  process.env.DINGTALK_APP_SECRET || ""
);

// ===== MCP Server =====
const server = new McpServer({
  name: "dingtalk-hr",
  version: "1.0.0",
});

// ----- 工具：搜索员工 -----
server.tool(
  "search_employee",
  "按姓名、工号或手机号搜索钉钉员工，适用于招聘内推查重、绩效对象查找等场景",
  {
    keyword: z.string().describe("搜索关键词（姓名/工号/手机号）"),
    offset: z.number().default(0),
    size: z.number().default(10).describe("返回条数，最大20"),
  },
  async ({ keyword, offset, size }) => {
    const data = await dingtalk.post("/topapi/smartwork/hrm/employee/queryonjob", {
      status_list: [2, 3, 5, 10], // 在职状态
      offset,
      size,
    });
    // 简单过滤（钉钉搜索API限制，实际可能需要分页匹配）
    const items = (data.result?.records || []).filter(
      (r: { name?: string; job_number?: string; mobile?: string }) =>
        r.name?.includes(keyword) ||
        r.job_number?.includes(keyword) ||
        r.mobile?.includes(keyword)
    );
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
    };
  }
);

// ----- 工具：获取员工详情 -----
server.tool(
  "get_employee_detail",
  "获取钉钉员工HR档案详情，包含个人信息、岗位、薪酬组、入离职信息",
  {
    userid: z.string().describe("钉钉用户ID"),
  },
  async ({ userid }) => {
    const data = await dingtalk.post("/topapi/smartwork/hrm/employee/get", {
      userid_list: [userid],
    });
    const record = data.result?.records?.[0];
    if (!record) return { content: [{ type: "text", text: "未找到该员工" }] };
    return {
      content: [{ type: "text", text: JSON.stringify(record, null, 2) }],
    };
  }
);

// ----- 工具：获取部门架构 -----
server.tool(
  "get_department_list",
  "获取钉钉部门架构，支持按父部门递归获取，用于组织结构分析和人员归属查询",
  {
    dept_id: z.number().default(1).describe("父部门ID，1表示根部门"),
  },
  async ({ dept_id }) => {
    const data = await dingtalk.post("/topapi/v2/department/listsub", {
      dept_id,
      language: "zh_CN",
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.result || [], null, 2),
        },
      ],
    };
  }
);

// ----- 工具：查询审批状态 -----
server.tool(
  "get_approval_status",
  "查询钉钉审批实例状态（请假/晋升/调薪/离职申请等），用于HR流程跟踪",
  {
    process_instance_id: z.string().describe("审批实例ID"),
  },
  async ({ process_instance_id }) => {
    const data = await dingtalk.post("/topapi/processinstance/get", {
      process_instance_id,
    });
    const instance = data.process_instance;
    if (!instance) return { content: [{ type: "text", text: "未找到审批实例" }] };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              id: instance.process_instance_id,
              title: instance.title,
              status: instance.status,
              result: instance.result,
              create_time: instance.create_time,
              finish_time: instance.finish_time,
              originator_userid: instance.originator_userid,
              form_component_values: instance.form_component_values,
              tasks: instance.tasks?.map((t: { task_id: string; userid: string; task_status: string }) => ({
                id: t.task_id,
                userid: t.userid,
                status: t.task_status,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ----- 工具：批量查询在职员工 -----
server.tool(
  "get_onjob_employees",
  "批量获取在职员工列表，支持按状态筛选，用于人力规划和花名册管理",
  {
    status_list: z
      .array(z.number())
      .default([2])
      .describe("员工状态列表：2=试用期, 3=正式, 5=实习, 10=劳务"),
    offset: z.number().default(0),
    size: z.number().default(20).describe("返回条数，最大50"),
  },
  async ({ status_list, offset, size }) => {
    const data = await dingtalk.post("/topapi/smartwork/hrm/employee/queryonjob", {
      status_list,
      offset,
      size,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              total: data.result?.next_cursor || 0,
              records: data.result?.records || [],
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ----- 工具：发送HR工作通知 -----
server.tool(
  "send_work_notification",
  "通过钉钉工作通知向员工发送HR消息（绩效提醒/审批通知/合规培训/政策更新等）",
  {
    userid_list: z.array(z.string()).describe("接收者钉钉userId列表，最多100人"),
    title: z.string().describe("通知标题"),
    content: z.string().describe("通知内容（支持Markdown）"),
    agent_id: z.string().optional().describe("企业应用AgentID，默认使用环境变量配置"),
  },
  async ({ userid_list, title, content, agent_id }) => {
    const data = await dingtalk.post("/topapi/message/corpconversation/asyncsend_v2", {
      agent_id: agent_id || process.env.DINGTALK_AGENT_ID,
      userid_list: userid_list.join(","),
      msg: {
        msgtype: "markdown",
        markdown: { title, text: content },
      },
    });
    return {
      content: [
        {
          type: "text",
          text:
            data.errcode === 0
              ? `消息发送成功，任务ID: ${data.task_id}`
              : `发送失败: ${data.errmsg}`,
        },
      ],
    };
  }
);

// ----- 工具：获取离职员工列表 -----
server.tool(
  "get_dimission_employees",
  "获取已离职员工列表，支持按时间范围筛选，用于离职分析和校友管理",
  {
    offset: z.number().default(0),
    size: z.number().default(20),
    dim_type: z
      .enum(["1", "2", "3", "4"])
      .optional()
      .describe("离职类型：1=辞职, 2=辞退, 3=退休, 4=合同到期"),
  },
  async ({ offset, size, dim_type }) => {
    const body: Record<string, unknown> = { offset, size };
    if (dim_type) body.dim_type = dim_type;

    const data = await dingtalk.post("/topapi/smartwork/hrm/employee/querydimission", body);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data.result || {}, null, 2),
        },
      ],
    };
  }
);

// ===== 启动服务 =====
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("钉钉HR MCP Server 已启动");
}

main().catch(console.error);
