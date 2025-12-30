# Code Pilot AI - Intelligent Coding Assistant for VS Code

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-007ACC?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

> **Your intelligent coding companion. Get AI-powered assistance through an intuitive chat interface directly in VS Code.**

Code Pilot AI brings powerful AI assistance into your development workflow with a clean, native chat interface that integrates seamlessly with your editor.

---

## Why Code Pilot AI?

- **Native Chat Interface** - Conversational AI assistance without leaving your editor
- **Workspace Snapshots** - Save and restore your code state with one click
- **Context Protocol Support** - Extend functionality with custom tool servers
- **Session Management** - Persistent conversation history across sessions
- **VS Code Integration** - Native theming and sidebar support
- **Planning & Reasoning Modes** - Configurable AI behavior for different tasks
- **Smart File Context** - Reference files, paste images, create custom workflows
- **Model Flexibility** - Switch between different AI models based on your needs
- **WSL Compatible** - Full Windows Subsystem for Linux support

---

## Features

### Chat Interface
- Clean, intuitive conversation UI
- Real-time streaming responses
- Markdown support with syntax highlighting
- Auto-expanding input field
- One-click message copying

### Workspace Snapshots
- Create restore points before major changes
- Git-based backup system
- Browse and restore any previous state
- Safe experimentation with instant rollback

### Tool Server Management
- Configure custom tool servers
- Pre-configured popular servers available
- Full lifecycle management (add, edit, delete)
- Seamless permissions integration

### Permission System
- Interactive approval dialogs
- "Always Allow" for trusted commands
- Auto-Approve Mode for power users
- Workspace-specific permission storage

### Image Support
- Drag and drop images into chat
- Paste screenshots with Ctrl+V
- Multiple image selection
- Organized local storage

### Sidebar Integration
- Full functionality in sidebar panel
- Automatic view switching
- Persistent state across panels
- Activity bar quick access

### File Integration
- Type `@` to search and reference files
- Fast search across your project
- Multi-file context in conversations

### Reasoning Modes
- **Standard** - Quick responses for simple tasks
- **Detailed** - More thorough analysis
- **Comprehensive** - In-depth reasoning
- **Maximum** - Most thorough exploration

---

## Getting Started

### Prerequisites
- VS Code 1.80 or later
- AI backend CLI installed
- Active API subscription

### Installation

1. **From VS Code Marketplace**
   ```
   ext install code-pilot-ai
   ```

2. **Manual Installation**
   - Download the `.vsix` file from releases
   - Run `code --install-extension code-pilot-ai-x.x.x.vsix`

3. **Open Code Pilot AI**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Or click the icon in your activity bar
   - Or use Command Palette: `Code Pilot AI: Open Chat`

---

## Usage

### Code Review
```
You: @src/components/UserProfile.tsx Review this component

AI: I'll analyze your UserProfile component...
[Detailed analysis with recommendations]
```

### Project Analysis
```
You: Analyze the architecture of this project

AI: Here's an overview of your project structure...
[Architecture breakdown with suggestions]
```

### Debugging
```
You: I'm getting this error: [paste error]

AI: Looking at this error, the issue appears to be...
[Step-by-step debugging guidance]
```

---

## Configuration

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Open Code Pilot AI |
| `Enter` | Send message |
| `@` | Open file picker |
| `/` | Open commands modal |

### WSL Configuration (Windows)
1. Open VS Code Settings
2. Search for "Code Pilot AI"
3. Configure WSL settings:
   - **WSL Enabled** - Enable WSL integration
   - **WSL Distro** - Your distribution name
   - **WSL Node Path** - Path to Node.js
   - **WSL Backend Path** - Path to AI backend

Example `settings.json`:
```json
{
  "codePilotAI.wsl.enabled": true,
  "codePilotAI.wsl.distro": "Ubuntu",
  "codePilotAI.wsl.nodePath": "/usr/bin/node",
  "codePilotAI.wsl.backendPath": "/usr/local/bin/claude"
}
```

---

## Tips

### File Context
- Type `@` followed by search terms to find files
- Use `@src/` to narrow to specific directories
- Reference multiple files in one message

### Productivity
- Snapshots are created automatically before changes
- Use the stop button to cancel long operations
- Access history to reference previous conversations
- Sidebar integration enables multi-panel workflow

---

## Tool Integration

Code Pilot AI provides access to various tools:
- **Shell** - Execute commands with permission controls
- **File Operations** - Read, write, and edit files
- **Search** - Pattern matching across workspace
- **Web** - Fetch and search web content
- **Batch Operations** - Multiple file modifications
- **Tool Servers** - Extend with custom functionality

---

## Development

```bash
git clone <your-repo-url>
cd code-pilot-ai
npm install

# Press F5 to run the extension in debug mode
```

---

## License

MIT License

---

## Support

For issues and feature requests, please use the GitHub Issues page.

---

**Code Pilot AI** - Your intelligent coding companion
