# Henry AI - Master Writer & Developer Assistant

Henry AI is an advanced AI assistant specifically designed for writers and developers. It combines the expertise of a master writer, professional editor, and full-stack developer in one powerful tool.

![Henry AI](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Writer](https://img.shields.io/badge/mode-Writer-purple)
![Developer](https://img.shields.io/badge/mode-Developer-cyan)

## 🎯 Core Capabilities

### 🖋️ Master Writer & Editor
- **Ebook Creation**: Complete guidance from concept to publication
- **Large-Scale Projects**: Novels, technical books, documentation
- **Professional Editing**: Developmental, line, copy, and proofreading
- **Research & Citations**: Fact-checking, source verification, academic standards
- **Story Structure**: Narrative development, character arcs, plot construction
- **Publishing Expertise**: Industry knowledge, formatting, distribution

### 💻 Full-Stack Developer & Architect
- **Complete App Development**: From concept to deployment
- **Multi-Platform**: Web, mobile, desktop applications
- **Full Technology Stack**: Frontend, backend, databases, cloud platforms
- **Architecture Design**: System design, scalability, best practices
- **Code Generation**: All major languages and frameworks
- **DevOps & Deployment**: CI/CD, monitoring, optimization

### 🎯 Advanced Features
- **Project Management** - Organized workspaces for books and apps
- **File Operations** - Read/write access to project files
- **Mode Switching** - Specialized prompts for different tasks
- **Enhanced UI** - Modern interface with advanced formatting
- **Desktop App** - Native application using Tauri
- **Web Version** - Browser-based access

## Architecture

Henry AI is built with a modern, scalable architecture designed for professional writing and development workflows:

### Enhanced Backend (API Server)
- **Location**: `apps/api/`
- **Technology**: Node.js + Express + File System Integration
- **Port**: 3000
- **Core Features**:
  - Advanced chat endpoint with mode detection
  - Enhanced OpenAI integration (GPT-4o with specialized prompts)
  - Intelligent local fallback responses
  - Project management system
  - File operations (create, read, write, organize)
  - CORS enabled for web access

### Advanced Frontend (Web App)
- **Location**: `apps/web/`
- **Technology**: React + TypeScript + Vite + Enhanced UI
- **Core Features**:
  - Multi-mode interface (Writer/Developer/General)
  - Project workspace management
  - Advanced message formatting (Markdown, code blocks)
  - File saving and organization
  - Real-time mode switching
  - Tauri integration for desktop app

### Project Management System
- **Book Projects**: Chapters, research, drafts, outlines
- **App Projects**: Source code, documentation, tests, architecture
- **File Organization**: Structured folders and file management
- **Content Saving**: Direct integration from chat to project files

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** (for building desktop app) - Install from [rustup.rs](https://rustup.rs/)
- **OpenAI API Key** (optional) - Get one from [OpenAI](https://platform.openai.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tophercook7-maker/henry-ai.git
   cd henry-ai
   ```

2. **Install API dependencies**
   ```bash
   cd apps/api
   npm install
   ```

3. **Install Web dependencies**
   ```bash
   cd ../web
   npm install
   ```

## Running Henry AI

### Option 1: Web Version (Development)

**Terminal 1 - Start API Server:**
```bash
cd apps/api
npm start
```

**Terminal 2 - Start Web App:**
```bash
cd apps/web
npm run dev
```

Then open http://localhost:5173 in your browser.

### Option 2: Desktop App (Development)

**Terminal 1 - Start API Server:**
```bash
cd apps/api
npm start
```

**Terminal 2 - Start Desktop App:**
```bash
cd apps/web
npm run tauri:dev
```

This will launch the native desktop application.

### Option 3: Using the Convenience Scripts

From the root directory:

```bash
# Start both API and Web servers
./start-all.sh

# Check status
./status.sh

# Restart all services
./restart-all.sh

# Stop all services
./stop-all.sh
```

## Building for Production

### Web Version

```bash
cd apps/web
npm run build
npm run preview
```

### Desktop App

**Build for your current platform:**
```bash
cd apps/web
npm run tauri:build
```

The built application will be in `apps/web/src-tauri/target/release/bundle/`

**Platform-specific builds:**
- **macOS**: Creates `.dmg` and `.app` files
- **Windows**: Creates `.exe` and `.msi` installers
- **Linux**: Creates `.deb`, `.AppImage`, and other formats

## Configuration

### API Settings

1. Click the **Settings** tab in the sidebar
2. Configure:
   - **API Base URL**: Default is `http://127.0.0.1:3000`
   - **API Key**: Your OpenAI API key (optional)
3. Click **Save Settings**

### Environment Variables

You can also configure the API server using environment variables:

```bash
# API Server Port
PORT=3000

# OpenAI API Key (optional)
OPENAI_API_KEY=sk-proj-...
```

## Usage

### Basic Chat

1. Type your message in the input box
2. Press **Enter** to send (or **Shift+Enter** for a new line)
3. Henry will respond using OpenAI (if configured) or local responses

### Features

- **Copy Responses**: Click the "Copy" button on any assistant message
- **New Chat**: Click "New Chat" to start fresh
- **Usage Stats**: View model, character count, and cost estimates in the top bar

## Project Structure

```
henry-ai/
├── apps/
│   ├── api/                 # Backend API server
│   │   ├── server.mjs       # Express server
│   │   ├── package.json     # API dependencies
│   │   └── data/            # Data storage
│   └── web/                 # Frontend web app
│       ├── src/
│       │   └── main.ts      # Main TypeScript app
│       ├── src-tauri/       # Tauri desktop app
│       │   ├── src/
│       │   │   ├── main.rs  # Rust main entry
│       │   │   └── lib.rs   # Rust library
│       │   ├── Cargo.toml   # Rust dependencies
│       │   └── tauri.conf.json  # Tauri config
│       ├── public/          # Static assets
│       ├── index.html       # HTML entry point
│       ├── package.json     # Web dependencies
│       └── vite.config.ts   # Vite configuration
├── bin/                     # Utility scripts
├── start-all.sh            # Start all services
├── stop-all.sh             # Stop all services
├── restart-all.sh          # Restart all services
├── status.sh               # Check service status
└── README.md               # This file
```

## Development

### API Server Development

The API server uses ES modules (`.mjs`). To modify:

1. Edit `apps/api/server.mjs`
2. Restart the server to see changes

### Web App Development

The web app uses Vite for hot module replacement:

1. Edit files in `apps/web/src/`
2. Changes appear instantly in the browser

### Desktop App Development

The desktop app uses Tauri:

1. Edit Rust code in `apps/web/src-tauri/src/`
2. Edit frontend code in `apps/web/src/`
3. Run `npm run tauri:dev` to see changes

## Troubleshooting

### API Server Not Starting

**Problem**: API server fails to start
**Solution**: 
- Check if port 3000 is already in use
- Try changing the port: `PORT=3001 npm start`

### Desktop App Can't Connect to API

**Problem**: Desktop app shows connection errors
**Solution**:
- Ensure API server is running on port 3000
- Check `http://127.0.0.1:3000/health` in your browser
- Verify firewall settings aren't blocking localhost connections

### OpenAI API Errors

**Problem**: Getting 401 or 502 errors with OpenAI
**Solution**:
- Verify your API key is correct
- Check your OpenAI account has credits
- The app will fall back to local responses if OpenAI fails

### Build Errors

**Problem**: Tauri build fails
**Solution**:
- Ensure Rust is installed: `rustc --version`
- Update Rust: `rustup update`
- Clear build cache: `cd apps/web/src-tauri && cargo clean`

## Why SuperNinja Doesn't Work in Desktop Apps

You asked about SuperNinja not working in desktop apps. Here's why:

**SuperNinja requires cloud infrastructure:**
- Runs on dedicated Linux VMs in the cloud
- Uses Cerebras's specialized AI hardware (wafer-scale engines)
- Needs server-side sandboxing for security
- Requires dynamic tool installation and execution

**Desktop apps are just interfaces:**
- They connect to cloud servers
- Cannot run VMs locally
- Don't have access to specialized AI hardware
- Limited by local system resources

**Solution**: SuperNinja only works through the web interface at https://super.myninja.ai/ because it needs the full cloud infrastructure.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the code comments for implementation details

## Roadmap

Future enhancements planned:
- [ ] Multiple chat history management
- [ ] Custom system prompts
- [ ] Support for other AI providers (Anthropic, Google, etc.)
- [ ] Voice input/output
- [ ] File upload and analysis
- [ ] Plugin system for extensions

---

Built with ❤️ using React, TypeScript, Vite, Tauri, and Node.js