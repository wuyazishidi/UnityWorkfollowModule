import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";

// 端口默认 3212，为支持动态端口，从 UTO 目录下的 .port 读取
function getUnityPort(): number {
    try {
        const candidates = [
            path.resolve(__dirname, "../.port"),
            path.resolve(__dirname, "../../.port"),
        ];

        for (const p of candidates) {
            if (fs.existsSync(p)) {
                const content = fs.readFileSync(p, "utf-8").trim();
                const port = parseInt(content, 10);
                if (!isNaN(port)) {
                    return port;
                }
            }
        }
    } catch (e) {
        // Ignore
    }
    return 3212;
}

function getUnityUrl(): string {
    const port = getUnityPort();
    return `http://127.0.0.1:${port}`;
}

// 辅助函数：获取 InstanceId
async function getInstanceId(): Promise<string | null> {
    try {
        const agent = new http.Agent({ keepAlive: false, maxSockets: 1 });
        const url = getUnityUrl();
        const response = await axios.get(`${url}/health`, { 
            timeout: 3000,
            proxy: false, // 本机回环调用禁用代理
            httpAgent: agent
        });
        agent.destroy();
        
        return response.data?.serverId || null;
    } catch (e) {
        return null;
    }
}

// 健康检查
async function healthCheck(): Promise<boolean> {
    // 为每次请求创建新的 Agent
    const agent = new http.Agent({
        keepAlive: false,
        maxSockets: 1
    });

    try {
        const url = getUnityUrl();
        const response = await axios.get(`${url}/health`, { 
            timeout: 3000,
            proxy: false, // 本机回环调用禁用代理
            httpAgent: agent
        });
        
        // 立即销毁 Agent
        agent.destroy();
        
        return response.status === 200;
    } catch (e) {
        // 确保 Agent 被销毁
        agent.destroy();
        return false;
    }
}

// Unity RPC 调用
async function callUnityRpc(method: string, params: any = {}): Promise<any> {
    const url = getUnityUrl();
    const port = getUnityPort();

    // 为每次请求创建新的 Agent
    const agent = new http.Agent({
        keepAlive: false,
        maxSockets: 1
    });

    try {
        const response = await axios.post(`${url}/rpc`, {
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: Date.now(),
        }, { 
            timeout: 30000,
            proxy: false, // 本机回环调用禁用代理
            httpAgent: agent,
            headers: {
                'Connection': 'close'  // 强制关闭连接
            }
        });

        // 立即销毁 Agent
        agent.destroy();

        if (response.data.error) {
            throw new Error(response.data.error.message);
        }

        return response.data.result;
    } catch (error: any) {
        // 确保 Agent 被销毁
        agent.destroy();
        
        if (error.code === 'ECONNREFUSED') {
            throw new Error(`Unity 连接被拒绝 (端口: ${port}, Unity 是否运行?)`);
        }
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            throw new Error(`Unity 响应超时 (端口: ${port})`);
        }
        throw error;
    }
}

// MCP Server
const server = new Server(
  {
    name: "uto",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 静态工具清单兜底:Unity 侧尚未实现 ListTools RPC,但 /rpc 可以按名字调用这些工具。
// 若上游后续实现 ListTools,动态结果优先。清单与参数说明来源:Config/README.md
const STATIC_TOOLS = [
    {
        name: "Log",
        description: "在 Unity Console 输出一条普通日志",
        inputSchema: { type: "object", properties: { message: { type: "string", description: "日志内容" } }, required: ["message"] }
    },
    {
        name: "LogError",
        description: "在 Unity Console 输出一条错误日志",
        inputSchema: { type: "object", properties: { message: { type: "string", description: "错误内容" } }, required: ["message"] }
    },
    {
        name: "EnterPlayMode",
        description: "让 Unity 编辑器进入 PlayMode",
        inputSchema: { type: "object", properties: {} }
    },
    {
        name: "StopPlayMode",
        description: "让 Unity 编辑器退出 PlayMode(未运行时返回 SKIPPED)",
        inputSchema: { type: "object", properties: {} }
    },
    {
        name: "TriggerCompile",
        description: "触发 Unity 脚本编译。注意:编辑器在后台时先用 ExecuteMenu 执行 Assets/Refresh,否则感知不到磁盘上的代码改动",
        inputSchema: { type: "object", properties: { Force: { type: "boolean", description: "是否强制编译", default: false } } }
    },
    {
        name: "GetCompileResult",
        description: "获取最近一次 Unity 编译的结果摘要(成功/错误列表)",
        inputSchema: { type: "object", properties: {} }
    },
    {
        name: "GetConsoleLog",
        description: "读取 Unity Console 日志",
        inputSchema: {
            type: "object",
            properties: {
                logType: { type: "number", description: "日志类型过滤" },
                logMaxCount: { type: "number", description: "最大返回条数", default: 100 },
                removeStackTrace: { type: "boolean", description: "是否去掉堆栈", default: true }
            }
        }
    },
    {
        name: "ExecuteMenu",
        description: "执行 Unity 编辑器菜单命令,例如 Assets/Refresh",
        inputSchema: { type: "object", properties: { menuPath: { type: "string", description: "菜单路径,如 Assets/Refresh" } }, required: ["menuPath"] }
    },
    {
        name: "AssertConsoleContains",
        description: "断言 Unity Console 中包含指定关键词",
        inputSchema: {
            type: "object",
            properties: {
                keyword: { type: "string", description: "单关键词" },
                keywordsJson: { type: "string", description: "多关键词 JSON 数组字符串" },
                matchAll: { type: "boolean" },
                ignoreCase: { type: "boolean" },
                useRegex: { type: "boolean" },
                tailCount: { type: "number" },
                removeStackTrace: { type: "boolean" }
            }
        }
    }
];

// ListTools - 优先从 Unity MCP 动态获取,失败则返回静态清单
server.setRequestHandler(ListToolsRequestSchema, async () => {
    try {
        const result = await callUnityRpc("ListTools", {});
        if (result && result.tools && result.tools.length > 0) {
            return { tools: result.tools };
        }
    } catch (error) {
        // Unity MCP 不支持 ListTools 或未就绪,使用静态清单
    }

    return { tools: STATIC_TOOLS };
});

// CallTool - 直接转发到 Unity MCP（心跳检测在 http-server 层处理）
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    // 直接转发到 Unity MCP
    try {
        const result = await callUnityRpc(name, args || {});
        
        if (result && result.success) {
            return {
                content: [{ type: "text", text: result.message || "Success" }]
            };
        } else {
            return {
                content: [{ type: "text", text: result?.message || "Unknown error" }],
                isError: true
            };
        }
    } catch (error: any) {
        return {
            content: [{ type: "text", text: `RPC Failed: ${error.message}` }],
            isError: true
        };
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("UTO Server running on stdio (pure proxy mode)");
}

// 根据启动参数决定运行模式
if (require.main === module) {
    const args = process.argv.slice(2);
    
    const isStdioMode = process.env.MCP_STDIO_MODE === '1';
    
    if (args.includes('--http') && !isStdioMode) {
        // HTTP 模式（无需传递端口，自动从 .port 文件读取）
        import('./http-server.js').then(({ startHttpServer }) => {
            startHttpServer().catch((error: any) => {
                console.error("HTTP Server 启动失败:", error);
                process.exit(1);
            });
        });
    } else {
        // Stdio 模式
        main().catch((error) => {
            console.error("Fatal error:", error);
            process.exit(1);
        });
    }
}
