import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import { glob } from 'glob';
import { MCPClient } from './mcp-client';

// Tool definitions for Anthropic API format
export const anthropicTools = [
    {
        name: "Read",
        description: "Reads a file from the filesystem. Returns the file contents with line numbers. Can read text files, and will describe binary files.",
        input_schema: {
            type: "object",
            properties: {
                file_path: {
                    type: "string",
                    description: "The absolute path to the file to read"
                },
                offset: {
                    type: "number",
                    description: "The line number to start reading from (1-indexed). Optional."
                },
                limit: {
                    type: "number",
                    description: "The number of lines to read. Optional, defaults to 2000."
                }
            },
            required: ["file_path"]
        }
    },
    {
        name: "Write",
        description: "Writes content to a file. Creates the file if it doesn't exist, overwrites if it does.",
        input_schema: {
            type: "object",
            properties: {
                file_path: {
                    type: "string",
                    description: "The absolute path to the file to write"
                },
                content: {
                    type: "string",
                    description: "The content to write to the file"
                }
            },
            required: ["file_path", "content"]
        }
    },
    {
        name: "Edit",
        description: "Performs exact string replacement in a file. Use this to edit existing files by specifying the exact text to find and replace.",
        input_schema: {
            type: "object",
            properties: {
                file_path: {
                    type: "string",
                    description: "The absolute path to the file to edit"
                },
                old_string: {
                    type: "string",
                    description: "The exact string to find in the file"
                },
                new_string: {
                    type: "string",
                    description: "The string to replace it with"
                },
                replace_all: {
                    type: "boolean",
                    description: "If true, replace all occurrences. Default is false (replace first occurrence only)."
                }
            },
            required: ["file_path", "old_string", "new_string"]
        }
    },
    {
        name: "Bash",
        description: "Executes a bash command in the shell. Use for running scripts, git commands, npm commands, etc.",
        input_schema: {
            type: "object",
            properties: {
                command: {
                    type: "string",
                    description: "The bash command to execute"
                },
                timeout: {
                    type: "number",
                    description: "Timeout in milliseconds. Default is 120000 (2 minutes)."
                }
            },
            required: ["command"]
        }
    },
    {
        name: "Glob",
        description: "Finds files matching a glob pattern. Use for finding files by name or extension.",
        input_schema: {
            type: "object",
            properties: {
                pattern: {
                    type: "string",
                    description: "The glob pattern to match (e.g., '**/*.ts', 'src/**/*.js')"
                },
                path: {
                    type: "string",
                    description: "The directory to search in. Defaults to workspace root."
                }
            },
            required: ["pattern"]
        }
    },
    {
        name: "Grep",
        description: "Searches for a pattern in files. Returns matching lines with file paths and line numbers.",
        input_schema: {
            type: "object",
            properties: {
                pattern: {
                    type: "string",
                    description: "The regex pattern to search for"
                },
                path: {
                    type: "string",
                    description: "The file or directory to search in. Defaults to workspace root."
                },
                include: {
                    type: "string",
                    description: "Glob pattern for files to include (e.g., '*.ts')"
                }
            },
            required: ["pattern"]
        }
    },
    {
        name: "ListDirectory",
        description: "Lists the contents of a directory, showing files and subdirectories.",
        input_schema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The absolute path to the directory to list"
                }
            },
            required: ["path"]
        }
    }
];

// Convert to Azure OpenAI format (functions)
export const azureTools = anthropicTools.map(tool => ({
    type: "function",
    function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema
    }
}));

// Tool execution class
export class ToolExecutor {
    private workspaceRoot: string;
    private outputChannel: vscode.OutputChannel;
    private permissionCallback: (toolName: string, args: any) => Promise<boolean>;
    private mcpClient?: MCPClient;

    constructor(
        workspaceRoot: string,
        outputChannel: vscode.OutputChannel,
        permissionCallback: (toolName: string, args: any) => Promise<boolean>
    ) {
        this.workspaceRoot = workspaceRoot;
        this.outputChannel = outputChannel;
        this.permissionCallback = permissionCallback;
    }

    setMCPClient(mcpClient: MCPClient) {
        this.mcpClient = mcpClient;
    }

    getMCPTools(format: 'anthropic' | 'azure'): any[] {
        if (!this.mcpClient) {
            return [];
        }
        return this.mcpClient.getToolsForAPI(format);
    }

