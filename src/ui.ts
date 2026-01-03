import styles from './ui-styles'
const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Code Pilot AI</title>
	<script src="https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js"></script>
	${styles}
</head>
<body>
	<div class="header">
		<div style="display: flex; align-items: center;">
			<h2>Code Pilot AI</h2>
			<!-- <div id="sessionInfo" class="session-badge" style="display: none;">
				<span class="session-icon">💬</span>
				<span id="sessionId">-</span>
				<span class="session-label">session</span>
			</div> -->
		</div>
		<div style="display: flex; gap: 8px; align-items: center;">
			<div id="sessionStatus" class="session-status" style="display: none;">No session</div>
			<button class="btn outlined" id="settingsBtn" onclick="toggleSettings()" title="Settings">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
					<circle cx="12" cy="12" r="3"></circle>
				</svg>
			</button>
			<div class="conversations-dropdown" style="position: relative;">
				<button class="btn outlined" id="historyBtn" onclick="toggleConversationHistory()" title="View chat history">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
						<path d="M3 3v5h5"></path>
						<polyline points="12 6 12 12 16 14"></polyline>
					</svg>
				</button>
			</div>
			<button class="btn primary" id="newSessionBtn" onclick="newSession()">New Chat</button>
		</div>
	</div>
	
	<div id="conversationHistory" class="conversation-history" style="display: none;">
		<div class="conversation-header">
			<h3>Conversation History</h3>
			<button class="btn" onclick="toggleConversationHistory()">✕ Close</button>
		</div>
		<div id="conversationList" class="conversation-list">
			<!-- Conversations will be loaded here -->
		</div>
	</div>

	<div class="chat-container" id="chatContainer">
		<div class="messages" id="messages"></div>

		<!-- Welcome Screen -->
		<div id="welcomeScreen" class="welcome-screen">
			<div class="welcome-content">
				<div class="welcome-logo">
					<img src="{{ICON_URI}}" alt="Code Pilot AI" class="welcome-icon-img" />
					<h1>Code Pilot AI</h1>
				</div>
				<p class="welcome-text" id="welcomeText">Ready to assist with your coding tasks...</p>
			</div>
		</div>

		<!-- WSL Alert for Windows users -->
		<div id="wslAlert" class="wsl-alert" style="display: none;">
			<div class="wsl-alert-content">
				<div class="wsl-alert-icon">💻</div>
				<div class="wsl-alert-text">
					<strong>Looks like you are using Windows!</strong><br/>
					If you are using WSL, you should enable WSL integration in the settings.
				</div>
				<div class="wsl-alert-actions">
					<button class="btn" onclick="openWSLSettings()">Enable WSL</button>
					<button class="btn outlined" onclick="dismissWSLAlert()">Dismiss</button>
				</div>
			</div>
		</div>
		
		<div class="input-container" id="inputContainer">
			<!-- Slash Commands Popup (positioned above input) -->
			<div id="slashCommandsPopup" class="slash-commands-popup" style="display: none;">
				<div class="slash-popup-header">Quick Actions</div>
				<div class="slash-popup-content">
					<div class="slash-command-item" onclick="executeSlashCommand('help')">
						<div class="slash-command-icon">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"/>
								<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
								<line x1="12" y1="17" x2="12.01" y2="17"/>
							</svg>
						</div>
						<div class="slash-command-content">
							<div class="slash-command-title">/help</div>
							<div class="slash-command-description">Learn more about Code Pilot AI</div>
						</div>
					</div>
					<div class="slash-command-item" onclick="executeSlashCommand('clear')">
						<div class="slash-command-icon">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="3 6 5 6 21 6"/>
								<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
							</svg>
						</div>
						<div class="slash-command-content">
							<div class="slash-command-title">/clear</div>
							<div class="slash-command-description">Clear this session</div>
						</div>
					</div>
					<div class="slash-command-item" onclick="executeSlashCommand('compact')">
						<div class="slash-command-icon">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
								<line x1="9" y1="3" x2="9" y2="21"/>
							</svg>
						</div>
						<div class="slash-command-content">
							<div class="slash-command-title">/compact</div>
							<div class="slash-command-description">Compact this conversation</div>
						</div>
					</div>
				</div>
			</div>

			<div class="input-modes">
				<div class="mode-toggle">
					<span onclick="togglePlanMode()" style="font-size: 13px;">Plan First</span>
					<div class="mode-switch" id="planModeSwitch" onclick="togglePlanMode()"></div>
				</div>
				<div class="mode-toggle">
					<span id="thinkingModeLabel" onclick="toggleThinkingMode()" style="font-size: 13px;">Thinking Mode</span>
					<div class="mode-switch" id="thinkingModeSwitch" onclick="toggleThinkingMode()"></div>
				</div>
			</div>
			<div class="textarea-container">
				<div class="textarea-wrapper">
					<div id="imagePreviewContainer" class="image-preview-container" style="display: none;"></div>
					<textarea class="input-field" id="messageInput" placeholder="Ask a question. Use @ to add context, / for quick actions" rows="1" style="font-size: 14px;"></textarea>
					<div class="input-controls">
						<div class="left-controls">
							<select id="modelSelector" class="model-selector" onchange="onModelSelectorChange()" title="Select model" style="font-size: 12px;">
								<option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
								<option value="claude-opus-4-20250514">Claude Opus 4</option>
								<option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
								<option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
							</select>
							<div class="agentic-toggle" style="display: flex; align-items: center; gap: 4px; margin-left: 8px;">
								<span style="font-size: 12px; color: var(--vscode-descriptionForeground);">Agentic</span>
								<div class="mode-switch" id="agenticModeSwitch" onclick="toggleAgenticMode()"></div>
							</div>
						</div>
						<div class="right-controls">
							<button class="slash-btn" onclick="showSlashCommandsPopup(messageInput.value)" title="Quick actions" style="font-size: 14px;">/</button>
							<button class="at-btn" onclick="showFilePicker()" title="Reference files" style="font-size: 14px;">@</button>
							<button class="image-btn" id="imageBtn" onclick="selectImage()" title="Attach images">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								width="16"
								height="16"
								>
								<g fill="currentColor">
									<path d="M6.002 5.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0"></path>
									<path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71l-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"></path>
								</g>
							</svg>
							</button>
							<button class="send-btn" id="sendBtn" onclick="sendMessage()" style="font-size: 13px;">
							<div>
							<span>Send </span>
							   <svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="12"
								height="12"
								>
								<path
									fill="currentColor"
									d="M20 4v9a4 4 0 0 1-4 4H6.914l2.5 2.5L8 20.914L3.086 16L8 11.086L9.414 12.5l-2.5 2.5H16a2 2 0 0 0 2-2V4z"
								></path>
								</svg>
								</div>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<div class="status ready" id="status">
		<div class="status-indicator"></div>
		<div class="status-text" id="statusText">Initializing...</div>
		<button class="btn stop" id="stopBtn" onclick="stopRequest()" style="display: none;">
			<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
				<path d="M6 6h12v12H6z"/>
			</svg>
			Stop
		</button>
	</div>

			<div id="yoloWarning" class="yolo-warning-new" style="display: none;">
			<div class="yolo-warning-icon">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
					<line x1="12" y1="9" x2="12" y2="13"/>
					<line x1="12" y1="17" x2="12.01" y2="17"/>
				</svg>
			</div>
			<div class="yolo-warning-content">
				<div class="yolo-warning-title">Auto-Approve Mode Active</div>
				<div class="yolo-warning-description">All tool and command requests will be automatically approved without confirmation</div>
			</div>
			<button class="yolo-warning-dismiss" onclick="dismissYoloWarning()" title="Dismiss">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"/>
					<line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>
		</div>

	<!-- File picker modal -->
	<div id="filePickerModal" class="file-picker-modal" style="display: none;">
		<div class="file-picker-content">
			<div class="file-picker-header">
				<span>Select File</span>
				<input type="text" id="fileSearchInput" placeholder="Search files..." class="file-search-input">
			</div>
			<div id="fileList" class="file-list">
				<!-- Files will be loaded here -->
			</div>
		</div>
	</div>

	<!-- Settings modal -->
	<div id="settingsModal" class="tools-modal" style="display: none;">
		<div class="tools-modal-content" style="width: 500px;">
			<div class="tools-modal-header">
				<span>Code Pilot AI Settings</span>
				<button class="tools-close-btn" onclick="hideSettingsModal()">✕</button>
			</div>

			<!-- Settings Tabs -->
			<div class="settings-tabs">
				<button class="settings-tab active" id="tabModel" onclick="switchSettingsTab('model')">Model Configuration</button>
				<button class="settings-tab" id="tabMCP" onclick="switchSettingsTab('mcp')">MCP Servers</button>
				<button class="settings-tab" id="tabWSL" onclick="switchSettingsTab('wsl')">WSL Configuration</button>
				<button class="settings-tab" id="tabPermissions" onclick="switchSettingsTab('permissions')">Permissions</button>
			</div>

			<div class="tools-list" style="padding-top: 8px;">
				<!-- Model Configuration Tab -->
				<div id="modelTabContent" class="settings-tab-content">
					<div style="margin-bottom: 16px;">
						<label style="display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600;">AI Provider</label>
						<select id="settings-provider" class="settings-select" onchange="onSettingsProviderChange()">
							<option value="anthropic">Anthropic (Claude)</option>
							<option value="azure">Azure OpenAI</option>
							<option value="deepseek">DeepSeek</option>
							<option value="grok">Grok (xAI)</option>
						</select>
					</div>

					<!-- Anthropic Configuration -->
					<div id="anthropicConfigSection" class="provider-config-section">
						<div style="margin-bottom: 12px;">
							<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">API Key</label>
							<input type="password" id="anthropic-api-key" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="sk-ant-api03-...">
						</div>
						<div style="display: flex; gap: 8px; align-items: center;">
							<button class="btn" onclick="testAnthropicConnection()" id="testAnthropicBtn" style="font-size: 11px; padding: 6px 12px;">Test Connection</button>
							<span id="anthropicTestResult" class="test-result"></span>
						</div>
					</div>

					<!-- Azure OpenAI Configuration -->
					<div id="azureConfigSection" class="provider-config-section" style="display: none;">
						<div style="margin-bottom: 12px;">
							<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">Endpoint URL</label>
							<input type="text" id="azure-endpoint" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="https://your-resource.openai.azure.com">
						</div>
						<div style="margin-bottom: 12px;">
							<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">API Key</label>
							<input type="password" id="azure-api-key" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="Your Azure API key">
						</div>
						<div style="margin-bottom: 12px;">
							<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">Deployment Name</label>
							<input type="text" id="azure-deployment" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="gpt-4">
						</div>
						<div style="margin-bottom: 12px;">
							<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">API Version</label>
							<input type="text" id="azure-version" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="2024-02-15-preview" value="2024-02-15-preview">
						</div>
						<div style="display: flex; gap: 8px; align-items: center;">
							<button class="btn" onclick="testAzureConnection()" id="testAzureBtn" style="font-size: 11px; padding: 6px 12px;">Test Connection</button>
							<span id="azureTestResult" class="test-result"></span>
						</div>
					</div>

					<!-- DeepSeek Configuration -->
					<div id="deepseekConfigSection" class="provider-config-section" style="display: none;">
						<div style="margin-bottom: 12px;">
							<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">API Key</label>
							<input type="password" id="deepseek-api-key" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="sk-...">
						</div>
						<div style="display: flex; gap: 8px; align-items: center;">
							<button class="btn" onclick="testDeepSeekConnection()" id="testDeepSeekBtn" style="font-size: 11px; padding: 6px 12px;">Test Connection</button>
							<span id="deepseekTestResult" class="test-result"></span>
						</div>
					</div>

					<!-- Grok Configuration -->
					<div id="grokConfigSection" class="provider-config-section" style="display: none;">
						<div style="margin-bottom: 12px;">
							<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">API Key</label>
							<input type="password" id="grok-api-key" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="xai-...">
						</div>
						<div style="display: flex; gap: 8px; align-items: center;">
							<button class="btn" onclick="testGrokConnection()" id="testGrokBtn" style="font-size: 11px; padding: 6px 12px;">Test Connection</button>
							<span id="grokTestResult" class="test-result"></span>
						</div>
					</div>
				</div>

				<!-- MCP Servers Tab -->
				<div id="mcpTabContent" class="settings-tab-content" style="display: none;">
					<div style="margin-bottom: 16px;">
						<p style="font-size: 11px; color: var(--vscode-descriptionForeground); margin: 0 0 12px 0;">
							Manage Model Context Protocol (MCP) servers to extend Code Pilot AI's capabilities with specialized tools and integrations.
						</p>
					</div>

					<!-- Server List -->
					<div id="mcpServerList" class="mcp-server-list" style="margin-bottom: 16px;">
						<div style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground); font-size: 11px;">
							Loading MCP servers...
						</div>
					</div>

					<!-- Add Server Section -->
					<div class="mcp-add-server-section">
						<button id="showAddMCPServerBtn" class="btn outlined" onclick="showAddMCPServerForm()" style="font-size: 11px; width: 100%;">
							+ Add New MCP Server
						</button>

						<div id="addMCPServerForm" class="mcp-add-form" style="display: none; margin-top: 16px; border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 16px;">
							<h4 style="margin: 0 0 12px 0; font-size: 12px;">Add MCP Server</h4>

							<!-- Server Type Selection -->
							<div style="margin-bottom: 12px;">
								<label style="display: block; margin-bottom: 6px; font-size: 11px; font-weight: 600;">Server Type</label>
								<div style="display: flex; gap: 8px;">
									<button class="mcp-type-btn active" id="mcpTypeRemote" onclick="selectMCPType('remote')" style="flex: 1; padding: 8px; font-size: 11px; border: 1px solid var(--vscode-button-background); border-radius: 4px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); cursor: pointer;">
										Remote (HTTP)
									</button>
									<button class="mcp-type-btn" id="mcpTypeLocal" onclick="selectMCPType('local')" style="flex: 1; padding: 8px; font-size: 11px; border: 1px solid var(--vscode-widget-border); border-radius: 4px; background: transparent; cursor: pointer;">
										Local (stdio)
									</button>
								</div>
							</div>

							<!-- Server Name -->
							<div style="margin-bottom: 12px;">
								<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">Server Name *</label>
								<input type="text" id="mcpServerName" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="e.g., my-mcp-server">
							</div>

							<!-- Remote Server Fields -->
							<div id="mcpRemoteFields">
								<div style="margin-bottom: 12px;">
									<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">Server URL *</label>
									<input type="text" id="mcpServerURL" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="https://my-server.com/api/mcp or my-server.com/api/mcp">
									<div style="font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 4px;">
										Protocol (https://) will be added automatically if not specified
									</div>
								</div>
							</div>

							<!-- Local Server Fields -->
							<div id="mcpLocalFields" style="display: none;">
								<div style="margin-bottom: 12px;">
									<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">Command *</label>
									<input type="text" id="mcpServerCommand" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="e.g., node, python, dotnet">
								</div>
								<div style="margin-bottom: 12px;">
									<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">Arguments (comma-separated)</label>
									<input type="text" id="mcpServerArgs" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="e.g., /path/to/server.js, --port, 3000">
								</div>
								<div style="margin-bottom: 12px;">
									<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">Environment Variables (KEY=VALUE, comma-separated)</label>
									<textarea id="mcpServerEnv" class="file-search-input" style="width: 100%; font-size: 11px; min-height: 60px; font-family: monospace;" placeholder="API_KEY=your-key, DEBUG=true"></textarea>
								</div>
							</div>

							<!-- Action Buttons -->
							<div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
								<button class="btn outlined" onclick="cancelAddMCPServer()" style="font-size: 11px; padding: 6px 16px;">Cancel</button>
								<button class="btn primary" onclick="saveMCPServer()" style="font-size: 11px; padding: 6px 16px;">Add Server</button>
							</div>
						</div>
					</div>
				</div>

				<!-- WSL Configuration Tab -->
				<div id="wslTabContent" class="settings-tab-content" style="display: none;">
					<div>
						<p style="font-size: 11px; color: var(--vscode-descriptionForeground); margin: 0 0 12px 0;">
							Enable WSL integration if you're running the AI backend in Windows Subsystem for Linux.
						</p>
					</div>
					<div class="settings-group">
						<div class="tool-item" style="margin-bottom: 12px;">
							<input type="checkbox" id="wsl-enabled" onchange="toggleWslOptions()">
							<label for="wsl-enabled" style="font-size: 12px; font-weight: 500;">Enable WSL Integration</label>
						</div>

						<div id="wslOptions" style="display: none;">
							<div style="margin-bottom: 12px;">
								<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">WSL Distribution</label>
								<input type="text" id="wsl-distro" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="Ubuntu">
							</div>

							<div style="margin-bottom: 12px;">
								<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">Node.js Path</label>
								<input type="text" id="wsl-node-path" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="/usr/bin/node">
							</div>

							<div style="margin-bottom: 12px;">
								<label style="display: block; margin-bottom: 4px; font-size: 11px; color: var(--vscode-descriptionForeground);">Backend Path</label>
								<input type="text" id="wsl-claude-path" class="file-search-input" style="width: 100%; font-size: 11px;" placeholder="/usr/local/bin/claude">
							</div>
						</div>
					</div>
				</div>

				<!-- Permissions Tab -->
				<div id="permissionsTabContent" class="settings-tab-content" style="display: none;">
					<!-- Header Section -->
					<div class="permissions-header">
						<div class="permissions-header-content">
							<h3 style="margin: 0; font-size: 13px; font-weight: 600;">Permission Management</h3>
							<p style="font-size: 11px; color: var(--vscode-descriptionForeground); margin: 4px 0 0 0;">
								Control which tools and commands can run automatically without asking for approval
							</p>
						</div>
					</div>

					<!-- Auto-Approve Mode Card -->
					<div class="yolo-mode-card">
						<div class="yolo-mode-icon">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
								<path d="M9 12l2 2 4-4"/>
							</svg>
						</div>
						<div class="yolo-mode-content">
							<div class="yolo-mode-title">Auto-Approve Mode</div>
							<div class="yolo-mode-description">Skip all permission requests and automatically approve all tool usage</div>
						</div>
						<div class="yolo-mode-toggle">
							<input type="checkbox" id="yolo-mode" class="toggle-checkbox" onchange="updateYoloWarning();">
							<label for="yolo-mode" class="toggle-label"></label>
						</div>
					</div>

					<!-- Permissions List Section -->
					<div class="permissions-section">
						<div class="permissions-section-header">
							<span style="font-size: 12px; font-weight: 600;">Always-Allow Permissions</span>
							<button id="showAddPermissionBtn" class="permissions-add-btn-new" onclick="showAddPermissionForm()">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="12" y1="5" x2="12" y2="19"/>
									<line x1="5" y1="12" x2="19" y2="12"/>
								</svg>
								Add Permission
							</button>
						</div>

						<!-- Add Permission Form -->
						<div id="addPermissionForm" class="permissions-add-form-new" style="display: none;">
							<div class="add-form-content">
								<div class="form-field">
									<label style="font-size: 11px; font-weight: 600; margin-bottom: 6px; display: block;">Tool</label>
									<select id="addPermissionTool" class="permissions-tool-select-new" onchange="toggleCommandInput()">
										<option value="">Select a tool...</option>
										<option value="Bash">Bash - Execute shell commands</option>
										<option value="Read">Read - Read file contents</option>
										<option value="Edit">Edit - Modify files</option>
										<option value="Write">Write - Create new files</option>
										<option value="MultiEdit">MultiEdit - Batch file edits</option>
										<option value="Glob">Glob - Find files by pattern</option>
										<option value="Grep">Grep - Search file contents</option>
										<option value="LS">LS - List directory contents</option>
										<option value="WebSearch">WebSearch - Search the web</option>
										<option value="WebFetch">WebFetch - Fetch web content</option>
									</select>
								</div>
								<div class="form-field" id="commandFieldContainer" style="display: none;">
									<label style="font-size: 11px; font-weight: 600; margin-bottom: 6px; display: block;">Command Pattern</label>
									<input type="text" id="addPermissionCommand" class="permissions-command-input-new" placeholder="e.g., npm install *, git add *" />
								</div>
								<div id="permissionsFormHint" class="permissions-form-hint-new">
									Select a tool to grant automatic permission
								</div>
								<div class="add-form-actions">
									<button class="btn-cancel" onclick="hideAddPermissionForm()">Cancel</button>
									<button id="addPermissionBtn" class="btn-confirm" onclick="addPermission()">Add Permission</button>
								</div>
							</div>
						</div>

						<!-- Permissions List -->
						<div id="permissionsList" class="permissions-list-new">
							<div class="permissions-loading" style="text-align: center; padding: 40px 20px; color: var(--vscode-descriptionForeground);">
								<div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
								<div style="font-size: 11px;">Loading permissions...</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Save Button -->
			<div class="settings-footer">
				<span id="settingsSaveStatus" class="settings-save-status"></span>
				<button class="btn primary" onclick="saveAllSettings()" style="font-size: 11px; padding: 8px 20px;">Save Settings</button>
			</div>
		</div>
	</div>


	<!-- Thinking intensity modal -->
	<div id="thinkingIntensityModal" class="tools-modal" style="display: none;">
		<div class="tools-modal-content" style="width: 450px;">
			<div class="tools-modal-header">
				<span>Reasoning Depth</span>
				<button class="tools-close-btn" onclick="hideThinkingIntensityModal()">✕</button>
			</div>
			<div class="thinking-modal-description">
				Configure the depth of reasoning. Higher levels provide more detailed analysis but consume more tokens.
			</div>
			<div class="tools-list">
				<div class="thinking-slider-container">
					<input type="range" min="0" max="3" value="0" step="1" class="thinking-slider" id="thinkingIntensitySlider" oninput="updateThinkingIntensityDisplay(this.value)">
					<div class="slider-labels">
						<div class="slider-label active" id="thinking-label-0" onclick="setThinkingIntensityValue(0)">Standard</div>
						<div class="slider-label" id="thinking-label-1" onclick="setThinkingIntensityValue(1)">Detailed</div>
						<div class="slider-label" id="thinking-label-2" onclick="setThinkingIntensityValue(2)">Comprehensive</div>
						<div class="slider-label" id="thinking-label-3" onclick="setThinkingIntensityValue(3)">Maximum</div>
					</div>
				</div>
				<div class="thinking-modal-actions">
					<button class="confirm-btn" onclick="confirmThinkingIntensity()">Confirm</button>
				</div>
			</div>
		</div>
	</div>


	<script>
		const vscode = acquireVsCodeApi();
		const messagesDiv = document.getElementById('messages');
		const messageInput = document.getElementById('messageInput');
		const sendBtn = document.getElementById('sendBtn');
		const statusDiv = document.getElementById('status');
		const statusTextDiv = document.getElementById('statusText');
		const filePickerModal = document.getElementById('filePickerModal');
		const fileSearchInput = document.getElementById('fileSearchInput');
		const fileList = document.getElementById('fileList');
		const imageBtn = document.getElementById('imageBtn');

		let isProcessRunning = false;
		let filteredFiles = [];
		let selectedFileIndex = -1;
		let planModeEnabled = false;
		let thinkingModeEnabled = false;
		let agenticModeEnabled = true; // Default to ON
		let currentProvider = 'anthropic';
		let currentModel = 'claude-sonnet-4-20250514';

		// Image attachment management
		let attachedImages = [];
		const imagePreviewContainer = document.getElementById('imagePreviewContainer');

		// Welcome screen animation
		const welcomeMessages = [
			"Ready to assist with your coding tasks...",
			"Ask me anything about your code",
			"I can help with debugging, refactoring, and more",
			"Use @ to add files, / for quick actions"
		];
		let currentWelcomeIndex = 0;
		const welcomeTextEl = document.getElementById('welcomeText');
		const welcomeScreen = document.getElementById('welcomeScreen');

		function rotateWelcomeText() {
			if (welcomeTextEl && welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
				currentWelcomeIndex = (currentWelcomeIndex + 1) % welcomeMessages.length;
				welcomeTextEl.textContent = welcomeMessages[currentWelcomeIndex];
			}
		}

		// Rotate welcome message every 8 seconds
		setInterval(rotateWelcomeText, 8000);

		// Stub function for state saving (disabled)
		function saveWebviewState() {
			// State persistence disabled for now
		}

		// Agentic mode toggle function
		function toggleAgenticMode() {
			agenticModeEnabled = !agenticModeEnabled;
			const switchEl = document.getElementById('agenticModeSwitch');
			if (switchEl) {
				switchEl.classList.toggle('active', agenticModeEnabled);
			}

			// Save preference to VS Code
			vscode.postMessage({
				type: 'updateSettings',
				settings: {
					'agentic.enabled': agenticModeEnabled
				}
			});
		}

		// Slash commands data for filtering
		const slashCommands = [
			{ name: 'help', title: '/help', description: 'Learn more about Code Pilot AI', icon: 'help' },
			{ name: 'clear', title: '/clear', description: 'Clear this session', icon: 'trash' },
			{ name: 'compact', title: '/compact', description: 'Compact this conversation', icon: 'compact' }
		];

		// Slash commands popup functions
		function showSlashCommandsPopup(filter = '') {
			const popup = document.getElementById('slashCommandsPopup');
			if (!popup) return;

			// Filter commands based on input
			const searchTerm = filter.toLowerCase().replace('/', '');
			const filteredCommands = slashCommands.filter(cmd =>
				cmd.name.toLowerCase().includes(searchTerm) ||
				cmd.title.toLowerCase().includes('/' + searchTerm)
			);

			// If no matches, hide popup
			if (filteredCommands.length === 0) {
				popup.style.display = 'none';
				return;
			}

			// Build popup content dynamically
			const contentDiv = popup.querySelector('.slash-popup-content');
			if (contentDiv) {
				contentDiv.innerHTML = filteredCommands.map(cmd => {
					let iconSvg = '';
					if (cmd.icon === 'help') {
						iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
					} else if (cmd.icon === 'trash') {
						iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
					} else if (cmd.icon === 'compact') {
						iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>';
					}
					return \`
						<div class="slash-command-item" onclick="executeSlashCommand('\${cmd.name}')">
							<div class="slash-command-icon">\${iconSvg}</div>
							<div class="slash-command-content">
								<div class="slash-command-title">\${cmd.title}</div>
								<div class="slash-command-description">\${cmd.description}</div>
							</div>
						</div>
					\`;
				}).join('');
			}

			// Update header to show filter count
			const headerDiv = popup.querySelector('.slash-popup-header');
			if (headerDiv) {
				headerDiv.textContent = searchTerm ? \`c: (\${filteredCommands.length})\` : 'Quick Actions';
			}

			popup.style.display = 'block';
			// Focus the message input so user can continue typing
			messageInput.focus();
		}

		function hideSlashCommandsPopup() {
			const popup = document.getElementById('slashCommandsPopup');
			if (popup) {
				popup.style.display = 'none';
			}
		}

		// Close popup when clicking outside (with delay to prevent immediate close)
		document.addEventListener('click', function(event) {
			const popup = document.getElementById('slashCommandsPopup');
			const slashBtn = document.querySelector('.slash-btn');
			const messageInputEl = document.getElementById('messageInput');
			if (popup && popup.style.display === 'block') {
				// Don't close if clicking inside popup, slash button, or message input
				if (!popup.contains(event.target) && event.target !== slashBtn && event.target !== messageInputEl) {
					popup.style.display = 'none';
				}
			}
		});

		// Provider and model selection - now controlled from settings modal only
		function onProviderChange() {
			// Provider is now controlled from settings modal
			// This function is kept for compatibility
		}

		function onModelChange() {
			// Model is now controlled from settings modal
			// This function is kept for compatibility
		}

		function shouldAutoScroll(messagesDiv) {
			const threshold = 100; // pixels from bottom
			const scrollTop = messagesDiv.scrollTop;
			const scrollHeight = messagesDiv.scrollHeight;
			const clientHeight = messagesDiv.clientHeight;
			
			return (scrollTop + clientHeight >= scrollHeight - threshold);
		}

		function scrollToBottomIfNeeded(messagesDiv, shouldScroll = null) {
			// If shouldScroll is not provided, check current scroll position
			if (shouldScroll === null) {
				shouldScroll = shouldAutoScroll(messagesDiv);
			}
			
			if (shouldScroll) {
				messagesDiv.scrollTop = messagesDiv.scrollHeight;
			}
		}

		function addMessage(content, type = 'claude') {
			const messagesDiv = document.getElementById('messages');
			const shouldScroll = shouldAutoScroll(messagesDiv);

			const messageDiv = document.createElement('div');
			messageDiv.className = \`message \${type}\`;

			// Only add copy button on hover for user and claude messages (no headers/icons/labels)
			if (type === 'user' || type === 'claude') {
				// Add copy button (appears on hover)
				const copyBtn = document.createElement('button');
				copyBtn.className = 'copy-btn';
				copyBtn.title = 'Copy message';
				copyBtn.onclick = () => copyMessageContent(messageDiv);
				copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
				messageDiv.appendChild(copyBtn);
			} else if (type === 'error') {
				// Modern error card design
				messageDiv.className = 'message error-card';

				// Error header with icon and label
				const headerDiv = document.createElement('div');
				headerDiv.className = 'error-card-header';

				const iconContainer = document.createElement('div');
				iconContainer.className = 'error-icon-container';
				iconContainer.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

				const labelDiv = document.createElement('div');
				labelDiv.className = 'error-label';
				labelDiv.textContent = 'ERROR';

				// Add copy button
				const copyBtn = document.createElement('button');
				copyBtn.className = 'error-copy-btn';
				copyBtn.title = 'Copy error message';
				copyBtn.onclick = () => copyMessageContent(messageDiv);
				copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

				headerDiv.appendChild(iconContainer);
				headerDiv.appendChild(labelDiv);
				headerDiv.appendChild(copyBtn);
				messageDiv.appendChild(headerDiv);
			}
			
			// Add content
			const contentDiv = document.createElement('div');
			contentDiv.className = type === 'error' ? 'error-card-content' : 'message-content';

			if(type == 'user' || type === 'claude' || type === 'thinking'){
				contentDiv.innerHTML = content;
			} else if (type === 'error') {
				// Format error content nicely
				contentDiv.innerHTML = '<p>' + content.replace(/\\n/g, '</p><p>') + '</p>';
			} else {
				const preElement = document.createElement('pre');
				preElement.textContent = content;
				contentDiv.appendChild(preElement);
			}
			
			messageDiv.appendChild(contentDiv);
			
			// Check if this is a permission-related error and add yolo mode button
			if (type === 'error' && isPermissionError(content)) {
				const yoloSuggestion = document.createElement('div');
				yoloSuggestion.className = 'yolo-suggestion';
				yoloSuggestion.innerHTML = \`
					<div class="yolo-suggestion-text">
						<span>💡 This looks like a permission issue. You can enable Yolo Mode to skip all permission checks.</span>
					</div>
					<button class="yolo-suggestion-btn" onclick="enableYoloMode()">Enable Yolo Mode</button>
				\`;
				messageDiv.appendChild(yoloSuggestion);
			}
			
			messagesDiv.appendChild(messageDiv);
			scrollToBottomIfNeeded(messagesDiv, shouldScroll);

			// Save state to preserve messages when switching extensions
			saveWebviewState();
		}

		// Streaming message handling
		let currentStreamingMessage = null;
		let streamingContent = '';

		function appendToStreamingMessage(text) {
			const messagesDiv = document.getElementById('messages');
			const shouldScroll = shouldAutoScroll(messagesDiv);

			if (!currentStreamingMessage) {
				// Create new streaming message (minimal - no header/icon/label)
				currentStreamingMessage = document.createElement('div');
				currentStreamingMessage.className = 'message claude streaming';

				// Add copy button (appears on hover)
				const copyBtn = document.createElement('button');
				copyBtn.className = 'copy-btn';
				copyBtn.title = 'Copy message';
				copyBtn.onclick = () => copyMessageContent(currentStreamingMessage);
				copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
				currentStreamingMessage.appendChild(copyBtn);

				// Add content div
				const contentDiv = document.createElement('div');
				contentDiv.className = 'message-content';
				currentStreamingMessage.appendChild(contentDiv);

				messagesDiv.appendChild(currentStreamingMessage);
				streamingContent = '';
			}

			// Append text to streaming content
			streamingContent += text;

			// Update the content div with parsed markdown
			const contentDiv = currentStreamingMessage.querySelector('.message-content');
			if (contentDiv) {
				contentDiv.innerHTML = parseSimpleMarkdown(streamingContent);
			}

			scrollToBottomIfNeeded(messagesDiv, shouldScroll);
		}

		function finalizeStreamingMessage() {
			if (currentStreamingMessage) {
				currentStreamingMessage.classList.remove('streaming');
				currentStreamingMessage = null;
				streamingContent = '';
				// Save state to preserve messages when switching extensions
				saveWebviewState();
			}
		}

		function addToolUseMessage(data) {
			const messagesDiv = document.getElementById('messages');
			const shouldScroll = shouldAutoScroll(messagesDiv);
			
			const messageDiv = document.createElement('div');
			messageDiv.className = 'message tool';
			
			// Create modern header with icon
			const headerDiv = document.createElement('div');
			headerDiv.className = 'tool-header';
			
			const iconDiv = document.createElement('div');
			iconDiv.className = 'tool-icon';
			iconDiv.textContent = '🔧';
			
			const toolInfoElement = document.createElement('div');
			toolInfoElement.className = 'tool-info';
			let toolName = data.toolInfo.replace('🔧 Executing: ', '');
			// Replace TodoWrite with more user-friendly name
			if (toolName === 'TodoWrite') {
				toolName = 'Update Todos';
			}
			toolInfoElement.textContent = toolName;
			
			headerDiv.appendChild(iconDiv);
			headerDiv.appendChild(toolInfoElement);
			messageDiv.appendChild(headerDiv);
			
			if (data.rawInput) {
				const inputElement = document.createElement('div');
				inputElement.className = 'tool-input';
				
				const contentDiv = document.createElement('div');
				contentDiv.className = 'tool-input-content';
				
				// Handle TodoWrite specially or format raw input
				if (data.toolName === 'TodoWrite' && data.rawInput.todos) {
					let todoHtml = 'Todo List Update:';
					for (const todo of data.rawInput.todos) {
						const status = todo.status === 'completed' ? '✅' :
							todo.status === 'in_progress' ? '🔄' : '⏳';
						todoHtml += '\\n' + status + ' ' + todo.content + ' <span class="priority-badge ' + todo.priority + '">' + todo.priority + '</span>';
					}
					contentDiv.innerHTML = todoHtml;
				} else {
					// Format raw input with expandable content for long values
					// Use diff format for Edit, MultiEdit, and Write tools, regular format for others
					if (data.toolName === 'Edit') {
						contentDiv.innerHTML = formatEditToolDiff(data.rawInput);
					} else if (data.toolName === 'MultiEdit') {
						contentDiv.innerHTML = formatMultiEditToolDiff(data.rawInput);
					} else if (data.toolName === 'Write') {
						contentDiv.innerHTML = formatWriteToolDiff(data.rawInput);
					} else {
						contentDiv.innerHTML = formatToolInputUI(data.rawInput);
					}
				}
				
				inputElement.appendChild(contentDiv);
				messageDiv.appendChild(inputElement);
			} else if (data.toolInput) {
				// Fallback for pre-formatted input
				const inputElement = document.createElement('div');
				inputElement.className = 'tool-input';
				
				const labelDiv = document.createElement('div');
				labelDiv.className = 'tool-input-label';
				labelDiv.textContent = 'INPUT';
				inputElement.appendChild(labelDiv);
				
				const contentDiv = document.createElement('div');
				contentDiv.className = 'tool-input-content';
				contentDiv.textContent = data.toolInput;
				inputElement.appendChild(contentDiv);
				messageDiv.appendChild(inputElement);
			}
			
			messagesDiv.appendChild(messageDiv);
			scrollToBottomIfNeeded(messagesDiv, shouldScroll);

			// Save state to preserve messages when switching extensions
			saveWebviewState();
		}

		function createExpandableInput(toolInput, rawInput) {
			try {
				let html = toolInput.replace(/\\[expand\\]/g, '<span class="expand-btn" onclick="toggleExpand(this)">expand</span>');
				
				// Store raw input data for expansion
				if (rawInput && typeof rawInput === 'object') {
					let btnIndex = 0;
					html = html.replace(/<span class="expand-btn"[^>]*>expand<\\/span>/g, (match) => {
						const keys = Object.keys(rawInput);
						const key = keys[btnIndex] || '';
						const value = rawInput[key] || '';
						const valueStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
						const escapedValue = valueStr.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
						btnIndex++;
						return \`<span class="expand-btn" data-key="\${key}" data-value="\${escapedValue}" onclick="toggleExpand(this)">expand</span>\`;
					});
				}
				
				return html;
			} catch (error) {
				console.error('Error creating expandable input:', error);
				return toolInput;
			}
		}


		function addToolResultMessage(data) {
			const messagesDiv = document.getElementById('messages');
			const shouldScroll = shouldAutoScroll(messagesDiv);
			
			// For Read and Edit tools with hidden flag, just hide loading state and show completion message
			if (data.hidden && (data.toolName === 'Read' || data.toolName === 'Edit' || data.toolName === 'TodoWrite' || data.toolName === 'MultiEdit') && !data.isError) {				
				return	
				// Show completion message
				const toolName = data.toolName;
				let completionText;
				if (toolName === 'Read') {
					completionText = '✅ Read completed';
				} else if (toolName === 'Edit') {
					completionText = '✅ Edit completed';
				} else if (toolName === 'TodoWrite') {
					completionText = '✅ Update Todos completed';
				} else {
					completionText = '✅ ' + toolName + ' completed';
				}
				addMessage(completionText, 'system');
				return; // Don't show the result message
			}

			const messageDiv = document.createElement('div');
			messageDiv.className = data.isError ? 'message error' : 'message tool-result';
			
			// Create header
			const headerDiv = document.createElement('div');
			headerDiv.className = 'message-header';
			
			const iconDiv = document.createElement('div');
			iconDiv.className = data.isError ? 'message-icon error' : 'message-icon';
			iconDiv.style.background = data.isError ? 
				'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' : 
				'linear-gradient(135deg, #1cc08c 0%, #16a974 100%)';
			iconDiv.textContent = data.isError ? '❌' : '✅';
			
			const labelDiv = document.createElement('div');
			labelDiv.className = 'message-label';
			labelDiv.textContent = data.isError ? 'Error' : 'Result';
			
			headerDiv.appendChild(iconDiv);
			headerDiv.appendChild(labelDiv);
			messageDiv.appendChild(headerDiv);
			
			// Add content
			const contentDiv = document.createElement('div');
			contentDiv.className = 'message-content';
			
			// Check if it's a tool result and truncate appropriately
			let content = data.content;
			if (content.length > 200 && !data.isError) {
				const truncateAt = 197;
				const truncated = content.substring(0, truncateAt);
				const resultId = 'result_' + Math.random().toString(36).substr(2, 9);
				
				const preElement = document.createElement('pre');
				preElement.innerHTML = '<span id="' + resultId + '_visible">' + escapeHtml(truncated) + '</span>' +
									   '<span id="' + resultId + '_ellipsis">...</span>' +
									   '<span id="' + resultId + '_hidden" style="display: none;">' + escapeHtml(content.substring(truncateAt)) + '</span>';
				contentDiv.appendChild(preElement);
				
				// Add expand button container
				const expandContainer = document.createElement('div');
				expandContainer.className = 'diff-expand-container';
				const expandButton = document.createElement('button');
				expandButton.className = 'diff-expand-btn';
				expandButton.textContent = 'Show more';
				expandButton.setAttribute('onclick', 'toggleResultExpansion(\\'' + resultId + '\\\')');
				expandContainer.appendChild(expandButton);
				contentDiv.appendChild(expandContainer);
			} else {
				const preElement = document.createElement('pre');
				preElement.textContent = content;
				contentDiv.appendChild(preElement);
			}
			
			messageDiv.appendChild(contentDiv);
			
			// Check if this is a permission-related error and add yolo mode button
			if (data.isError && isPermissionError(content)) {
				const yoloSuggestion = document.createElement('div');
				yoloSuggestion.className = 'yolo-suggestion';
				yoloSuggestion.innerHTML = \`
					<div class="yolo-suggestion-text">
						<span>💡 This looks like a permission issue. You can enable Yolo Mode to skip all permission checks.</span>
					</div>
					<button class="yolo-suggestion-btn" onclick="enableYoloMode()">Enable Yolo Mode</button>
				\`;
				messageDiv.appendChild(yoloSuggestion);
			}
			
			messagesDiv.appendChild(messageDiv);
			scrollToBottomIfNeeded(messagesDiv, shouldScroll);

			// Save state to preserve messages when switching extensions
			saveWebviewState();
		}

		function formatToolInputUI(input) {
			if (!input || typeof input !== 'object') {
				const str = String(input);
				if (str.length > 100) {
					const truncateAt = 97;
					const truncated = str.substring(0, truncateAt);
					const inputId = 'input_' + Math.random().toString(36).substr(2, 9);
					
					return '<span id="' + inputId + '_visible">' + escapeHtml(truncated) + '</span>' +
						   '<span id="' + inputId + '_ellipsis">...</span>' +
						   '<span id="' + inputId + '_hidden" style="display: none;">' + escapeHtml(str.substring(truncateAt)) + '</span>' +
						   '<div class="diff-expand-container">' +
						   '<button class="diff-expand-btn" onclick="toggleResultExpansion(\\\'' + inputId + '\\\')">Show more</button>' +
						   '</div>';
				}
				return str;
			}

			// Special handling for Read tool with file_path
			if (input.file_path && Object.keys(input).length === 1) {
				const formattedPath = formatFilePath(input.file_path);
				return '<div class="diff-file-path" onclick="openFileInEditor(\\\'' + escapeHtml(input.file_path) + '\\\')">' + formattedPath + '</div>';
			}

			let result = '';
			let isFirst = true;
			for (const [key, value] of Object.entries(input)) {
				const valueStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
				
				if (!isFirst) result += '\\n';
				isFirst = false;
				
				// Special formatting for file_path in Read tool context
				if (key === 'file_path') {
					const formattedPath = formatFilePath(valueStr);
					result += '<div class="diff-file-path" onclick="openFileInEditor(\\\'' + escapeHtml(valueStr) + '\\\')">' + formattedPath + '</div>';
				} else if (valueStr.length > 100) {
					const truncated = valueStr.substring(0, 97) + '...';
					const escapedValue = valueStr.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
					result += '<span class="expandable-item"><strong>' + key + ':</strong> ' + truncated + ' <span class="expand-btn" data-key="' + key + '" data-value="' + escapedValue + '" onclick="toggleExpand(this)">expand</span></span>';
				} else {
					result += '<strong>' + key + ':</strong> ' + valueStr;
				}
			}
			return result;
		}

		function formatEditToolDiff(input) {
			if (!input || typeof input !== 'object') {
				return formatToolInputUI(input);
			}

			// Check if this is an Edit tool (has file_path, old_string, new_string)
			if (!input.file_path || !input.old_string || !input.new_string) {
				return formatToolInputUI(input);
			}

			// Format file path with better display
			const formattedPath = formatFilePath(input.file_path);
			let result = '<div class="diff-file-path" onclick="openFileInEditor(\\\'' + escapeHtml(input.file_path) + '\\\')">' + formattedPath + '</div>\\n';
			
			// Create diff view
			const oldLines = input.old_string.split('\\n');
			const newLines = input.new_string.split('\\n');
			const allLines = [...oldLines.map(line => ({type: 'removed', content: line})), 
							 ...newLines.map(line => ({type: 'added', content: line}))];
			
			const maxLines = 6;
			const shouldTruncate = allLines.length > maxLines;
			const visibleLines = shouldTruncate ? allLines.slice(0, maxLines) : allLines;
			const hiddenLines = shouldTruncate ? allLines.slice(maxLines) : [];
			
			result += '<div class="diff-container">';
			result += '<div class="diff-header">Changes:</div>';
			
			// Create a unique ID for this diff
			const diffId = 'diff_' + Math.random().toString(36).substr(2, 9);
			
			// Show visible lines
			result += '<div id="' + diffId + '_visible">';
			for (const line of visibleLines) {
				const prefix = line.type === 'removed' ? '- ' : '+ ';
				const cssClass = line.type === 'removed' ? 'removed' : 'added';
				result += '<div class="diff-line ' + cssClass + '">' + prefix + escapeHtml(line.content) + '</div>';
			}
			result += '</div>';
			
			// Show hidden lines (initially hidden)
			if (shouldTruncate) {
				result += '<div id="' + diffId + '_hidden" style="display: none;">';
				for (const line of hiddenLines) {
					const prefix = line.type === 'removed' ? '- ' : '+ ';
					const cssClass = line.type === 'removed' ? 'removed' : 'added';
					result += '<div class="diff-line ' + cssClass + '">' + prefix + escapeHtml(line.content) + '</div>';
				}
				result += '</div>';
				
				// Add expand button
				result += '<div class="diff-expand-container">';
				result += '<button class="diff-expand-btn" onclick="toggleDiffExpansion(\\\'' + diffId + '\\\')">Show ' + hiddenLines.length + ' more lines</button>';
				result += '</div>';
			}
			
			result += '</div>';
			
			// Add other properties if they exist
			for (const [key, value] of Object.entries(input)) {
				if (key !== 'file_path' && key !== 'old_string' && key !== 'new_string') {
					const valueStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
					result += '\\n<strong>' + key + ':</strong> ' + valueStr;
				}
			}
			
			return result;
		}

		function formatMultiEditToolDiff(input) {
			if (!input || typeof input !== 'object') {
				return formatToolInputUI(input);
			}

			// Check if this is a MultiEdit tool (has file_path and edits array)
			if (!input.file_path || !input.edits || !Array.isArray(input.edits)) {
				return formatToolInputUI(input);
			}

			// Format file path with better display
			const formattedPath = formatFilePath(input.file_path);
			let result = '<div class="diff-file-path" onclick="openFileInEditor(\\\'' + escapeHtml(input.file_path) + '\\\')">' + formattedPath + '</div>\\n';
			
			// Count total lines across all edits for truncation
			let totalLines = 0;
			for (const edit of input.edits) {
				if (edit.old_string && edit.new_string) {
					const oldLines = edit.old_string.split('\\n');
					const newLines = edit.new_string.split('\\n');
					totalLines += oldLines.length + newLines.length;
				}
			}

			const maxLines = 6;
			const shouldTruncate = totalLines > maxLines;
			
			result += '<div class="diff-container">';
			result += '<div class="diff-header">Changes (' + input.edits.length + ' edit' + (input.edits.length > 1 ? 's' : '') + '):</div>';
			
			// Create a unique ID for this diff
			const diffId = 'multiedit_' + Math.random().toString(36).substr(2, 9);
			
			let currentLineCount = 0;
			let visibleEdits = [];
			let hiddenEdits = [];
			
			// Determine which edits to show/hide based on line count
			for (let i = 0; i < input.edits.length; i++) {
				const edit = input.edits[i];
				if (!edit.old_string || !edit.new_string) continue;
				
				const oldLines = edit.old_string.split('\\n');
				const newLines = edit.new_string.split('\\n');
				const editLines = oldLines.length + newLines.length;
				
				if (shouldTruncate && currentLineCount + editLines > maxLines && visibleEdits.length > 0) {
					hiddenEdits.push(edit);
				} else {
					visibleEdits.push(edit);
					currentLineCount += editLines;
				}
			}
			
			// Show visible edits
			result += '<div id="' + diffId + '_visible">';
			for (let i = 0; i < visibleEdits.length; i++) {
				const edit = visibleEdits[i];
				if (i > 0) result += '<div class="diff-edit-separator"></div>';
				result += formatSingleEdit(edit, i + 1);
			}
			result += '</div>';
			
			// Show hidden edits (initially hidden)
			if (hiddenEdits.length > 0) {
				result += '<div id="' + diffId + '_hidden" style="display: none;">';
				for (let i = 0; i < hiddenEdits.length; i++) {
					const edit = hiddenEdits[i];
					result += '<div class="diff-edit-separator"></div>';
					result += formatSingleEdit(edit, visibleEdits.length + i + 1);
				}
				result += '</div>';
				
				// Add expand button
				result += '<div class="diff-expand-container">';
				result += '<button class="diff-expand-btn" onclick="toggleDiffExpansion(\\\'' + diffId + '\\\')">Show ' + hiddenEdits.length + ' more edit' + (hiddenEdits.length > 1 ? 's' : '') + '</button>';
				result += '</div>';
			}
			
			result += '</div>';
			
			// Add other properties if they exist
			for (const [key, value] of Object.entries(input)) {
				if (key !== 'file_path' && key !== 'edits') {
					const valueStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
					result += '\\n<strong>' + key + ':</strong> ' + valueStr;
				}
			}
			
			return result;
		}

		function formatSingleEdit(edit, editNumber) {
			let result = '<div class="single-edit">';
			result += '<div class="edit-number">Edit #' + editNumber + '</div>';
			
			// Create diff view for this single edit
			const oldLines = edit.old_string.split('\\n');
			const newLines = edit.new_string.split('\\n');
			
			// Show removed lines
			for (const line of oldLines) {
				result += '<div class="diff-line removed">- ' + escapeHtml(line) + '</div>';
			}
			
			// Show added lines
			for (const line of newLines) {
				result += '<div class="diff-line added">+ ' + escapeHtml(line) + '</div>';
			}
			
			result += '</div>';
			return result;
		}

		function formatWriteToolDiff(input) {
			if (!input || typeof input !== 'object') {
				return formatToolInputUI(input);
			}

			// Check if this is a Write tool (has file_path and content)
			if (!input.file_path || !input.content) {
				return formatToolInputUI(input);
			}

			// Format file path with better display
			const formattedPath = formatFilePath(input.file_path);
			let result = '<div class="diff-file-path" onclick="openFileInEditor(\\\'' + escapeHtml(input.file_path) + '\\\')">' + formattedPath + '</div>\\n';
			
			// Create diff view showing all content as additions
			const contentLines = input.content.split('\\n');
			
			const maxLines = 6;
			const shouldTruncate = contentLines.length > maxLines;
			const visibleLines = shouldTruncate ? contentLines.slice(0, maxLines) : contentLines;
			const hiddenLines = shouldTruncate ? contentLines.slice(maxLines) : [];
			
			result += '<div class="diff-container">';
			result += '<div class="diff-header">New file content:</div>';
			
			// Create a unique ID for this diff
			const diffId = 'write_' + Math.random().toString(36).substr(2, 9);
			
			// Show visible lines (all as additions)
			result += '<div id="' + diffId + '_visible">';
			for (const line of visibleLines) {
				result += '<div class="diff-line added">+ ' + escapeHtml(line) + '</div>';
			}
			result += '</div>';
			
			// Show hidden lines (initially hidden)
			if (shouldTruncate) {
				result += '<div id="' + diffId + '_hidden" style="display: none;">';
				for (const line of hiddenLines) {
					result += '<div class="diff-line added">+ ' + escapeHtml(line) + '</div>';
				}
				result += '</div>';
				
				// Add expand button
				result += '<div class="diff-expand-container">';
				result += '<button class="diff-expand-btn" onclick="toggleDiffExpansion(\\\'' + diffId + '\\\')">Show ' + hiddenLines.length + ' more lines</button>';
				result += '</div>';
			}
			
			result += '</div>';
			
			// Add other properties if they exist
			for (const [key, value] of Object.entries(input)) {
				if (key !== 'file_path' && key !== 'content') {
					const valueStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
					result += '\\n<strong>' + key + ':</strong> ' + valueStr;
				}
			}
			
			return result;
		}

		function escapeHtml(text) {
			const div = document.createElement('div');
			div.textContent = text;
			return div.innerHTML;
		}

		function openFileInEditor(filePath) {
			vscode.postMessage({
				type: 'openFile',
				filePath: filePath
			});
		}

		function formatFilePath(filePath) {
			if (!filePath) return '';
			
			// Extract just the filename
			const parts = filePath.split('/');
			const fileName = parts[parts.length - 1];
			
			return '<span class="file-path-truncated" title="' + escapeHtml(filePath) + '" data-file-path="' + escapeHtml(filePath) + '">' + 
				   '<span class="file-icon">📄</span>' + escapeHtml(fileName) + '</span>';
		}

		function toggleDiffExpansion(diffId) {
			const hiddenDiv = document.getElementById(diffId + '_hidden');
			const button = document.querySelector('[onclick*="' + diffId + '"]');
			
			if (hiddenDiv && button) {
				if (hiddenDiv.style.display === 'none') {
					hiddenDiv.style.display = 'block';
					button.textContent = 'Show less';
				} else {
					hiddenDiv.style.display = 'none';
					const hiddenLines = hiddenDiv.querySelectorAll('.diff-line').length;
					button.textContent = 'Show ' + hiddenLines + ' more lines';
				}
			}
		}

		function toggleResultExpansion(resultId) {
			const hiddenDiv = document.getElementById(resultId + '_hidden');
			const ellipsis = document.getElementById(resultId + '_ellipsis');
			const button = document.querySelector('[onclick*="toggleResultExpansion(\\'' + resultId + '\\\')"]');
			
			if (hiddenDiv && button) {
				if (hiddenDiv.style.display === 'none') {
					hiddenDiv.style.display = 'inline';
					if (ellipsis) ellipsis.style.display = 'none';
					button.textContent = 'Show less';
				} else {
					hiddenDiv.style.display = 'none';
					if (ellipsis) ellipsis.style.display = 'inline';
					button.textContent = 'Show more';
				}
			}
		}

		function toggleExpand(button) {
			const key = button.getAttribute('data-key');
			const value = button.getAttribute('data-value');
			
			// Find the container that holds just this key-value pair
			let container = button.parentNode;
			while (container && !container.classList.contains('expandable-item')) {
				container = container.parentNode;
			}
			
			if (!container) {
				// Fallback: create a wrapper around the current line
				const parent = button.parentNode;
				const wrapper = document.createElement('div');
				wrapper.className = 'expandable-item';
				parent.insertBefore(wrapper, button.previousSibling || button);
				
				// Move the key, value text, and button into the wrapper
				let currentNode = wrapper.nextSibling;
				const nodesToMove = [];
				while (currentNode && currentNode !== button.nextSibling) {
					nodesToMove.push(currentNode);
					currentNode = currentNode.nextSibling;
				}
				nodesToMove.forEach(node => wrapper.appendChild(node));
				container = wrapper;
			}
			
			if (button.textContent === 'expand') {
				// Show full content
				const decodedValue = value.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
				container.innerHTML = '<strong>' + key + ':</strong> ' + decodedValue + ' <span class="expand-btn" data-key="' + key + '" data-value="' + value + '" onclick="toggleExpand(this)">collapse</span>';
			} else {
				// Show truncated content
				const decodedValue = value.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
				const truncated = decodedValue.substring(0, 97) + '...';
				container.innerHTML = '<strong>' + key + ':</strong> ' + truncated + ' <span class="expand-btn" data-key="' + key + '" data-value="' + value + '" onclick="toggleExpand(this)">expand</span>';
			}
		}

		function sendMessage() {
			const text = messageInput.value.trim();
			const hasImages = attachedImages.length > 0;

			if (text || hasImages) {
				// Hide welcome screen on first message
				if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
					welcomeScreen.classList.add('hidden');
				}

				// Prepare image data for sending
				const images = attachedImages.map(img => ({
					filePath: img.filePath,
					base64Data: img.base64Data,
					fileName: img.fileName
				}));

				vscode.postMessage({
					type: 'sendMessage',
					text: text,
					images: images,
					planMode: planModeEnabled,
					thinkingMode: thinkingModeEnabled
				});

				messageInput.value = '';
				// Clear attached images after sending
				clearAttachedImages();
			}
		}

		function togglePlanMode() {
			planModeEnabled = !planModeEnabled;
			const switchElement = document.getElementById('planModeSwitch');
			if (planModeEnabled) {
				switchElement.classList.add('active');
			} else {
				switchElement.classList.remove('active');
			}
		}

		function toggleThinkingMode() {
			thinkingModeEnabled = !thinkingModeEnabled;
			const switchElement = document.getElementById('thinkingModeSwitch');
			const toggleLabel = document.getElementById('thinkingModeLabel');
			if (thinkingModeEnabled) {
				switchElement.classList.add('active');
				// Show thinking intensity modal when thinking mode is enabled
				showThinkingIntensityModal();
			} else {
				switchElement.classList.remove('active');
				// Reset to default "Thinking Mode" when turned off
				if (toggleLabel) {
					toggleLabel.textContent = 'Thinking Mode';
				}
			}
		}


		let totalCost = 0;
		let totalTokensInput = 0;
		let totalTokensOutput = 0;
		let requestCount = 0;
		let isProcessing = false;
		let requestStartTime = null;
		let requestTimer = null;

		// Fun dynamic status messages for processing state (Claude Code style)
		const processingMessages = [
			'Reticulating splines',
			'Marinating',
			'Discombobulating',
			'Percolating',
			'Cogitating',
			'Ruminating',
			'Contemplating',
			'Brainstorming',
			'Synthesizing',
			'Pondering deeply',
			'Consulting the oracle',
			'Channeling inspiration',
			'Untangling thoughts',
			'Brewing ideas',
			'Assembling neurons',
			'Calibrating wisdom',
			'Defragmenting thoughts',
			'Loading creativity',
			'Warming up circuits',
			'Connecting dots'
		];
		let currentMessageIndex = 0;
		let messageRotationTimer = null;

		function updateStatus(text, state = 'ready') {
			statusTextDiv.textContent = text;
			statusDiv.className = \`status \${state}\`;
		}

		function getProcessingMessage(elapsedSeconds) {
			// Rotate through fun messages every 3 seconds
			const messageIndex = Math.floor(elapsedSeconds / 3) % processingMessages.length;
			return processingMessages[messageIndex];
		}

		function updateStatusWithTotals() {
			if (isProcessing) {
				// While processing, show dynamic message with elapsed time
				let elapsedSeconds = 0;
				if (requestStartTime) {
					elapsedSeconds = Math.floor((Date.now() - requestStartTime) / 1000);
				}

				const dynamicMessage = getProcessingMessage(elapsedSeconds);
				const totalTokens = totalTokensInput + totalTokensOutput;

				let statusText = dynamicMessage;
				if (elapsedSeconds > 0) {
					statusText += \` · \${elapsedSeconds}s\`;
				}
				if (totalTokens > 0) {
					statusText += \` · \${totalTokens.toLocaleString()} tokens\`;
				}

				updateStatus(statusText, 'processing');
			} else {
				// When ready, show minimal info
				const costStr = totalCost > 0 ? \`$\${totalCost.toFixed(4)}\` : '';
				const totalTokens = totalTokensInput + totalTokensOutput;
				const tokensStr = totalTokens > 0 ? \`\${totalTokens.toLocaleString()} tokens\` : '';

				let statusParts = ['Ready'];
				if (costStr) statusParts.push(costStr);
				if (tokensStr) statusParts.push(tokensStr);

				const statusText = statusParts.join(' · ');
				updateStatus(statusText, 'ready');
			}
		}

		function startRequestTimer() {
			requestStartTime = Date.now();
			// Update status every 100ms for smooth real-time display
			requestTimer = setInterval(() => {
				if (isProcessing) {
					updateStatusWithTotals();
				}
			}, 100);
		}

		function stopRequestTimer() {
			if (requestTimer) {
				clearInterval(requestTimer);
				requestTimer = null;
			}
			requestStartTime = null;
		}

		// Animated loading indicator
		let loadingElement = null;
		let loadingInterval = null;
		let loadingMessageIndex = 0;

		function showAnimatedLoading() {
			// Remove existing loading if any
			hideAnimatedLoading();

			const messagesDiv = document.getElementById('messages');
			const shouldScroll = shouldAutoScroll(messagesDiv);

			// Create loading element
			loadingElement = document.createElement('div');
			loadingElement.className = 'animated-loading';
			loadingElement.innerHTML = \`
				<div class="loading-dots">
					<span></span><span></span><span></span>
				</div>
				<span class="loading-text">\${processingMessages[0]}</span>
			\`;

			messagesDiv.appendChild(loadingElement);
			scrollToBottomIfNeeded(messagesDiv, shouldScroll);

			// Start rotating through messages
			loadingMessageIndex = 0;
			loadingInterval = setInterval(() => {
				loadingMessageIndex = (loadingMessageIndex + 1) % processingMessages.length;
				const textEl = loadingElement?.querySelector('.loading-text');
				if (textEl) {
					textEl.textContent = processingMessages[loadingMessageIndex];
				}
			}, 2000); // Change message every 2 seconds
		}

		function hideAnimatedLoading() {
			if (loadingInterval) {
				clearInterval(loadingInterval);
				loadingInterval = null;
			}
			if (loadingElement) {
				loadingElement.remove();
				loadingElement = null;
			}
		}

		// Auto-resize textarea
		function adjustTextareaHeight() {
			// Reset height to calculate new height
			messageInput.style.height = 'auto';
			
			// Get computed styles
			const computedStyle = getComputedStyle(messageInput);
			const lineHeight = parseFloat(computedStyle.lineHeight);
			const paddingTop = parseFloat(computedStyle.paddingTop);
			const paddingBottom = parseFloat(computedStyle.paddingBottom);
			const borderTop = parseFloat(computedStyle.borderTopWidth);
			const borderBottom = parseFloat(computedStyle.borderBottomWidth);
			
			// Calculate heights
			const scrollHeight = messageInput.scrollHeight;
			const maxRows = 5;
			const minHeight = lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
			const maxHeight = (lineHeight * maxRows) + paddingTop + paddingBottom + borderTop + borderBottom;
			
			// Set height
			if (scrollHeight <= maxHeight) {
				messageInput.style.height = Math.max(scrollHeight, minHeight) + 'px';
				messageInput.style.overflowY = 'hidden';
			} else {
				messageInput.style.height = maxHeight + 'px';
				messageInput.style.overflowY = 'auto';
			}
		}

		messageInput.addEventListener('input', adjustTextareaHeight);
		
		messageInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				sendMessage();
			} else if (e.key === '/' && !e.ctrlKey && !e.metaKey && messageInput.value === '') {
				// Show slash commands popup when typing / at the beginning
				setTimeout(() => {
					if (messageInput.value.startsWith('/')) {
						showSlashCommandsPopup(messageInput.value);
					}
				}, 0);
			} else if (e.key === '@' && !e.ctrlKey && !e.metaKey) {
				// Don't prevent default, let @ be typed first
				setTimeout(() => {
					showFilePicker();
				}, 0);
			} else if (e.key === 'Escape' && filePickerModal.style.display === 'flex') {
				e.preventDefault();
				hideFilePicker();
			} else if (e.key === 'Escape') {
				// Also close slash popup on Escape
				hideSlashCommandsPopup();
			} else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
				// Handle Ctrl+V/Cmd+V explicitly in case paste event doesn't fire
				// Don't prevent default - let browser handle it first
				setTimeout(() => {
					// If value hasn't changed, manually trigger paste
					const currentValue = messageInput.value;
					setTimeout(() => {
						if (messageInput.value === currentValue) {
							// Value didn't change, request clipboard from VS Code
							vscode.postMessage({
								type: 'getClipboardText'
							});
						}
					}, 50);
				}, 0);
			}
		});

		// Add explicit paste event handler for better clipboard support in VSCode webviews
		messageInput.addEventListener('paste', async (e) => {
			e.preventDefault();
			
			try {
				// Try to get clipboard data from the event first
				const clipboardData = e.clipboardData;
				
				// Check for images first
				if (clipboardData && clipboardData.items) {
					let hasImage = false;
					for (let i = 0; i < clipboardData.items.length; i++) {
						const item = clipboardData.items[i];
						if (item.type.startsWith('image/')) {
							// Found an image, handle it
							console.log('Image detected in clipboard:', item.type);
							hasImage = true;
							const blob = item.getAsFile();
							if (blob) {
								console.log('Converting image blob to base64...');
								// Convert blob to base64
								const reader = new FileReader();
								reader.onload = function(event) {
									const base64Data = event.target.result;
									console.log('Showing image preview immediately');
									// Show preview immediately with base64 data
									const tempPath = 'pasted_image_' + Date.now() + '.' + item.type.split('/')[1];
									addImageToPreview(tempPath, base64Data);

									console.log('Sending image to extension for file creation');
									// Send to extension to create file
									vscode.postMessage({
										type: 'createImageFile',
										imageData: base64Data,
										imageType: item.type
									});
								};
								reader.readAsDataURL(blob);
							}
							break; // Process only the first image found
						}
					}
					
					// If we found an image, don't process any text
					if (hasImage) {
						return;
					}
				}
				
				// No image found, handle text
				let text = '';
				
				if (clipboardData) {
					text = clipboardData.getData('text/plain');
				}
				
				// If no text from event, try navigator.clipboard API
				if (!text && navigator.clipboard && navigator.clipboard.readText) {
					try {
						text = await navigator.clipboard.readText();
					} catch (err) {
						console.log('Clipboard API failed:', err);
					}
				}
				
				// If still no text, request from VS Code extension
				if (!text) {
					vscode.postMessage({
						type: 'getClipboardText'
					});
					return;
				}
				
				// Insert text at cursor position
				const start = messageInput.selectionStart;
				const end = messageInput.selectionEnd;
				const currentValue = messageInput.value;
				
				const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
				messageInput.value = newValue;
				
				// Set cursor position after pasted text
				const newCursorPos = start + text.length;
				messageInput.setSelectionRange(newCursorPos, newCursorPos);
				
				// Trigger input event to adjust height
				messageInput.dispatchEvent(new Event('input', { bubbles: true }));
			} catch (error) {
				console.error('Paste error:', error);
			}
		});

		// Handle context menu paste
		messageInput.addEventListener('contextmenu', (e) => {
			// Don't prevent default - allow context menu to show
			// but ensure paste will work when selected
		});

		// Initialize textarea height
		adjustTextareaHeight();

		// File picker event listeners
		fileSearchInput.addEventListener('input', (e) => {
			filterFiles(e.target.value);
		});

		fileSearchInput.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				selectedFileIndex = Math.min(selectedFileIndex + 1, filteredFiles.length - 1);
				renderFileList();
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				selectedFileIndex = Math.max(selectedFileIndex - 1, -1);
				renderFileList();
			} else if (e.key === 'Enter' && selectedFileIndex >= 0) {
				e.preventDefault();
				selectFile(filteredFiles[selectedFileIndex]);
			} else if (e.key === 'Escape') {
				e.preventDefault();
				hideFilePicker();
			}
		});

		// Close modal when clicking outside
		filePickerModal.addEventListener('click', (e) => {
			if (e.target === filePickerModal) {
				hideFilePicker();
			}
		});

		// Tools modal functions
		function updateYoloWarning() {
			const yoloModeCheckbox = document.getElementById('yolo-mode');
			const warning = document.getElementById('yoloWarning');

			if (!yoloModeCheckbox || !warning) {
				return; // Elements not ready yet
			}

			const yoloMode = yoloModeCheckbox.checked;
			if (yoloMode) {
				warning.style.display = 'flex';
				// Trigger animation
				setTimeout(() => warning.classList.add('visible'), 10);
			} else {
				warning.classList.remove('visible');
				setTimeout(() => warning.style.display = 'none', 300);
			}
		}

		function dismissYoloWarning() {
			const warning = document.getElementById('yoloWarning');
			warning.classList.remove('visible');
			setTimeout(() => warning.style.display = 'none', 300);
		}
		
		function isPermissionError(content) {
			const permissionErrorPatterns = [
				'Error: MCP config file not found',
				'Error: MCP tool',
				'Permission requested to use',
				'permission denied',
				'Permission denied',
				'permission request',
				'Permission request',
				'EACCES',
				'permission error',
				'Permission error'
			];
			
			return permissionErrorPatterns.some(pattern => 
				content.toLowerCase().includes(pattern.toLowerCase())
			);
		}
		
		function enableYoloMode() {
			// Update the checkbox
			const yoloModeCheckbox = document.getElementById('yolo-mode');
			if (yoloModeCheckbox) {
				yoloModeCheckbox.checked = true;
				
				// Trigger the settings update
				updateSettings();
				
				// Show confirmation message
				addMessage('✅ Yolo Mode enabled! All permission checks will be bypassed for future commands.', 'system');
				
				// Update the warning banner
				updateYoloWarning();
			}
		}

		// Model selector functions - now using dropdowns
		function showModelSelector() {
			// Model selection now uses dropdown, no modal needed
		}

		function hideModelModal() {
			// Model modal removed, using dropdowns
		}

		// Slash commands modal functions (for backward compatibility)
		function showSlashCommandsModal() {
			showSlashCommandsPopup(messageInput.value);
		}

		function hideSlashCommandsModal() {
			hideSlashCommandsPopup();
		}

		// Thinking intensity modal functions
		function showThinkingIntensityModal() {
			// Request current settings from VS Code first
			vscode.postMessage({
				type: 'getSettings'
			});
			document.getElementById('thinkingIntensityModal').style.display = 'flex';
		}

		function hideThinkingIntensityModal() {
			document.getElementById('thinkingIntensityModal').style.display = 'none';
		}

		function saveThinkingIntensity() {
			const thinkingSlider = document.getElementById('thinkingIntensitySlider');
			const intensityValues = ['think', 'think-hard', 'think-harder', 'ultrathink'];
			const thinkingIntensity = intensityValues[thinkingSlider.value] || 'think';
			
			// Send settings to VS Code
			vscode.postMessage({
				type: 'updateSettings',
				settings: {
					'thinking.intensity': thinkingIntensity
				}
			});
		}

		function updateThinkingModeToggleName(intensityValue) {
			const intensityNames = ['Thinking', 'Think Hard', 'Think Harder', 'Ultrathink'];
			const modeName = intensityNames[intensityValue] || 'Thinking';
			const toggleLabel = document.getElementById('thinkingModeLabel');
			if (toggleLabel) {
				toggleLabel.textContent = modeName + ' Mode';
			}
		}

		function updateThinkingIntensityDisplay(value) {
			// Update label highlighting for thinking intensity modal
			for (let i = 0; i < 4; i++) {
				const label = document.getElementById('thinking-label-' + i);
				if (i == value) {
					label.classList.add('active');
				} else {
					label.classList.remove('active');
				}
			}
			
			// Don't update toggle name until user confirms
		}

		function setThinkingIntensityValue(value) {
			// Set slider value for thinking intensity modal
			document.getElementById('thinkingIntensitySlider').value = value;
			
			// Update visual state
			updateThinkingIntensityDisplay(value);
		}

		function confirmThinkingIntensity() {
			// Get the current slider value
			const currentValue = document.getElementById('thinkingIntensitySlider').value;
			
			// Update the toggle name with confirmed selection
			updateThinkingModeToggleName(currentValue);
			
			// Save the current intensity setting
			saveThinkingIntensity();
			
			// Close the modal
			hideThinkingIntensityModal();
		}

		// WSL Alert functions
		function showWSLAlert() {
			const alert = document.getElementById('wslAlert');
			if (alert) {
				alert.style.display = 'block';
			}
		}

		function dismissWSLAlert() {
			const alert = document.getElementById('wslAlert');
			if (alert) {
				alert.style.display = 'none';
			}
			// Send dismiss message to extension to store in globalState
			vscode.postMessage({
				type: 'dismissWSLAlert'
			});
		}

		function openWSLSettings() {
			// Dismiss the alert
			dismissWSLAlert();
			
			// Open settings modal
			toggleSettings();
		}

		function executeSlashCommand(command) {
			// Hide the popup
			hideSlashCommandsPopup();

			// Clear the input since user selected a command
			messageInput.value = '';

			// Handle commands locally
			switch (command) {
				case 'help':
					// Request README content from extension to display in chat
					vscode.postMessage({ type: 'getHelpContent' });
					break;
				case 'clear':
					// Clear the chat messages locally
					clearChat();
					break;
				case 'compact':
					// Compact the chat (summarize/collapse old messages)
					compactChat();
					break;
				default:
					addMessage(\`Unknown command: /\${command}\`, 'system');
			}
		}

		function clearChat() {
			// Clear all messages from the UI
			const messagesDiv = document.getElementById('messages');
			messagesDiv.innerHTML = '';

			// Reset totals
			totalCost = 0;
			totalTokensInput = 0;
			totalTokensOutput = 0;
			requestCount = 0;
			updateStatusWithTotals();

			// Notify extension to clear session
			vscode.postMessage({ type: 'newSession' });

			addMessage('Chat cleared. Starting fresh!', 'system');
		}

		function compactChat() {
			// Get all message elements
			const messagesDiv = document.getElementById('messages');
			const messages = messagesDiv.querySelectorAll('.message');

			if (messages.length <= 3) {
				addMessage('Chat is already compact.', 'system');
				return;
			}

			// Keep only the last 3 messages and add a summary note
			const messagesToKeep = Array.from(messages).slice(-3);
			const removedCount = messages.length - 3;

			// Clear and rebuild
			messagesDiv.innerHTML = '';

			// Add compact notice
			const compactNotice = document.createElement('div');
			compactNotice.className = 'message system';
			compactNotice.innerHTML = \`<div class="message-content">📦 \${removedCount} earlier message(s) compacted to save space.</div>\`;
			messagesDiv.appendChild(compactNotice);

			// Re-add kept messages
			messagesToKeep.forEach(msg => messagesDiv.appendChild(msg));

			addMessage('Chat compacted! Older messages have been removed from view.', 'system');
		}

		function handleCustomCommandKeydown(event) {
			if (event.key === 'Enter') {
				event.preventDefault();
				const customCommand = event.target.value.trim();
				if (customCommand) {
					executeSlashCommand(customCommand);
					// Clear the input for next use
					event.target.value = '';
				}
			}
		}

		// Store custom snippets data globally
		let customSnippetsData = {};

		function usePromptSnippet(snippetType) {
			const builtInSnippets = {
				'explain': 'Explain this code in detail',
				'fix': 'Fix issues in this code',
				'refactor': 'Refactor this code to improve readability and maintainability',
				'test': 'Generate tests for this code',
				'review': 'Review this code and provide feedback'
			};
			
			// Check built-in snippets first
			let promptText = builtInSnippets[snippetType];
			
			// If not found in built-in, check custom snippets
			if (!promptText && customSnippetsData[snippetType]) {
				promptText = customSnippetsData[snippetType].prompt;
			}
			
			if (promptText) {
				// Hide the modal
				hideSlashCommandsModal();
				
				// Insert the prompt into the message input
				messageInput.value = promptText;
				messageInput.focus();
				
				// Auto-resize the textarea
				autoResizeTextarea();
			}
		}

		function showAddSnippetForm() {
			// Removed - custom snippets not supported in simplified UI
		}

		function hideAddSnippetForm() {
			// Removed - custom snippets not supported in simplified UI
		}

		function saveCustomSnippet() {
			// Removed - custom snippets not supported in simplified UI
		}

		function loadCustomSnippets(snippetsData = {}) {
			// Removed - custom snippets not supported in simplified UI
		}

		function deleteCustomSnippet(snippetId) {
			// Removed - custom snippets not supported in simplified UI
		}

		function filterSlashCommands() {
			// Removed - no search in simplified UI
		}

		function openModelTerminal() {
			// Removed - using dropdown instead
		}

		function selectModel(model, fromBackend = false) {
			currentModel = model;

			// Update dropdown if it exists
			const modelSelector = document.getElementById('modelSelector');
			if (modelSelector) {
				modelSelector.value = model;
			}

			// Only send model selection to VS Code extension if not from backend
			if (!fromBackend) {
				vscode.postMessage({
					type: 'selectModel',
					model: model
				});

				// Save preference
				localStorage.setItem('selectedModel', model);
			}
		}

		// Model already initialized via dropdown

		// Stop button functions
		function showStopButton() {
			document.getElementById('stopBtn').style.display = 'flex';
		}

		function hideStopButton() {
			document.getElementById('stopBtn').style.display = 'none';
		}

		function stopRequest() {
			vscode.postMessage({
				type: 'stopRequest'
			});
			hideStopButton();
		}

		// Disable/enable buttons during processing
		function disableButtons() {
			const sendBtn = document.getElementById('sendBtn');
			if (sendBtn) sendBtn.disabled = true;
		}

		function enableButtons() {
			const sendBtn = document.getElementById('sendBtn');
			if (sendBtn) sendBtn.disabled = false;
		}

		// Copy message content function
		function copyMessageContent(messageDiv) {
			const contentDiv = messageDiv.querySelector('.message-content');
			if (contentDiv) {
				// Get text content, preserving line breaks
				const text = contentDiv.innerText || contentDiv.textContent;
				
				// Copy to clipboard
				navigator.clipboard.writeText(text).then(() => {
					// Show brief feedback
					const copyBtn = messageDiv.querySelector('.copy-btn');
					const originalHtml = copyBtn.innerHTML;
					copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
					copyBtn.style.color = '#4caf50';
					
					setTimeout(() => {
						copyBtn.innerHTML = originalHtml;
						copyBtn.style.color = '';
					}, 1000);
				}).catch(err => {
					console.error('Failed to copy message:', err);
				});
			}
		}
		
		function copyCodeBlock(codeId) {
			const codeElement = document.getElementById(codeId);
			if (codeElement) {
				const rawCode = codeElement.getAttribute('data-raw-code');
				if (rawCode) {
					// Decode HTML entities
					const decodedCode = rawCode.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
					navigator.clipboard.writeText(decodedCode).then(() => {
						// Show temporary feedback
						const copyBtn = codeElement.closest('.code-block-container').querySelector('.code-copy-btn');
						if (copyBtn) {
							const originalInnerHTML = copyBtn.innerHTML;
							copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
							copyBtn.style.color = '#4caf50';
							setTimeout(() => {
								copyBtn.innerHTML = originalInnerHTML;
								copyBtn.style.color = '';
							}, 1000);
						}
					}).catch(err => {
						console.error('Failed to copy code:', err);
					});
				}
			}
		}

		// Handle test connection results
		function handleTestResult(provider, message) {
			const providerMap = {
				'anthropic': { resultId: 'anthropicTestResult', btnId: 'testAnthropicBtn' },
				'azure': { resultId: 'azureTestResult', btnId: 'testAzureBtn' },
				'deepseek': { resultId: 'deepseekTestResult', btnId: 'testDeepSeekBtn' },
				'grok': { resultId: 'grokTestResult', btnId: 'testGrokBtn' }
			};

			const config = providerMap[provider];
			if (!config) return;

			const resultSpan = document.getElementById(config.resultId);
			const testBtn = document.getElementById(config.btnId);

			if (testBtn) testBtn.disabled = false;
			if (!resultSpan) return;

			if (message.success) {
				resultSpan.textContent = 'Connected!';
				resultSpan.className = 'test-result success';
				setTimeout(() => {
					resultSpan.textContent = '';
					resultSpan.className = 'test-result';
				}, 3000);
			} else {
				resultSpan.textContent = message.error || 'Connection failed';
				resultSpan.className = 'test-result error';
			}
		}

		window.addEventListener('message', event => {
			const message = event.data;

			switch (message.type) {
				case 'ready':
					addMessage(message.data, 'system');
					updateStatusWithTotals();
					break;
					
				case 'output':
					if (message.data.trim()) {
						let displayData = message.data;

						// Check if this is a usage limit message with Unix timestamp
						const usageLimitMatch = displayData.match(/API usage limit reached\\|(\\d+)/);
						if (usageLimitMatch) {
							const timestamp = parseInt(usageLimitMatch[1]);
							const date = new Date(timestamp * 1000);
							const readableDate = date.toLocaleString(
								undefined,
								{
									weekday: 'short',
									month: 'short',
									day: 'numeric',
									hour: 'numeric',
									minute: '2-digit',
									second: '2-digit',
									hour12: true,
									timeZoneName: 'short',
									year: 'numeric'
								}
							);
							displayData = displayData.replace(usageLimitMatch[0], \`API usage limit reached: \${readableDate}\`);
						}

						addMessage(parseSimpleMarkdown(displayData), 'claude');
					}
					updateStatusWithTotals();
					break;

				case 'streamText':
					// Handle streaming text - append to current streaming message
					appendToStreamingMessage(message.data);
					break;

				case 'streamEnd':
					// Finalize the streaming message
					finalizeStreamingMessage();
					break;

				case 'userInput':
					if (message.data.trim()) {
						addMessage(parseSimpleMarkdown(message.data), 'user');
					}
					break;
					
				case 'loading':
					// Legacy - no longer used
					break;

				case 'showLoading':
					showAnimatedLoading();
					updateStatusWithTotals();
					break;

				case 'hideLoading':
					hideAnimatedLoading();
					updateStatusWithTotals();
					break;

				case 'setProcessing':
					isProcessing = message.data;
					if (isProcessing) {
						startRequestTimer();
						showStopButton();
						disableButtons();
					} else {
						stopRequestTimer();
						hideStopButton();
						enableButtons();
					}
					updateStatusWithTotals();
					break;

				case 'clearLoading':
					// Legacy - hide animated loading
					hideAnimatedLoading();
					updateStatusWithTotals();
					break;
					
				case 'error':
					if (message.data.trim()) {
						addMessage(message.data, 'error');
					}
					updateStatusWithTotals();
					break;
					
				case 'toolUse':
					if (typeof message.data === 'object') {
						addToolUseMessage(message.data);
					} else if (message.data.trim()) {
						addMessage(message.data, 'tool');
					}
					break;
					
				case 'toolResult':
							addToolResultMessage(message.data);
					break;
					
				case 'thinking':
					if (message.data.trim()) {
						addMessage('💭 Thinking...' + parseSimpleMarkdown(message.data), 'thinking');
					}
					break;
					
				case 'sessionInfo':
					console.log('Session info:', message.data);
					if (message.data.sessionId) {
						showSessionInfo(message.data.sessionId);
						// Show detailed session information
						const sessionDetails = [
							\`🆔 Session ID: \${message.data.sessionId}\`,
							\`🔧 Tools Available: \${message.data.tools.length}\`,
							\`🖥️ MCP Servers: \${message.data.mcpServers ? message.data.mcpServers.length : 0}\`
						];
						//addMessage(sessionDetails.join('\\n'), 'system');
					}
					break;
					
				case 'imagePath':
					// Handle image file path response - show preview instead of path
					if (message.data && message.data.filePath) {
						// Update the last pasted image with the real file path (if it was a paste operation)
						const lastImage = attachedImages[attachedImages.length - 1];
						if (lastImage && lastImage.filePath.startsWith('pasted_image_')) {
							// Update the existing entry with the real path
							lastImage.filePath = message.data.filePath;
							lastImage.fileName = message.data.filePath.split(/[\\/\\\\]/).pop();
						} else {
							// This is from file picker, add new preview
							addImageToPreview(message.data.filePath);
						}
						messageInput.focus();
					} else if (message.path) {
						// Alternative format from file picker
						addImageToPreview(message.path);
						messageInput.focus();
					}
					break;
					
				case 'updateTokens':
					console.log('Tokens updated in real-time:', message.data);
					// Update token totals in real-time
					totalTokensInput = message.data.totalTokensInput || 0;
					totalTokensOutput = message.data.totalTokensOutput || 0;
					
					// Update status bar immediately
					updateStatusWithTotals();
					
					// Show detailed token breakdown for current message
					const currentTotal = (message.data.currentInputTokens || 0) + (message.data.currentOutputTokens || 0);
					if (currentTotal > 0) {
						let tokenBreakdown = \`📊 Tokens: \${currentTotal.toLocaleString()}\`;
						
						if (message.data.cacheCreationTokens || message.data.cacheReadTokens) {
							const cacheInfo = [];
							if (message.data.cacheCreationTokens) cacheInfo.push(\`\${message.data.cacheCreationTokens.toLocaleString()} cache created\`);
							if (message.data.cacheReadTokens) cacheInfo.push(\`\${message.data.cacheReadTokens.toLocaleString()} cache read\`);
							tokenBreakdown += \` • \${cacheInfo.join(' • ')}\`;
						}
						
						addMessage(tokenBreakdown, 'system');
					}
					break;
					
				case 'updateTotals':
					console.log('Totals updated:', message.data);
					console.log('Cost data received:', {
						totalCost: message.data.totalCost,
						currentCost: message.data.currentCost,
						previousTotalCost: totalCost
					});
					// Update local tracking variables
					totalCost = message.data.totalCost || 0;
					totalTokensInput = message.data.totalTokensInput || 0;
					totalTokensOutput = message.data.totalTokensOutput || 0;
					requestCount = message.data.requestCount || 0;
					
					// Update status bar with new totals
					updateStatusWithTotals();
					
					// Show current request info if available
					if (message.data.currentCost || message.data.currentDuration) {
						const currentCostStr = message.data.currentCost ? \`$\${message.data.currentCost.toFixed(4)}\` : 'N/A';
						const currentDurationStr = message.data.currentDuration ? \`\${message.data.currentDuration}ms\` : 'N/A';
						addMessage(\`Request completed - Cost: \${currentCostStr}, Duration: \${currentDurationStr}\`, 'system');
					}
					break;
					
				case 'sessionResumed':
					console.log('Session resumed:', message.data);
					showSessionInfo(message.data.sessionId);
					addMessage(\`📝 Resumed previous session\\n🆔 Session ID: \${message.data.sessionId}\\n💡 Your conversation history is preserved\`, 'system');
					break;
					
				case 'sessionCleared':
					console.log('Session cleared');
					// Clear all messages from UI
					messagesDiv.innerHTML = '';
					hideSessionInfo();
					// Show welcome screen again
					if (welcomeScreen && welcomeScreen.classList.contains('hidden')) {
						welcomeScreen.classList.remove('hidden');
					}
					// Reset totals
					totalCost = 0;
					totalTokensInput = 0;
					totalTokensOutput = 0;
					requestCount = 0;
					updateStatusWithTotals();
					break;
					
				case 'loginRequired':
					addMessage('🔐 Login Required\\n\\nYour API key is invalid or expired.\\nA terminal has been opened - please run the login process there.\\n\\nAfter logging in, come back to this chat to continue.', 'error');
					updateStatus('Login Required', 'error');
					break;
					
				case 'showRestoreOption':
					// Restore checkpoint button removed for cleaner UI
					// showRestoreContainer(message.data);
					break;
					
				case 'restoreProgress':
					addMessage('🔄 ' + message.data, 'system');
					break;
					
				case 'restoreSuccess':
					//hideRestoreContainer(message.data.commitSha);
					addMessage('✅ ' + message.data.message, 'system');
					break;
					
				case 'restoreError':
					addMessage('❌ ' + message.data, 'error');
					break;
					
				case 'workspaceFiles':
					filteredFiles = message.data;
					selectedFileIndex = -1;
					renderFileList();
					break;
					
				case 'conversationList':
					displayConversationList(message.data);
					break;
				case 'helpContent':
					displayHelpContent(message.data);
					break;
				case 'clipboardText':
					handleClipboardText(message.data);
					break;
				case 'modelSelected':
					// Update the UI with the current model
					currentModel = message.model;
					selectModel(message.model, true);
					break;
				case 'terminalOpened':
					// Display notification about checking the terminal
					addMessage(message.data, 'system');
					break;
				case 'permissionRequest':
					addPermissionRequestMessage(message.data);
					break;
				case 'mcpServersData':
					// Render MCP servers in settings tab
					renderMCPServers(message.data);
					break;
				case 'mcpServerAdded':
					// Reload servers and show success message
					loadMCPServers();
					addMessage('✅ MCP server "' + message.data.name + '" added successfully. Reload window to connect.', 'system');
					break;
				case 'mcpServerRemoved':
					// Reload servers
					loadMCPServers();
					addMessage('✅ MCP server "' + message.data.name + '" removed successfully', 'system');
					break;
				case 'mcpServerConnected':
					// Reload servers to update status
					loadMCPServers();
					break;
				case 'mcpServerDisconnected':
					// Reload servers to update status
					loadMCPServers();
					break;
				case 'permissionsData':
					// Update permissions UI
					renderPermissions(message.data);
					break;
				case 'anthropicTestResult':
					handleTestResult('anthropic', message);
					break;
				case 'azureTestResult':
					handleTestResult('azure', message);
					break;
				case 'deepseekTestResult':
					handleTestResult('deepseek', message);
					break;
				case 'grokTestResult':
					handleTestResult('grok', message);
					break;
			}
		});
		
		// Permission request functions
		function addPermissionRequestMessage(data) {
			const messagesDiv = document.getElementById('messages');
			const shouldScroll = shouldAutoScroll(messagesDiv);

			const messageDiv = document.createElement('div');
			messageDiv.className = 'message permission-request-new';

			const toolName = data.tool || 'Unknown Tool';

			// Create always allow button text with command styling for Bash
			let alwaysAllowText = \`Always Allow \${toolName}\`;
			let alwaysAllowDescription = \`Automatically approve all \${toolName} operations\`;
			let alwaysAllowTooltip = '';
			if (toolName === 'Bash' && data.pattern) {
				const pattern = data.pattern;
				// Remove the asterisk for display - show "npm i" instead of "npm i *"
				const displayPattern = pattern.replace(' *', '');
				const truncatedPattern = displayPattern.length > 40 ? displayPattern.substring(0, 40) + '...' : displayPattern;
				alwaysAllowText = \`Always Allow: <code>\${truncatedPattern}</code>\`;
				alwaysAllowDescription = \`Automatically approve this specific command\`;
				alwaysAllowTooltip = displayPattern.length > 40 ? \`title="\${displayPattern}"\` : '';
			}

			messageDiv.innerHTML = \`
				<div class="permission-card-new">
					<div class="permission-header-new">
						<div class="permission-title-section">
							<div class="permission-icon-new">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
									<path d="M7 11V7a5 5 0 0110 0v4"/>
								</svg>
							</div>
							<div>
								<div class="permission-title-new">Permission Required</div>
								<div class="permission-subtitle-new">Review this request before proceeding</div>
							</div>
						</div>
						<div class="permission-menu-new">
							<button class="permission-menu-btn-new" onclick="togglePermissionMenu('\${data.id}')" title="More options">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<circle cx="12" cy="5" r="2"/>
									<circle cx="12" cy="12" r="2"/>
									<circle cx="12" cy="19" r="2"/>
								</svg>
							</button>
							<div class="permission-menu-dropdown-new" id="permissionMenu-\${data.id}" style="display: none;">
								<button class="permission-menu-item-new" onclick="enableYoloMode('\${data.id}')">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
									</svg>
									<div>
										<div class="menu-item-title">Enable Auto-Approve Mode</div>
										<div class="menu-item-subtitle">Auto-allow all future permissions</div>
									</div>
								</button>
							</div>
						</div>
					</div>
					<div class="permission-body-new">
						<div class="permission-question">
							Allow <strong class="tool-name-highlight">\${toolName}</strong> to execute the tool call above?
						</div>
					</div>
					<div class="permission-actions-new">
						<button class="permission-btn-new deny-btn" onclick="respondToPermission('\${data.id}', false)">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"/>
								<line x1="15" y1="9" x2="9" y2="15"/>
								<line x1="9" y1="9" x2="15" y2="15"/>
							</svg>
							Deny
						</button>
						<button class="permission-btn-new always-allow-btn" onclick="respondToPermission('\${data.id}', true, true)" \${alwaysAllowTooltip}>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
							</svg>
							<div class="btn-text-content">
								<span class="btn-main-text">\${alwaysAllowText}</span>
								<span class="btn-sub-text">\${alwaysAllowDescription}</span>
							</div>
						</button>
						<button class="permission-btn-new allow-btn" onclick="respondToPermission('\${data.id}', true)">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
								<polyline points="22 4 12 14.01 9 11.01"/>
							</svg>
							Allow Once
						</button>
					</div>
				</div>
			\`;

			messagesDiv.appendChild(messageDiv);
			scrollToBottomIfNeeded(messagesDiv, shouldScroll);
		}
		
		function respondToPermission(id, approved, alwaysAllow = false) {
			// Send response back to extension
			vscode.postMessage({
				type: 'permissionResponse',
				id: id,
				approved: approved,
				alwaysAllow: alwaysAllow
			});

			// Update the UI to show the decision
			const permissionMsg = document.querySelector(\`.permission-request-new:has([onclick*="\${id}"])\`);
			if (permissionMsg) {
				const card = permissionMsg.querySelector('.permission-card-new');
				const actionsDiv = permissionMsg.querySelector('.permission-actions-new');
				const bodyDiv = permissionMsg.querySelector('.permission-body-new');

				let decisionText = approved ? 'Permission Granted' : 'Permission Denied';
				let decisionDescription = '';

				if (alwaysAllow && approved) {
					decisionText = 'Permission Granted & Always Allow Set';
					decisionDescription = 'This permission has been saved and will be auto-approved in the future';
				} else if (approved) {
					decisionDescription = 'This operation was allowed for this request only';
				} else {
					decisionDescription = 'This operation was denied and will not execute';
				}

				const decisionClass = approved ? 'approved' : 'denied';
				const icon = approved ? (alwaysAllow ? 'shield-check' : 'check-circle') : 'x-circle';

				// Hide action buttons
				actionsDiv.style.display = 'none';

				// Add decision status
				const decisionDiv = document.createElement('div');
				decisionDiv.className = \`permission-decision-new \${decisionClass}\`;
				decisionDiv.innerHTML = \`
					<div class="decision-icon">
						\${icon === 'shield-check' ? \`
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
								<path d="M9 12l2 2 4-4"/>
							</svg>
						\` : icon === 'check-circle' ? \`
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
								<polyline points="22 4 12 14.01 9 11.01"/>
							</svg>
						\` : \`
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"/>
								<line x1="15" y1="9" x2="9" y2="15"/>
								<line x1="9" y1="9" x2="15" y2="15"/>
							</svg>
						\`}
					</div>
					<div class="decision-content">
						<div class="decision-title">\${decisionText}</div>
						<div class="decision-description">\${decisionDescription}</div>
					</div>
				\`;

				bodyDiv.appendChild(decisionDiv);
				card.classList.add('permission-resolved', decisionClass);
			}
		}

		function togglePermissionMenu(permissionId) {
			const menu = document.getElementById(\`permissionMenu-\${permissionId}\`);
			const isVisible = menu.style.display !== 'none';
			
			// Close all other permission menus
			document.querySelectorAll('.permission-menu-dropdown').forEach(dropdown => {
				dropdown.style.display = 'none';
			});
			
			// Toggle this menu
			menu.style.display = isVisible ? 'none' : 'block';
		}

		function enableYoloMode(permissionId) {
			// Hide the menu
			document.getElementById(\`permissionMenu-\${permissionId}\`).style.display = 'none';
			
			// Send message to enable YOLO mode
			vscode.postMessage({
				type: 'enableYoloMode'
			});
			
			// Auto-approve this permission
			respondToPermission(permissionId, true);
			
			// Show notification
			addMessage('⚡ YOLO Mode enabled! All future permissions will be automatically allowed.', 'system');
		}

		// Close permission menus when clicking outside
		document.addEventListener('click', function(event) {
			if (!event.target.closest('.permission-menu')) {
				document.querySelectorAll('.permission-menu-dropdown').forEach(dropdown => {
					dropdown.style.display = 'none';
				});
			}
		});

		// Session management functions
		function newSession() {
			vscode.postMessage({
				type: 'newSession'
			});
		}

		function restoreToCommit(commitSha) {
			console.log('Restore button clicked for commit:', commitSha);
			vscode.postMessage({
				type: 'restoreCommit',
				commitSha: commitSha
			});
		}

		function showRestoreContainer(data) {
			const messagesDiv = document.getElementById('messages');
			const shouldScroll = shouldAutoScroll(messagesDiv);
			
			const restoreContainer = document.createElement('div');
			restoreContainer.className = 'restore-container';
			restoreContainer.id = \`restore-\${data.sha}\`;
			
			const timeAgo = new Date(data.timestamp).toLocaleTimeString();
			const shortSha = data.sha ? data.sha.substring(0, 8) : 'unknown';
			
			restoreContainer.innerHTML = \`
				<button class="restore-btn dark" onclick="restoreToCommit('\${data.sha}')">
					Restore checkpoint
				</button>
				<span class="restore-date">\${timeAgo}</span>
			\`;
			
			messagesDiv.appendChild(restoreContainer);
			scrollToBottomIfNeeded(messagesDiv, shouldScroll);
		}

		function hideRestoreContainer(commitSha) {
			const container = document.getElementById(\`restore-\${commitSha}\`);
			if (container) {
				container.remove();
			}
		}
		
		function showSessionInfo(sessionId) {
			// const sessionInfo = document.getElementById('sessionInfo');
			// const sessionIdSpan = document.getElementById('sessionId');
			const sessionStatus = document.getElementById('sessionStatus');
			const newSessionBtn = document.getElementById('newSessionBtn');
			const historyBtn = document.getElementById('historyBtn');
			
			if (sessionStatus && newSessionBtn) {
				// sessionIdSpan.textContent = sessionId.substring(0, 8);
				// sessionIdSpan.title = \`Full session ID: \${sessionId} (click to copy)\`;
				// sessionIdSpan.style.cursor = 'pointer';
				// sessionIdSpan.onclick = () => copySessionId(sessionId);
				// sessionInfo.style.display = 'flex';
				sessionStatus.style.display = 'none';
				newSessionBtn.style.display = 'block';
				if (historyBtn) historyBtn.style.display = 'block';
			}
		}
		
		function copySessionId(sessionId) {
			navigator.clipboard.writeText(sessionId).then(() => {
				// Show temporary feedback
				const sessionIdSpan = document.getElementById('sessionId');
				if (sessionIdSpan) {
					const originalText = sessionIdSpan.textContent;
					sessionIdSpan.textContent = 'Copied!';
					setTimeout(() => {
						sessionIdSpan.textContent = originalText;
					}, 1000);
				}
			}).catch(err => {
				console.error('Failed to copy session ID:', err);
			});
		}
		
		function hideSessionInfo() {
			// const sessionInfo = document.getElementById('sessionInfo');
			const sessionStatus = document.getElementById('sessionStatus');
			const newSessionBtn = document.getElementById('newSessionBtn');
			const historyBtn = document.getElementById('historyBtn');
			
			if (sessionStatus && newSessionBtn) {
				// sessionInfo.style.display = 'none';
				sessionStatus.style.display = 'none';

				// Always show new session
				newSessionBtn.style.display = 'block';
				// Keep history button visible - don't hide it
				if (historyBtn) historyBtn.style.display = 'block';
			}
		}

		updateStatus('Initializing...', 'disconnected');
		

		function parseSimpleMarkdown(markdown) {
			// First, handle code blocks before line-by-line processing
			let processedMarkdown = markdown;
			
			// Store code blocks temporarily to protect them from further processing
			const codeBlockPlaceholders = [];
			
			// Handle multi-line code blocks with triple backticks
			// Using RegExp constructor to avoid backtick conflicts in template literal
			const codeBlockRegex = new RegExp('\\\`\\\`\\\`(\\\\w*)\\n([\\\\s\\\\S]*?)\\\`\\\`\\\`', 'g');
			processedMarkdown = processedMarkdown.replace(codeBlockRegex, function(match, lang, code) {
				const language = lang || 'plaintext';
				// Process code line by line to preserve formatting like diff implementation
				const codeLines = code.split('\\n');
				let codeHtml = '';
				
				for (const line of codeLines) {
					const escapedLine = escapeHtml(line);
					codeHtml += '<div class="code-line">' + escapedLine + '</div>';
				}
				
				// Create unique ID for this code block
				const codeId = 'code_' + Math.random().toString(36).substr(2, 9);
				const escapedCode = escapeHtml(code);
				
				const codeBlockHtml = '<div class="code-block-container"><div class="code-block-header"><span class="code-block-language">' + language + '</span><button class="code-copy-btn" onclick="copyCodeBlock(\\\'' + codeId + '\\\')" title="Copy code"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg></button></div><pre class="code-block"><code class="language-' + language + '" id="' + codeId + '" data-raw-code="' + escapedCode.replace(/"/g, '&quot;') + '">' + codeHtml + '</code></pre></div>';
				
				// Store the code block and return a placeholder
				const placeholder = '__CODEBLOCK_' + codeBlockPlaceholders.length + '__';
				codeBlockPlaceholders.push(codeBlockHtml);
				return placeholder;
			});
			
			// Handle inline code with single backticks
			const inlineCodeRegex = new RegExp('\\\`([^\\\`]+)\\\`', 'g');
			processedMarkdown = processedMarkdown.replace(inlineCodeRegex, '<code>$1</code>');

			// Handle tables - detect and convert markdown tables to HTML
			const tablePlaceholders = [];
			const tableRegex = /((?:^|\\n)\\|[^\\n]+\\|(?:\\n\\|[-:\\s|]+\\|)?(?:\\n\\|[^\\n]+\\|)+)/g;
			processedMarkdown = processedMarkdown.replace(tableRegex, function(match) {
				const rows = match.trim().split('\\n').filter(row => row.trim());
				if (rows.length < 2) return match; // Not a valid table

				let tableHtml = '<div class="markdown-table-container"><table class="markdown-table">';
				let isHeader = true;
				let skipNext = false;

				for (let i = 0; i < rows.length; i++) {
					const row = rows[i].trim();

					// Skip separator row (|---|---|)
					if (/^\\|[\\s-:|]+\\|$/.test(row)) {
						skipNext = false;
						continue;
					}

					// Parse cells
					const cells = row.split('|').filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1);

					if (isHeader) {
						tableHtml += '<thead><tr>';
						cells.forEach(cell => {
							let cellContent = cell.trim();
							// Process bold text in header cells
							cellContent = cellContent.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
							tableHtml += '<th>' + cellContent + '</th>';
						});
						tableHtml += '</tr></thead><tbody>';
						isHeader = false;
					} else {
						tableHtml += '<tr>';
						cells.forEach(cell => {
							// Process formatting in table cells
							let cellContent = cell.trim();
							// Bold text
							cellContent = cellContent.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
							// Italic text
							cellContent = cellContent.replace(/(?<!\\*)\\*(?!\\*)(.*?)\\*(?!\\*)/g, '<em>$1</em>');
							// Links [text](url)
							cellContent = cellContent.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
							// Auto-link plain URLs
							cellContent = cellContent.replace(/(?<!href=")(?<!">)(https?:\\/\\/[^\\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
							// Inline code
							cellContent = cellContent.replace(/\\\`([^\\\`]+)\\\`/g, '<code>$1</code>');
							tableHtml += '<td>' + cellContent + '</td>';
						});
						tableHtml += '</tr>';
					}
				}

				tableHtml += '</tbody></table></div>';

				const placeholder = '__TABLE_' + tablePlaceholders.length + '__';
				tablePlaceholders.push(tableHtml);
				return '\\n' + placeholder + '\\n';
			});

			const lines = processedMarkdown.split('\\n');
			let html = '';
			let inUnorderedList = false;
			let inOrderedList = false;

			for (let line of lines) {
				line = line.trim();
				
				// Check if this is a code block placeholder
				if (line.startsWith('__CODEBLOCK_') && line.endsWith('__')) {
					// This is a code block placeholder, don't process it
					html += line;
					continue;
				}

				// Check if this is a table placeholder
				if (line.startsWith('__TABLE_') && line.endsWith('__')) {
					// This is a table placeholder, don't process it
					html += line;
					continue;
				}

				// Bold
				line = line.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');

				// Italic - only apply when underscores are surrounded by whitespace or at beginning/end
				line = line.replace(/(?<!\\*)\\*(?!\\*)(.*?)\\*(?!\\*)/g, '<em>$1</em>');
				line = line.replace(/(^|\\s)_([^_\\s][^_]*[^_\\s]|[^_\\s])_(?=\\s|$)/g, '$1<em>$2</em>');

				// Links [text](url)
				line = line.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

				// Auto-link plain URLs (but not already in href)
				line = line.replace(/(?<!href=")(?<!">)(https?:\\/\\/[^\\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

				// Headers
				if (/^####\\s+/.test(line)) {
				html += '<h4>' + line.replace(/^####\\s+/, '') + '</h4>';
				continue;
				} else if (/^###\\s+/.test(line)) {
				html += '<h3>' + line.replace(/^###\\s+/, '') + '</h3>';
				continue;
				} else if (/^##\\s+/.test(line)) {
				html += '<h2>' + line.replace(/^##\\s+/, '') + '</h2>';
				continue;
				} else if (/^#\\s+/.test(line)) {
				html += '<h1>' + line.replace(/^#\\s+/, '') + '</h1>';
				continue;
				}

				// Ordered list
				if (/^\\d+\\.\\s+/.test(line)) {
				if (!inOrderedList) {
					html += '<ol>';
					inOrderedList = true;
				}
				const item = line.replace(/^\\d+\\.\\s+/, '');
				html += '<li>' + item + '</li>';
				continue;
				}

				// Unordered list
				if (line.startsWith('- ')) {
				if (!inUnorderedList) {
					html += '<ul>';
					inUnorderedList = true;
				}
				html += '<li>' + line.slice(2) + '</li>';
				continue;
				}

				// Close lists
				if (inUnorderedList) {
				html += '</ul>';
				inUnorderedList = false;
				}
				if (inOrderedList) {
				html += '</ol>';
				inOrderedList = false;
				}

				// Paragraph or break
				if (line !== '') {
				html += '<p>' + line + '</p>';
				} else {
				html += '<br>';
				}
			}

			if (inUnorderedList) html += '</ul>';
			if (inOrderedList) html += '</ol>';

			// Restore code block placeholders
			for (let i = 0; i < codeBlockPlaceholders.length; i++) {
				const placeholder = '__CODEBLOCK_' + i + '__';
				html = html.replace(placeholder, codeBlockPlaceholders[i]);
			}

			// Restore table placeholders
			for (let i = 0; i < tablePlaceholders.length; i++) {
				const placeholder = '__TABLE_' + i + '__';
				html = html.replace(placeholder, tablePlaceholders[i]);
			}

			return html;
		}

		// Conversation history functions
		function toggleConversationHistory() {
			const historyDiv = document.getElementById('conversationHistory');
			const chatContainer = document.getElementById('chatContainer');
			
			if (historyDiv.style.display === 'none') {
				// Show conversation history
				requestConversationList();
				historyDiv.style.display = 'block';
				chatContainer.style.display = 'none';
			} else {
				// Hide conversation history
				historyDiv.style.display = 'none';
				chatContainer.style.display = 'flex';
			}
		}

		function requestConversationList() {
			vscode.postMessage({
				type: 'getConversationList'
			});
		}

		function loadConversation(filename) {
			console.log('Loading conversation:', filename);
			vscode.postMessage({
				type: 'loadConversation',
				filename: filename
			});
			
			// Hide conversation history and show chat
			toggleConversationHistory();
		}

		// File picker functions
		function showFilePicker() {
			// Request initial file list from VS Code
			vscode.postMessage({
				type: 'getWorkspaceFiles',
				searchTerm: ''
			});
			
			// Show modal
			filePickerModal.style.display = 'flex';
			fileSearchInput.focus();
			selectedFileIndex = -1;
		}

		function hideFilePicker() {
			filePickerModal.style.display = 'none';
			fileSearchInput.value = '';
			selectedFileIndex = -1;
		}

		function getFileIcon(filename) {
			const ext = filename.split('.').pop()?.toLowerCase();
			switch (ext) {
				case 'js': case 'jsx': case 'ts': case 'tsx': return '📄';
				case 'html': case 'htm': return '🌐';
				case 'css': case 'scss': case 'sass': return '🎨';
				case 'json': return '📋';
				case 'md': return '📝';
				case 'py': return '🐍';
				case 'java': return '☕';
				case 'cpp': case 'c': case 'h': return '⚙️';
				case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return '🖼️';
				case 'pdf': return '📄';
				case 'zip': case 'tar': case 'gz': return '📦';
				default: return '📄';
			}
		}

		function renderFileList() {
			fileList.innerHTML = '';
			
			filteredFiles.forEach((file, index) => {
				const fileItem = document.createElement('div');
				fileItem.className = 'file-item';
				if (index === selectedFileIndex) {
					fileItem.classList.add('selected');
				}
				
				fileItem.innerHTML = \`
					<span class="file-icon">\${getFileIcon(file.name)}</span>
					<div class="file-info">
						<div class="file-name">\${file.name}</div>
						<div class="file-path">\${file.path}</div>
					</div>
				\`;
				
				fileItem.addEventListener('click', () => {
					selectFile(file);
				});
				
				fileList.appendChild(fileItem);
			});
		}

		function selectFile(file) {
			// Insert file path at cursor position
			const cursorPos = messageInput.selectionStart;
			const textBefore = messageInput.value.substring(0, cursorPos);
			const textAfter = messageInput.value.substring(cursorPos);
			
			// Replace the @ symbol with the file path
			const beforeAt = textBefore.substring(0, textBefore.lastIndexOf('@'));
			const newText = beforeAt + '@' + file.path + ' ' + textAfter;
			
			messageInput.value = newText;
			messageInput.focus();
			
			// Set cursor position after the inserted path
			const newCursorPos = beforeAt.length + file.path.length + 2;
			messageInput.setSelectionRange(newCursorPos, newCursorPos);
			
			hideFilePicker();
			adjustTextareaHeight();
		}

		function filterFiles(searchTerm) {
			// Send search request to backend instead of filtering locally
			vscode.postMessage({
				type: 'getWorkspaceFiles',
				searchTerm: searchTerm
			});
			selectedFileIndex = -1;
		}

		// Image handling functions
		function selectImage() {
			// Use VS Code's native file picker instead of browser file picker
			vscode.postMessage({
				type: 'selectImageFile'
			});
		}

		function addImageToPreview(filePath, base64Data = null) {
			// Create image preview item
			const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
			const fileName = filePath.split(/[\\/\\\\]/).pop();

			// Store image data
			attachedImages.push({
				id: imageId,
				filePath: filePath,
				base64Data: base64Data,
				fileName: fileName
			});

			// Create preview element
			const previewItem = document.createElement('div');
			previewItem.className = 'image-preview-item';
			previewItem.id = imageId;
			previewItem.innerHTML = \`
				<img src="\${base64Data || 'vscode-file://vscode-app/' + filePath.replace(/\\\\/g, '/')}" alt="\${fileName}" />
				<button class="image-remove-btn" onclick="removeAttachedImage('\${imageId}')" title="Remove image">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
					</svg>
				</button>
			\`;

			// Show container and add preview
			imagePreviewContainer.style.display = 'flex';
			imagePreviewContainer.appendChild(previewItem);

			// Show feedback
			showImageAddedFeedback(fileName);
		}

		function removeAttachedImage(imageId) {
			// Remove from array
			attachedImages = attachedImages.filter(img => img.id !== imageId);

			// Remove from DOM
			const element = document.getElementById(imageId);
			if (element) {
				element.remove();
			}

			// Hide container if no images
			if (attachedImages.length === 0) {
				imagePreviewContainer.style.display = 'none';
			}
		}

		function clearAttachedImages() {
			attachedImages = [];
			imagePreviewContainer.innerHTML = '';
			imagePreviewContainer.style.display = 'none';
		}

		function showImageAddedFeedback(fileName) {
			// Create temporary feedback element
			const feedback = document.createElement('div');
			feedback.textContent = \`Added: \${fileName}\`;
			feedback.style.cssText = \`
				position: fixed;
				top: 20px;
				right: 20px;
				background: var(--vscode-notifications-background);
				color: var(--vscode-notifications-foreground);
				padding: 8px 12px;
				border-radius: 4px;
				font-size: 12px;
				z-index: 1000;
				opacity: 0;
				transition: opacity 0.3s ease;
			\`;
			
			document.body.appendChild(feedback);
			
			// Animate in
			setTimeout(() => feedback.style.opacity = '1', 10);
			
			// Animate out and remove
			setTimeout(() => {
				feedback.style.opacity = '0';
				setTimeout(() => feedback.remove(), 300);
			}, 2000);
		}

		function displayConversationList(conversations) {
			const listDiv = document.getElementById('conversationList');
			listDiv.innerHTML = '';

			if (conversations.length === 0) {
				listDiv.innerHTML = '<p style="text-align: center; color: var(--vscode-descriptionForeground);">No conversations found</p>';
				return;
			}

			conversations.forEach(conv => {
				const item = document.createElement('div');
				item.className = 'conversation-item';

				const date = new Date(conv.startTime).toLocaleDateString();
				const time = new Date(conv.startTime).toLocaleTimeString();

				item.innerHTML = \`
					<div class="conversation-content" style="flex: 1; min-width: 0;">
						<div class="conversation-title">\${conv.firstUserMessage.substring(0, 60)}\${conv.firstUserMessage.length > 60 ? '...' : ''}</div>
						<div class="conversation-meta">\${date} at \${time} • \${conv.messageCount} messages • $\${conv.totalCost.toFixed(3)}</div>
						<div class="conversation-preview">Last: \${conv.lastUserMessage.substring(0, 80)}\${conv.lastUserMessage.length > 80 ? '...' : ''}</div>
					</div>
					<button class="conversation-delete-btn" title="Delete conversation">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				\`;

				// Add click handler for loading conversation (on content area only)
				const contentArea = item.querySelector('.conversation-content');
				contentArea.onclick = () => loadConversation(conv.filename);

				// Add click handler for delete button
				const deleteBtn = item.querySelector('.conversation-delete-btn');
				deleteBtn.onclick = (e) => {
					e.stopPropagation();
					deleteConversation(conv.filename);
				};

				listDiv.appendChild(item);
			});
		}

		function deleteConversation(filename) {
			if (confirm('Are you sure you want to delete this conversation?')) {
				vscode.postMessage({
					type: 'deleteConversation',
					filename: filename
				});
			}
		}

		function displayHelpContent(content) {
			// Use markdown-it library (same as VS Code uses) for proper markdown parsing
			let helpHtml = '';

			// Check if markdownit is available
			if (typeof markdownit !== 'undefined') {
				try {
					// Create markdown-it instance with VS Code-like settings
					const md = markdownit({
						html: true,
						linkify: true,
						typographer: true,
						breaks: false
					});
					helpHtml = md.render(content);
				} catch (error) {
					console.warn('markdown-it parsing failed, using fallback:', error);
					helpHtml = parseSimpleMarkdown(content);
				}
			} else {
				// Fallback
				helpHtml = parseSimpleMarkdown(content);
			}

			const messagesDiv = document.getElementById('messages');
			const shouldScroll = shouldAutoScroll(messagesDiv);

			// Create the help content container - no rounded box, just clean markdown
			const messageDiv = document.createElement('div');
			messageDiv.className = 'markdown-preview-content';

			const contentDiv = document.createElement('div');
			contentDiv.className = 'vscode-markdown-body';
			contentDiv.innerHTML = helpHtml;

			messageDiv.appendChild(contentDiv);
			messagesDiv.appendChild(messageDiv);

			if (shouldScroll) {
				messagesDiv.scrollTop = messagesDiv.scrollHeight;
			}
		}

		function handleClipboardText(text) {
			if (!text) return;
			
			// Insert text at cursor position
			const start = messageInput.selectionStart;
			const end = messageInput.selectionEnd;
			const currentValue = messageInput.value;
			
			const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
			messageInput.value = newValue;
			
			// Set cursor position after pasted text
			const newCursorPos = start + text.length;
			messageInput.setSelectionRange(newCursorPos, newCursorPos);
			
			// Trigger input event to adjust height
			messageInput.dispatchEvent(new Event('input', { bubbles: true }));
		}

		// Settings functions

		function toggleSettings() {
			const settingsModal = document.getElementById('settingsModal');
			if (settingsModal.style.display === 'none') {
				// Request current settings from VS Code
				vscode.postMessage({
					type: 'getSettings'
				});
				// Request current permissions
				vscode.postMessage({
					type: 'getPermissions'
				});
				settingsModal.style.display = 'flex';
			} else {
				hideSettingsModal();
			}
		}

		function hideSettingsModal() {
			document.getElementById('settingsModal').style.display = 'none';
		}

		// Settings tab switching
		function switchSettingsTab(tabName) {
			// Update tab buttons
			document.querySelectorAll('.settings-tab').forEach(tab => tab.classList.remove('active'));

			// Map tab names to their IDs (handle case sensitivity for WSL)
			const tabIdMap = {
				'model': 'tabModel',
				'mcp': 'tabMCP',
				'wsl': 'tabWSL',
				'permissions': 'tabPermissions'
			};

			const tabElement = document.getElementById(tabIdMap[tabName]);
			if (tabElement) {
				tabElement.classList.add('active');
			}

			// Update tab content
			document.getElementById('modelTabContent').style.display = tabName === 'model' ? 'block' : 'none';
			document.getElementById('mcpTabContent').style.display = tabName === 'mcp' ? 'block' : 'none';
			document.getElementById('wslTabContent').style.display = tabName === 'wsl' ? 'block' : 'none';
			document.getElementById('permissionsTabContent').style.display = tabName === 'permissions' ? 'block' : 'none';

			// Load MCP servers when switching to MCP tab
			if (tabName === 'mcp') {
				loadMCPServers();
			}
		}

		// Provider switching in settings
		function onSettingsProviderChange(autoSave = false) {
			const provider = document.getElementById('settings-provider').value;
			document.getElementById('anthropicConfigSection').style.display = provider === 'anthropic' ? 'block' : 'none';
			document.getElementById('azureConfigSection').style.display = provider === 'azure' ? 'block' : 'none';
			document.getElementById('deepseekConfigSection').style.display = provider === 'deepseek' ? 'block' : 'none';
			document.getElementById('grokConfigSection').style.display = provider === 'grok' ? 'block' : 'none';

			// Update global provider state
			currentProvider = provider;

			// Update model selector dropdown based on provider
			updateModelSelectorOptions(provider);

			// Only auto-save if explicitly requested (not when loading settings)
			// Settings are now saved only when user clicks "Save Settings" button
		}

		// Update model selector options based on provider
		function updateModelSelectorOptions(provider) {
			const modelSelector = document.getElementById('modelSelector');
			if (!modelSelector) return;

			// Clear existing options
			modelSelector.innerHTML = '';

			let defaultModel = '';

			if (provider === 'anthropic') {
				const claudeModels = [
					{ value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
					{ value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
					{ value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
					{ value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' }
				];
				claudeModels.forEach(model => {
					const option = document.createElement('option');
					option.value = model.value;
					option.textContent = model.label;
					modelSelector.appendChild(option);
				});
				defaultModel = 'claude-sonnet-4-20250514';
			} else if (provider === 'azure') {
				const azureModels = [
					{ value: 'gpt-4o', label: 'GPT-4o' },
					{ value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
					{ value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
					{ value: 'gpt-4', label: 'GPT-4' },
					{ value: 'gpt-35-turbo', label: 'GPT-3.5 Turbo' }
				];
				azureModels.forEach(model => {
					const option = document.createElement('option');
					option.value = model.value;
					option.textContent = model.label;
					modelSelector.appendChild(option);
				});
				defaultModel = 'gpt-4o';
			} else if (provider === 'deepseek') {
				const deepseekModels = [
					{ value: 'deepseek-chat', label: 'DeepSeek Chat' },
					{ value: 'deepseek-coder', label: 'DeepSeek Coder' },
					{ value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' }
				];
				deepseekModels.forEach(model => {
					const option = document.createElement('option');
					option.value = model.value;
					option.textContent = model.label;
					modelSelector.appendChild(option);
				});
				defaultModel = 'deepseek-chat';
			} else if (provider === 'grok') {
				const grokModels = [
					{ value: 'grok-beta', label: 'Grok Beta' },
					{ value: 'grok-vision-beta', label: 'Grok Vision Beta' }
				];
				grokModels.forEach(model => {
					const option = document.createElement('option');
					option.value = model.value;
					option.textContent = model.label;
					modelSelector.appendChild(option);
				});
				defaultModel = 'grok-beta';
			}

			// Set default value to ensure something is selected
			if (defaultModel) {
				modelSelector.value = defaultModel;
			}
		}

		// Handle model selector change
		function onModelSelectorChange() {
			// Settings are now saved only when user clicks "Save Settings" button
			// No auto-save on model change
		}

		// Toggle WSL options visibility
		function toggleWslOptions() {
			const wslEnabled = document.getElementById('wsl-enabled').checked;
			document.getElementById('wslOptions').style.display = wslEnabled ? 'block' : 'none';
		}

		// Test Anthropic connection
		function testAnthropicConnection() {
			const apiKey = document.getElementById('anthropic-api-key').value.trim();
			const modelSelector = document.getElementById('modelSelector');
			const model = modelSelector ? modelSelector.value : 'claude-sonnet-4-20250514';
			const resultSpan = document.getElementById('anthropicTestResult');
			const testBtn = document.getElementById('testAnthropicBtn');

			if (!apiKey) {
				resultSpan.textContent = 'Please enter an API key';
				resultSpan.className = 'test-result error';
				return;
			}

			testBtn.disabled = true;
			resultSpan.textContent = 'Testing...';
			resultSpan.className = 'test-result loading';

			vscode.postMessage({
				type: 'testAnthropicConnection',
				apiKey: apiKey,
				model: model
			});
		}

		// Test Azure connection
		function testAzureConnection() {
			const endpoint = document.getElementById('azure-endpoint').value.trim();
			const apiKey = document.getElementById('azure-api-key').value.trim();
			const deployment = document.getElementById('azure-deployment').value.trim();
			const apiVersion = document.getElementById('azure-version').value.trim();
			const resultSpan = document.getElementById('azureTestResult');
			const testBtn = document.getElementById('testAzureBtn');

			if (!endpoint || !apiKey || !deployment) {
				resultSpan.textContent = 'Please fill all required fields';
				resultSpan.className = 'test-result error';
				return;
			}

			testBtn.disabled = true;
			resultSpan.textContent = 'Testing...';
			resultSpan.className = 'test-result loading';

			vscode.postMessage({
				type: 'testAzureConnection',
				endpoint: endpoint,
				apiKey: apiKey,
				deployment: deployment,
				apiVersion: apiVersion || '2024-02-15-preview'
			});
		}

		// Test DeepSeek connection
		function testDeepSeekConnection() {
			const apiKey = document.getElementById('deepseek-api-key').value.trim();
			const modelSelector = document.getElementById('modelSelector');
			const model = modelSelector ? modelSelector.value : 'deepseek-chat';
			const resultSpan = document.getElementById('deepseekTestResult');
			const testBtn = document.getElementById('testDeepSeekBtn');

			if (!apiKey) {
				resultSpan.textContent = 'Please enter an API key';
				resultSpan.className = 'test-result error';
				return;
			}

			testBtn.disabled = true;
			resultSpan.textContent = 'Testing...';
			resultSpan.className = 'test-result loading';

			vscode.postMessage({
				type: 'testDeepSeekConnection',
				apiKey: apiKey,
				model: model
			});
		}

		function testGrokConnection() {
			const apiKey = document.getElementById('grok-api-key').value.trim();
			const modelSelector = document.getElementById('modelSelector');
			const model = modelSelector ? modelSelector.value : 'grok-beta';
			const resultSpan = document.getElementById('grokTestResult');
			const testBtn = document.getElementById('testGrokBtn');

			if (!apiKey) {
				resultSpan.textContent = 'Please enter an API key';
				resultSpan.className = 'test-result error';
				return;
			}

			testBtn.disabled = true;
			resultSpan.textContent = 'Testing...';
			resultSpan.className = 'test-result loading';

			vscode.postMessage({
				type: 'testGrokConnection',
				apiKey: apiKey,
				model: model
			});
		}

		function updateSettings() {
			// Get all settings elements with null checks
			const wslEnabledEl = document.getElementById('wsl-enabled');
			const wslDistroEl = document.getElementById('wsl-distro');
			const wslNodePathEl = document.getElementById('wsl-node-path');
			const wslClaudePathEl = document.getElementById('wsl-claude-path');
			const yoloModeEl = document.getElementById('yolo-mode');
			const settingsProviderEl = document.getElementById('settings-provider');
			const anthropicApiKeyEl = document.getElementById('anthropic-api-key');
			const modelSelectorEl = document.getElementById('modelSelector');
			const azureEndpointEl = document.getElementById('azure-endpoint');
			const azureApiKeyEl = document.getElementById('azure-api-key');
			const azureDeploymentEl = document.getElementById('azure-deployment');
			const azureVersionEl = document.getElementById('azure-version');
			const deepseekApiKeyEl = document.getElementById('deepseek-api-key');
			const grokApiKeyEl = document.getElementById('grok-api-key');

			const wslEnabled = wslEnabledEl ? wslEnabledEl.checked : false;
			const wslDistro = wslDistroEl ? wslDistroEl.value : 'Ubuntu';
			const wslNodePath = wslNodePathEl ? wslNodePathEl.value : '/usr/bin/node';
			const wslClaudePath = wslClaudePathEl ? wslClaudePathEl.value : '/usr/local/bin/claude';
			const yoloMode = yoloModeEl ? yoloModeEl.checked : false;
			const provider = settingsProviderEl ? settingsProviderEl.value : 'anthropic';
			const anthropicApiKey = anthropicApiKeyEl ? anthropicApiKeyEl.value : '';
			const selectedModel = modelSelectorEl ? modelSelectorEl.value : 'claude-sonnet-4-20250514';
			const azureEndpoint = azureEndpointEl ? azureEndpointEl.value : '';
			const azureApiKey = azureApiKeyEl ? azureApiKeyEl.value : '';
			const azureDeployment = azureDeploymentEl ? azureDeploymentEl.value : '';
			const azureVersion = azureVersionEl ? azureVersionEl.value : '2024-02-15-preview';
			const deepseekApiKey = deepseekApiKeyEl ? deepseekApiKeyEl.value : '';
			const grokApiKey = grokApiKeyEl ? grokApiKeyEl.value : '';

			// Send settings to VS Code immediately
			vscode.postMessage({
				type: 'updateSettings',
				settings: {
					'wsl.enabled': wslEnabled,
					'wsl.distro': wslDistro || 'Ubuntu',
					'wsl.nodePath': wslNodePath || '/usr/bin/node',
					'wsl.claudePath': wslClaudePath || '/usr/local/bin/claude',
					'permissions.yoloMode': yoloMode,
					'provider': provider,
					'anthropic.apiKey': anthropicApiKey,
					'anthropic.model': provider === 'anthropic' ? selectedModel : 'claude-sonnet-4-20250514',
					'azure.endpoint': azureEndpoint,
					'azure.apiKey': azureApiKey,
					'azure.deployment': azureDeployment,
					'azure.apiVersion': azureVersion,
					'azure.model': provider === 'azure' ? selectedModel : 'gpt-4o',
					'deepseek.apiKey': deepseekApiKey,
					'deepseek.model': provider === 'deepseek' ? selectedModel : 'deepseek-chat',
					'grok.apiKey': grokApiKey,
					'grok.model': provider === 'grok' ? selectedModel : 'grok-beta'
				}
			});
		}

		// Save all settings with visual feedback
		function saveAllSettings() {
			const statusEl = document.getElementById('settingsSaveStatus');

			// Call the existing updateSettings function
			updateSettings();

			// Show save confirmation
			if (statusEl) {
				statusEl.textContent = 'Settings saved!';
				statusEl.className = 'settings-save-status success';

				// Clear the message after 2 seconds
				setTimeout(() => {
					statusEl.textContent = '';
					statusEl.className = 'settings-save-status';
				}, 2000);
			}
		}

		// MCP Server Management Functions
		let currentMCPServers = [];
		let currentMCPServerType = 'remote';

		function loadMCPServers() {
			// Request MCP servers from VS Code
			vscode.postMessage({
				type: 'getMCPServers'
			});
		}

		function renderMCPServers(data) {
			const serverListEl = document.getElementById('mcpServerList');
			const servers = data.servers || [];
			const statuses = data.statuses || {};

			currentMCPServers = servers;

			if (servers.length === 0) {
				serverListEl.innerHTML = \`
					<div style="text-align: center; padding: 30px 20px; color: var(--vscode-descriptionForeground);">
						<div style="font-size: 32px; margin-bottom: 12px;">🔌</div>
						<div style="font-size: 12px; margin-bottom: 8px;">No MCP servers configured</div>
						<div style="font-size: 10px; color: var(--vscode-descriptionForeground);">
							Add a server to extend Code Pilot AI's capabilities
						</div>
					</div>
				\`;
				return;
			}

			// Separate local and remote servers
			const remoteServers = servers.filter(s => s.url);
			const localServers = servers.filter(s => !s.url);

			let html = '';

			// Remote Servers Section
			if (remoteServers.length > 0) {
				html += \`
					<div style="margin-bottom: 20px;">
						<h4 style="font-size: 11px; font-weight: 600; margin: 0 0 12px 0; color: var(--vscode-foreground);">Remote Servers (\${remoteServers.length})</h4>
						\${renderServerList(remoteServers, statuses)}
					</div>
				\`;
			}

			// Local Servers Section
			if (localServers.length > 0) {
				html += \`
					<div style="margin-bottom: 20px;">
						<h4 style="font-size: 11px; font-weight: 600; margin: 0 0 12px 0; color: var(--vscode-foreground);">Local Servers (\${localServers.length})</h4>
						\${renderServerList(localServers, statuses)}
					</div>
				\`;
			}

			serverListEl.innerHTML = html;
		}

		function renderServerList(servers, statuses) {
			let html = '';
			servers.forEach((server) => {
				const status = statuses[server.name] || { connected: false, toolCount: 0, enabled: true };
				const isEnabled = status.enabled !== undefined ? status.enabled : !server.disabled;
				const isConnected = status.connected && isEnabled;
				const statusClass = isConnected ? 'connected' : 'disconnected';
				const statusText = isEnabled ? (isConnected ? 'Connected' : 'Disconnected') : 'Disabled';
				const statusIcon = isConnected ? '🟢' : (isEnabled ? '🔴' : '⚫');
				const serverType = server.url ? 'Remote' : 'Local';
				const serverInfo = server.url || (server.command ? \`\${server.command}\${server.args ? ' ' + server.args.join(' ') : ''}\` : 'MCP Server');
				const serverNameEscaped = server.name.replace(/'/g, "\\\\'");
				const serverJsonEscaped = JSON.stringify(server).replace(/"/g, '&quot;');

				html += \`
					<div class="mcp-server-item" style="border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 12px; margin-bottom: 8px; background: var(--vscode-editor-background);">
						<div style="display: flex; justify-content: space-between; align-items: center;">
							<div style="flex: 1;">
								<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
									<span style="font-weight: 600; font-size: 12px;">\${server.name}</span>
									<span class="mcp-server-type-badge" style="font-size: 9px; padding: 2px 6px; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); border-radius: 3px;">\${serverType}</span>
								</div>
								<div style="font-size: 10px; color: var(--vscode-descriptionForeground); margin-bottom: 6px; word-break: break-all; font-family: monospace;">\${serverInfo}</div>
								<div style="display: flex; align-items: center; gap: 6px;">
									<span class="mcp-status-indicator \${statusClass}" style="font-size: 10px; display: flex; align-items: center; gap: 4px;">
										\${statusIcon} \${statusText}
									</span>
									\${isConnected ? \`<span style="font-size: 10px; color: var(--vscode-descriptionForeground);">• \${status.toolCount} tools</span>\` : ''}
								</div>
							</div>
							<div style="display: flex; align-items: center; gap: 8px;">
								<!-- Toggle Switch -->
								<label class="mcp-toggle-switch" style="position: relative; display: inline-block; width: 40px; height: 20px;">
									<input type="checkbox" class="mcp-toggle-input" data-server-name="\${serverNameEscaped}" \${isEnabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
									<span class="mcp-toggle-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--vscode-input-background); border: 1px solid var(--vscode-widget-border); border-radius: 20px; transition: 0.3s;"></span>
								</label>
								<!-- Edit Button -->
								<button class="btn outlined" onclick="editMCPServerSettings('\${serverNameEscaped}', \${serverJsonEscaped})" title="Edit server" style="font-size: 10px; padding: 4px 12px;">
									Edit
								</button>
								<!-- Remove Button -->
								<button class="btn outlined" onclick="removeMCPServerSettings('\${serverNameEscaped}')" title="Remove server" style="font-size: 10px; padding: 4px 12px; color: var(--vscode-errorForeground); border-color: var(--vscode-errorForeground);">
									Remove
								</button>
							</div>
						</div>
					</div>
				\`;
			});
			return html;
		}

		function showAddMCPServerForm() {
			document.getElementById('showAddMCPServerBtn').style.display = 'none';
			document.getElementById('addMCPServerForm').style.display = 'block';
			// Clear form
			document.getElementById('mcpServerName').value = '';
			document.getElementById('mcpServerURL').value = '';
			document.getElementById('mcpServerCommand').value = '';
			document.getElementById('mcpServerArgs').value = '';
			document.getElementById('mcpServerEnv').value = '';
		}

		function cancelAddMCPServer() {
			document.getElementById('showAddMCPServerBtn').style.display = 'block';
			document.getElementById('addMCPServerForm').style.display = 'none';

			// Reset form state
			document.getElementById('mcpServerName').disabled = false;
			document.querySelector('#addMCPServerForm h4').textContent = 'Add MCP Server';
			document.querySelector('#addMCPServerForm .btn.primary').textContent = 'Add Server';
			document.getElementById('addMCPServerForm').removeAttribute('data-edit-mode');
			document.getElementById('addMCPServerForm').removeAttribute('data-original-name');
		}

		function selectMCPType(type) {
			currentMCPServerType = type;

			// Update button states
			document.getElementById('mcpTypeRemote').className = type === 'remote' ? 'mcp-type-btn active' : 'mcp-type-btn';
			document.getElementById('mcpTypeLocal').className = type === 'local' ? 'mcp-type-btn active' : 'mcp-type-btn';

			// Update button styles
			const remoteBtn = document.getElementById('mcpTypeRemote');
			const localBtn = document.getElementById('mcpTypeLocal');

			if (type === 'remote') {
				remoteBtn.style.background = 'var(--vscode-button-background)';
				remoteBtn.style.color = 'var(--vscode-button-foreground)';
				remoteBtn.style.border = '1px solid var(--vscode-button-background)';
				localBtn.style.background = 'transparent';
				localBtn.style.color = 'inherit';
				localBtn.style.border = '1px solid var(--vscode-widget-border)';
			} else {
				localBtn.style.background = 'var(--vscode-button-background)';
				localBtn.style.color = 'var(--vscode-button-foreground)';
				localBtn.style.border = '1px solid var(--vscode-button-background)';
				remoteBtn.style.background = 'transparent';
				remoteBtn.style.color = 'inherit';
				remoteBtn.style.border = '1px solid var(--vscode-widget-border)';
			}

			// Toggle field visibility
			document.getElementById('mcpRemoteFields').style.display = type === 'remote' ? 'block' : 'none';
			document.getElementById('mcpLocalFields').style.display = type === 'local' ? 'block' : 'none';
		}

		function saveMCPServer() {
			const name = document.getElementById('mcpServerName').value.trim();
			const formEl = document.getElementById('addMCPServerForm');
			const isEditMode = formEl.getAttribute('data-edit-mode') === 'true';
			const originalName = formEl.getAttribute('data-original-name');

			if (!name) {
				alert('Please enter a server name');
				return;
			}

			// Check for duplicate names (skip check if editing same server)
			if (!isEditMode && currentMCPServers.some(s => s.name === name)) {
				alert('A server with this name already exists');
				return;
			}

			const serverConfig = {
				name,
				type: currentMCPServerType
			};

			if (currentMCPServerType === 'remote') {
				const url = document.getElementById('mcpServerURL').value.trim();
				if (!url) {
					alert('Please enter a server URL');
					return;
				}
				serverConfig.url = url;
			} else {
				const command = document.getElementById('mcpServerCommand').value.trim();
				if (!command) {
					alert('Please enter a command');
					return;
				}

				serverConfig.command = command;

				const argsInput = document.getElementById('mcpServerArgs').value.trim();
				if (argsInput) {
					serverConfig.args = argsInput.split(',').map(a => a.trim()).filter(a => a);
				}

				const envInput = document.getElementById('mcpServerEnv').value.trim();
				if (envInput) {
					const env = {};
					const pairs = envInput.split(',').map(p => p.trim()).filter(p => p);
					for (const pair of pairs) {
						const [key, ...valueParts] = pair.split('=');
						if (key && valueParts.length > 0) {
							env[key.trim()] = valueParts.join('=').trim();
						}
					}
					if (Object.keys(env).length > 0) {
						serverConfig.env = env;
					}
				}
			}

			// Send to VS Code
			if (isEditMode) {
				vscode.postMessage({
					type: 'updateMCPServer',
					originalName: originalName,
					server: serverConfig
				});
			} else {
				vscode.postMessage({
					type: 'addMCPServer',
					server: serverConfig
				});
			}

			// Close form
			cancelAddMCPServer();
		}

		function connectMCPServer(serverName) {
			vscode.postMessage({
				type: 'connectMCPServer',
				serverName
			});
		}

		function disconnectMCPServer(serverName) {
			vscode.postMessage({
				type: 'disconnectMCPServer',
				serverName
			});
		}

		function removeMCPServerSettings(serverName) {
			console.log('removeMCPServerSettings called with:', serverName);
			console.log('Sending removeMCPServer message:', serverName);
			// Send message to backend - webview doesn't support confirm() due to sandboxing
			vscode.postMessage({
				type: 'removeMCPServer',
				serverName: serverName
			});
		}

		function editMCPServerSettings(serverName, server) {
			// Populate the form with server data
			document.getElementById('mcpServerName').value = server.name;
			document.getElementById('mcpServerName').disabled = true; // Can't change name during edit

			if (server.url) {
				// Remote server
				currentMCPServerType = 'remote';
				document.getElementById('mcpServerURL').value = server.url;
				selectMCPType('remote');
			} else {
				// Local server
				currentMCPServerType = 'local';
				document.getElementById('mcpServerCommand').value = server.command || '';
				document.getElementById('mcpServerArgs').value = server.args ? server.args.join(', ') : '';

				if (server.env) {
					const envString = Object.entries(server.env).map(([k, v]) => \`\${k}=\${v}\`).join(', ');
					document.getElementById('mcpServerEnv').value = envString;
				}
				selectMCPType('local');
			}

			// Show the form in edit mode
			document.getElementById('showAddMCPServerBtn').style.display = 'none';
			document.getElementById('addMCPServerForm').style.display = 'block';

			// Change the form title and button text
			document.querySelector('#addMCPServerForm h4').textContent = 'Edit MCP Server';
			document.querySelector('#addMCPServerForm .btn.primary').textContent = 'Save Changes';

			// Store that we're in edit mode
			document.getElementById('addMCPServerForm').setAttribute('data-edit-mode', 'true');
			document.getElementById('addMCPServerForm').setAttribute('data-original-name', serverName);
		}

		// Add event delegation for MCP server toggle
		document.addEventListener('change', function(event) {
			const target = event.target;

			// Handle toggle switch
			if (target.classList.contains('mcp-toggle-input')) {
				const serverName = target.getAttribute('data-server-name');
				if (serverName) {
					if (target.checked) {
						connectMCPServer(serverName);
					} else {
						disconnectMCPServer(serverName);
					}
				}
			}
		});

		// Permissions management functions
		function renderPermissions(permissions) {
			const permissionsList = document.getElementById('permissionsList');

			if (!permissions || !permissions.alwaysAllow || Object.keys(permissions.alwaysAllow).length === 0) {
				permissionsList.innerHTML = \`
					<div class="permissions-empty-new">
						<div style="font-size: 48px; margin-bottom: 12px; opacity: 0.5;">🔒</div>
						<div style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">No Permissions Configured</div>
						<div style="font-size: 11px; color: var(--vscode-descriptionForeground);">
							Add permissions to allow specific tools to run without approval
						</div>
					</div>
				\`;
				return;
			}

			let html = '';

			for (const [toolName, permission] of Object.entries(permissions.alwaysAllow)) {
				if (permission === true) {
					// Tool is always allowed
					html += \`
						<div class="permission-card">
							<div class="permission-card-icon">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
									<path d="M9 12l2 2 4-4"/>
								</svg>
							</div>
							<div class="permission-card-content">
								<div class="permission-card-header">
									<span class="permission-tool-badge" data-tool="\${toolName}">\${toolName}</span>
									<span class="permission-scope-badge">All Operations</span>
								</div>
								<div class="permission-card-description">
									All \${toolName} operations are automatically approved
								</div>
							</div>
							<button class="permission-remove-btn-new" onclick="removePermission('\${toolName}', null)" title="Remove permission">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="18" y1="6" x2="6" y2="18"/>
									<line x1="6" y1="6" x2="18" y2="18"/>
								</svg>
							</button>
						</div>
					\`;
				} else if (Array.isArray(permission)) {
					// Tool has specific commands/patterns
					for (const command of permission) {
						const displayCommand = command.replace(' *', ''); // Remove asterisk for display
						html += \`
							<div class="permission-card">
								<div class="permission-card-icon">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M9 11l3 3L22 4"/>
										<path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
									</svg>
								</div>
								<div class="permission-card-content">
									<div class="permission-card-header">
										<span class="permission-tool-badge" data-tool="\${toolName}">\${toolName}</span>
										<span class="permission-scope-badge-specific">Specific Command</span>
									</div>
									<div class="permission-card-description">
										<code class="permission-command-code">\${displayCommand}</code>
									</div>
								</div>
								<button class="permission-remove-btn-new" onclick="removePermission('\${toolName}', '\${escapeHtml(command)}')" title="Remove permission">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<line x1="18" y1="6" x2="6" y2="18"/>
										<line x1="6" y1="6" x2="18" y2="18"/>
									</svg>
								</button>
							</div>
						\`;
					}
				}
			}

			permissionsList.innerHTML = html;
		}
		
		function removePermission(toolName, command) {
			vscode.postMessage({
				type: 'removePermission',
				toolName: toolName,
				command: command
			});
		}
		
		function showAddPermissionForm() {
			document.getElementById('showAddPermissionBtn').style.display = 'none';
			document.getElementById('addPermissionForm').style.display = 'block';
			
			// Focus on the tool select dropdown
			setTimeout(() => {
				document.getElementById('addPermissionTool').focus();
			}, 100);
		}
		
		function hideAddPermissionForm() {
			document.getElementById('showAddPermissionBtn').style.display = 'flex';
			document.getElementById('addPermissionForm').style.display = 'none';
			
			// Clear form inputs
			document.getElementById('addPermissionTool').value = '';
			document.getElementById('addPermissionCommand').value = '';
			document.getElementById('addPermissionCommand').style.display = 'none';
		}
		
		function toggleCommandInput() {
			const toolSelect = document.getElementById('addPermissionTool');
			const commandFieldContainer = document.getElementById('commandFieldContainer');
			const commandInput = document.getElementById('addPermissionCommand');
			const hintDiv = document.getElementById('permissionsFormHint');

			if (toolSelect.value === 'Bash') {
				commandFieldContainer.style.display = 'block';
				hintDiv.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>Use patterns like <code>npm install *</code> or <code>git add *</code> for specific commands';
			} else if (toolSelect.value === '') {
				commandFieldContainer.style.display = 'none';
				commandInput.value = '';
				hintDiv.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>Select a tool to grant automatic permission';
			} else {
				commandFieldContainer.style.display = 'none';
				commandInput.value = '';
				const toolName = toolSelect.value.split(' - ')[0]; // Extract just the tool name
				hintDiv.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>This will automatically approve all <strong>' + toolName + '</strong> operations without asking';
			}
		}
		
		function addPermission() {
			const toolSelect = document.getElementById('addPermissionTool');
			const commandInput = document.getElementById('addPermissionCommand');
			const addBtn = document.getElementById('addPermissionBtn');

			const toolValue = toolSelect.value.trim();
			const toolName = toolValue.split(' - ')[0]; // Extract just the tool name
			const command = commandInput.value.trim();

			if (!toolName) {
				return;
			}

			// Disable button during processing
			addBtn.disabled = true;
			addBtn.textContent = 'Adding...';

			vscode.postMessage({
				type: 'addPermission',
				toolName: toolName,
				command: command || null
			});

			// Clear form and hide it
			toolSelect.value = '';
			commandInput.value = '';
			hideAddPermissionForm();

			// Re-enable button
			setTimeout(() => {
				addBtn.disabled = false;
				addBtn.textContent = 'Add Permission';
			}, 500);
		}

		// Close settings modal when clicking outside
		document.getElementById('settingsModal').addEventListener('click', (e) => {
			if (e.target === document.getElementById('settingsModal')) {
				hideSettingsModal();
			}
		});

		// Close thinking intensity modal when clicking outside
		document.getElementById('thinkingIntensityModal').addEventListener('click', (e) => {
			if (e.target === document.getElementById('thinkingIntensityModal')) {
				hideThinkingIntensityModal();
			}
		});

		// Close slash commands modal when clicking outside
		document.getElementById('slashCommandsModal').addEventListener('click', (e) => {
			if (e.target === document.getElementById('slashCommandsModal')) {
				hideSlashCommandsModal();
			}
		});

		// Request custom snippets from VS Code on page load
		vscode.postMessage({
			type: 'getCustomSnippets'
		});

		// Initialize model selector with default value on page load
		(function initModelSelector() {
			// First populate options based on current provider
			updateModelSelectorOptions(currentProvider);

			const modelSelector = document.getElementById('modelSelector');
			if (modelSelector && modelSelector.options.length > 0) {
				// Set first option as selected if nothing is selected
				if (!modelSelector.value || modelSelector.value === '') {
					modelSelector.value = modelSelector.options[0].value;
				}
			}
		})();

		// Initialize agentic mode switch
		(function initAgenticModeSwitch() {
			const switchEl = document.getElementById('agenticModeSwitch');
			if (switchEl && agenticModeEnabled) {
				switchEl.classList.add('active');
			}
		})();

		// Detect slash commands input
		messageInput.addEventListener('input', (e) => {
			const value = messageInput.value;
			// Show and filter popup when input starts with "/"
			if (value.startsWith('/')) {
				showSlashCommandsPopup(value);
			} else {
				// Hide popup when "/" is removed or input doesn't start with "/"
				hideSlashCommandsPopup();
			}
		});

		// Add settings message handler to window message event
		const originalMessageHandler = window.onmessage;
		window.addEventListener('message', event => {
			const message = event.data;
			
			if (message.type === 'customSnippetsData') {
				// Update global custom snippets data
				customSnippetsData = message.data || {};
				// Refresh the snippets display
				loadCustomSnippets(customSnippetsData);
			} else if (message.type === 'customSnippetSaved') {
				// Refresh snippets after saving
				vscode.postMessage({
					type: 'getCustomSnippets'
				});
			} else if (message.type === 'customSnippetDeleted') {
				// Refresh snippets after deletion
				vscode.postMessage({
					type: 'getCustomSnippets'
				});
			} else if (message.type === 'settingsData') {
				// Update UI with current settings
				const thinkingIntensity = message.data['thinking.intensity'] || 'think';
				const intensityValues = ['think', 'think-hard', 'think-harder', 'ultrathink'];
				const sliderValue = intensityValues.indexOf(thinkingIntensity);

				// Update thinking intensity modal if it exists
				const thinkingIntensitySlider = document.getElementById('thinkingIntensitySlider');
				if (thinkingIntensitySlider) {
					thinkingIntensitySlider.value = sliderValue >= 0 ? sliderValue : 0;
					updateThinkingIntensityDisplay(thinkingIntensitySlider.value);
				} else {
					// Update toggle name even if modal isn't open
					updateThinkingModeToggleName(sliderValue >= 0 ? sliderValue : 0);
				}

				// WSL settings
				document.getElementById('wsl-enabled').checked = message.data['wsl.enabled'] || false;
				document.getElementById('wsl-distro').value = message.data['wsl.distro'] || 'Ubuntu';
				document.getElementById('wsl-node-path').value = message.data['wsl.nodePath'] || '/usr/bin/node';
				document.getElementById('wsl-claude-path').value = message.data['wsl.claudePath'] || '/usr/local/bin/claude';
				document.getElementById('yolo-mode').checked = message.data['permissions.yoloMode'] || false;

				// Provider settings
				const provider = message.data['provider'] || 'anthropic';
				const settingsProviderEl = document.getElementById('settings-provider');
				if (settingsProviderEl) {
					settingsProviderEl.value = provider;
					onSettingsProviderChange();
				}

				// Anthropic settings
				const anthropicApiKeyEl = document.getElementById('anthropic-api-key');
				if (anthropicApiKeyEl) anthropicApiKeyEl.value = message.data['anthropic.apiKey'] || '';

				// Azure settings
				const azureEndpointEl = document.getElementById('azure-endpoint');
				const azureApiKeyEl = document.getElementById('azure-api-key');
				const azureDeploymentEl = document.getElementById('azure-deployment');
				const azureVersionEl = document.getElementById('azure-version');
				if (azureEndpointEl) azureEndpointEl.value = message.data['azure.endpoint'] || '';
				if (azureApiKeyEl) azureApiKeyEl.value = message.data['azure.apiKey'] || '';
				if (azureDeploymentEl) azureDeploymentEl.value = message.data['azure.deployment'] || '';
				if (azureVersionEl) azureVersionEl.value = message.data['azure.apiVersion'] || '2024-02-15-preview';

				// DeepSeek settings
				const deepseekApiKeyEl = document.getElementById('deepseek-api-key');
				if (deepseekApiKeyEl) deepseekApiKeyEl.value = message.data['deepseek.apiKey'] || '';

				// Grok settings
				const grokApiKeyEl = document.getElementById('grok-api-key');
				if (grokApiKeyEl) grokApiKeyEl.value = message.data['grok.apiKey'] || '';

				// Update global provider and repopulate model selector
				currentProvider = provider;
				updateModelSelectorOptions(provider);

				// Set model selector value based on provider (after options are populated)
				const modelSelectorEl = document.getElementById('modelSelector');
				if (modelSelectorEl && modelSelectorEl.options.length > 0) {
					let modelToSet = '';
					if (provider === 'anthropic') {
						modelToSet = message.data['anthropic.model'] || 'claude-sonnet-4-20250514';
					} else if (provider === 'azure') {
						modelToSet = message.data['azure.model'] || 'gpt-4o';
					} else if (provider === 'deepseek') {
						modelToSet = message.data['deepseek.model'] || 'deepseek-chat';
					} else if (provider === 'grok') {
						modelToSet = message.data['grok.model'] || 'grok-beta';
					}
					// Verify the option exists before setting
					const optionExists = Array.from(modelSelectorEl.options).some(opt => opt.value === modelToSet);
					modelSelectorEl.value = optionExists ? modelToSet : modelSelectorEl.options[0].value;
				}

				// Update yolo warning visibility
				updateYoloWarning();

				// Show/hide WSL options
				document.getElementById('wslOptions').style.display = message.data['wsl.enabled'] ? 'block' : 'none';
			} else if (message.type === 'platformInfo') {
				// Check if user is on Windows and show WSL alert if not dismissed and WSL not already enabled
				if (message.data.isWindows && !message.data.wslAlertDismissed && !message.data.wslEnabled) {
					// Small delay to ensure UI is ready
					setTimeout(() => {
						showWSLAlert();
					}, 1000);
				}
			}
		});

	</script>
</body>
</html>`;

export default html;