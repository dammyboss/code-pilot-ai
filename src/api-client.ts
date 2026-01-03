import * as vscode from 'vscode';
import { anthropicTools, azureTools, ToolExecutor } from './tools';

export interface Message {
    role: 'user' | 'assistant';
    content: string | ContentBlock[];
}

export interface ContentBlock {
    type: 'text' | 'tool_use' | 'tool_result' | 'image';
    text?: string;
    id?: string;
    name?: string;
    input?: any;
    tool_use_id?: string;
    content?: string;
    is_error?: boolean;
    // Image-specific fields
    source?: {
        type: 'base64';
        media_type: string;
        data: string;
    };
}

export interface ImageAttachment {
    filePath: string;
    base64Data?: string;
    fileName: string;
}

export interface StreamCallbacks {
    onText: (text: string) => void;
    onToolUse: (toolName: string, toolInput: any) => void;
    onToolResult: (toolName: string, result: string, isError: boolean) => void;
    onError: (error: string) => void;
    onComplete: (totalInputTokens: number, totalOutputTokens: number) => void;
    onThinking?: (thinking: string) => void;
}

export type Provider = 'anthropic' | 'azure' | 'deepseek' | 'grok';

export class APIClient {
    private provider: Provider;
    private anthropicApiKey: string;
    private anthropicModel: string;
    private azureEndpoint: string;
    private azureApiKey: string;
    private azureDeployment: string;
    private azureApiVersion: string;
    private deepseekApiKey: string;
    private deepseekModel: string;
    private grokApiKey: string;
    private grokModel: string;
    private toolExecutor: ToolExecutor;
    private conversationHistory: Message[] = [];
    private systemPrompt: string;
    private outputChannel: vscode.OutputChannel;
    private abortController: AbortController | null = null;
    private totalInputTokens: number = 0;
    private totalOutputTokens: number = 0;

    constructor(
        config: {
            provider: Provider;
            anthropicApiKey?: string;
            anthropicModel?: string;
            azureEndpoint?: string;
            azureApiKey?: string;
            azureDeployment?: string;
            azureApiVersion?: string;
            deepseekApiKey?: string;
            deepseekModel?: string;
            grokApiKey?: string;
            grokModel?: string;
        },
        toolExecutor: ToolExecutor,
        outputChannel: vscode.OutputChannel
    ) {
        this.provider = config.provider;
        this.anthropicApiKey = config.anthropicApiKey || '';
        this.anthropicModel = config.anthropicModel || 'claude-sonnet-4-20250514';
        this.azureEndpoint = config.azureEndpoint || '';
        this.azureApiKey = config.azureApiKey || '';
        this.azureDeployment = config.azureDeployment || '';
        this.azureApiVersion = config.azureApiVersion || '2024-02-15-preview';
        this.deepseekApiKey = config.deepseekApiKey || '';
        this.deepseekModel = config.deepseekModel || 'deepseek-chat';
        this.grokApiKey = config.grokApiKey || '';
        this.grokModel = config.grokModel || 'grok-beta';
        this.toolExecutor = toolExecutor;
        this.outputChannel = outputChannel;
        this.systemPrompt = this.buildSystemPrompt();
    }

    private buildSystemPrompt(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workspacePath = workspaceFolders?.[0]?.uri.fsPath || '';
        const platform = process.platform;

        return `You are Code Pilot AI, an intelligent coding assistant integrated into VS Code. You help developers with coding tasks, debugging, file operations, and project management.

## Environment
- Workspace: ${workspacePath}
- Platform: ${platform}
- Current time: ${new Date().toISOString()}

## Capabilities
You have access to tools that allow you to:
- Read, write, and edit files in the workspace
- Execute shell commands
- Search for files and content
- List directory contents
- Use MCP (Model Context Protocol) servers for extended functionality like Azure DevOps, GitHub, databases, etc.

## Guidelines
1. Always use absolute paths when working with files
2. Read files before editing to understand context
3. Make minimal, focused changes
4. Explain what you're doing before taking actions
5. Ask for clarification if requirements are unclear
6. Be concise but thorough in explanations
7. Handle errors gracefully and explain what went wrong
8. When MCP tools are available, use them for specialized tasks like repository management

## Tool Usage
- Use the Read tool to examine file contents before editing
- Use the Edit tool for precise string replacements in existing files
- Use the Write tool only for creating new files
- Use the Bash tool for running commands, git operations, npm commands, etc.
- Use Glob to find files by pattern
- Use Grep to search for content in files
- Use MCP tools (prefixed with mcp_) for specialized integrations like Azure DevOps, GitHub, etc.

When you need to perform an action, use the appropriate tool. After receiving tool results, continue to help the user or perform additional actions as needed.`;
    }

