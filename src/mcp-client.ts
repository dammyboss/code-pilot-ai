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
    sanitizedServerName?: string;
    sanitizedToolName?: string;
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

        // Validate configuration
        this.validateConfig();
    }

    private validateConfig(): void {
        if (!this.config.url && !this.config.command) {
            const error = `MCP server '${this.serverName}' must have either 'url' (for remote server) or 'command' (for local server)`;
            this.outputChannel.appendLine(`[${this.serverName}] Configuration error: ${error}`);
            throw new Error(error);
        }

        if (this.config.url && this.config.command) {
            this.outputChannel.appendLine(`[${this.serverName}] Warning: Both 'url' and 'command' specified. Will use remote connection (url).`);
        }

        // Validate remote server config
        if (this.config.url) {
            try {
                new URL(this.config.url);
            } catch (e) {
                const error = `Invalid URL for MCP server '${this.serverName}': ${this.config.url}`;
                this.outputChannel.appendLine(`[${this.serverName}] Configuration error: ${error}`);
                throw new Error(error);
            }
        }

        // Validate local server config
        if (this.config.command && !this.config.url) {
            if (typeof this.config.command !== 'string' || this.config.command.trim() === '') {
                const error = `Invalid command for MCP server '${this.serverName}': command must be a non-empty string`;
                this.outputChannel.appendLine(`[${this.serverName}] Configuration error: ${error}`);
                throw new Error(error);
            }
        }
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
                const errorMsg = `MCP server '${this.serverName}' process error: ${error.message}`;
                this.outputChannel.appendLine(`[${this.serverName}] ${errorMsg}`);

                // Show error notification
                vscode.window.showErrorMessage(errorMsg, 'Open Output').then(selection => {
                    if (selection === 'Open Output') {
                        this.outputChannel.show();
                    }
                });

                reject(error);
            });

            this.process.on('close', (code) => {
                this.outputChannel.appendLine(`[${this.serverName}] Process closed with code ${code}`);
                this.isConnected = false;

                if (code !== 0 && code !== null) {
                    vscode.window.showWarningMessage(`MCP server '${this.serverName}' exited with code ${code}`);
                }
            });

            // Initialize the connection
            setTimeout(async () => {
                try {
                    await this.initialize();
                    this.isConnected = true;
                    this.outputChannel.appendLine(`[${this.serverName}] Connected to local MCP server with ${this.tools.length} tools`);

                    // Notify user of successful connection
                    vscode.window.showInformationMessage(`MCP server '${this.serverName}' connected successfully with ${this.tools.length} tools`);

                    resolve();
                } catch (error: any) {
                    const errorMsg = `Failed to initialize MCP server '${this.serverName}': ${error.message}`;
                    this.outputChannel.appendLine(`[${this.serverName}] ${errorMsg}`);

                    // Show error notification
                    vscode.window.showErrorMessage(errorMsg, 'Open Output').then(selection => {
                        if (selection === 'Open Output') {
                            this.outputChannel.show();
                        }
                    });

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

            // Check if response is SSE format
            const contentType = response.headers.get('content-type') || '';
            let result: any;

            if (contentType.includes('text/event-stream')) {
                // Handle SSE response
                const text = await response.text();
                const lines = text.split('\n');
                let jsonData = '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        jsonData = line.substring(6);
                        break;
                    }
                }

                if (jsonData) {
                    result = JSON.parse(jsonData);
                } else {
                    throw new Error('No data found in SSE response');
                }
            } else {
                // Standard JSON response
                result = await response.json();
            }

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

            // Parse tools response (may be SSE format)
            const toolsContentType = toolsResponse.headers.get('content-type') || '';
            let toolsResult: any;

            if (toolsContentType.includes('text/event-stream')) {
                // Handle SSE response
                const toolsText = await toolsResponse.text();
                const toolsLines = toolsText.split('\n');
                let toolsJsonData = '';

                for (const line of toolsLines) {
                    if (line.startsWith('data: ')) {
                        toolsJsonData = line.substring(6);
                        break;
                    }
                }

                if (toolsJsonData) {
                    toolsResult = JSON.parse(toolsJsonData);
                } else {
                    throw new Error('No tools data found in SSE response');
                }
            } else {
                // Standard JSON response
                toolsResult = await toolsResponse.json();
            }

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

            // Notify user of successful connection
            vscode.window.showInformationMessage(`MCP server '${this.serverName}' connected successfully with ${this.tools.length} tools`);
        } catch (error: any) {
            const errorMsg = `Failed to connect to MCP server '${this.serverName}': ${error.message}`;
            this.outputChannel.appendLine(`[${this.serverName}] ${errorMsg}`);

            // Show error notification to user
            vscode.window.showErrorMessage(errorMsg, 'Open Output').then(selection => {
                if (selection === 'Open Output') {
                    this.outputChannel.show();
                }
            });

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

            // Parse response (may be SSE format)
            const callContentType = response.headers.get('content-type') || '';
            let result: any;

            if (callContentType.includes('text/event-stream')) {
                // Handle SSE response
                const callText = await response.text();
                const callLines = callText.split('\n');
                let callJsonData = '';

                for (const line of callLines) {
                    if (line.startsWith('data: ')) {
                        callJsonData = line.substring(6);
                        break;
                    }
                }

                if (callJsonData) {
                    result = JSON.parse(callJsonData);
                } else {
                    throw new Error('No data found in SSE response');
                }
            } else {
                // Standard JSON response
                result = await response.json();
            }

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

        // Get tools from manually configured MCP servers
        for (const [name, server] of this.servers) {
            if (server.isActive()) {
                tools.push(...server.getTools());
            }
        }

        // Add VS Code native MCP tools
        tools.push(...this.getVSCodeMCPTools());

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

    private sanitizeToolName(name: string): string {
        // Replace any character that's not alphanumeric, underscore, or hyphen with underscore
        return name.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    getToolsForAPI(format: 'anthropic' | 'azure'): any[] {
        const mcpTools = this.getAllTools();

        // Store sanitized names in tool metadata for later lookup
        mcpTools.forEach(tool => {
            tool.sanitizedServerName = this.sanitizeToolName(tool.serverName);
            tool.sanitizedToolName = this.sanitizeToolName(tool.name);
        });

        if (format === 'anthropic') {
            return mcpTools.map(tool => ({
                name: `mcp_${tool.sanitizedServerName}_${tool.sanitizedToolName}`,
                description: `[MCP: ${tool.serverName}] ${tool.description}`,
                input_schema: this.sanitizeSchema(tool.inputSchema)
            }));
        } else {
            return mcpTools.map(tool => ({
                type: 'function',
                function: {
                    name: `mcp_${tool.sanitizedServerName}_${tool.sanitizedToolName}`,
                    description: `[MCP: ${tool.serverName}] ${tool.description}`,
                    parameters: this.sanitizeSchema(tool.inputSchema)
                }
            }));
        }
    }

    async callTool(fullToolName: string, args: any): Promise<{ success: boolean; result: string; error?: string }> {
        // Find the tool in our list to get the original server name
        const allTools = this.getAllTools();
        const tool = allTools.find(t =>
            fullToolName === `mcp_${t.sanitizedServerName}_${t.sanitizedToolName}`
        );

        if (!tool) {
            return { success: false, result: '', error: `MCP tool not found: ${fullToolName}` };
        }

        // Check if this is a VS Code native MCP tool
        if (tool.serverName === 'VSCode-MCP') {
            return await this.callVSCodeTool(tool.name, args);
        }

        // Otherwise, use the regular MCP server connection
        const server = this.servers.get(tool.serverName);

        if (!server || !server.isActive()) {
            return { success: false, result: '', error: `MCP server not connected: ${tool.serverName}` };
        }

        try {
            const result = await server.callTool(tool.name, args);

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

    // VS Code native MCP tools support
    getVSCodeMCPTools(): MCPTool[] {
        const vscodeTools: MCPTool[] = [];

        try {
            // Access VS Code's language model tools API
            if (vscode.lm && (vscode.lm as any).tools) {
                const tools = (vscode.lm as any).tools as any[];

                for (const tool of tools) {
                    // Filter for MCP tools (they usually have a specific naming pattern or metadata)
                    if (tool.name && tool.name.startsWith('mcp_') || tool.tags?.includes('mcp')) {
                        vscodeTools.push({
                            name: tool.name,
                            description: tool.description || '',
                            inputSchema: tool.inputSchema || { type: 'object', properties: {} },
                            serverName: 'VSCode-MCP',
                            sanitizedServerName: 'VSCode-MCP',
                            sanitizedToolName: this.sanitizeToolName(tool.name)
                        });
                    }
                }

                this.outputChannel.appendLine(`Discovered ${vscodeTools.length} VS Code MCP tools`);
            }
        } catch (error: any) {
            this.outputChannel.appendLine(`Failed to discover VS Code MCP tools: ${error.message}`);
        }

        return vscodeTools;
    }

    async callVSCodeTool(toolName: string, args: any): Promise<{ success: boolean; result: string; error?: string }> {
        try {
            if (!vscode.lm || !(vscode.lm as any).invokeTool) {
                return { success: false, result: '', error: 'VS Code LM API not available' };
            }

            // Invoke the tool using VS Code's API
            const result = await (vscode.lm as any).invokeTool(toolName, { input: args });

            // Extract text content from the result
            let content = '';
            if (result && Array.isArray(result)) {
                for (const part of result) {
                    if (part.text) {
                        content += part.text;
                    }
                }
            } else if (typeof result === 'string') {
                content = result;
            } else {
                content = JSON.stringify(result);
            }

            return { success: true, result: content };
        } catch (error: any) {
            return { success: false, result: '', error: error.message };
        }
    }
}
