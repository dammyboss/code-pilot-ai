import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as util from 'util';
import * as path from 'path';
import * as fs from 'fs';
import html from './ui';
import { ToolExecutor, anthropicTools } from './tools';
import { APIClient, StreamCallbacks, Provider, ImageAttachment } from './api-client';
import { MCPClient, MCPServerConfig } from './mcp-client';
import { createChatRequestHandler } from './chat-participant';

const exec = util.promisify(cp.exec);

export function activate(context: vscode.ExtensionContext) {
	console.log('Code Pilot AI extension is being activated!');
	const provider = new ClaudeChatProvider(context.extensionUri, context);

	// Register Chat Participant for native markdown rendering
	const chatHandler = createChatRequestHandler(context);
	const participantDisposable = vscode.chat.createChatParticipant('code-pilot-ai', chatHandler);
	participantDisposable.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');
	participantDisposable.followupProvider = {
		provideFollowups: () => [
			{ prompt: 'Help me with code review', label: 'Code Review' },
			{ prompt: 'Explain this code', label: 'Explain Code' },
			{ prompt: 'Find bugs in my code', label: 'Find Bugs' }
		]
	};

	const disposable = vscode.commands.registerCommand('code-pilot-ai.openChat', () => {
		console.log('Code Pilot AI command executed!');
		provider.show();
	});

	const loadConversationDisposable = vscode.commands.registerCommand('code-pilot-ai.loadConversation', (filename: string) => {
		provider.loadConversation(filename);
	});

	const configureMCPDisposable = vscode.commands.registerCommand('code-pilot-ai.configureMCP', async () => {
		await configureMCPServers(context);
	});

	// Register webview view provider for sidebar chat (using shared provider instance)
	const webviewProvider = new ClaudeChatWebviewProvider(context.extensionUri, context, provider);
	vscode.window.registerWebviewViewProvider('code-pilot-ai.chat', webviewProvider);

	// Listen for configuration changes
	const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('codePilotAI.wsl')) {
			console.log('WSL configuration changed, starting new session');
			provider.newSessionOnConfigChange();
		}
	});

	// Create status bar item
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = "Pilot";
	statusBarItem.tooltip = "Open Code Pilot AI (Ctrl+Shift+P)";
	statusBarItem.command = 'code-pilot-ai.openChat';
	statusBarItem.show();

	context.subscriptions.push(disposable, loadConversationDisposable, configureMCPDisposable, configChangeDisposable, statusBarItem);
	console.log('Code Pilot AI extension activation completed successfully!');
}

export function deactivate() { }

// MCP Configuration UI
async function configureMCPServers(context: vscode.ExtensionContext): Promise<void> {
	const config = vscode.workspace.getConfiguration('codePilotAI');
	const currentServers = config.get<any[]>('mcp.servers', []);

	// Show quick pick for action
	const action = await vscode.window.showQuickPick(
		[
			{ label: '$(plus) Add New MCP Server', value: 'add' },
			{ label: '$(edit) Edit Existing Server', value: 'edit' },
			{ label: '$(trash) Remove Server', value: 'remove' },
			{ label: '$(list-unordered) View All Servers', value: 'view' }
		],
		{
			placeHolder: 'What would you like to do?'
		}
	);

	if (!action) return;

	switch (action.value) {
		case 'add':
			await addMCPServer(config, currentServers);
			break;
		case 'edit':
			await editMCPServer(config, currentServers);
			break;
		case 'remove':
			await removeMCPServer(config, currentServers);
			break;
		case 'view':
			await viewMCPServers(currentServers);
			break;
	}
}