    updateConfig(config: Partial<{
        provider: Provider;
        anthropicApiKey: string;
        anthropicModel: string;
        azureEndpoint: string;
        azureApiKey: string;
        azureDeployment: string;
        azureApiVersion: string;
        deepseekApiKey: string;
        deepseekModel: string;
        grokApiKey: string;
        grokModel: string;
    }>) {
        if (config.provider !== undefined) this.provider = config.provider;
        if (config.anthropicApiKey !== undefined) this.anthropicApiKey = config.anthropicApiKey;
        if (config.anthropicModel !== undefined) this.anthropicModel = config.anthropicModel;
        if (config.azureEndpoint !== undefined) this.azureEndpoint = config.azureEndpoint;
        if (config.azureApiKey !== undefined) this.azureApiKey = config.azureApiKey;
        if (config.azureDeployment !== undefined) this.azureDeployment = config.azureDeployment;
        if (config.azureApiVersion !== undefined) this.azureApiVersion = config.azureApiVersion;
        if (config.deepseekApiKey !== undefined) this.deepseekApiKey = config.deepseekApiKey;
        if (config.deepseekModel !== undefined) this.deepseekModel = config.deepseekModel;
        if (config.grokApiKey !== undefined) this.grokApiKey = config.grokApiKey;
        if (config.grokModel !== undefined) this.grokModel = config.grokModel;
    }

    clearHistory() {
        this.conversationHistory = [];
        this.totalInputTokens = 0;
        this.totalOutputTokens = 0;
    }

    stop() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    async sendMessage(userMessage: string, callbacks: StreamCallbacks, thinkingEnabled: boolean = false, images?: ImageAttachment[]): Promise<void> {
        this.abortController = new AbortController();

        // Build message content with text and optional images
        let messageContent: string | ContentBlock[];

        if (images && images.length > 0) {
            // Create content blocks array with images and text
            const contentBlocks: any[] = [];

            // Add images first (using Anthropic's expected format)
            for (const img of images) {
                if (img.base64Data) {
                    // Extract base64 data and media type from data URL
                    const matches = img.base64Data.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                        const mediaType = matches[1];
                        const base64Data = matches[2];
                        contentBlocks.push({
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mediaType,
                                data: base64Data
                            }
                        });
                    }
                }
            }

            // Add text content - always include text to give the AI context
            // If no text provided, add a default prompt for image analysis
            const textContent = userMessage || 'What is in this image?';
            contentBlocks.push({
                type: 'text',
                text: textContent
            });