    async executeTool(toolName: string, args: any): Promise<{ success: boolean; result: string; error?: string }> {
        this.outputChannel.appendLine(`Executing tool: ${toolName}`);
        this.outputChannel.appendLine(`Arguments: ${JSON.stringify(args, null, 2)}`);

        try {
            // Check permission before executing
            const hasPermission = await this.permissionCallback(toolName, args);
            if (!hasPermission) {
                return { success: false, result: '', error: 'Permission denied by user' };
            }

            // Check if this is an MCP tool
            if (toolName.startsWith('mcp_') && this.mcpClient) {
                return await this.mcpClient.callTool(toolName, args);
            }

            switch (toolName) {
                case 'Read':
                    return await this.readFile(args);
                case 'Write':
                    return await this.writeFile(args);
                case 'Edit':
                    return await this.editFile(args);
                case 'Bash':
                    return await this.executeBash(args);
                case 'Glob':
                    return await this.executeGlob(args);
                case 'Grep':
                    return await this.executeGrep(args);
                case 'ListDirectory':
                    return await this.listDirectory(args);
                default:
                    return { success: false, result: '', error: `Unknown tool: ${toolName}` };
            }
        } catch (error: any) {
            this.outputChannel.appendLine(`Tool error: ${error.message}`);
            return { success: false, result: '', error: error.message };
        }
    }

    private async readFile(args: { file_path: string; offset?: number; limit?: number }): Promise<{ success: boolean; result: string; error?: string }> {
        const filePath = this.resolvePath(args.file_path);

        if (!fs.existsSync(filePath)) {
            return { success: false, result: '', error: `File not found: ${filePath}` };
        }

        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            return { success: false, result: '', error: `Path is a directory, not a file: ${filePath}` };
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        const offset = (args.offset || 1) - 1; // Convert to 0-indexed
        const limit = args.limit || 2000;

        const selectedLines = lines.slice(offset, offset + limit);
        const numberedLines = selectedLines.map((line, idx) => `${offset + idx + 1}\t${line}`);

        return { success: true, result: numberedLines.join('\n') };
    }

