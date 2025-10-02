# Henry AI Desktop - Build Instructions

## 🎯 Overview
This guide will help you build Henry AI Desktop for Windows, macOS, and Linux.

## 📋 Prerequisites

### All Platforms
- **Node.js 20+** (for the frontend and API server)
- **Rust** (for Tauri)
- **Git** (for version control)

### Platform-Specific Requirements

#### Windows
- **Visual Studio 2022** with C++ build tools
- **WebView2** (usually pre-installed on Windows 10/11)

#### macOS
- **Xcode Command Line Tools**: `xcode-select --install`
- **macOS 10.13+**

#### Linux (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  build-essential \
  curl \
  wget \
  file
```

## 🚀 Quick Start

### 1. Install Rust (if not already installed)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. Install Dependencies
```bash
cd henry-ai/apps/web
npm install
```

### 3. Build for Your Platform

#### Development Build (for testing)
```bash
npm run tauri dev
```

#### Production Build (creates installers)
```bash
npm run tauri build
```

## 📦 Build Outputs

After running `npm run tauri build`, you'll find installers in:
```
henry-ai/apps/web/src-tauri/target/release/bundle/
```

### Windows
- `henry-ai_1.0.0_x64_en-US.msi` - MSI installer
- `henry-ai_1.0.0_x64-setup.exe` - EXE installer

### macOS
- `Henry AI Ultimate.app` - Application bundle
- `Henry AI Ultimate_1.0.0_x64.dmg` - DMG installer
- `Henry AI Ultimate_1.0.0_aarch64.dmg` - DMG for Apple Silicon

### Linux
- `henry-ai_1.0.0_amd64.deb` - Debian/Ubuntu package
- `henry-ai_1.0.0_amd64.AppImage` - Universal Linux package

## 🔧 Build Configuration

The build is configured in `src-tauri/tauri.conf.json`:

```json
{
  "productName": "Henry AI Ultimate",
  "version": "1.0.0",
  "identifier": "ai.henry.ultimate",
  "bundle": {
    "targets": "all"
  }
}
```

## 🎨 Customization

### Change App Icon
Replace icons in `src-tauri/icons/`:
- `icon.icns` - macOS
- `icon.ico` - Windows
- `*.png` - Linux

### Modify App Name
Edit `src-tauri/tauri.conf.json`:
```json
{
  "productName": "Your App Name"
}
```

## 🐛 Troubleshooting

### Build Fails on Linux
Make sure all dependencies are installed:
```bash
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### Build Fails on macOS
Install Xcode Command Line Tools:
```bash
xcode-select --install
```

### Build Fails on Windows
Install Visual Studio 2022 with C++ build tools.

## 📝 Notes

- **First build takes longer** (10-30 minutes) as Rust compiles dependencies
- **Subsequent builds are faster** (2-5 minutes)
- **API server is embedded** - no separate backend needed
- **Zero hosting costs** - everything runs locally

## 🎉 Success!

Once built, you'll have a standalone desktop application that:
- ✅ Runs completely offline (except for OpenAI API calls)
- ✅ Has full file system access
- ✅ Includes embedded API server
- ✅ Works on Windows, macOS, and Linux
- ✅ Costs $0/month to run (just your OpenAI API usage)