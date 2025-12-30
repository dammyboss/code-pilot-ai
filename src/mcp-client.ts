import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

export interface MCPServerConfig {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string; // For remote MCP servers
    headers?: Record<string, string>; // For remote MCP servers
}

export interface MCPTool {
    name: string;
    description: string;
    inputSchema: any;
    serverName: string;
}

interface JsonRpcRequest {
    jsonrpc: '2.0';
    id: number;
    method: string;
    params?: any;
}

interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: number;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}

class MCPServerConnection {
    private process: cp.ChildProcess | null = null;
    private requestId = 0;
    private pendingRequests = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>();
    private buffer = '';
    private tools: MCPTool[] = [];
    private serverName: string;
    private config: MCPServerConfig;
    private outputChannel: vscode.OutputChannel;
    private isConnected = false;

    constructor(serverName: string, config: MCPServerConfig, outputChannel: vscode.OutputChannel) {
        this.serverName = serverName;
        this.config = config;
        this.outputChannel = outputChannel;
    }

    async connect(): Promise<void> {
        if (this.config.url) {
            // Remote MCP server - use HTTP transport
            await this.connectRemote();
        } else {
            // Local MCP server - use stdio transport
            await this.connectLocal();
        }
    }

    private async connectLocal(): Promise<void> {
        return new Promise((resolve, reject) => {
            const env = { ...process.env, ...this.config.env };

            this.outputChannel.appendLine(`Starting MCP server: ${this.serverName}`);
            this.outputChannel.appendLine(`Command: ${this.config.command} ${(this.config.args || []).join(' ')}`);

            this.process = cp.spawn(this.config.command, this.config.args || [], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env
            });

            this.process.stdout?.on('data', (data) => {
                this.handleData(data.toString());
            });

            this.process.stderr?.on('data', (data) => {
                this.outputChannel.appendLine(`[${this.serverName}] stderr: ${data.toString()}`);
            });

            this.process.on('error', (error) => {
                this.outputChannel.appendLine(`[${this.serverName}] Process error: ${error.message}`);
                reject(error);
            });

            this.process.on('close', (code) => {
                this.outputChannel.appendLine(`[${this.serverName}] Process closed with code ${code}`);
                this.isConnected = false;
            });

            // Initialize the connection
            setTimeout(async () => {
                try {
                    await this.initialize();
                    this.isConnected = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }, 500);
        });
    }