            messageContent = contentBlocks;
        } else {
            messageContent = userMessage;
        }

        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            content: messageContent
        });

        try {
            await this.runAgentLoop(callbacks, thinkingEnabled);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                callbacks.onError('Request cancelled');
            } else {
                // Check for corrupted conversation history error
                const errorMsg = error.message || 'Unknown error occurred';
                if (errorMsg.includes('tool_calls') && errorMsg.includes('tool_call_id')) {
                    // Clear corrupted history and notify user
                    this.conversationHistory = [];
                    callbacks.onError('Conversation history was corrupted. Please try again with a fresh message.');
                } else {
                    callbacks.onError(errorMsg);
                }
            }
        } finally {
            this.abortController = null;
            callbacks.onComplete(this.totalInputTokens, this.totalOutputTokens);
        }
    }

    private async runAgentLoop(callbacks: StreamCallbacks, thinkingEnabled: boolean): Promise<void> {
        const maxIterations = 50; // Prevent infinite loops
        let iteration = 0;

        while (iteration < maxIterations) {
            iteration++;
            this.outputChannel.appendLine(`\n--- Agent Loop Iteration ${iteration} ---`);

            let response: { content: ContentBlock[]; inputTokens: number; outputTokens: number; stopReason: string; bufferedText: string };

            if (this.provider === 'anthropic') {
                response = await this.callAnthropicAPI(callbacks, thinkingEnabled);
            } else if (this.provider === 'deepseek') {
                response = await this.callDeepSeekAPI();
            } else if (this.provider === 'grok') {
                response = await this.callGrokAPI();
            } else {
                response = await this.callAzureAPI();
            }

            this.totalInputTokens += response.inputTokens;
            this.totalOutputTokens += response.outputTokens;

            // Check if there are any tool uses in the response
            const toolUses = response.content.filter(block => block.type === 'tool_use');

            if (toolUses.length === 0) {
                // No more tool calls, agent is done
                // Send the final response text to the UI
                if (response.bufferedText) {
                    callbacks.onText(response.bufferedText);
                }
                this.outputChannel.appendLine('Agent completed - no more tool calls');
                break;
            }

            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: response.content
            });

            // Execute tools and collect results
            const toolResults: ContentBlock[] = [];

            for (const toolUse of toolUses) {
                callbacks.onToolUse(toolUse.name!, toolUse.input);

                const result = await this.toolExecutor.executeTool(toolUse.name!, toolUse.input);

                const resultContent = result.success
                    ? result.result
                    : `Error: ${result.error}\n${result.result}`;

                callbacks.onToolResult(toolUse.name!, resultContent, !result.success);

                toolResults.push({
                    type: 'tool_result',
                    tool_use_id: toolUse.id,
                    content: resultContent,
                    is_error: !result.success
                });
            }

            // Now send any buffered text AFTER tools have executed
            // This ensures the AI's explanatory text appears after tools complete
            if (response.bufferedText) {
                callbacks.onText(response.bufferedText);
            }

            // Add tool results to history
            this.conversationHistory.push({
                role: 'user',
                content: toolResults
            });

            // Check abort signal
            if (this.abortController?.signal.aborted) {
                throw new Error('AbortError');
            }
        }

        if (iteration >= maxIterations) {
            callbacks.onError('Agent reached maximum iterations limit');
        }
    }

    private async callAnthropicAPI(callbacks: StreamCallbacks, thinkingEnabled: boolean): Promise<{
        content: ContentBlock[];
        inputTokens: number;
        outputTokens: number;
        stopReason: string;
        bufferedText: string;
    }> {
        const url = 'https://api.anthropic.com/v1/messages';

        const body: any = {
            model: this.anthropicModel,
            max_tokens: 8192,
            system: this.systemPrompt,
            messages: this.formatMessagesForAnthropic(),
            tools: [...anthropicTools, ...this.toolExecutor.getMCPTools('anthropic')],
            stream: true
        };

        // Add extended thinking if enabled (only for supported models)
        if (thinkingEnabled && (this.anthropicModel.includes('claude-3-5-sonnet') || this.anthropicModel.includes('claude-sonnet-4') || this.anthropicModel.includes('claude-opus-4'))) {
            body.thinking = {
                type: 'enabled',
                budget_tokens: 5000
            };
            body.temperature = 1; // Required for extended thinking
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.anthropicApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(body),
            signal: this.abortController?.signal
        });

        if (!response.ok) {
            const errorData: any = await response.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || `API error: ${response.status}`);
        }

        return await this.processAnthropicStream(response);
    }

    private async processAnthropicStream(response: Response): Promise<{
        content: ContentBlock[];
        inputTokens: number;
        outputTokens: number;
        stopReason: string;
        bufferedText: string;
    }> {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        const contentBlocks: ContentBlock[] = [];
        let currentTextBlock: ContentBlock | null = null;
        let currentToolUseBlock: ContentBlock | null = null;
        let currentToolInput = '';
        let inputTokens = 0;
        let outputTokens = 0;
        let stopReason = 'end_turn';
        let bufferedText = ''; // Buffer all text, don't stream immediately

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const event = JSON.parse(data);

                    switch (event.type) {
                        case 'message_start':
                            if (event.message?.usage) {
                                inputTokens = event.message.usage.input_tokens || 0;
                            }
                            break;

                        case 'content_block_start':
                            if (event.content_block?.type === 'text') {
                                currentTextBlock = { type: 'text', text: '' };
                            } else if (event.content_block?.type === 'tool_use') {
                                currentToolUseBlock = {
                                    type: 'tool_use',
                                    id: event.content_block.id,
                                    name: event.content_block.name,
                                    input: {}
                                };
                                currentToolInput = '';
                            } else if (event.content_block?.type === 'thinking') {
                                // Handle thinking block
                                currentTextBlock = { type: 'text', text: '' };
                            }
                            break;

                        case 'content_block_delta':
                            if (event.delta?.type === 'text_delta' && currentTextBlock) {
                                currentTextBlock.text += event.delta.text;
                                // Buffer the text instead of streaming immediately
                                bufferedText += event.delta.text;
                            } else if (event.delta?.type === 'input_json_delta' && currentToolUseBlock) {
                                currentToolInput += event.delta.partial_json;
                            }
                            // Note: thinking_delta is not buffered - it should stream immediately if needed
                            break;

                        case 'content_block_stop':
                            if (currentTextBlock) {
                                if (currentTextBlock.text) {
                                    contentBlocks.push(currentTextBlock);
                                }
                                currentTextBlock = null;
                            }
                            if (currentToolUseBlock) {
                                try {
                                    currentToolUseBlock.input = JSON.parse(currentToolInput || '{}');
                                } catch {
                                    currentToolUseBlock.input = {};
                                }
                                contentBlocks.push(currentToolUseBlock);
                                currentToolUseBlock = null;
                                currentToolInput = '';
                            }
                            break;

                        case 'message_delta':
                            if (event.delta?.stop_reason) {
                                stopReason = event.delta.stop_reason;
                            }
                            if (event.usage?.output_tokens) {
                                outputTokens = event.usage.output_tokens;
                            }
                            break;
                    }
                } catch (e) {
                    this.outputChannel.appendLine(`Error parsing SSE: ${e}`);
                }
            }
        }

        return { content: contentBlocks, inputTokens, outputTokens, stopReason, bufferedText };
    }

    private async callAzureAPI(): Promise<{
        content: ContentBlock[];
        inputTokens: number;
        outputTokens: number;
        stopReason: string;
        bufferedText: string;
    }> {
        const url = `${this.azureEndpoint}/openai/deployments/${this.azureDeployment}/chat/completions?api-version=${this.azureApiVersion}`;

        const messages = this.formatMessagesForAzure();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.azureApiKey
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    ...messages
                ],
                tools: [...azureTools, ...this.toolExecutor.getMCPTools('azure')],
                stream: true,
                max_tokens: 4096
            }),
            signal: this.abortController?.signal
        });

        if (!response.ok) {
            const errorData: any = await response.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || `API error: ${response.status}`);
        }

        return await this.processAzureStream(response);
    }

    private async processAzureStream(response: Response): Promise<{
        content: ContentBlock[];
        inputTokens: number;
        outputTokens: number;
        stopReason: string;
        bufferedText: string;
    }> {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        const contentBlocks: ContentBlock[] = [];
        let currentText = '';
        let currentToolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();
        let inputTokens = 0;
        let outputTokens = 0;
        let stopReason = 'stop';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const event = JSON.parse(data);
                    const choice = event.choices?.[0];

                    if (choice?.delta?.content) {
                        // Buffer text instead of streaming immediately
                        currentText += choice.delta.content;
                    }

                    if (choice?.delta?.tool_calls) {
                        for (const toolCall of choice.delta.tool_calls) {
                            const index = toolCall.index;
                            if (!currentToolCalls.has(index)) {
                                currentToolCalls.set(index, {
                                    id: toolCall.id || '',
                                    name: toolCall.function?.name || '',
                                    arguments: ''
                                });
                            }
                            const tc = currentToolCalls.get(index)!;
                            if (toolCall.id) tc.id = toolCall.id;
                            if (toolCall.function?.name) tc.name = toolCall.function.name;
                            if (toolCall.function?.arguments) tc.arguments += toolCall.function.arguments;
                        }
                    }

                    if (choice?.finish_reason) {
                        stopReason = choice.finish_reason;
                    }

                    if (event.usage) {
                        inputTokens = event.usage.prompt_tokens || 0;
                        outputTokens = event.usage.completion_tokens || 0;
                    }
                } catch (e) {
                    this.outputChannel.appendLine(`Error parsing Azure SSE: ${e}`);
                }
            }
        }

        // Build content blocks
        if (currentText) {
            contentBlocks.push({ type: 'text', text: currentText });
        }

        for (const [_, toolCall] of currentToolCalls) {
            try {
                const input = JSON.parse(toolCall.arguments || '{}');
                contentBlocks.push({
                    type: 'tool_use',
                    id: toolCall.id,
                    name: toolCall.name,
                    input
                });
            } catch {
                this.outputChannel.appendLine(`Failed to parse tool arguments: ${toolCall.arguments}`);
            }
        }

        return { content: contentBlocks, inputTokens, outputTokens, stopReason, bufferedText: currentText };
    }

    private formatMessagesForAnthropic(): any[] {
        return this.conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    private formatMessagesForAzure(): any[] {
        const messages: any[] = [];

        for (const msg of this.conversationHistory) {
            if (msg.role === 'user') {
                if (typeof msg.content === 'string') {
                    messages.push({ role: 'user', content: msg.content });
                } else if (Array.isArray(msg.content)) {
                    // Tool results
                    for (const block of msg.content) {
                        if (block.type === 'tool_result') {
                            messages.push({
                                role: 'tool',
                                tool_call_id: block.tool_use_id,
                                content: block.content
                            });
                        }
                    }
                }
            } else if (msg.role === 'assistant') {
                if (typeof msg.content === 'string') {
                    messages.push({ role: 'assistant', content: msg.content });
                } else if (Array.isArray(msg.content)) {
                    // Combine text and tool calls
                    let content = '';
                    const toolCalls: any[] = [];

                    for (const block of msg.content) {
                        if (block.type === 'text') {
                            content += block.text || '';
                        } else if (block.type === 'tool_use') {
                            toolCalls.push({
                                id: block.id,
                                type: 'function',
                                function: {
                                    name: block.name,
                                    arguments: JSON.stringify(block.input)
                                }
                            });
                        }
                    }

                    const assistantMsg: any = { role: 'assistant' };
                    if (content) assistantMsg.content = content;
                    if (toolCalls.length > 0) assistantMsg.tool_calls = toolCalls;
                    messages.push(assistantMsg);
                }
            }
        }

        return messages;
    }

    private async callDeepSeekAPI(): Promise<{
        content: ContentBlock[];
        inputTokens: number;
        outputTokens: number;
        stopReason: string;
        bufferedText: string;
    }> {
        const url = 'https://api.deepseek.com/chat/completions';

        const messages = this.formatMessagesForAzure(); // DeepSeek uses OpenAI-compatible format

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.deepseekApiKey}`
            },
            body: JSON.stringify({
                model: this.deepseekModel,
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    ...messages
                ],
                tools: [...azureTools, ...this.toolExecutor.getMCPTools('azure')], // DeepSeek uses OpenAI-compatible tool format
                stream: true,
                max_tokens: 4096
            }),
            signal: this.abortController?.signal
        });

        if (!response.ok) {
            const errorData: any = await response.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || `DeepSeek API error: ${response.status}`);
        }

        return await this.processDeepSeekStream(response);
    }

    private async processDeepSeekStream(response: Response): Promise<{
        content: ContentBlock[];
        inputTokens: number;
        outputTokens: number;
        stopReason: string;
        bufferedText: string;
    }> {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        const contentBlocks: ContentBlock[] = [];
        let currentText = '';
        let currentToolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();
        let inputTokens = 0;
        let outputTokens = 0;
        let stopReason = 'stop';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const event = JSON.parse(data);
                    const choice = event.choices?.[0];

                    if (choice?.delta?.content) {
                        currentText += choice.delta.content;
                    }

                    if (choice?.delta?.tool_calls) {
                        for (const toolCall of choice.delta.tool_calls) {
                            const index = toolCall.index;
                            if (!currentToolCalls.has(index)) {
                                currentToolCalls.set(index, {
                                    id: toolCall.id || '',
                                    name: toolCall.function?.name || '',
                                    arguments: ''
                                });
                            }
                            const tc = currentToolCalls.get(index)!;
                            if (toolCall.id) tc.id = toolCall.id;
                            if (toolCall.function?.name) tc.name = toolCall.function.name;
                            if (toolCall.function?.arguments) tc.arguments += toolCall.function.arguments;
                        }
                    }

                    if (choice?.finish_reason) {
                        stopReason = choice.finish_reason;
                    }

                    if (event.usage) {
                        inputTokens = event.usage.prompt_tokens || 0;
                        outputTokens = event.usage.completion_tokens || 0;
                    }
                } catch (e) {
                    this.outputChannel.appendLine(`Error parsing DeepSeek SSE: ${e}`);
                }
            }
        }

        // Build content blocks
        if (currentText) {
            contentBlocks.push({ type: 'text', text: currentText });
        }

        for (const [_, toolCall] of currentToolCalls) {
            try {
                const input = JSON.parse(toolCall.arguments || '{}');
                contentBlocks.push({
                    type: 'tool_use',
                    id: toolCall.id,
                    name: toolCall.name,
                    input
                });
            } catch {
                this.outputChannel.appendLine(`Failed to parse tool arguments: ${toolCall.arguments}`);
            }
        }

        return { content: contentBlocks, inputTokens, outputTokens, stopReason, bufferedText: currentText };
    }

    private async callGrokAPI(): Promise<{
        content: ContentBlock[];
        inputTokens: number;
        outputTokens: number;
        stopReason: string;
        bufferedText: string;
    }> {
        const url = 'https://api.x.ai/v1/chat/completions';

        const messages = this.formatMessagesForAzure(); // Grok uses OpenAI-compatible format

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.grokApiKey}`
            },
            body: JSON.stringify({
                model: this.grokModel,
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    ...messages
                ],
                tools: [...azureTools, ...this.toolExecutor.getMCPTools('azure')], // Grok uses OpenAI-compatible tool format
                stream: true,
                max_tokens: 4096,
                temperature: 0
            }),
            signal: this.abortController?.signal
        });

        if (!response.ok) {
            const errorData: any = await response.json().catch(() => ({}));
            // xAI error format: { "code": "...", "error": "..." } where error is a string
            const errorMessage = typeof errorData?.error === 'string'
                ? errorData.error
                : errorData?.error?.message || `Grok API error: ${response.status}`;
            throw new Error(errorMessage);
        }

        return await this.processGrokStream(response);
    }

    private async processGrokStream(response: Response): Promise<{
        content: ContentBlock[];
        inputTokens: number;
        outputTokens: number;
        stopReason: string;
        bufferedText: string;
    }> {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        const contentBlocks: ContentBlock[] = [];
        let currentText = '';
        let currentToolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();
        let inputTokens = 0;
        let outputTokens = 0;
        let stopReason = 'stop';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const event = JSON.parse(data);
                    const choice = event.choices?.[0];

                    if (choice?.delta?.content) {
                        currentText += choice.delta.content;
                    }

                    if (choice?.delta?.tool_calls) {
                        for (const toolCall of choice.delta.tool_calls) {
                            const index = toolCall.index;
                            if (!currentToolCalls.has(index)) {
                                currentToolCalls.set(index, {
                                    id: toolCall.id || '',
                                    name: toolCall.function?.name || '',
                                    arguments: ''
                                });
                            }
                            const tc = currentToolCalls.get(index)!;
                            if (toolCall.id) tc.id = toolCall.id;
                            if (toolCall.function?.name) tc.name = toolCall.function.name;
                            if (toolCall.function?.arguments) tc.arguments += toolCall.function.arguments;
                        }
                    }

                    if (choice?.finish_reason) {
                        stopReason = choice.finish_reason;
                    }

                    if (event.usage) {
                        inputTokens = event.usage.prompt_tokens || 0;
                        outputTokens = event.usage.completion_tokens || 0;
                    }
                } catch (e) {
                    this.outputChannel.appendLine(`Error parsing Grok SSE: ${e}`);
                }
            }
        }

        // Build content blocks
        if (currentText) {
            contentBlocks.push({ type: 'text', text: currentText });
        }

        for (const [_, toolCall] of currentToolCalls) {
            try {
                const input = JSON.parse(toolCall.arguments || '{}');
                contentBlocks.push({
                    type: 'tool_use',
                    id: toolCall.id,
                    name: toolCall.name,
                    input
                });
            } catch {
                this.outputChannel.appendLine(`Failed to parse tool arguments: ${toolCall.arguments}`);
            }
        }

        return { content: contentBlocks, inputTokens, outputTokens, stopReason, bufferedText: currentText };
    }
}
