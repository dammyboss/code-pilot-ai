import * as vscode from 'vscode';
import * as path from 'path';

export function createChatRequestHandler(context: vscode.ExtensionContext) {
    return async (
        request: vscode.ChatRequest,
        chatContext: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> => {

        // Handle /help command
        if (request.command === 'help') {
            return handleHelpCommand(stream, context);
        }

        // Handle regular chat messages
        if (request.prompt.trim()) {
            stream.markdown('Processing your request...');
            return { metadata: { command: 'chat' } };
        }

        return { metadata: { command: 'unknown' } };
    };
}

async function handleHelpCommand(stream: vscode.ChatResponseStream, context: vscode.ExtensionContext): Promise<vscode.ChatResult> {
    try {
        // Read the actual README.md file from the extension directory
        const extensionPath = context.extensionPath;
        const readmePath = path.join(extensionPath, 'README.md');
        const readmeUri = vscode.Uri.file(readmePath);

        let readmeContent: string;

        try {
            const fileContent = await vscode.workspace.fs.readFile(readmeUri);
            readmeContent = new TextDecoder().decode(fileContent);
        } catch {
            // Fallback content if README not found
            readmeContent = getDefaultHelpContent();
        }

        // Use native MarkdownString - this renders exactly like VS Code's markdown preview
        const markdownString = new vscode.MarkdownString(readmeContent);
        markdownString.isTrusted = false;
        markdownString.supportHtml = false;

        stream.markdown(markdownString);

        return { metadata: { command: 'help' } };
    } catch (error) {
        stream.markdown('Error loading help content.');
        return { metadata: { command: 'help', error: true } };
    }
}

function getDefaultHelpContent(): string {
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
