import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosInstance } from "axios";
import * as dotenv from "dotenv";

dotenv.config();

// ===== SAP HCM OData API Client =====
// 支持 SAP HCM 的 OData API 和 SAP SuccessFactors API
class SAPClient {
  private client: AxiosInstance;
  private readonly mode: "hcm" | "sf";

  constructor() {
    this.mode = (process.env.SAP_MODE || "hcm") as "hcm" | "sf";

    if (this.mode === "sf") {
      // SAP SuccessFactors OData API
      this.client = axios.create({
        baseURL: process.env.SAP_SF_BASE_URL,
        timeout: 15000,
        auth: {
          username: `${process.env.SAP_SF_USERNAME}@${process.env.SAP_SF_COMPANY_ID}`,
          password: process.env.SAP_SF_API_KEY || "",
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    } else {
      // SAP HCM REST/OData API
      this.client = axios.create({
        baseURL: process.env.SAP_HCM_BASE_URL,
        timeout: 15000,
        auth: {
          username: process.env.SAP_HCM_USERNAME || "",
          password: process.env.SAP_HCM_PASSWORD || "",
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "sap-client": process.env.SAP_CLIENT || "100",
        },
      });
    }
  }

  async get(path: string, params?: Record<string, string>) {
    const res = await this.client.get(path, { params });
    return res.data;
  }

  async post(path: string, data: Record<string, unknown>) {
    const res = await this.client.post(path, data);
    return res.data;
  }
}

const sap = new SAPClient();

// ===== MCP Server =====
const server = new McpServer({
  name: "sap-hr",
  version: "1.0.0",
});

// ----- 工具：查询员工主数据 -----
server.tool(
  "get_employee_master_data",
  "从SAP HR/SuccessFactors获取员工主数据，包含个人信息、组织分配、薪酬组等核心HR字段",
  {
    employee_id: z.string().describe("员工工号（Pernr）"),
    fields: z
      .array(z.string())
      .optional()
      .describe("需要返回的字段列表，不填返回所有字段"),
  },
  async ({ employee_id, fields }) => {
    const params: Record<string, string> = {
      $format: "json",
    };
    if (fields) params.$select = fields.join(",");

    // SuccessFactors: /EmpEmployment, SAP HCM: /EmployeeCollection
    const path =
      process.env.SAP_MODE === "sf"
        ? `/EmpEmployment?$filter=userId eq '${employee_id}'&$expand=empInfo`
        : `/api/odata/v2/EmployeeCollection('${employee_id}')`;

    const data = await sap.get(path, params);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ----- 工具：获取编制报告 -----
server.tool(
  "get_headcount_report",
  "获取SAP中指定组织单元的人力编制报告（在编人数/预算人数/空缺岗位），用于人力规划和编制管控",
  {
    org_unit: z.string().describe("组织单元ID（部门代码）"),
    as_of_date: z
      .string()
      .optional()
      .describe("快照日期，格式YYYY-MM-DD，不填返回当前"),
  },
  async ({ org_unit, as_of_date }) => {
    const dateFilter = as_of_date ? `&validFrom le datetime'${as_of_date}T00:00:00'` : "";
    const path =
      process.env.SAP_MODE === "sf"
        ? `/FODepartment?$filter=externalCode eq '${org_unit}'${dateFilter}&$expand=FODepartment_effectiveLatestStartDate_nav`
        : `/api/odata/v2/OrgUnitCollection('${org_unit}')`;

    const data = await sap.get(path, { $format: "json" });
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ----- 工具：查询薪酬数据 -----
server.tool(
  "get_compensation_data",
  "获取员工薪酬数据（基本工资/绩效工资/薪酬等级/薪酬组），支持薪酬分析和市场对标。注意：仅返回当前用户有权限的数据",
  {
    employee_id: z.string().describe("员工工号"),
    include_history: z.boolean().default(false).describe("是否包含历史薪酬记录"),
  },
  async ({ employee_id, include_history }) => {
    const path =
      process.env.SAP_MODE === "sf"
        ? `/EmpCompensation?$filter=userId eq '${employee_id}'${include_history ? "" : "&$top=1"}&$orderby=startDate desc`
        : `/api/odata/v2/EmpPayroll?$filter=EmployeeId eq '${employee_id}'`;

    const data = await sap.get(path, { $format: "json" });
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ----- 工具：创建岗位 -----
server.tool(
  "create_position",
  "在SAP HR中创建新岗位（Position），用于组织扩张、编制新增审批流程",
  {
    position_code: z.string().describe("岗位编码"),
    position_name: z.string().describe("岗位名称"),
    org_unit: z.string().describe("归属组织单元（部门代码）"),
    job_code: z.string().describe("职务代码（Job Classification）"),
    effective_date: z.string().describe("生效日期，格式YYYY-MM-DD"),
    headcount: z.number().default(1).describe("编制人数"),
    reports_to: z.string().optional().describe("直接上级岗位编码"),
  },
  async (positionData) => {
    const path =
      process.env.SAP_MODE === "sf"
        ? "/Position"
        : "/api/odata/v2/PositionCollection";

    const payload =
      process.env.SAP_MODE === "sf"
        ? {
            code: positionData.position_code,
            externalName_defaultValue: positionData.position_name,
            department: positionData.org_unit,
            jobCode: positionData.job_code,
            effectiveStartDate: positionData.effective_date,
            maxNumOfOpenings: positionData.headcount,
            reportsTo: positionData.reports_to,
          }
        : {
            Position: positionData.position_code,
            OrganizationalUnit: positionData.org_unit,
            ValidityBeginDate: positionData.effective_date,
          };

    const data = await sap.post(path, payload);
    return {
      content: [
        {
          type: "text",
          text: `岗位创建${data ? "成功" : "失败"}: ${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }
);

// ----- 工具：获取培训记录 -----
server.tool(
  "get_training_records",
  "获取员工在SAP Learning中的培训完成记录，用于培训效果分析和合规性追踪",
  {
    employee_id: z.string().describe("员工工号"),
    from_date: z.string().optional().describe("开始日期 YYYY-MM-DD"),
    to_date: z.string().optional().describe("结束日期 YYYY-MM-DD"),
    status: z
      .enum(["COMPLETED", "IN_PROGRESS", "ENROLLED"])
      .optional()
      .describe("培训状态筛选"),
  },
  async ({ employee_id, from_date, to_date, status }) => {
    let filter = `userId eq '${employee_id}'`;
    if (from_date) filter += ` and completionDate ge datetime'${from_date}T00:00:00'`;
    if (to_date) filter += ` and completionDate le datetime'${to_date}T23:59:59'`;
    if (status) filter += ` and status eq '${status}'`;

    const data = await sap.get("/LearnerHistory", {
      $filter: filter,
      $format: "json",
      $orderby: "completionDate desc",
    });

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ----- 工具：绩效评估记录查询 -----
server.tool(
  "get_performance_reviews",
  "获取员工在SAP SuccessFactors中的绩效评估记录，用于绩效趋势分析和薪酬决策支持",
  {
    employee_id: z.string().describe("员工工号"),
    review_period: z.string().optional().describe("绩效周期，格式如 2024Q4 或 2024"),
  },
  async ({ employee_id, review_period }) => {
    let filter = `userId eq '${employee_id}'`;
    if (review_period) filter += ` and performancePeriod/externalCode eq '${review_period}'`;

    const data = await sap.get("/PerformanceReview", {
      $filter: filter,
      $format: "json",
      $expand: "ratingSource",
      $orderby: "lastModifiedDateTime desc",
    });

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ===== 启动服务 =====
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const mode = process.env.SAP_MODE === "sf" ? "SuccessFactors" : "HCM";
  console.error(`SAP ${mode} HR MCP Server 已启动`);
}

main().catch(console.error);
