# Change Log

All notable changes to the "code-pilot-ai" extension will be documented in this file.

## [1.0.0] - Initial Release

### Features

#### **Chat Interface**
- Native VS Code chat interface for AI assistance
- Real-time streaming responses with typing indicators
- Markdown support with syntax highlighting
- Auto-expanding input field
- One-click message copying

#### **Workspace Snapshots**
- Git-based backup system for safe experimentation
- Create restore points before major changes
- Browse and restore any previous state
- Automatic snapshot creation

#### **Tool Server Management (MCP)**
- Complete tool server configuration interface
- Popular servers gallery with one-click installation
- Custom server creation with validation
- Server management (edit, delete, enable/disable)

#### **Permission System**
- Interactive permission dialogs with command previews
- "Always Allow" functionality for trusted commands
- Auto-Approve Mode for power users
- Workspace-specific permission storage

#### **Image Support**
- Drag-and-drop images into chat
- Clipboard paste for screenshots (Ctrl+V)
- Multiple image selection
- Organized local storage

#### **Sidebar Integration**
- Native VS Code sidebar view
- Smart panel management
- Persistent session state
- Activity bar integration

#### **Reasoning Modes**
- Standard - Quick responses
- Detailed - More thorough analysis
- Comprehensive - In-depth reasoning
- Maximum - Most thorough exploration

#### **Cross-Platform Support**
- Windows, macOS, Linux compatibility
- Full WSL integration
- Automatic path conversion

### Technical Features
- Session management with conversation persistence
- Real-time cost and token tracking
- Model selection (Opus, Sonnet, Default)
- Built-in slash commands
- Planning mode for complex tasks