async function addMCPServer(config: vscode.WorkspaceConfiguration, currentServers: any[]): Promise<void> {
	// Ask for server type
	const serverType = await vscode.window.showQuickPick(
		[
			{ label: 'Remote MCP Server (HTTP)', value: 'remote', description: 'Connect to a remote MCP server via URL' },
			{ label: 'Local MCP Server (stdio)', value: 'local', description: 'Run a local MCP server process' }
		],
		{
			placeHolder: 'Select MCP server type'
		}
	);

	if (!serverType) return;

	// Get server name
	const name = await vscode.window.showInputBox({
		prompt: 'Enter a unique name for this MCP server',
		placeHolder: 'e.g., my-mcp-server',
		validateInput: (value) => {
			if (!value || value.trim() === '') return 'Name cannot be empty';
			if (currentServers.some(s => s.name === value)) return 'Server with this name already exists';
			return null;
		}
	});

	if (!name) return;

	if (serverType.value === 'remote') {
		// Remote server configuration
		const url = await vscode.window.showInputBox({
			prompt: 'Enter the MCP server URL',
			placeHolder: 'e.g., https://my-server.com/api/mcp or my-server.com/api/mcp',
			validateInput: (value) => {
				if (!value || value.trim() === '') return 'URL cannot be empty';
				return null;
			}
		});

		if (!url) return;

		const newServer = {
			name,
			type: 'remote',
			url: url.trim()
		};

		await config.update('mcp.servers', [...currentServers, newServer], vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage(`MCP server '${name}' added successfully! Please reload the window to connect.`, 'Reload Window').then(selection => {
			if (selection === 'Reload Window') {
				vscode.commands.executeCommand('workbench.action.reloadWindow');
			}
		});

	} else {
		// Local server configuration
		const command = await vscode.window.showInputBox({
			prompt: 'Enter the command to run the MCP server',
			placeHolder: 'e.g., node, python, npx'
		});

		if (!command) return;

		const argsInput = await vscode.window.showInputBox({
			prompt: 'Enter command arguments (comma-separated, optional)',
			placeHolder: 'e.g., /path/to/server.js, --port, 3000'
		});

		const args = argsInput ? argsInput.split(',').map(a => a.trim()).filter(a => a) : [];

		const envInput = await vscode.window.showInputBox({
			prompt: 'Enter environment variables (KEY=VALUE, comma-separated, optional)',
			placeHolder: 'e.g., API_KEY=your-key, DEBUG=true'
		});

		const env: Record<string, string> = {};
		if (envInput) {
			const pairs = envInput.split(',').map(p => p.trim()).filter(p => p);
			for (const pair of pairs) {
				const [key, ...valueParts] = pair.split('=');
				if (key && valueParts.length > 0) {
					env[key.trim()] = valueParts.join('=').trim();
				}
			}
		}

		const newServer: any = {
			name,
			type: 'local',
			command: command.trim(),
			args
		};

		if (Object.keys(env).length > 0) {
			newServer.env = env;
		}

		await config.update('mcp.servers', [...currentServers, newServer], vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage(`MCP server '${name}' added successfully! Please reload the window to connect.`, 'Reload Window').then(selection => {
			if (selection === 'Reload Window') {
				vscode.commands.executeCommand('workbench.action.reloadWindow');
			}
		});
	}
}

async function editMCPServer(config: vscode.WorkspaceConfiguration, currentServers: any[]): Promise<void> {
	if (currentServers.length === 0) {
		vscode.window.showInformationMessage('No MCP servers configured yet. Add one first!');
		return;
	}

	const serverToEdit = await vscode.window.showQuickPick(
		currentServers.map(s => ({
			label: s.name,
			description: s.type === 'remote' ? `Remote: ${s.url}` : `Local: ${s.command}`,
			server: s
		})),
		{
			placeHolder: 'Select a server to edit'
		}
	);

	if (!serverToEdit) return;

	vscode.window.showInformationMessage(
		'To edit a server, please open VS Code settings and navigate to "Code Pilot AI > MCP: Servers"',
		'Open Settings'
	).then(selection => {
		if (selection === 'Open Settings') {
			vscode.commands.executeCommand('workbench.action.openSettings', 'codePilotAI.mcp.servers');
		}
	});
}

async function removeMCPServer(config: vscode.WorkspaceConfiguration, currentServers: any[]): Promise<void> {
	if (currentServers.length === 0) {
		vscode.window.showInformationMessage('No MCP servers configured.');
		return;
	}

	const serverToRemove = await vscode.window.showQuickPick(
		currentServers.map(s => ({
			label: s.name,
			description: s.type === 'remote' ? `Remote: ${s.url}` : `Local: ${s.command}`,
			server: s
		})),
		{
			placeHolder: 'Select a server to remove'
		}
	);

	if (!serverToRemove) return;

	const confirm = await vscode.window.showWarningMessage(
		`Are you sure you want to remove MCP server '${serverToRemove.server.name}'?`,
		{ modal: true },
		'Yes, Remove'
	);

	if (confirm === 'Yes, Remove') {
		const updatedServers = currentServers.filter(s => s.name !== serverToRemove.server.name);
		await config.update('mcp.servers', updatedServers, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage(`MCP server '${serverToRemove.server.name}' removed successfully! Please reload the window.`, 'Reload Window').then(selection => {
			if (selection === 'Reload Window') {
				vscode.commands.executeCommand('workbench.action.reloadWindow');
			}
		});
	}
}

async function viewMCPServers(currentServers: any[]): Promise<void> {
	if (currentServers.length === 0) {
		vscode.window.showInformationMessage('No MCP servers configured yet.');
		return;
	}

	const serverList = currentServers.map((s, idx) => {
		let details = `**${idx + 1}. ${s.name}**\n`;
		details += `   - Type: ${s.type || 'unknown'}\n`;

		if (s.type === 'remote' && s.url) {
			details += `   - URL: ${s.url}\n`;
		} else if (s.type === 'local' || s.command) {
			details += `   - Command: ${s.command}\n`;
			if (s.args && s.args.length > 0) {
				details += `   - Args: ${JSON.stringify(s.args)}\n`;
			}
			if (s.env && Object.keys(s.env).length > 0) {
				details += `   - Environment: ${JSON.stringify(s.env)}\n`;
			}
		}

		return details;
	}).join('\n');

	const message = `# Configured MCP Servers (${currentServers.length})\n\n${serverList}`;

	const action = await vscode.window.showInformationMessage(
		`You have ${currentServers.length} MCP server(s) configured.`,
		'Open Settings',
		'Copy Configuration'
	);

	if (action === 'Open Settings') {
		vscode.commands.executeCommand('workbench.action.openSettings', 'codePilotAI.mcp.servers');
	} else if (action === 'Copy Configuration') {
		await vscode.env.clipboard.writeText(JSON.stringify(currentServers, null, 2));
		vscode.window.showInformationMessage('MCP servers configuration copied to clipboard!');
	}
}

class ClaudeChatWebviewProvider implements vscode.WebviewViewProvider {
	constructor(
		private readonly _extensionUri: vscode.Uri,
		private readonly _context: vscode.ExtensionContext,
		private readonly _chatProvider: ClaudeChatProvider
	) {}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};

		// Use the shared chat provider instance for the sidebar
		this._chatProvider.showInWebview(webviewView.webview, webviewView);

		// Handle visibility changes to reinitialize when sidebar reopens
		webviewView.onDidChangeVisibility(() => {
			if (webviewView.visible) {
				// Close main panel when sidebar becomes visible
				if (this._chatProvider._panel) {
					console.log('Closing main panel because sidebar became visible');
					this._chatProvider._panel.dispose();
					this._chatProvider._panel = undefined;
				}
				this._chatProvider.reinitializeWebview();
			}
		});
	}
}


class ClaudeChatProvider {
	public _panel: vscode.WebviewPanel | undefined;
	private _webview: vscode.Webview | undefined;
	private _webviewView: vscode.WebviewView | undefined;
	private _disposables: vscode.Disposable[] = [];
	private _messageHandlerDisposable: vscode.Disposable | undefined;
	private _totalCost: number = 0;
	private _totalTokensInput: number = 0;
	private _totalTokensOutput: number = 0;
	private _requestCount: number = 0;
	private _currentSessionId: string | undefined;
	private _backupRepoPath: string | undefined;
	private _commits: Array<{ id: string, sha: string, message: string, timestamp: string }> = [];
	private _conversationsPath: string | undefined;
	private _permissionRequestsPath: string | undefined;
	private _permissionWatcher: vscode.FileSystemWatcher | undefined;
	private _pendingPermissionResolvers: Map<string, (approved: boolean) => void> | undefined;
	private _currentConversation: Array<{ timestamp: string, messageType: string, data: any }> = [];
	private _conversationStartTime: string | undefined;
	private _conversationIndex: Array<{
		filename: string,
		sessionId: string,
		startTime: string,
		endTime: string,
		messageCount: number,
		totalCost: number,
		firstUserMessage: string,
		lastUserMessage: string
	}> = [];
	private _currentClaudeProcess: cp.ChildProcess | undefined;
	private _selectedModel: string = 'default'; // Default model

	// New API-based architecture
	private _apiClient: APIClient | undefined;
	private _toolExecutor: ToolExecutor | undefined;
	private _mcpClient: MCPClient | undefined;
	private _outputChannel: vscode.OutputChannel;
	private _alwaysAllowedTools: Set<string> = new Set();

	constructor(
		private readonly _extensionUri: vscode.Uri,
		private readonly _context: vscode.ExtensionContext
	) {
		// Create output channel for logging
		this._outputChannel = vscode.window.createOutputChannel('Code Pilot AI');

		// Initialize backup repository and conversations
		this._initializeBackupRepo();
		this._initializeConversations();
		this._initializeMCPConfig();
		this._initializePermissions();

		// Load conversation index from workspace state
		this._conversationIndex = this._context.workspaceState.get('claude.conversationIndex', []);

		// Load saved model preference
		this._selectedModel = this._context.workspaceState.get('claude.selectedModel', 'default');

		// Resume session from latest conversation
		const latestConversation = this._getLatestConversation();
		this._currentSessionId = latestConversation?.sessionId;

		// Initialize the new API-based architecture
		this._initializeAPIClient();
	}

	private async _initializeAPIClient(): Promise<void> {
		const config = vscode.workspace.getConfiguration('codePilotAI');
		const workspaceFolders = vscode.workspace.workspaceFolders;
		const workspaceRoot = workspaceFolders?.[0]?.uri.fsPath || process.cwd();

		// Create tool executor with permission callback
		this._toolExecutor = new ToolExecutor(
			workspaceRoot,
			this._outputChannel,
			async (toolName: string, args: any) => this._checkToolPermission(toolName, args)
		);

		// Create MCP client
		const storagePath = this._context.globalStorageUri.fsPath;
		const mcpConfigPath = path.join(storagePath, 'mcp', 'mcp-servers.json');
		this._mcpClient = new MCPClient(this._outputChannel, mcpConfigPath);

		// Load MCP servers from config
		await this._loadMCPServersForClient();

		// Connect MCP client to tool executor
		this._toolExecutor.setMCPClient(this._mcpClient);

		// Create API client
		const provider = (config.get<string>('provider', 'anthropic') as Provider);
		this._apiClient = new APIClient(
			{
				provider,
				anthropicApiKey: config.get<string>('anthropic.apiKey', ''),
				anthropicModel: config.get<string>('anthropic.model', 'claude-sonnet-4-20250514'),
				azureEndpoint: config.get<string>('azure.endpoint', ''),
				azureApiKey: config.get<string>('azure.apiKey', ''),
				azureDeployment: config.get<string>('azure.deployment', ''),
				azureApiVersion: config.get<string>('azure.apiVersion', '2024-02-15-preview'),
				deepseekApiKey: config.get<string>('deepseek.apiKey', ''),
				deepseekModel: config.get<string>('deepseek.model', 'deepseek-chat'),
				grokApiKey: config.get<string>('grok.apiKey', ''),
				grokModel: config.get<string>('grok.model', 'grok-beta')
			},
			this._toolExecutor,
			this._outputChannel
		);

		this._outputChannel.appendLine('API Client initialized');
	}

	private normalizeUrl(url: string): string {
		// Auto-add https:// if no protocol is specified
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			return `https://${url}`;
		}
		return url;
	}

	private async _loadMCPServersForClient(): Promise<void> {
		if (!this._mcpClient) return;

		const servers: Record<string, MCPServerConfig> = {};

		try {
			// Load from VS Code settings first (highest priority, user-friendly)
			const config = vscode.workspace.getConfiguration('codePilotAI');
			const mcpServersFromSettings = config.get<any[]>('mcp.servers', []);

			for (const serverConfig of mcpServersFromSettings) {
				if (!serverConfig.name) continue;

				// Skip disabled servers
				if (serverConfig.disabled === true) {
					this._outputChannel.appendLine(`Skipping disabled MCP server: ${serverConfig.name}`);
					continue;
				}

				servers[serverConfig.name] = {
					command: serverConfig.command,
					args: serverConfig.args,
					env: serverConfig.env,
					url: serverConfig.url ? this.normalizeUrl(serverConfig.url) : undefined,
					headers: serverConfig.headers
				};
				this._outputChannel.appendLine(`Loaded MCP server from settings: ${serverConfig.name}`);
			}

			// Load from extension's storage (for backward compatibility)
			const storagePath = this._context.globalStorageUri.fsPath;
			const mcpConfigPath = path.join(storagePath, 'mcp', 'mcp-servers.json');

			if (fs.existsSync(mcpConfigPath)) {
				const configContent = fs.readFileSync(mcpConfigPath, 'utf-8');
				const storageConfig = JSON.parse(configContent);

				if (storageConfig.mcpServers) {
					for (const [name, serverConfig] of Object.entries(storageConfig.mcpServers as Record<string, any>)) {
						// Skip the built-in permissions server
						if (name === 'claude-code-chat-permissions' || name === 'code-pilot-ai-permissions') continue;

						// Skip if already loaded from settings
						if (servers[name]) continue;

						servers[name] = {
							command: serverConfig.command,
							args: serverConfig.args,
							env: serverConfig.env,
							url: serverConfig.url ? this.normalizeUrl(serverConfig.url) : undefined,
							headers: serverConfig.headers
						};
					}
				}
			}

			// Also try to load from VS Code's global MCP config (lowest priority)
			const vscodeMcpPaths = [
				// Windows
				path.join(process.env.APPDATA || '', 'Code', 'User', 'mcp.json'),
				// macOS
				path.join(process.env.HOME || '', 'Library', 'Application Support', 'Code', 'User', 'mcp.json'),
				// Linux
				path.join(process.env.HOME || '', '.config', 'Code', 'User', 'mcp.json')
			];

			for (const vscodeMcpPath of vscodeMcpPaths) {
				if (fs.existsSync(vscodeMcpPath)) {
					this._outputChannel.appendLine(`Found VS Code MCP config at: ${vscodeMcpPath}`);
					try {
						const vscodeConfig = JSON.parse(fs.readFileSync(vscodeMcpPath, 'utf-8'));
						if (vscodeConfig.servers) {
							for (const [name, serverConfig] of Object.entries(vscodeConfig.servers as Record<string, any>)) {
								// Skip if already loaded from settings or extension config
								if (servers[name]) continue;

								servers[name] = {
									command: serverConfig.command,
									args: serverConfig.args,
									env: serverConfig.env,
									url: serverConfig.url ? this.normalizeUrl(serverConfig.url) : undefined,
									headers: serverConfig.headers
								};
								this._outputChannel.appendLine(`Loaded MCP server from VS Code config: ${name}`);
							}
						}
					} catch (e: any) {
						this._outputChannel.appendLine(`Error parsing VS Code MCP config: ${e.message}`);
					}
					break; // Only use first found config
				}
			}

			if (Object.keys(servers).length > 0) {
				this._outputChannel.appendLine(`Loading ${Object.keys(servers).length} MCP servers...`);
				await this._mcpClient.loadServers(servers);
			} else {
				this._outputChannel.appendLine('No MCP servers configured');
			}
		} catch (error: any) {
			this._outputChannel.appendLine(`Failed to load MCP servers: ${error.message}`);
		}
	}

	private async _checkToolPermission(toolName: string, args: any): Promise<boolean> {
		const config = vscode.workspace.getConfiguration('codePilotAI');
		const yoloMode = config.get<boolean>('permissions.yoloMode', false);

		// YOLO mode - allow everything
		if (yoloMode) {
			return true;
		}

		// Check if tool is always allowed
		const toolKey = `${toolName}:${JSON.stringify(args)}`;
		if (this._alwaysAllowedTools.has(toolName)) {
			return true;
		}

		// Read tools don't need permission
		if (toolName === 'Read' || toolName === 'Glob' || toolName === 'Grep' || toolName === 'ListDirectory') {
			return true;
		}

		// Ask user for permission
		return new Promise((resolve) => {
			const permissionId = `perm_${Date.now()}_${Math.random().toString(36).substring(7)}`;

			// Send permission request to webview
			this._postMessage({
				type: 'permissionRequest',
				data: {
					id: permissionId,
					tool: toolName,
					args: args,
					description: this._getToolDescription(toolName, args)
				}
			});

			// Store resolver
			if (!this._pendingPermissionResolvers) {
				this._pendingPermissionResolvers = new Map();
			}
			this._pendingPermissionResolvers.set(permissionId, (approved: boolean) => {
				resolve(approved);
			});

			// Timeout after 5 minutes
			setTimeout(() => {
				if (this._pendingPermissionResolvers?.has(permissionId)) {
					this._pendingPermissionResolvers.delete(permissionId);
					resolve(false);
				}
			}, 300000);
		});
	}

	private _getToolDescription(toolName: string, args: any): string {
		switch (toolName) {
			case 'Write':
				return `Create/overwrite file: ${args.file_path}`;
			case 'Edit':
				return `Edit file: ${args.file_path}`;
			case 'Bash':
				return `Run command: ${args.command}`;
			default:
				return `${toolName}: ${JSON.stringify(args).substring(0, 100)}`;
		}
	}

	public show() {
		const column = vscode.ViewColumn.Two;

		// Close sidebar if it's open
		this._closeSidebar();

		if (this._panel) {
			this._panel.reveal(column);
			return;
		}

		this._panel = vscode.window.createWebviewPanel(
			'codePilotChat',
			'Code Pilot AI',
			column,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [this._extensionUri]
			}
		);

		// Set icon for the webview tab using URI path
		const iconPath = vscode.Uri.joinPath(this._extensionUri, 'icon.png');
		this._panel.iconPath = iconPath;

		this._panel.webview.html = this._getHtmlForWebview();

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._setupWebviewMessageHandler(this._panel.webview);

		// Resume session from latest conversation
		const latestConversation = this._getLatestConversation();
		this._currentSessionId = latestConversation?.sessionId;

		// Load latest conversation history if available
		if (latestConversation) {
			this._loadConversationHistory(latestConversation.filename);
		}

		// Send ready message immediately
		setTimeout(() => {
			// If no conversation to load, send ready immediately
			if (!latestConversation) {
				this._sendReadyMessage();
			}
		}, 100);
	}

	private _postMessage(message: any) {
		if (this._panel && this._panel.webview) {
			this._panel.webview.postMessage(message);
		} else if (this._webview) {
			this._webview.postMessage(message);
		}
	}

	private _sendReadyMessage() {
		// Send current session info if available
		if (this._currentSessionId) {
			this._postMessage({
				type: 'sessionResumed',
				data: {
					sessionId: this._currentSessionId
				}
			});
		}

		// Ready message removed - using welcome screen instead

		// Send current model to webview
		this._postMessage({
			type: 'modelSelected',
			model: this._selectedModel
		});

		// Send platform information to webview
		this._sendPlatformInfo();

		// Send current settings to webview
		this._sendCurrentSettings();
	}

	private _handleWebviewMessage(message: any) {
		switch (message.type) {
			case 'sendMessage':
				this._sendMessageToClaude(message.text, message.planMode, message.thinkingMode, message.images);
				return;
			case 'newSession':
				this._newSession();
				return;
			case 'restoreCommit':
				this._restoreToCommit(message.commitSha);
				return;
			case 'getConversationList':
				this._sendConversationList();
				return;
			case 'getWorkspaceFiles':
				this._sendWorkspaceFiles(message.searchTerm);
				return;
			case 'selectImageFile':
				this._selectImageFile();
				return;
			case 'loadConversation':
				this.loadConversation(message.filename);
				return;
			case 'stopRequest':
				this._stopClaudeProcess();
				return;
			case 'getSettings':
				this._sendCurrentSettings();
				return;
			case 'updateSettings':
				this._updateSettings(message.settings);
				return;
			case 'getClipboardText':
				this._getClipboardText();
				return;
			case 'selectModel':
				this._setSelectedModel(message.model);
				return;
			case 'openModelTerminal':
				this._openModelTerminal();
				return;
			case 'executeSlashCommand':
				this._executeSlashCommand(message.command);
				return;
			case 'showHelp':
			case 'getHelpContent':
				this._showHelp();
				return;
			case 'openNativeChatHelp':
				this._openNativeChatHelp();
				return;
			case 'openMarkdownPreview':
				this._openMarkdownPreview();
				return;
			case 'deleteConversation':
				this._deleteConversation(message.filename);
				return;
			case 'dismissWSLAlert':
				this._dismissWSLAlert();
				return;
			case 'openFile':
				this._openFileInEditor(message.filePath);
				return;
			case 'createImageFile':
				this._createImageFile(message.imageData, message.imageType);
				return;
			case 'permissionResponse':
				this._handlePermissionResponse(message.id, message.approved, message.alwaysAllow);
				return;
			case 'getPermissions':
				this._sendPermissions();
				return;
			case 'removePermission':
				this._removePermission(message.toolName, message.command);
				return;
			case 'addPermission':
				this._addPermission(message.toolName, message.command);
				return;
			case 'loadMCPServers':
				this._loadMCPServers();
				return;
			case 'saveMCPServer':
				this._saveMCPServer(message.name, message.config);
				return;
			case 'deleteMCPServer':
				this._deleteMCPServer(message.name);
				return;
			case 'getMCPServers':
				this._getMCPServersForSettings();
				return;
			case 'addMCPServer':
				this._addMCPServerFromSettings(message.server);
				return;
			case 'updateMCPServer':
				this._updateMCPServerFromSettings(message.originalName, message.server);
				return;
			case 'removeMCPServer':
				this._removeMCPServerFromSettings(message.serverName);
				return;
			case 'connectMCPServer':
				this._connectMCPServerFromSettings(message.serverName);
				return;
			case 'disconnectMCPServer':
				this._disconnectMCPServerFromSettings(message.serverName);
				return;
			case 'getCustomSnippets':
				this._sendCustomSnippets();
				return;
			case 'saveCustomSnippet':
				this._saveCustomSnippet(message.snippet);
				return;
			case 'deleteCustomSnippet':
				this._deleteCustomSnippet(message.snippetId);
				return;
			case 'enableYoloMode':
				this._enableYoloMode();
				return;
			case 'testAnthropicConnection':
				this._testAnthropicConnection(message.apiKey, message.model);
				return;
			case 'testAzureConnection':
				this._testAzureConnection(message.endpoint, message.apiKey, message.deployment, message.apiVersion);
				return;
			case 'testDeepSeekConnection':
				this._testDeepSeekConnection(message.apiKey, message.model);
				return;
			case 'testGrokConnection':
				this._testGrokConnection(message.apiKey, message.model);
				return;
			case 'generateMemoryBank':
				this._generateMemoryBank();
				return;
			case 'createNewRule':
				this._createNewRule();
				return;
		}
	}

	private _setupWebviewMessageHandler(webview: vscode.Webview) {
		// Dispose of any existing message handler
		if (this._messageHandlerDisposable) {
			this._messageHandlerDisposable.dispose();
		}
		
		// Set up new message handler
		this._messageHandlerDisposable = webview.onDidReceiveMessage(
			message => this._handleWebviewMessage(message),
			null,
			this._disposables
		);
	}

	private _closeSidebar() {
		if (this._webviewView) {
			// Switch VS Code to show Explorer view instead of chat sidebar
			vscode.commands.executeCommand('workbench.view.explorer');
		}
	}

	public showInWebview(webview: vscode.Webview, webviewView?: vscode.WebviewView) {		
		// Close main panel if it's open
		if (this._panel) {
			console.log('Closing main panel because sidebar is opening');
			this._panel.dispose();
			this._panel = undefined;
		}

		this._webview = webview;
		this._webviewView = webviewView;
		this._webview.html = this._getHtmlForWebview();

		this._setupWebviewMessageHandler(this._webview);

		// Initialize the webview
		this._initializeWebview();
	}

	private _initializeWebview() {
		// Resume session from latest conversation
		const latestConversation = this._getLatestConversation();
		this._currentSessionId = latestConversation?.sessionId;

		// Load latest conversation history if available
		if (latestConversation) {
			this._loadConversationHistory(latestConversation.filename);
		} else {
			// If no conversation to load, send ready immediately
			setTimeout(() => {
				this._sendReadyMessage();
			}, 100);
		}
	}

	public reinitializeWebview() {
		// Only reinitialize if we have a webview (sidebar)
		if (this._webview) {
			this._initializePermissions();
			this._initializeWebview();
			// Set up message handler for the webview
			this._setupWebviewMessageHandler(this._webview);
		}
	}

	private async _sendMessageToClaude(message: string, planMode?: boolean, thinkingMode?: boolean, images?: Array<{filePath: string, base64Data?: string, fileName: string}>) {
		// Ensure API client is initialized
		if (!this._apiClient || !this._toolExecutor) {
			await this._initializeAPIClient();
		}

		if (!this._apiClient) {
			this._sendAndSaveMessage({
				type: 'error',
				data: 'Failed to initialize API client. Please check your settings.'
			});
			return;
		}

		// Update API client with current settings
		const config = vscode.workspace.getConfiguration('codePilotAI');
		this._apiClient.updateConfig({
			provider: config.get<string>('provider', 'anthropic') as Provider,
			anthropicApiKey: config.get<string>('anthropic.apiKey', ''),
			anthropicModel: config.get<string>('anthropic.model', 'claude-sonnet-4-20250514'),
			azureEndpoint: config.get<string>('azure.endpoint', ''),
			azureApiKey: config.get<string>('azure.apiKey', ''),
			azureDeployment: config.get<string>('azure.deployment', ''),
			azureApiVersion: config.get<string>('azure.apiVersion', '2024-02-15-preview')
		});

		// Get thinking intensity setting
		const thinkingIntensity = config.get<string>('thinking.intensity', 'think');

		// Prepend mode instructions if enabled
		let actualMessage = message;
		if (planMode) {
			actualMessage = 'PLAN FIRST FOR THIS MESSAGE ONLY: Plan first before making any changes. Show me in detail what you will change and wait for my explicit approval in a separate message before proceeding. Do not implement anything until I confirm. This planning requirement applies ONLY to this current message. \n\n' + message;
		}
		if (thinkingMode) {
			let thinkingPrompt = '';
			const thinkingMesssage = ' THROUGH THIS STEP BY STEP: \n';
			switch (thinkingIntensity) {
				case 'think':
					thinkingPrompt = 'THINK';
					break;
				case 'think-hard':
					thinkingPrompt = 'THINK HARD';
					break;
				case 'think-harder':
					thinkingPrompt = 'THINK HARDER';
					break;
				case 'ultrathink':
					thinkingPrompt = 'ULTRATHINK';
					break;
				default:
					thinkingPrompt = 'THINK';
			}
			actualMessage = thinkingPrompt + thinkingMesssage + actualMessage;
		}

		// Show original user input in chat and save to conversation (without mode prefixes)
		this._sendAndSaveMessage({
			type: 'userInput',
			data: message
		});

		// Set processing state
		this._postMessage({
			type: 'setProcessing',
			data: true
		});

		// Create backup commit before making changes
		try {
			await this._createBackupCommit(message);
		} catch (e) {
			console.log("error creating backup:", e);
		}

		// Show animated loading indicator (no "Processing your request..." message)
		this._postMessage({
			type: 'showLoading',
			data: true
		});

		this._outputChannel.appendLine(`\n=== New Message ===`);
		this._outputChannel.appendLine(`User: ${message}`);

		// Track accumulated text for the response
		let accumulatedText = '';

		// Define stream callbacks
		const callbacks: StreamCallbacks = {
			onText: (text: string) => {
				accumulatedText += text;
				// Send streaming text to UI
				this._postMessage({
					type: 'streamText',
					data: text
				});
			},
			onToolUse: (toolName: string, toolInput: any) => {
				this._outputChannel.appendLine(`Tool Use: ${toolName}`);
				this._outputChannel.appendLine(`Input: ${JSON.stringify(toolInput, null, 2)}`);

				// Send tool use to UI
				this._sendAndSaveMessage({
					type: 'toolUse',
					data: {
						tool: toolName,
						input: toolInput
					}
				});
			},
			onToolResult: (toolName: string, result: string, isError: boolean) => {
				this._outputChannel.appendLine(`Tool Result (${toolName}): ${isError ? 'ERROR' : 'SUCCESS'}`);
				this._outputChannel.appendLine(result.substring(0, 500));

				// Send tool result to UI
				this._sendAndSaveMessage({
					type: 'toolResult',
					data: {
						tool: toolName,
						result: result.substring(0, 2000), // Limit display size
						isError
					}
				});
			},
			onError: (error: string) => {
				this._outputChannel.appendLine(`Error: ${error}`);
				this._sendAndSaveMessage({
					type: 'error',
					data: error
				});
			},
			onComplete: (totalInputTokens: number, totalOutputTokens: number) => {
				this._outputChannel.appendLine(`\nCompleted. Tokens: ${totalInputTokens} in, ${totalOutputTokens} out`);

				// Update totals
				this._totalTokensInput = totalInputTokens;
				this._totalTokensOutput = totalOutputTokens;

				// Send token update
				this._postMessage({
					type: 'updateTokens',
					data: {
						totalTokensInput: this._totalTokensInput,
						totalTokensOutput: this._totalTokensOutput
					}
				});

				// Hide animated loading and set processing complete
				this._postMessage({ type: 'hideLoading' });
				this._postMessage({ type: 'setProcessing', data: false });

				// End streaming - this finalizes the streamed message
				// Note: Don't send accumulated text separately as it's already displayed via streaming
				this._postMessage({ type: 'streamEnd' });

				// Save the accumulated text to conversation history (without displaying again)
				if (accumulatedText.trim()) {
					this._currentConversation.push({
						timestamp: new Date().toISOString(),
						messageType: 'output',
						data: accumulatedText.trim()
					});
					void this._saveCurrentConversation();
				}
			},
			onThinking: (thinking: string) => {
				// Send thinking content to UI
				this._sendAndSaveMessage({
					type: 'thinking',
					data: thinking
				});
			}
		};

		// Send message using API client
		try {
			await this._apiClient.sendMessage(actualMessage, callbacks, thinkingMode || false, images);
		} catch (error: any) {
			this._outputChannel.appendLine(`Send message error: ${error.message}`);
			this._sendAndSaveMessage({
				type: 'error',
				data: `Error: ${error.message}`
			});
			this._postMessage({ type: 'hideLoading' });
			this._postMessage({ type: 'setProcessing', data: false });
			// End streaming on error
			this._postMessage({ type: 'streamEnd' });
		}
	}




	private _newSession() {
		// Clear current session
		this._currentSessionId = undefined;

		// Clear commits and conversation
		this._commits = [];
		this._currentConversation = [];
		this._conversationStartTime = undefined;

		// Reset counters
		this._totalCost = 0;
		this._totalTokensInput = 0;
		this._totalTokensOutput = 0;
		this._requestCount = 0;

		// Clear API client conversation history
		if (this._apiClient) {
			this._apiClient.clearHistory();
		}

		// Notify webview to clear all messages and reset session
		this._postMessage({
			type: 'sessionCleared'
		});
	}

	public newSessionOnConfigChange() {
		// Reinitialize MCP config with new WSL paths
		this._initializeMCPConfig();
		
		// Start a new session due to configuration change
		this._newSession();
		
		// Show notification to user
		vscode.window.showInformationMessage(
			'WSL configuration changed. Started a new session.',
			'OK'
		);

		// Send message to webview about the config change
		this._sendAndSaveMessage({
			type: 'configChanged',
			data: '⚙️ WSL configuration changed. Started a new session.'
		});
	}

	private _handleLoginRequired() {
		// Clear processing state
		this._postMessage({
			type: 'setProcessing',
			data: false
		});

		// Show login required message
		this._postMessage({
			type: 'loginRequired'
		});

		// Get configuration to check if WSL is enabled
		const config = vscode.workspace.getConfiguration('codePilotAI');
		const wslEnabled = config.get<boolean>('wsl.enabled', false);
		const wslDistro = config.get<string>('wsl.distro', 'Ubuntu');
		const nodePath = config.get<string>('wsl.nodePath', '/usr/bin/node');
		const claudePath = config.get<string>('wsl.claudePath', '/usr/local/bin/claude');

		// Open terminal and run login
		const terminal = vscode.window.createTerminal('AI Login');
		if (wslEnabled) {
			terminal.sendText(`wsl -d ${wslDistro} ${nodePath} --no-warnings --enable-source-maps ${claudePath}`);
		} else {
			terminal.sendText('claude');
		}
		terminal.show();

		// Show info message
		vscode.window.showInformationMessage(
			'Please login in the terminal, then come back to this chat to continue.',
			'OK'
		);

				// Send message to UI about terminal
		this._postMessage({
			type: 'terminalOpened',
			data: `Please login in the terminal, then come back to this chat to continue.`,
		});
	}

	private async _initializeBackupRepo(): Promise<void> {
		try {
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {return;}

			const storagePath = this._context.storageUri?.fsPath;
			if (!storagePath) {
				console.error('No workspace storage available');
				return;
			}
			console.log('Workspace storage path:', storagePath);
			this._backupRepoPath = path.join(storagePath, 'backups', '.git');

			// Create backup git directory if it doesn't exist
			try {
				await vscode.workspace.fs.stat(vscode.Uri.file(this._backupRepoPath));
			} catch {
				await vscode.workspace.fs.createDirectory(vscode.Uri.file(this._backupRepoPath));

				const workspacePath = workspaceFolder.uri.fsPath;

				// Initialize git repo with workspace as work-tree
				await exec(`git --git-dir="${this._backupRepoPath}" --work-tree="${workspacePath}" init`);
				await exec(`git --git-dir="${this._backupRepoPath}" config user.name "Code Pilot AI"`);
				await exec(`git --git-dir="${this._backupRepoPath}" config user.email "codepilot@local"`);

				console.log(`Initialized backup repository at: ${this._backupRepoPath}`);
			}
		} catch (error: any) {
			console.error('Failed to initialize backup repository:', error.message);
		}
	}

	private async _createBackupCommit(userMessage: string): Promise<void> {
		try {
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder || !this._backupRepoPath) {return;}

			const workspacePath = workspaceFolder.uri.fsPath;
			const now = new Date();
			const timestamp = now.toISOString().replace(/[:.]/g, '-');
			const displayTimestamp = now.toISOString();
			const commitMessage = `Before: ${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}`;

			// Add all files using git-dir and work-tree (excludes .git automatically)
			await exec(`git --git-dir="${this._backupRepoPath}" --work-tree="${workspacePath}" add -A`);

			// Check if this is the first commit (no HEAD exists yet)
			let isFirstCommit = false;
			try {
				await exec(`git --git-dir="${this._backupRepoPath}" rev-parse HEAD`);
			} catch {
				isFirstCommit = true;
			}

			// Check if there are changes to commit
			const { stdout: status } = await exec(`git --git-dir="${this._backupRepoPath}" --work-tree="${workspacePath}" status --porcelain`);

			// Always create a checkpoint, even if no files changed
			let actualMessage;
			if (isFirstCommit) {
				actualMessage = `Initial backup: ${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}`;
			} else if (status.trim()) {
				actualMessage = commitMessage;
			} else {
				actualMessage = `Checkpoint (no changes): ${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}`;
			}

			// Create commit with --allow-empty to ensure checkpoint is always created
			await exec(`git --git-dir="${this._backupRepoPath}" --work-tree="${workspacePath}" commit --allow-empty -m "${actualMessage}"`);
			const { stdout: sha } = await exec(`git --git-dir="${this._backupRepoPath}" rev-parse HEAD`);

			// Store commit info
			const commitInfo = {
				id: `commit-${timestamp}`,
				sha: sha.trim(),
				message: actualMessage,
				timestamp: displayTimestamp
			};

			this._commits.push(commitInfo);

			// Show restore option in UI and save to conversation
			this._sendAndSaveMessage({
				type: 'showRestoreOption',
				data: commitInfo
			});

			console.log(`Created backup commit: ${commitInfo.sha.substring(0, 8)} - ${actualMessage}`);
		} catch (error: any) {
			console.error('Failed to create backup commit:', error.message);
		}
	}


	private async _restoreToCommit(commitSha: string): Promise<void> {
		try {
			const commit = this._commits.find(c => c.sha === commitSha);
			if (!commit) {
				this._postMessage({
					type: 'restoreError',
					data: 'Commit not found'
				});
				return;
			}

			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder || !this._backupRepoPath) {
				vscode.window.showErrorMessage('No workspace folder or backup repository available.');
				return;
			}

			const workspacePath = workspaceFolder.uri.fsPath;

			this._postMessage({
				type: 'restoreProgress',
				data: 'Restoring files from backup...'
			});

			// Restore files directly to workspace using git checkout
			await exec(`git --git-dir="${this._backupRepoPath}" --work-tree="${workspacePath}" checkout ${commitSha} -- .`);

			vscode.window.showInformationMessage(`Restored to commit: ${commit.message}`);

			this._sendAndSaveMessage({
				type: 'restoreSuccess',
				data: {
					message: `Successfully restored to: ${commit.message}`,
					commitSha: commitSha
				}
			});

		} catch (error: any) {
			console.error('Failed to restore commit:', error.message);
			vscode.window.showErrorMessage(`Failed to restore commit: ${error.message}`);
			this._postMessage({
				type: 'restoreError',
				data: `Failed to restore: ${error.message}`
			});
		}
	}

	private async _initializeConversations(): Promise<void> {
		try {
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {return;}

			const storagePath = this._context.storageUri?.fsPath;
			if (!storagePath) {return;}

			this._conversationsPath = path.join(storagePath, 'conversations');

			// Create conversations directory if it doesn't exist
			try {
				await vscode.workspace.fs.stat(vscode.Uri.file(this._conversationsPath));
			} catch {
				await vscode.workspace.fs.createDirectory(vscode.Uri.file(this._conversationsPath));
				console.log(`Created conversations directory at: ${this._conversationsPath}`);
			}
		} catch (error: any) {
			console.error('Failed to initialize conversations directory:', error.message);
		}
	}

	private async _initializeMCPConfig(): Promise<void> {
		try {
			const storagePath = this._context.storageUri?.fsPath;
			if (!storagePath) {return;}

			// Create MCP config directory
			const mcpConfigDir = path.join(storagePath, 'mcp');
			try {
				await vscode.workspace.fs.stat(vscode.Uri.file(mcpConfigDir));
			} catch {
				await vscode.workspace.fs.createDirectory(vscode.Uri.file(mcpConfigDir));
				console.log(`Created MCP config directory at: ${mcpConfigDir}`);
			}

			// Create or update mcp-servers.json with permissions server, preserving existing servers
			const mcpConfigPath = path.join(mcpConfigDir, 'mcp-servers.json');
			const mcpPermissionsPath = this.convertToWSLPath(path.join(this._extensionUri.fsPath, 'mcp-permissions.js'));
			const permissionRequestsPath = this.convertToWSLPath(path.join(storagePath, 'permission-requests'));
			
			// Load existing config or create new one
			let mcpConfig: any = { mcpServers: {} };
			const mcpConfigUri = vscode.Uri.file(mcpConfigPath);
			
			try {
				const existingContent = await vscode.workspace.fs.readFile(mcpConfigUri);
				mcpConfig = JSON.parse(new TextDecoder().decode(existingContent));
				console.log('Loaded existing MCP config, preserving user servers');
			} catch {
				console.log('No existing MCP config found, creating new one');
			}
			
			// Ensure mcpServers exists
			if (!mcpConfig.mcpServers) {
				mcpConfig.mcpServers = {};
			}
			
			// Add or update the permissions server entry
			mcpConfig.mcpServers['code-pilot-ai-permissions'] = {
				command: 'node',
				args: [mcpPermissionsPath],
				env: {
					CLAUDE_PERMISSIONS_PATH: permissionRequestsPath
				}
			};

			const configContent = new TextEncoder().encode(JSON.stringify(mcpConfig, null, 2));
			await vscode.workspace.fs.writeFile(mcpConfigUri, configContent);
			
			console.log(`Updated MCP config at: ${mcpConfigPath}`);
		} catch (error: any) {
			console.error('Failed to initialize MCP config:', error.message);
		}
	}

	private async _initializePermissions(): Promise<void> {
		try {
			const storagePath = this._context.storageUri?.fsPath;
			if (!storagePath) {return;}

			// Create permission requests directory
			this._permissionRequestsPath = path.join(path.join(storagePath, 'permission-requests'));
			try {
				await vscode.workspace.fs.stat(vscode.Uri.file(this._permissionRequestsPath));
			} catch {
				await vscode.workspace.fs.createDirectory(vscode.Uri.file(this._permissionRequestsPath));
				console.log(`Created permission requests directory at: ${this._permissionRequestsPath}`);
			}

			console.log("DIRECTORY-----", this._permissionRequestsPath)

			// Set up file watcher for *.request files
			this._permissionWatcher = vscode.workspace.createFileSystemWatcher(
				new vscode.RelativePattern(this._permissionRequestsPath, '*.request')
			);

			this._permissionWatcher.onDidCreate(async (uri) => {
				console.log("----file", uri)
				// Only handle file scheme URIs, ignore vscode-userdata scheme
				if (uri.scheme === 'file') {
					await this._handlePermissionRequest(uri);
				}
			});

			this._disposables.push(this._permissionWatcher);

		} catch (error: any) {
			console.error('Failed to initialize permissions:', error.message);
		}
	}

	private async _handlePermissionRequest(requestUri: vscode.Uri): Promise<void> {
		try {
			// Read the request file
			const content = await vscode.workspace.fs.readFile(requestUri);
			const request = JSON.parse(new TextDecoder().decode(content));

			// Show permission dialog
			const approved = await this._showPermissionDialog(request);

			// Write response file
			const responseFile = requestUri.fsPath.replace('.request', '.response');
			const response = {
				id: request.id,
				approved: approved,
				timestamp: new Date().toISOString()
			};

			const responseContent = new TextEncoder().encode(JSON.stringify(response));
			await vscode.workspace.fs.writeFile(vscode.Uri.file(responseFile), responseContent);

			// Clean up request file
			await vscode.workspace.fs.delete(requestUri);

		} catch (error: any) {
			console.error('Failed to handle permission request:', error.message);
		}
	}

	private async _showPermissionDialog(request: any): Promise<boolean> {
		const toolName = request.tool || 'Unknown Tool';
		
		// Generate pattern for Bash commands
		let pattern = undefined;
		if (toolName === 'Bash' && request.input?.command) {
			pattern = this.getCommandPattern(request.input.command);
		}
		
		// Send permission request to the UI
		this._postMessage({
			type: 'permissionRequest',
			data: {
				id: request.id,
				tool: toolName,
				input: request.input,
				pattern: pattern
			}
		});

		// Wait for response from UI
		return new Promise((resolve) => {
			// Store the resolver so we can call it when we get the response
			this._pendingPermissionResolvers = this._pendingPermissionResolvers || new Map();
			this._pendingPermissionResolvers.set(request.id, resolve);
		});
	}

	private _handlePermissionResponse(id: string, approved: boolean, alwaysAllow?: boolean): void {
		if (this._pendingPermissionResolvers && this._pendingPermissionResolvers.has(id)) {
			const resolver = this._pendingPermissionResolvers.get(id);
			if (resolver) {
				resolver(approved);
				this._pendingPermissionResolvers.delete(id);
				
				// Handle always allow setting
				if (alwaysAllow && approved) {
					void this._saveAlwaysAllowPermission(id);
				}
			}
		}
	}

	private async _saveAlwaysAllowPermission(requestId: string): Promise<void> {
		try {
			// Read the original request to get tool name and input
			const storagePath = this._context.storageUri?.fsPath;
			if (!storagePath) return;

			const requestFileUri = vscode.Uri.file(path.join(storagePath, 'permission-requests', `${requestId}.request`));
			
			let requestContent: Uint8Array;
			try {
				requestContent = await vscode.workspace.fs.readFile(requestFileUri);
			} catch {
				return; // Request file doesn't exist
			}

			const request = JSON.parse(new TextDecoder().decode(requestContent));
			
			// Load existing workspace permissions
			const permissionsUri = vscode.Uri.file(path.join(storagePath, 'permission-requests', 'permissions.json'));
			let permissions: any = { alwaysAllow: {} };
			
			try {
				const content = await vscode.workspace.fs.readFile(permissionsUri);
				permissions = JSON.parse(new TextDecoder().decode(content));
			} catch {
				// File doesn't exist yet, use default permissions
			}

			// Add the new permission
			const toolName = request.tool;
			if (toolName === 'Bash' && request.input?.command) {
				// For Bash, store the command pattern
				if (!permissions.alwaysAllow[toolName]) {
					permissions.alwaysAllow[toolName] = [];
				}
				if (Array.isArray(permissions.alwaysAllow[toolName])) {
					const command = request.input.command.trim();
					const pattern = this.getCommandPattern(command);
					if (!permissions.alwaysAllow[toolName].includes(pattern)) {
						permissions.alwaysAllow[toolName].push(pattern);
					}
				}
			} else {
				// For other tools, allow all instances
				permissions.alwaysAllow[toolName] = true;
			}

			// Ensure permissions directory exists
			const permissionsDir = vscode.Uri.file(path.dirname(permissionsUri.fsPath));
			try {
				await vscode.workspace.fs.stat(permissionsDir);
			} catch {
				await vscode.workspace.fs.createDirectory(permissionsDir);
			}

			// Save the permissions
			const permissionsContent = new TextEncoder().encode(JSON.stringify(permissions, null, 2));
			await vscode.workspace.fs.writeFile(permissionsUri, permissionsContent);
			
			console.log(`Saved always-allow permission for ${toolName}`);
		} catch (error) {
			console.error('Error saving always-allow permission:', error);
		}
	}

	private getCommandPattern(command: string): string {
		const parts = command.trim().split(/\s+/);
		if (parts.length === 0) return command;
		
		const baseCmd = parts[0];
		const subCmd = parts.length > 1 ? parts[1] : '';
		
		// Common patterns that should use wildcards
		const patterns = [
			// Package managers
			['npm', 'install', 'npm install *'],
			['npm', 'i', 'npm i *'],
			['npm', 'add', 'npm add *'],
			['npm', 'remove', 'npm remove *'],
			['npm', 'uninstall', 'npm uninstall *'],
			['npm', 'update', 'npm update *'],
			['npm', 'run', 'npm run *'],
			['yarn', 'add', 'yarn add *'],
			['yarn', 'remove', 'yarn remove *'],
			['yarn', 'install', 'yarn install *'],
			['pnpm', 'install', 'pnpm install *'],
			['pnpm', 'add', 'pnpm add *'],
			['pnpm', 'remove', 'pnpm remove *'],
			
			// Git commands
			['git', 'add', 'git add *'],
			['git', 'commit', 'git commit *'],
			['git', 'push', 'git push *'],
			['git', 'pull', 'git pull *'],
			['git', 'checkout', 'git checkout *'],
			['git', 'branch', 'git branch *'],
			['git', 'merge', 'git merge *'],
			['git', 'clone', 'git clone *'],
			['git', 'reset', 'git reset *'],
			['git', 'rebase', 'git rebase *'],
			['git', 'tag', 'git tag *'],
			
			// Docker commands
			['docker', 'run', 'docker run *'],
			['docker', 'build', 'docker build *'],
			['docker', 'exec', 'docker exec *'],
			['docker', 'logs', 'docker logs *'],
			['docker', 'stop', 'docker stop *'],
			['docker', 'start', 'docker start *'],
			['docker', 'rm', 'docker rm *'],
			['docker', 'rmi', 'docker rmi *'],
			['docker', 'pull', 'docker pull *'],
			['docker', 'push', 'docker push *'],
			
			// Build tools
			['make', '', 'make *'],
			['cargo', 'build', 'cargo build *'],
			['cargo', 'run', 'cargo run *'],
			['cargo', 'test', 'cargo test *'],
			['cargo', 'install', 'cargo install *'],
			['mvn', 'compile', 'mvn compile *'],
			['mvn', 'test', 'mvn test *'],
			['mvn', 'package', 'mvn package *'],
			['gradle', 'build', 'gradle build *'],
			['gradle', 'test', 'gradle test *'],
			
			// System commands
			['curl', '', 'curl *'],
			['wget', '', 'wget *'],
			['ssh', '', 'ssh *'],
			['scp', '', 'scp *'],
			['rsync', '', 'rsync *'],
			['tar', '', 'tar *'],
			['zip', '', 'zip *'],
			['unzip', '', 'unzip *'],
			
			// Development tools
			['node', '', 'node *'],
			['python', '', 'python *'],
			['python3', '', 'python3 *'],
			['pip', 'install', 'pip install *'],
			['pip3', 'install', 'pip3 install *'],
			['composer', 'install', 'composer install *'],
			['composer', 'require', 'composer require *'],
			['bundle', 'install', 'bundle install *'],
			['gem', 'install', 'gem install *'],
		];
		
		// Find matching pattern
		for (const [cmd, sub, pattern] of patterns) {
			if (baseCmd === cmd && (sub === '' || subCmd === sub)) {
				return pattern;
			}
		}
		
		// Default: return exact command
		return command;
	}

	private async _sendPermissions(): Promise<void> {
		try {
			const storagePath = this._context.storageUri?.fsPath;
			if (!storagePath) {
				this._postMessage({
					type: 'permissionsData',
					data: { alwaysAllow: {} }
				});
				return;
			}

			const permissionsUri = vscode.Uri.file(path.join(storagePath, 'permission-requests', 'permissions.json'));
			let permissions: any = { alwaysAllow: {} };
			
			try {
				const content = await vscode.workspace.fs.readFile(permissionsUri);
				permissions = JSON.parse(new TextDecoder().decode(content));
			} catch {
				// File doesn't exist or can't be read, use default permissions
			}

			this._postMessage({
				type: 'permissionsData',
				data: permissions
			});
		} catch (error) {
			console.error('Error sending permissions:', error);
			this._postMessage({
				type: 'permissionsData',
				data: { alwaysAllow: {} }
			});
		}
	}

	private async _removePermission(toolName: string, command: string | null): Promise<void> {
		try {
			const storagePath = this._context.storageUri?.fsPath;
			if (!storagePath) return;

			const permissionsUri = vscode.Uri.file(path.join(storagePath, 'permission-requests', 'permissions.json'));
			let permissions: any = { alwaysAllow: {} };
			
			try {
				const content = await vscode.workspace.fs.readFile(permissionsUri);
				permissions = JSON.parse(new TextDecoder().decode(content));
			} catch {
				// File doesn't exist or can't be read, nothing to remove
				return;
			}

			// Remove the permission
			if (command === null) {
				// Remove entire tool permission
				delete permissions.alwaysAllow[toolName];
			} else {
				// Remove specific command from tool permissions
				if (Array.isArray(permissions.alwaysAllow[toolName])) {
					permissions.alwaysAllow[toolName] = permissions.alwaysAllow[toolName].filter(
						(cmd: string) => cmd !== command
					);
					// If no commands left, remove the tool entirely
					if (permissions.alwaysAllow[toolName].length === 0) {
						delete permissions.alwaysAllow[toolName];
					}
				}
			}

			// Save updated permissions
			const permissionsContent = new TextEncoder().encode(JSON.stringify(permissions, null, 2));
			await vscode.workspace.fs.writeFile(permissionsUri, permissionsContent);
			
			// Send updated permissions to UI
			this._sendPermissions();
			
			console.log(`Removed permission for ${toolName}${command ? ` command: ${command}` : ''}`);
		} catch (error) {
			console.error('Error removing permission:', error);
		}
	}

	private async _addPermission(toolName: string, command: string | null): Promise<void> {
		try {
			const storagePath = this._context.storageUri?.fsPath;
			if (!storagePath) return;

			const permissionsUri = vscode.Uri.file(path.join(storagePath, 'permission-requests', 'permissions.json'));
			let permissions: any = { alwaysAllow: {} };
			
			try {
				const content = await vscode.workspace.fs.readFile(permissionsUri);
				permissions = JSON.parse(new TextDecoder().decode(content));
			} catch {
				// File doesn't exist, use default permissions
			}

			// Add the new permission
			if (command === null || command === '') {
				// Allow all commands for this tool
				permissions.alwaysAllow[toolName] = true;
			} else {
				// Add specific command pattern
				if (!permissions.alwaysAllow[toolName]) {
					permissions.alwaysAllow[toolName] = [];
				}
				
				// Convert to array if it's currently set to true
				if (permissions.alwaysAllow[toolName] === true) {
					permissions.alwaysAllow[toolName] = [];
				}
				
				if (Array.isArray(permissions.alwaysAllow[toolName])) {
					// For Bash commands, convert to pattern using existing logic
					let commandToAdd = command;
					if (toolName === 'Bash') {
						commandToAdd = this.getCommandPattern(command);
					}
					
					// Add if not already present
					if (!permissions.alwaysAllow[toolName].includes(commandToAdd)) {
						permissions.alwaysAllow[toolName].push(commandToAdd);
					}
				}
			}

			// Ensure permissions directory exists
			const permissionsDir = vscode.Uri.file(path.dirname(permissionsUri.fsPath));
			try {
				await vscode.workspace.fs.stat(permissionsDir);
			} catch {
				await vscode.workspace.fs.createDirectory(permissionsDir);
			}

			// Save updated permissions
			const permissionsContent = new TextEncoder().encode(JSON.stringify(permissions, null, 2));
			await vscode.workspace.fs.writeFile(permissionsUri, permissionsContent);
			
			// Send updated permissions to UI
			this._sendPermissions();
			
			console.log(`Added permission for ${toolName}${command ? ` command: ${command}` : ' (all commands)'}`);
		} catch (error) {
			console.error('Error adding permission:', error);
		}
	}

	private async _loadMCPServers(): Promise<void> {
		try {
			const mcpConfigPath = this.getMCPConfigPath();
			if (!mcpConfigPath) {
				this._postMessage({ type: 'mcpServers', data: {} });
				return;
			}

			const mcpConfigUri = vscode.Uri.file(mcpConfigPath);
			let mcpConfig: any = { mcpServers: {} };

			try {
				const content = await vscode.workspace.fs.readFile(mcpConfigUri);
				mcpConfig = JSON.parse(new TextDecoder().decode(content));
			} catch (error) {
				console.log('MCP config file not found or error reading:', error);
				// File doesn't exist, return empty servers
			}

			// Filter out internal servers before sending to UI
		const filteredServers = Object.fromEntries(
			Object.entries(mcpConfig.mcpServers || {}).filter(([name]) => name !== 'code-pilot-ai-permissions')
		);
		this._postMessage({ type: 'mcpServers', data: filteredServers });
		} catch (error) {
			console.error('Error loading MCP servers:', error);
			this._postMessage({ type: 'mcpServerError', data: { error: 'Failed to load MCP servers' } });
		}
	}

	private async _saveMCPServer(name: string, config: any): Promise<void> {
		try {
			const mcpConfigPath = this.getMCPConfigPath();
			if (!mcpConfigPath) {
				this._postMessage({ type: 'mcpServerError', data: { error: 'Storage path not available' } });
				return;
			}

			const mcpConfigUri = vscode.Uri.file(mcpConfigPath);
			let mcpConfig: any = { mcpServers: {} };

			// Load existing config
			try {
				const content = await vscode.workspace.fs.readFile(mcpConfigUri);
				mcpConfig = JSON.parse(new TextDecoder().decode(content));
			} catch {
				// File doesn't exist, use default structure
			}

			// Ensure mcpServers exists
			if (!mcpConfig.mcpServers) {
				mcpConfig.mcpServers = {};
			}

			// Add/update the server
			mcpConfig.mcpServers[name] = config;

			// Ensure directory exists
			const mcpDir = vscode.Uri.file(path.dirname(mcpConfigPath));
			try {
				await vscode.workspace.fs.stat(mcpDir);
			} catch {
				await vscode.workspace.fs.createDirectory(mcpDir);
			}

			// Save the config
			const configContent = new TextEncoder().encode(JSON.stringify(mcpConfig, null, 2));
			await vscode.workspace.fs.writeFile(mcpConfigUri, configContent);

			this._postMessage({ type: 'mcpServerSaved', data: { name } });
			console.log(`Saved MCP server: ${name}`);

			// Reload MCP servers to pick up the new one
			await this._loadMCPServersForClient();
			this._outputChannel.appendLine(`Reloaded MCP servers after saving: ${name}`);
		} catch (error) {
			console.error('Error saving MCP server:', error);
			this._postMessage({ type: 'mcpServerError', data: { error: 'Failed to save MCP server' } });
		}
	}

	private async _deleteMCPServer(name: string): Promise<void> {
		try {
			const mcpConfigPath = this.getMCPConfigPath();
			if (!mcpConfigPath) {
				this._postMessage({ type: 'mcpServerError', data: { error: 'Storage path not available' } });
				return;
			}

			const mcpConfigUri = vscode.Uri.file(mcpConfigPath);
			let mcpConfig: any = { mcpServers: {} };

			// Load existing config
			try {
				const content = await vscode.workspace.fs.readFile(mcpConfigUri);
				mcpConfig = JSON.parse(new TextDecoder().decode(content));
			} catch {
				// File doesn't exist, nothing to delete
				this._postMessage({ type: 'mcpServerError', data: { error: 'MCP config file not found' } });
				return;
			}

			// Delete the server
			if (mcpConfig.mcpServers && mcpConfig.mcpServers[name]) {
				delete mcpConfig.mcpServers[name];

				// Save the updated config
				const configContent = new TextEncoder().encode(JSON.stringify(mcpConfig, null, 2));
				await vscode.workspace.fs.writeFile(mcpConfigUri, configContent);

				this._postMessage({ type: 'mcpServerDeleted', data: { name } });
				console.log(`Deleted MCP server: ${name}`);

				// Reload MCP servers after deletion
				await this._loadMCPServersForClient();
				this._outputChannel.appendLine(`Reloaded MCP servers after deleting: ${name}`);
			} else {
				this._postMessage({ type: 'mcpServerError', data: { error: `Server '${name}' not found` } });
			}
		} catch (error) {
			console.error('Error deleting MCP server:', error);
			this._postMessage({ type: 'mcpServerError', data: { error: 'Failed to delete MCP server' } });
		}
	}

	private async _getMCPServersForSettings(): Promise<void> {
		try {
			const config = vscode.workspace.getConfiguration('codePilotAI');
			const servers = config.get<any[]>('mcp.servers', []);

			// Get server statuses from MCP client
			const statuses: Record<string, { connected: boolean; toolCount: number; enabled: boolean }> = {};

			if (this._mcpClient) {
				const allTools = this._mcpClient.getAllTools();

				for (const server of servers) {
					const serverTools = allTools.filter(t => t.serverName === server.name);
					const isEnabled = !server.disabled;
					const isConnected = serverTools.length > 0 && isEnabled;
					statuses[server.name] = {
						connected: isConnected,
						toolCount: serverTools.length,
						enabled: isEnabled
					};
				}
			} else {
				// If no MCP client, still provide enabled status
				for (const server of servers) {
					statuses[server.name] = {
						connected: false,
						toolCount: 0,
						enabled: !server.disabled
					};
				}
			}

			this._postMessage({
				type: 'mcpServersData',
				data: {
					servers: servers,
					statuses
				}
			});
		} catch (error) {
			console.error('Error getting MCP servers:', error);
			this._postMessage({ type: 'mcpServerError', data: { error: 'Failed to get MCP servers' } });
		}
	}

	private async _addMCPServerFromSettings(server: any): Promise<void> {
		try {
			const config = vscode.workspace.getConfiguration('codePilotAI');
			const currentServers = config.get<any[]>('mcp.servers', []);

			// Check for duplicate names
			if (currentServers.some(s => s.name === server.name)) {
				this._postMessage({ type: 'mcpServerError', data: { error: `Server '${server.name}' already exists` } });
				return;
			}

			// Add the new server
			const updatedServers = [...currentServers, server];
			await config.update('mcp.servers', updatedServers, vscode.ConfigurationTarget.Global);

			this._postMessage({ type: 'mcpServerAdded', data: { name: server.name } });

			// Reload MCP servers for client
			await this._loadMCPServersForClient();
		} catch (error) {
			console.error('Error adding MCP server:', error);
			this._postMessage({ type: 'mcpServerError', data: { error: 'Failed to add MCP server' } });
		}
	}

	private async _updateMCPServerFromSettings(originalName: string, server: any): Promise<void> {
		try {
			const config = vscode.workspace.getConfiguration('codePilotAI');
			const currentServers = config.get<any[]>('mcp.servers', []);

			// Find and update the server
			const serverIndex = currentServers.findIndex(s => s.name === originalName);
			if (serverIndex === -1) {
				this._postMessage({ type: 'mcpServerError', data: { error: `Server '${originalName}' not found` } });
				return;
			}

			// Update the server configuration
			currentServers[serverIndex] = { ...currentServers[serverIndex], ...server };
			await config.update('mcp.servers', currentServers, vscode.ConfigurationTarget.Global);

			this._postMessage({ type: 'mcpServerUpdated', data: { name: server.name } });

			// Reload MCP servers for client
			await this._loadMCPServersForClient();

			// Refresh the UI
			await this._getMCPServersForSettings();
		} catch (error) {
			console.error('Error updating MCP server:', error);
			this._postMessage({ type: 'mcpServerError', data: { error: 'Failed to update MCP server' } });
		}
	}

	private async _removeMCPServerFromSettings(serverName: string): Promise<void> {
		try {
			this._outputChannel.appendLine(`Removing MCP server from settings: ${serverName}`);

			// Show confirmation dialog using VS Code API (works outside sandboxed webview)
			const confirm = await vscode.window.showWarningMessage(
				`Are you sure you want to remove MCP server '${serverName}'?`,
				{ modal: true },
				'Yes, Remove'
			);
			this._outputChannel.appendLine(`User confirmation result: ${confirm}`);

			if (confirm !== 'Yes, Remove') {
				this._outputChannel.appendLine(`User cancelled removal`);
				return;
			}

			const config = vscode.workspace.getConfiguration('codePilotAI');
			const currentServers = config.get<any[]>('mcp.servers', []);
			this._outputChannel.appendLine(`Current servers count: ${currentServers.length}`);

			// Remove the server
			const updatedServers = currentServers.filter(s => s.name !== serverName);
			this._outputChannel.appendLine(`Updated servers count: ${updatedServers.length}`);

			await config.update('mcp.servers', updatedServers, vscode.ConfigurationTarget.Global);
			this._outputChannel.appendLine(`Settings updated successfully`);

			// Reload MCP servers for client
			await this._loadMCPServersForClient();

			// Refresh the UI immediately
			await this._getMCPServersForSettings();

			this._postMessage({ type: 'mcpServerRemoved', data: { name: serverName } });
			this._outputChannel.appendLine(`Removed server '${serverName}' successfully`);
			vscode.window.showInformationMessage(`MCP server '${serverName}' removed successfully.`);
		} catch (error) {
			this._outputChannel.appendLine(`Error removing MCP server: ${error}`);
			console.error('Error removing MCP server:', error);
			vscode.window.showErrorMessage(`Failed to remove MCP server: ${error instanceof Error ? error.message : 'Unknown error'}`);
			this._postMessage({ type: 'mcpServerError', data: { error: 'Failed to remove MCP server' } });
		}
	}

	private async _connectMCPServerFromSettings(serverName: string): Promise<void> {
		try {
			const config = vscode.workspace.getConfiguration('codePilotAI');
			const servers = config.get<any[]>('mcp.servers', []);

			// Find the server and enable it
			const updatedServers = servers.map(s => {
				if (s.name === serverName) {
					return { ...s, disabled: false };
				}
				return s;
			});

			await config.update('mcp.servers', updatedServers, vscode.ConfigurationTarget.Global);

			// Reload MCP client to connect the server
			await this._loadMCPServersForClient();

			// Small delay to allow MCP client to connect
			setTimeout(async () => {
				// Refresh the UI with updated status
				await this._getMCPServersForSettings();
				this._postMessage({ type: 'mcpServerConnected', data: { name: serverName } });
			}, 500);
		} catch (error) {
			console.error('Error connecting MCP server:', error);
			this._postMessage({ type: 'mcpServerError', data: { error: 'Failed to connect MCP server' } });
		}
	}

	private async _disconnectMCPServerFromSettings(serverName: string): Promise<void> {
		try {
			const config = vscode.workspace.getConfiguration('codePilotAI');
			const servers = config.get<any[]>('mcp.servers', []);

			// Find the server and disable it
			const updatedServers = servers.map(s => {
				if (s.name === serverName) {
					return { ...s, disabled: true };
				}
				return s;
			});

			await config.update('mcp.servers', updatedServers, vscode.ConfigurationTarget.Global);

			// Reload MCP client (disabled servers won't be loaded)
			await this._loadMCPServersForClient();

			// Small delay to allow MCP client to disconnect
			setTimeout(async () => {
				// Refresh the UI with updated status
				await this._getMCPServersForSettings();
				this._postMessage({ type: 'mcpServerDisconnected', data: { name: serverName } });
			}, 500);
		} catch (error) {
			console.error('Error disconnecting MCP server:', error);
			this._postMessage({ type: 'mcpServerError', data: { error: 'Failed to disconnect MCP server' } });
		}
	}

	private async _sendCustomSnippets(): Promise<void> {
		try {
			const customSnippets = this._context.globalState.get<{[key: string]: any}>('customPromptSnippets', {});
			this._postMessage({
				type: 'customSnippetsData',
				data: customSnippets
			});
		} catch (error) {
			console.error('Error loading custom snippets:', error);
			this._postMessage({
				type: 'customSnippetsData',
				data: {}
			});
		}
	}

	private async _saveCustomSnippet(snippet: any): Promise<void> {
		try {
			const customSnippets = this._context.globalState.get<{[key: string]: any}>('customPromptSnippets', {});
			customSnippets[snippet.id] = snippet;
			
			await this._context.globalState.update('customPromptSnippets', customSnippets);
			
			this._postMessage({
				type: 'customSnippetSaved',
				data: { snippet }
			});
			
			console.log('Saved custom snippet:', snippet.name);
		} catch (error) {
			console.error('Error saving custom snippet:', error);
			this._postMessage({
				type: 'error',
				data: 'Failed to save custom snippet'
			});
		}
	}

	private async _deleteCustomSnippet(snippetId: string): Promise<void> {
		try {
			const customSnippets = this._context.globalState.get<{[key: string]: any}>('customPromptSnippets', {});
			
			if (customSnippets[snippetId]) {
				delete customSnippets[snippetId];
				await this._context.globalState.update('customPromptSnippets', customSnippets);
				
				this._postMessage({
					type: 'customSnippetDeleted',
					data: { snippetId }
				});
				
				console.log('Deleted custom snippet:', snippetId);
			} else {
				this._postMessage({
					type: 'error',
					data: 'Snippet not found'
				});
			}
		} catch (error) {
			console.error('Error deleting custom snippet:', error);
			this._postMessage({
				type: 'error',
				data: 'Failed to delete custom snippet'
			});
		}
	}

	private convertToWSLPath(windowsPath: string): string {
		const config = vscode.workspace.getConfiguration('codePilotAI');
		const wslEnabled = config.get<boolean>('wsl.enabled', false);
		
		if (wslEnabled && windowsPath.match(/^[a-zA-Z]:/)) {
			// Convert C:\Users\... to /mnt/c/Users/...
			return windowsPath.replace(/^([a-zA-Z]):/, '/mnt/$1').toLowerCase().replace(/\\/g, '/');
		}
		
		return windowsPath;
	}

	public getMCPConfigPath(): string | undefined {
		const storagePath = this._context.storageUri?.fsPath;
		if (!storagePath) {return undefined;}
		
		const configPath = path.join(storagePath, 'mcp', 'mcp-servers.json');
		return path.join(configPath);
	}

	private _sendAndSaveMessage(message: { type: string, data: any }): void {
		// Initialize conversation if this is the first message
		if (this._currentConversation.length === 0) {
			this._conversationStartTime = new Date().toISOString();
			// Create a new session ID if we don't have one
			if (!this._currentSessionId) {
				this._currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
				console.log('Created new session ID:', this._currentSessionId);
			}
		}

		if (message.type === 'sessionInfo') {
			message.data.sessionId;
		}

		// Send to UI using the helper method
		this._postMessage(message);

		// Save to conversation
		this._currentConversation.push({
			timestamp: new Date().toISOString(),
			messageType: message.type,
			data: message.data
		});

		// Persist conversation
		void this._saveCurrentConversation();
	}

	private async _saveCurrentConversation(): Promise<void> {
		if (!this._conversationsPath || this._currentConversation.length === 0) {return;}
		if(!this._currentSessionId) {return;}

		try {
			// Create filename from first user message and timestamp
			const firstUserMessage = this._currentConversation.find(m => m.messageType === 'userInput');
			const firstMessage = firstUserMessage ? firstUserMessage.data : 'conversation';
			const startTime = this._conversationStartTime || new Date().toISOString();
			const sessionId = this._currentSessionId || 'unknown';

			// Clean and truncate first message for filename
			const cleanMessage = firstMessage
				.replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
				.replace(/\s+/g, '-') // Replace spaces with dashes
				.substring(0, 50) // Limit length
				.toLowerCase();

			const datePrefix = startTime.substring(0, 16).replace('T', '_').replace(/:/g, '-');
			const filename = `${datePrefix}_${cleanMessage}.json`;

			const conversationData = {
				sessionId: sessionId,
				startTime: this._conversationStartTime,
				endTime: new Date().toISOString(),
				messageCount: this._currentConversation.length,
				totalCost: this._totalCost,
				totalTokens: {
					input: this._totalTokensInput,
					output: this._totalTokensOutput
				},
				messages: this._currentConversation,
				filename
			};

			const filePath = path.join(this._conversationsPath, filename);
			const content = new TextEncoder().encode(JSON.stringify(conversationData, null, 2));
			await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), content);

			// Update conversation index
			this._updateConversationIndex(filename, conversationData);

			console.log(`Saved conversation: ${filename}`, this._conversationsPath);
		} catch (error: any) {
			console.error('Failed to save conversation:', error.message);
		}
	}


	public async loadConversation(filename: string): Promise<void> {
		// Load the conversation history
		await this._loadConversationHistory(filename);
	}

	private _sendConversationList(): void {
		this._postMessage({
			type: 'conversationList',
			data: this._conversationIndex
		});
	}

	private async _sendWorkspaceFiles(searchTerm?: string): Promise<void> {
		try {
			// Always get all files and filter on the backend for better search results
			const files = await vscode.workspace.findFiles(
				'**/*',
				'{**/node_modules/**,**/.git/**,**/dist/**,**/build/**,**/.next/**,**/.nuxt/**,**/target/**,**/bin/**,**/obj/**}',
				500 // Reasonable limit for filtering
			);

			let fileList = files.map(file => {
				const relativePath = vscode.workspace.asRelativePath(file);
				return {
					name: file.path.split('/').pop() || '',
					path: relativePath,
					fsPath: file.fsPath
				};
			});

			// Filter results based on search term
			if (searchTerm && searchTerm.trim()) {
				const term = searchTerm.toLowerCase();
				fileList = fileList.filter(file => {
					const fileName = file.name.toLowerCase();
					const filePath = file.path.toLowerCase();
					
					// Check if term matches filename or any part of the path
					return fileName.includes(term) || 
						   filePath.includes(term) ||
						   filePath.split('/').some(segment => segment.includes(term));
				});
			}

			// Sort and limit results
			fileList = fileList
				.sort((a, b) => a.name.localeCompare(b.name))
				.slice(0, 50);

			this._postMessage({
				type: 'workspaceFiles',
				data: fileList
			});
		} catch (error) {
			console.error('Error getting workspace files:', error);
			this._postMessage({
				type: 'workspaceFiles',
				data: []
			});
		}
	}

	private async _selectImageFile(): Promise<void> {
		try {
			// Show VS Code's native file picker for images
			const result = await vscode.window.showOpenDialog({
				canSelectFiles: true,
				canSelectFolders: false,
				canSelectMany: true,
				title: 'Select image files',
				filters: {
					'Images': ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp']
				}
			});
			
			if (result && result.length > 0) {
				// Send the selected file paths back to webview
				result.forEach(uri => {
					this._postMessage({
						type: 'imagePath',
						path: uri.fsPath
					});
				});
			}
			
		} catch (error) {
			console.error('Error selecting image files:', error);
		}
	}

	private _stopClaudeProcess(): void {
		console.log('Stop request received');

		// Stop API client request
		if (this._apiClient) {
			this._apiClient.stop();
			console.log('API client request stopped');
		}

		// Also handle legacy CLI process if any
		if (this._currentClaudeProcess) {
			console.log('Terminating Claude process...');

			// Try graceful termination first
			this._currentClaudeProcess.kill('SIGTERM');

			// Force kill after 2 seconds if still running
			setTimeout(() => {
				if (this._currentClaudeProcess && !this._currentClaudeProcess.killed) {
					console.log('Force killing Claude process...');
					this._currentClaudeProcess.kill('SIGKILL');
				}
			}, 2000);

			// Clear process reference
			this._currentClaudeProcess = undefined;
		}

		// Update UI state
		this._postMessage({
			type: 'setProcessing',
			data: false
		});

		this._postMessage({
			type: 'hideLoading'
		});

		// Send stop confirmation message directly to UI and save
		this._sendAndSaveMessage({
			type: 'error',
			data: '⏹️ Request was stopped.'
		});

		console.log('Stop completed');
	}

	private _updateConversationIndex(filename: string, conversationData: any): void {
		// Extract first and last user messages
		const userMessages = conversationData.messages.filter((m: any) => m.messageType === 'userInput');
		const firstUserMessage = userMessages.length > 0 ? userMessages[0].data : 'No user message';
		const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].data : firstUserMessage;

		// Create or update index entry
		const indexEntry = {
			filename: filename,
			sessionId: conversationData.sessionId,
			startTime: conversationData.startTime,
			endTime: conversationData.endTime,
			messageCount: conversationData.messageCount,
			totalCost: conversationData.totalCost,
			firstUserMessage: firstUserMessage.substring(0, 100), // Truncate for storage
			lastUserMessage: lastUserMessage.substring(0, 100)
		};

		// Remove any existing entry for this session (in case of updates)
		this._conversationIndex = this._conversationIndex.filter(entry => entry.filename !== conversationData.filename);

		// Add new entry at the beginning (most recent first)
		this._conversationIndex.unshift(indexEntry);

		// Keep only last 50 conversations to avoid workspace state bloat
		if (this._conversationIndex.length > 50) {
			this._conversationIndex = this._conversationIndex.slice(0, 50);
		}

		// Save to workspace state
		this._context.workspaceState.update('claude.conversationIndex', this._conversationIndex);
	}

	private _getLatestConversation(): any | undefined {
		return this._conversationIndex.length > 0 ? this._conversationIndex[0] : undefined;
	}

	private async _loadConversationHistory(filename: string): Promise<void> {
		console.log("_loadConversationHistory");
		if (!this._conversationsPath) {return;}

		try {
			const filePath = path.join(this._conversationsPath, filename);
			console.log("filePath", filePath);
			
			let conversationData;
			try {
				const fileUri = vscode.Uri.file(filePath);
				const content = await vscode.workspace.fs.readFile(fileUri);
				conversationData = JSON.parse(new TextDecoder().decode(content));
			} catch {
				return;
			}
			
			console.log("conversationData", conversationData);
			// Load conversation into current state
			this._currentConversation = conversationData.messages || [];
			this._conversationStartTime = conversationData.startTime;
			this._totalCost = conversationData.totalCost || 0;
			this._totalTokensInput = conversationData.totalTokens?.input || 0;
			this._totalTokensOutput = conversationData.totalTokens?.output || 0;

			// Clear UI messages first, then send all messages to recreate the conversation
			setTimeout(() => {
				// Clear existing messages
				this._postMessage({
					type: 'sessionCleared'
				});

				// Small delay to ensure messages are cleared before loading new ones
				setTimeout(() => {
					for (const message of this._currentConversation) {
						this._postMessage({
							type: message.messageType,
							data: message.data
						});
					}

					// Send updated totals
					this._postMessage({
						type: 'updateTotals',
						data: {
							totalCost: this._totalCost,
							totalTokensInput: this._totalTokensInput,
							totalTokensOutput: this._totalTokensOutput,
							requestCount: this._requestCount
						}
					});

					// Send ready message after conversation is loaded
					this._sendReadyMessage();
				}, 50);
			}, 100); // Small delay to ensure webview is ready

			console.log(`Loaded conversation history: ${filename}`);
		} catch (error: any) {
			console.error('Failed to load conversation history:', error.message);
		}
	}

	private _getHtmlForWebview(): string {
		// Get webview reference - try panel first, then sidebar webview
		const webview = this._panel?.webview || this._webview;

		if (webview) {
			// Create URI for the icon
			const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'icon.png'));

			// Replace placeholder in HTML with actual icon URI
			return html.replace('{{ICON_URI}}', iconUri.toString());
		}

		return html;
	}

	private _sendCurrentSettings(): void {
		const config = vscode.workspace.getConfiguration('codePilotAI');
		const settings = {
			'thinking.intensity': config.get<string>('thinking.intensity', 'think'),
			'wsl.enabled': config.get<boolean>('wsl.enabled', false),
			'wsl.distro': config.get<string>('wsl.distro', 'Ubuntu'),
			'wsl.nodePath': config.get<string>('wsl.nodePath', '/usr/bin/node'),
			'wsl.claudePath': config.get<string>('wsl.claudePath', '/usr/local/bin/claude'),
			'permissions.yoloMode': config.get<boolean>('permissions.yoloMode', false),
			// Provider and API settings
			'provider': config.get<string>('provider', 'anthropic'),
			'anthropic.apiKey': config.get<string>('anthropic.apiKey', ''),
			'anthropic.model': config.get<string>('anthropic.model', 'claude-sonnet-4-20250514'),
			'azure.endpoint': config.get<string>('azure.endpoint', ''),
			'azure.apiKey': config.get<string>('azure.apiKey', ''),
			'azure.deployment': config.get<string>('azure.deployment', ''),
			'azure.apiVersion': config.get<string>('azure.apiVersion', '2024-02-15-preview'),
			// DeepSeek settings
			'deepseek.apiKey': config.get<string>('deepseek.apiKey', ''),
			'deepseek.model': config.get<string>('deepseek.model', 'deepseek-chat'),
			// Grok settings
			'grok.apiKey': config.get<string>('grok.apiKey', ''),
			'grok.model': config.get<string>('grok.model', 'grok-beta')
		};

		this._postMessage({
			type: 'settingsData',
			data: settings
		});
	}

	private async _enableYoloMode(): Promise<void> {
		try {
			// Update VS Code configuration to enable YOLO mode
			const config = vscode.workspace.getConfiguration('codePilotAI');

			// Clear any global setting and set workspace setting
			await config.update('permissions.yoloMode', true, vscode.ConfigurationTarget.Workspace);

			console.log('YOLO Mode enabled - all future permissions will be skipped');

			// Send updated settings to UI
			this._sendCurrentSettings();

		} catch (error) {
			console.error('Error enabling YOLO mode:', error);
		}
	}

	private async _testAnthropicConnection(apiKey: string, model: string): Promise<void> {
		try {
			const response = await fetch('https://api.anthropic.com/v1/messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': apiKey,
					'anthropic-version': '2023-06-01'
				},
				body: JSON.stringify({
					model: model || 'claude-sonnet-4-20250514',
					max_tokens: 10,
					messages: [{ role: 'user', content: 'Hi' }]
				})
			});

			if (response.ok) {
				this._postMessage({ type: 'anthropicTestResult', success: true });
			} else {
				const errorData: any = await response.json().catch(() => ({}));
				const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
				this._postMessage({ type: 'anthropicTestResult', success: false, error: errorMessage });
			}
		} catch (error: any) {
			this._postMessage({ type: 'anthropicTestResult', success: false, error: error.message || 'Connection failed' });
		}
	}

	private async _testAzureConnection(endpoint: string, apiKey: string, deployment: string, apiVersion: string): Promise<void> {
		try {
			const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion || '2024-02-15-preview'}`;

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'api-key': apiKey
				},
				body: JSON.stringify({
					messages: [{ role: 'user', content: 'Hi' }],
					max_tokens: 10
				})
			});

			if (response.ok) {
				this._postMessage({ type: 'azureTestResult', success: true });
			} else {
				const errorData: any = await response.json().catch(() => ({}));
				const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
				this._postMessage({ type: 'azureTestResult', success: false, error: errorMessage });
			}
		} catch (error: any) {
			this._postMessage({ type: 'azureTestResult', success: false, error: error.message || 'Connection failed' });
		}
	}

	private async _testDeepSeekConnection(apiKey: string, model: string): Promise<void> {
		try {
			const response = await fetch('https://api.deepseek.com/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${apiKey}`
				},
				body: JSON.stringify({
					model: model || 'deepseek-chat',
					messages: [{ role: 'user', content: 'Hi' }],
					max_tokens: 10
				})
			});

			if (response.ok) {
				this._postMessage({ type: 'deepseekTestResult', success: true });
			} else {
				const errorData: any = await response.json().catch(() => ({}));
				const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
				this._postMessage({ type: 'deepseekTestResult', success: false, error: errorMessage });
			}
		} catch (error: any) {
			this._postMessage({ type: 'deepseekTestResult', success: false, error: error.message || 'Connection failed' });
		}
	}

	private async _testGrokConnection(apiKey: string, model: string): Promise<void> {
		try {
			const response = await fetch('https://api.x.ai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${apiKey}`
				},
				body: JSON.stringify({
					model: model || 'grok-beta',
					messages: [{ role: 'user', content: 'Hi' }],
					max_tokens: 10,
					temperature: 0
				})
			});

			if (response.ok) {
				this._postMessage({ type: 'grokTestResult', success: true });
			} else {
				const errorData: any = await response.json().catch(() => ({}));
				// xAI error format: { "code": "...", "error": "..." } where error is a string
				const errorMessage = typeof errorData?.error === 'string'
					? errorData.error
					: errorData?.error?.message || `HTTP ${response.status}`;
				this._postMessage({ type: 'grokTestResult', success: false, error: errorMessage });
			}
		} catch (error: any) {
			this._postMessage({ type: 'grokTestResult', success: false, error: error.message || 'Connection failed' });
		}
	}

	private async _updateSettings(settings: { [key: string]: any }): Promise<void> {
		const config = vscode.workspace.getConfiguration('codePilotAI');

		try {
			for (const [key, value] of Object.entries(settings)) {
				try {
					if (key === 'permissions.yoloMode') {
						// YOLO mode - try workspace first, fall back to global
						const hasWorkspace = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
						if (hasWorkspace) {
							await config.update(key, value, vscode.ConfigurationTarget.Workspace);
						} else {
							await config.update(key, value, vscode.ConfigurationTarget.Global);
						}
					} else {
						// Other settings are global (user-wide)
						await config.update(key, value, vscode.ConfigurationTarget.Global);
					}
				} catch (innerError) {
					console.warn(`Failed to save setting ${key}:`, innerError);
					// Continue with other settings even if one fails
				}
			}

			console.log('Settings updated:', settings);

			// Reinitialize API client with new settings
			await this._initializeAPIClient();
		} catch (error) {
			console.error('Failed to update settings:', error);
			vscode.window.showErrorMessage('Failed to update settings');
		}
	}

	private async _getClipboardText(): Promise<void> {
		try {
			const text = await vscode.env.clipboard.readText();
			this._postMessage({
				type: 'clipboardText',
				data: text
			});
		} catch (error) {
			console.error('Failed to read clipboard:', error);
		}
	}

	private _setSelectedModel(model: string): void {
		// Validate model name to prevent issues mentioned in the GitHub issue
		const validModels = ['opus', 'sonnet', 'default'];
		if (validModels.includes(model)) {
			this._selectedModel = model;
			console.log('Model selected:', model);
			
			// Store the model preference in workspace state
			this._context.workspaceState.update('claude.selectedModel', model);
			
			// Show confirmation
			vscode.window.showInformationMessage(`Model switched to: ${model.charAt(0).toUpperCase() + model.slice(1)}`);
		} else {
			console.error('Invalid model selected:', model);
			vscode.window.showErrorMessage(`Invalid model: ${model}. Please select Opus, Sonnet, or Default.`);
		}
	}

	private _openModelTerminal(): void {
		const config = vscode.workspace.getConfiguration('codePilotAI');
		const wslEnabled = config.get<boolean>('wsl.enabled', false);
		const wslDistro = config.get<string>('wsl.distro', 'Ubuntu');
		const nodePath = config.get<string>('wsl.nodePath', '/usr/bin/node');
		const claudePath = config.get<string>('wsl.claudePath', '/usr/local/bin/claude');

		// Build command arguments
		const args = ['/model'];
		
		// Add session resume if we have a current session
		if (this._currentSessionId) {
			args.push('--resume', this._currentSessionId);
		}

		// Create terminal with the /model command
		const terminal = vscode.window.createTerminal('Model Selection');
		if (wslEnabled) {
			terminal.sendText(`wsl -d ${wslDistro} ${nodePath} --no-warnings --enable-source-maps ${claudePath} ${args.join(' ')}`);
		} else {
			terminal.sendText(`claude ${args.join(' ')}`);
		}
		terminal.show();

		// Show info message
		vscode.window.showInformationMessage(
			'Check the terminal to update your default model configuration. Come back to this chat here after making changes.',
			'OK'
		);

		// Send message to UI about terminal
		this._postMessage({
			type: 'terminalOpened',
			data: 'Check the terminal to update your default model configuration. Come back to this chat here after making changes.'
		});
	}

	private _executeSlashCommand(command: string): void {
		const config = vscode.workspace.getConfiguration('codePilotAI');
		const wslEnabled = config.get<boolean>('wsl.enabled', false);
		const wslDistro = config.get<string>('wsl.distro', 'Ubuntu');
		const nodePath = config.get<string>('wsl.nodePath', '/usr/bin/node');
		const claudePath = config.get<string>('wsl.claudePath', '/usr/local/bin/claude');

		// Build command arguments
		const args = [`/${command}`];
		
		// Add session resume if we have a current session
		if (this._currentSessionId) {
			args.push('--resume', this._currentSessionId);
		}

		// Create terminal with the command
		const terminal = vscode.window.createTerminal(`/${command}`);
		if (wslEnabled) {
			terminal.sendText(`wsl -d ${wslDistro} ${nodePath} --no-warnings --enable-source-maps ${claudePath} ${args.join(' ')}`);
		} else {
			terminal.sendText(`claude ${args.join(' ')}`);
		}
		terminal.show();

		// Show info message
		vscode.window.showInformationMessage(
			`Executing /${command} command in terminal. Check the terminal output and return when ready.`,
			'OK'
		);

		// Send message to UI about terminal
		this._postMessage({
			type: 'terminalOpened',
			data: `Executing /${command} command in terminal. Check the terminal output and return when ready.`,
		});
	}

	private async _openNativeChatHelp(): Promise<void> {
		try {
			// Open VS Code's native chat panel with the @code-pilot-ai /help command
			// This uses VS Code's built-in MarkdownString rendering for proper markdown display
			await vscode.commands.executeCommand('workbench.action.chat.open', {
				query: '@code-pilot-ai /help'
			});
		} catch (error) {
			console.error('Error opening native chat help:', error);
			// Fallback to showing help in webview if native chat fails
			this._showHelp();
		}
	}

	private async _openMarkdownPreview(): Promise<void> {
		try {
			// Open the README.md file in VS Code's native Markdown preview
			const extensionPath = this._context.extensionPath;
			const readmePath = path.join(extensionPath, 'README.md');
			const readmeUri = vscode.Uri.file(readmePath);

			// Check if file exists
			try {
				await vscode.workspace.fs.stat(readmeUri);
			} catch {
				vscode.window.showErrorMessage('README.md not found.');
				return;
			}

			// Open the markdown preview using VS Code's built-in command
			// This renders markdown exactly like VS Code's native preview
			await vscode.commands.executeCommand('markdown.showPreview', readmeUri);
		} catch (error) {
			console.error('Error opening markdown preview:', error);
			vscode.window.showErrorMessage('Failed to open help documentation.');
		}
	}

	private async _showHelp(): Promise<void> {
		try {
			// Try to find README in the extension directory first
			const extensionPath = this._context.extensionPath;
			const readmePath = path.join(extensionPath, 'README.md');

			let helpContent = '';

			try {
				const readmeUri = vscode.Uri.file(readmePath);
				const readmeContent = await vscode.workspace.fs.readFile(readmeUri);
				helpContent = new TextDecoder().decode(readmeContent);
			} catch {
				// If no README found, show default help
				helpContent = this._getDefaultHelpContent();
			}

			this._postMessage({
				type: 'helpContent',
				data: helpContent
			});
		} catch (error) {
			console.error('Error showing help:', error);
			this._postMessage({
				type: 'helpContent',
				data: this._getDefaultHelpContent()
			});
		}
	}

	private _getDefaultHelpContent(): string {
		return `# Code Pilot AI - Help

## Quick Actions

- **/help** - Display this help information
- **/clear** - Clear the current chat and start fresh
- **/compact** - Remove older messages to save space

## Features

### Chat with AI
Type your message in the input box and press Enter or click Send to chat with the AI assistant.

### File Context
Use **@** to mention files from your workspace. The AI will have context about these files.

### Image Support
Click the image button to attach images to your messages.

### Model Selection
Use the dropdown in the chat area to switch between different AI models.

### Modes
- **Plan First** - AI will plan before executing
- **Thinking Mode** - AI shows its reasoning process
- **Agentic** - AI can take autonomous actions

### Settings
Click the gear icon to configure:
- API keys for different providers
- WSL settings (Windows)
- Permissions for auto-approval

### Conversation History
Click the history icon to view and load previous conversations.

## Tips

- Use Shift+Enter for multi-line messages
- Press Escape to close popups
- Hover over conversations to delete them
`;
	}

	private async _deleteConversation(filename: string): Promise<void> {
		try {
			const storagePath = this._context.storageUri?.fsPath;
			if (!storagePath) {
				return;
			}

			const conversationsDir = path.join(storagePath, 'conversations');
			const filePath = path.join(conversationsDir, filename);
			const fileUri = vscode.Uri.file(filePath);

			await vscode.workspace.fs.delete(fileUri);

			// Send updated conversation list to UI
			this._sendConversationList();

			// Show confirmation
			vscode.window.showInformationMessage('Conversation deleted.');
		} catch (error) {
			console.error('Error deleting conversation:', error);
			vscode.window.showErrorMessage('Failed to delete conversation.');
		}
	}

	private _sendPlatformInfo() {
		const platform = process.platform;
		const dismissed = this._context.globalState.get<boolean>('wslAlertDismissed', false);
		
		// Get WSL configuration
		const config = vscode.workspace.getConfiguration('codePilotAI');
		const wslEnabled = config.get<boolean>('wsl.enabled', false);

		this._postMessage({
			type: 'platformInfo',
			data: {
				platform: platform,
				isWindows: platform === 'win32',
				wslAlertDismissed: dismissed,
				wslEnabled: wslEnabled
			}
		});
	}

	private _dismissWSLAlert() {
		this._context.globalState.update('wslAlertDismissed', true);
	}

	private async _openFileInEditor(filePath: string) {
		try {
			const uri = vscode.Uri.file(filePath);
			const document = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to open file: ${filePath}`);
			console.error('Error opening file:', error);
		}
	}

	private async _createImageFile(imageData: string, imageType: string) {
		try {
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {return;}

			// Extract base64 data from data URL
			const base64Data = imageData.split(',')[1];
			const buffer = Buffer.from(base64Data, 'base64');
			
			// Get file extension from image type
			const extension = imageType.split('/')[1] || 'png';
			
			// Create unique filename with timestamp
			const timestamp = Date.now();
			const imageFileName = `image_${timestamp}.${extension}`;
			
			// Create images folder in workspace .codepilot directory
			const imagesDir = vscode.Uri.joinPath(workspaceFolder.uri, '.codepilot', 'images');
			await vscode.workspace.fs.createDirectory(imagesDir);
			
			// Create .gitignore to ignore all images
			const gitignorePath = vscode.Uri.joinPath(imagesDir, '.gitignore');
			try {
				await vscode.workspace.fs.stat(gitignorePath);
			} catch {
				// .gitignore doesn't exist, create it
				const gitignoreContent = new TextEncoder().encode('*\n');
				await vscode.workspace.fs.writeFile(gitignorePath, gitignoreContent);
			}
			
			// Create the image file
			const imagePath = vscode.Uri.joinPath(imagesDir, imageFileName);
			await vscode.workspace.fs.writeFile(imagePath, buffer);
			
			// Send the file path back to webview
			this._postMessage({
				type: 'imagePath',
				data: {
					filePath: imagePath.fsPath
				}
			});
			
		} catch (error) {
			console.error('Error creating image file:', error);
			vscode.window.showErrorMessage('Failed to create image file');
		}
	}

	private async _generateMemoryBank(): Promise<void> {
		try {
			// Get workspace folder
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {
				vscode.window.showErrorMessage('No workspace folder found');
				return;
			}

			// Create .codepilot directory if it doesn't exist
			const codepilotDir = vscode.Uri.joinPath(workspaceFolder.uri, '.codepilot');
			try {
				await vscode.workspace.fs.createDirectory(codepilotDir);
			} catch {
				// Directory might already exist
			}

			// Create memory bank file
			const memoryBankPath = vscode.Uri.joinPath(codepilotDir, 'memory-bank.md');
			const memoryBankContent = `# Memory Bank

## Project Overview
<!-- Add a brief description of your project here -->

## Key Patterns
<!-- Document important patterns and conventions used in this project -->

## Architecture
<!-- Describe the high-level architecture of your project -->

## Common Tasks
<!-- Document common development tasks and how to perform them -->

## Notes
<!-- Add any other important notes here -->

---
Generated by Code Pilot AI
`;

			await vscode.workspace.fs.writeFile(memoryBankPath, new TextEncoder().encode(memoryBankContent));

			// Open the file for editing
			const doc = await vscode.workspace.openTextDocument(memoryBankPath);
			await vscode.window.showTextDocument(doc);

			this._postMessage({
				type: 'streamText',
				data: '✅ Memory bank created at .codepilot/memory-bank.md. Edit this file to add project-specific context that will help Code Pilot AI understand your project better.'
			});
			this._postMessage({ type: 'streamEnd' });
		} catch (error: any) {
			console.error('Error generating memory bank:', error);
			vscode.window.showErrorMessage(`Failed to generate memory bank: ${error.message}`);
		}
	}

	private async _createNewRule(): Promise<void> {
		try {
			// Get workspace folder
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {
				vscode.window.showErrorMessage('No workspace folder found');
				return;
			}

			// Create .codepilot directory if it doesn't exist
			const codepilotDir = vscode.Uri.joinPath(workspaceFolder.uri, '.codepilot');
			try {
				await vscode.workspace.fs.createDirectory(codepilotDir);
			} catch {
				// Directory might already exist
			}

			// Create rules directory
			const rulesDir = vscode.Uri.joinPath(codepilotDir, 'rules');
			try {
				await vscode.workspace.fs.createDirectory(rulesDir);
			} catch {
				// Directory might already exist
			}

			// Generate a unique rule filename
			const timestamp = Date.now();
			const rulePath = vscode.Uri.joinPath(rulesDir, `rule-${timestamp}.md`);
			const ruleContent = `# Rule Name
<!-- Give your rule a descriptive name -->

## Description
<!-- Describe what this rule does and when it should apply -->

## Pattern
<!-- Define the pattern or conditions when this rule should be triggered -->

## Action
<!-- Describe the action that should be taken when this rule matches -->

## Examples
<!-- Provide examples of when this rule should apply -->

---
Created by Code Pilot AI
`;

			await vscode.workspace.fs.writeFile(rulePath, new TextEncoder().encode(ruleContent));

			// Open the file for editing
			const doc = await vscode.workspace.openTextDocument(rulePath);
			await vscode.window.showTextDocument(doc);

			this._postMessage({
				type: 'streamText',
				data: `✅ New rule created at .codepilot/rules/rule-${timestamp}.md. Edit this file to define your custom rule.`
			});
			this._postMessage({ type: 'streamEnd' });
		} catch (error: any) {
			console.error('Error creating new rule:', error);
			vscode.window.showErrorMessage(`Failed to create new rule: ${error.message}`);
		}
	}

	public dispose() {
		if (this._panel) {
			this._panel.dispose();
			this._panel = undefined;
		}

		// Dispose message handler if it exists
		if (this._messageHandlerDisposable) {
			this._messageHandlerDisposable.dispose();
			this._messageHandlerDisposable = undefined;
		}

		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}
}