    private async writeFile(args: { file_path: string; content: string }): Promise<{ success: boolean; result: string; error?: string }> {
        const filePath = this.resolvePath(args.file_path);

        // Create directory if it doesn't exist
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, args.content, 'utf-8');
        return { success: true, result: `Successfully wrote ${args.content.length} characters to ${filePath}` };
    }

    private async editFile(args: { file_path: string; old_string: string; new_string: string; replace_all?: boolean }): Promise<{ success: boolean; result: string; error?: string }> {
        const filePath = this.resolvePath(args.file_path);

        if (!fs.existsSync(filePath)) {
            return { success: false, result: '', error: `File not found: ${filePath}` };
        }

        let content = fs.readFileSync(filePath, 'utf-8');

        if (!content.includes(args.old_string)) {
            return { success: false, result: '', error: `String not found in file: "${args.old_string.substring(0, 50)}..."` };
        }

        if (args.replace_all) {
            content = content.split(args.old_string).join(args.new_string);
        } else {
            content = content.replace(args.old_string, args.new_string);
        }

        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true, result: `Successfully edited ${filePath}` };
    }

    private async executeBash(args: { command: string; timeout?: number }): Promise<{ success: boolean; result: string; error?: string }> {
        return new Promise((resolve) => {
            const timeout = args.timeout || 120000;
            const isWindows = process.platform === 'win32';

            const shell = isWindows ? 'cmd.exe' : '/bin/bash';
            const shellArgs = isWindows ? ['/c', args.command] : ['-c', args.command];

            const child = cp.spawn(shell, shellArgs, {
                cwd: this.workspaceRoot,
                timeout: timeout,
                env: { ...process.env }
            });

            let stdout = '';
            let stderr = '';

            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
                if (code === 0) {
                    resolve({ success: true, result: output || 'Command completed successfully' });
                } else {
                    resolve({ success: false, result: output, error: `Command exited with code ${code}` });
                }
            });

            child.on('error', (error) => {
                resolve({ success: false, result: '', error: error.message });
            });
        });
    }

    private async executeGlob(args: { pattern: string; path?: string }): Promise<{ success: boolean; result: string; error?: string }> {
        const searchPath = args.path ? this.resolvePath(args.path) : this.workspaceRoot;

        try {
            const files = await glob(args.pattern, {
                cwd: searchPath,
                nodir: true,
                absolute: true
            });

            if (files.length === 0) {
                return { success: true, result: 'No files found matching pattern' };
            }

            // Limit results to prevent huge outputs
            const limitedFiles = files.slice(0, 100);
            const result = limitedFiles.join('\n');

            if (files.length > 100) {
                return { success: true, result: result + `\n... and ${files.length - 100} more files` };
            }

            return { success: true, result };
        } catch (error: any) {
            return { success: false, result: '', error: error.message };
        }
    }

    private async executeGrep(args: { pattern: string; path?: string; include?: string }): Promise<{ success: boolean; result: string; error?: string }> {
        const searchPath = args.path ? this.resolvePath(args.path) : this.workspaceRoot;

        try {
            // Use ripgrep if available, otherwise fall back to manual search
            const rgPath = this.findRipgrep();

            if (rgPath) {
                return await this.executeRipgrep(rgPath, args.pattern, searchPath, args.include);
            } else {
                return await this.manualGrep(args.pattern, searchPath, args.include);
            }
        } catch (error: any) {
            return { success: false, result: '', error: error.message };
        }
    }

    private findRipgrep(): string | null {
        // Try to find ripgrep in common locations
        const possiblePaths = [
            'rg',
            '/usr/bin/rg',
            '/usr/local/bin/rg',
            'C:\\Program Files\\ripgrep\\rg.exe'
        ];

        for (const rgPath of possiblePaths) {
            try {
                cp.execSync(`${rgPath} --version`, { stdio: 'ignore' });
                return rgPath;
            } catch {
                continue;
            }
        }
        return null;
    }

    private async executeRipgrep(rgPath: string, pattern: string, searchPath: string, include?: string): Promise<{ success: boolean; result: string; error?: string }> {
        return new Promise((resolve) => {
            const args = ['-n', '--no-heading', pattern, searchPath];
            if (include) {
                args.push('-g', include);
            }
            args.push('--max-count', '100'); // Limit matches

            const child = cp.spawn(rgPath, args, {
                cwd: this.workspaceRoot,
                timeout: 30000
            });

            let stdout = '';
            let stderr = '';

            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0 || code === 1) { // rg returns 1 for no matches
                    resolve({ success: true, result: stdout || 'No matches found' });
                } else {
                    resolve({ success: false, result: stdout, error: stderr || `rg exited with code ${code}` });
                }
            });

            child.on('error', (error) => {
                resolve({ success: false, result: '', error: error.message });
            });
        });
    }

    private async manualGrep(pattern: string, searchPath: string, include?: string): Promise<{ success: boolean; result: string; error?: string }> {
        const regex = new RegExp(pattern, 'gi');
        const results: string[] = [];

        const searchFile = (filePath: string) => {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (regex.test(line)) {
                        results.push(`${filePath}:${idx + 1}:${line}`);
                    }
                });
            } catch {
                // Skip files that can't be read
            }
        };

        const walkDir = (dir: string) => {
            if (results.length > 100) return; // Limit results

            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    if (results.length > 100) break;

                    const fullPath = path.join(dir, entry.name);

                    // Skip common non-code directories
                    if (entry.isDirectory()) {
                        if (!['node_modules', '.git', 'dist', 'out', 'build'].includes(entry.name)) {
                            walkDir(fullPath);
                        }
                    } else if (entry.isFile()) {
                        if (!include || this.matchesGlob(entry.name, include)) {
                            searchFile(fullPath);
                        }
                    }
                }
            } catch {
                // Skip directories that can't be read
            }
        };

        if (fs.statSync(searchPath).isDirectory()) {
            walkDir(searchPath);
        } else {
            searchFile(searchPath);
        }

        return { success: true, result: results.join('\n') || 'No matches found' };
    }

    private matchesGlob(filename: string, pattern: string): boolean {
        // Simple glob matching for common patterns
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(`^${regexPattern}$`).test(filename);
    }

    private async listDirectory(args: { path: string }): Promise<{ success: boolean; result: string; error?: string }> {
        const dirPath = this.resolvePath(args.path);

        if (!fs.existsSync(dirPath)) {
            return { success: false, result: '', error: `Directory not found: ${dirPath}` };
        }

        const stats = fs.statSync(dirPath);
        if (!stats.isDirectory()) {
            return { success: false, result: '', error: `Path is not a directory: ${dirPath}` };
        }

        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        const formatted = entries.map(entry => {
            const prefix = entry.isDirectory() ? '[DIR] ' : '[FILE]';
            return `${prefix} ${entry.name}`;
        });

        return { success: true, result: formatted.join('\n') };
    }

    private resolvePath(inputPath: string): string {
        if (path.isAbsolute(inputPath)) {
            return inputPath;
        }
        return path.join(this.workspaceRoot, inputPath);
    }
}