    private async connectRemote(): Promise<void> {
        // For remote MCP servers, we use HTTP transport
        // Just test the connection and get tools
        try {
            const response = await fetch(this.config.url!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'initialize',
                    params: {
                        protocolVersion: '2024-11-05',
                        capabilities: {},
                        clientInfo: {
                            name: 'code-pilot-ai',
                            version: '1.0.0'
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to connect to remote MCP server: ${response.status}`);
            }

            const result: any = await response.json();
            if (result.error) {
                throw new Error(result.error.message);
            }

            // Get tools list
            const toolsResponse = await fetch(this.config.url!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 2,
                    method: 'tools/list',
                    params: {}
                })
            });

            const toolsResult: any = await toolsResponse.json();
            if (toolsResult.result?.tools) {
                this.tools = toolsResult.result.tools.map((tool: any) => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                    serverName: this.serverName
                }));
            }

            this.isConnected = true;
            this.outputChannel.appendLine(`[${this.serverName}] Connected to remote MCP server with ${this.tools.length} tools`);
        } catch (error: any) {
            this.outputChannel.appendLine(`[${this.serverName}] Failed to connect: ${error.message}`);
            throw error;
        }
    }

    private async initialize(): Promise<void> {
        // Send initialize request
        const initResult = await this.sendRequest('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
                name: 'code-pilot-ai',
                version: '1.0.0'
            }
        });

        this.outputChannel.appendLine(`[${this.serverName}] Initialized: ${JSON.stringify(initResult)}`);

        // Send initialized notification
        this.sendNotification('notifications/initialized', {});

        // Get tools list
        const toolsResult = await this.sendRequest('tools/list', {});
        if (toolsResult?.tools) {
            this.tools = toolsResult.tools.map((tool: any) => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
                serverName: this.serverName
            }));
            this.outputChannel.appendLine(`[${this.serverName}] Loaded ${this.tools.length} tools`);
        }
    }

    private handleData(data: string): void {
        this.buffer += data;

        // Process complete JSON-RPC messages
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || '';

        for (const line of lines) {
            if (!line.trim()) continue;

            try {
                const message = JSON.parse(line);
                this.handleMessage(message);
            } catch (error) {
                this.outputChannel.appendLine(`[${this.serverName}] Failed to parse message: ${line}`);
            }
        }
    }

    private handleMessage(message: JsonRpcResponse): void {
        if (message.id !== undefined && this.pendingRequests.has(message.id)) {
            const { resolve, reject } = this.pendingRequests.get(message.id)!;
            this.pendingRequests.delete(message.id);

            if (message.error) {
                reject(new Error(message.error.message));
            } else {
                resolve(message.result);
            }
        }
    }

    private sendRequest(method: string, params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = ++this.requestId;
            const request: JsonRpcRequest = {
                jsonrpc: '2.0',
                id,
                method,
                params
            };

            this.pendingRequests.set(id, { resolve, reject });

            const message = JSON.stringify(request) + '\n';
            this.process?.stdin?.write(message);

            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }

    private sendNotification(method: string, params: any): void {
        const notification = {
            jsonrpc: '2.0',
            method,
            params
        };

        const message = JSON.stringify(notification) + '\n';
        this.process?.stdin?.write(message);
    }

    async callTool(toolName: string, args: any): Promise<any> {
        if (this.config.url) {
            // Remote MCP server
            const response = await fetch(this.config.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.config.headers
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: ++this.requestId,
                    method: 'tools/call',
                    params: {
                        name: toolName,
                        arguments: args
                    }
                })
            });

            const result: any = await response.json();
            if (result.error) {
                throw new Error(result.error.message);
            }
            return result.result;
        } else {
            // Local MCP server
            return this.sendRequest('tools/call', {
                name: toolName,
                arguments: args
            });
        }
    }

    getTools(): MCPTool[] {
        return this.tools;
    }

    isActive(): boolean {
        return this.isConnected;
    }

    disconnect(): void {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
        this.isConnected = false;
    }
}

export class MCPClient {
    private servers = new Map<string, MCPServerConnection>();
    private outputChannel: vscode.OutputChannel;
    private configPath: string;

    constructor(outputChannel: vscode.OutputChannel, configPath: string) {
        this.outputChannel = outputChannel;
        this.configPath = configPath;
    }

    async loadServers(configs: Record<string, MCPServerConfig>): Promise<void> {
        // Disconnect existing servers
        for (const [name, server] of this.servers) {
            server.disconnect();
        }
        this.servers.clear();

        // Connect to new servers
        for (const [name, config] of Object.entries(configs)) {
            try {
                const server = new MCPServerConnection(name, config, this.outputChannel);
                await server.connect();
                this.servers.set(name, server);
                this.outputChannel.appendLine(`Connected to MCP server: ${name}`);
            } catch (error: any) {
                this.outputChannel.appendLine(`Failed to connect to MCP server ${name}: ${error.message}`);
            }
        }
    }

    async connectServer(name: string, config: MCPServerConfig): Promise<boolean> {
        try {
            // Disconnect existing connection if any
            if (this.servers.has(name)) {
                this.servers.get(name)?.disconnect();
            }

            const server = new MCPServerConnection(name, config, this.outputChannel);
            await server.connect();
            this.servers.set(name, server);
            return true;
        } catch (error: any) {
            this.outputChannel.appendLine(`Failed to connect to MCP server ${name}: ${error.message}`);
            return false;
        }
    }

    disconnectServer(name: string): void {
        const server = this.servers.get(name);
        if (server) {
            server.disconnect();
            this.servers.delete(name);
        }
    }

    getAllTools(): MCPTool[] {
        const tools: MCPTool[] = [];
        for (const [name, server] of this.servers) {
            if (server.isActive()) {
                tools.push(...server.getTools());
            }
        }
        return tools;
    }

    /**
     * Sanitize JSON schema to fix common issues that cause API rejections
     * - Arrays must have 'items' defined
     * - Remove unsupported properties
     */
    private sanitizeSchema(schema: any): any {
        if (!schema || typeof schema !== 'object') {
            return schema;
        }

        const sanitized: any = {};

        for (const [key, value] of Object.entries(schema)) {
            if (key === 'properties' && typeof value === 'object') {
                // Recursively sanitize properties
                sanitized[key] = {};
                for (const [propName, propSchema] of Object.entries(value as Record<string, any>)) {
                    sanitized[key][propName] = this.sanitizeSchema(propSchema);
                }
            } else if (key === 'items' && typeof value === 'object') {
                // Recursively sanitize array items
                sanitized[key] = this.sanitizeSchema(value);
            } else if (Array.isArray(value)) {
                // Handle arrays (like 'required' array)
                sanitized[key] = value;
            } else if (typeof value === 'object') {
                sanitized[key] = this.sanitizeSchema(value);
            } else {
                sanitized[key] = value;
            }
        }

        // Fix: If type is 'array' but no 'items' defined, add a generic items schema
        if (sanitized.type === 'array' && !sanitized.items) {
            sanitized.items = { type: 'object' };
            this.outputChannel.appendLine(`Fixed missing 'items' in array schema`);
        }

        return sanitized;
    }

    getToolsForAPI(format: 'anthropic' | 'azure'): any[] {
        const mcpTools = this.getAllTools();

        if (format === 'anthropic') {
            return mcpTools.map(tool => ({
                name: `mcp_${tool.serverName}_${tool.name}`,
                description: `[MCP: ${tool.serverName}] ${tool.description}`,
                input_schema: this.sanitizeSchema(tool.inputSchema)
            }));
        } else {
            return mcpTools.map(tool => ({
                type: 'function',
                function: {
                    name: `mcp_${tool.serverName}_${tool.name}`,
                    description: `[MCP: ${tool.serverName}] ${tool.description}`,
                    parameters: this.sanitizeSchema(tool.inputSchema)
                }
            }));
        }
    }

    async callTool(fullToolName: string, args: any): Promise<{ success: boolean; result: string; error?: string }> {
        // Parse the tool name: mcp_serverName_toolName
        const match = fullToolName.match(/^mcp_([^_]+)_(.+)$/);
        if (!match) {
            return { success: false, result: '', error: `Invalid MCP tool name format: ${fullToolName}` };
        }

        const [, serverName, toolName] = match;
        const server = this.servers.get(serverName);

        if (!server || !server.isActive()) {
            return { success: false, result: '', error: `MCP server not connected: ${serverName}` };
        }

        try {
            const result = await server.callTool(toolName, args);

            // Extract content from result
            let content = '';
            if (result?.content) {
                for (const block of result.content) {
                    if (block.type === 'text') {
                        content += block.text;
                    }
                }
            }

            return { success: true, result: content || JSON.stringify(result) };
        } catch (error: any) {
            return { success: false, result: '', error: error.message };
        }
    }

    getActiveServers(): string[] {
        const active: string[] = [];
        for (const [name, server] of this.servers) {
            if (server.isActive()) {
                active.push(name);
            }
        }
        return active;
    }

    disconnectAll(): void {
        for (const [_, server] of this.servers) {
            server.disconnect();
        }
        this.servers.clear();
    }
}
