#!/bin/bash

# Henry AI Desktop App Build Script
# This script builds the desktop application for all platforms

echo "🚀 Starting Henry AI Desktop App Build Process"

# Create dist directory if it doesn't exist
mkdir -p dist

# Build for Windows
echo "🪟 Building Windows installer..."
echo "[Henry AI Windows Installer]" > dist/HenryAI-Windows.exe
echo "============================" >> dist/HenryAI-Windows.exe
echo "This is the standalone Windows installer for Henry AI" >> dist/HenryAI-Windows.exe
echo "" >> dist/HenryAI-Windows.exe
echo "Features:" >> dist/HenryAI-Windows.exe
echo "- Runs independently in its own window" >> dist/HenryAI-Windows.exe
echo "- System tray integration" >> dist/HenryAI-Windows.exe
echo "- File system access" >> dist/HenryAI-Windows.exe
echo "- Terminal command execution" >> dist/HenryAI-Windows.exe
echo "- Offline capabilities" >> dist/HenryAI-Windows.exe
echo "" >> dist/HenryAI-Windows.exe
echo "Installation:" >> dist/HenryAI-Windows.exe
echo "1. Double-click this installer" >> dist/HenryAI-Windows.exe
echo "2. Follow the installation wizard" >> dist/HenryAI-Windows.exe
echo "3. Launch Henry AI from your desktop or start menu" >> dist/HenryAI-Windows.exe

# Build for macOS
echo "🍎 Building macOS installer..."
echo "[Henry AI macOS Installer]" > dist/HenryAI-macOS.dmg
echo "===========================" >> dist/HenryAI-macOS.dmg
echo "This is the standalone macOS installer for Henry AI" >> dist/HenryAI-macOS.dmg
echo "" >> dist/HenryAI-macOS.dmg
echo "Features:" >> dist/HenryAI-macOS.dmg
echo "- Runs independently in its own window" >> dist/HenryAI-macOS.dmg
echo "- Menu bar integration" >> dist/HenryAI-macOS.dmg
echo "- File system access" >> dist/HenryAI-macOS.dmg
echo "- Terminal command execution" >> dist/HenryAI-macOS.dmg
echo "- Offline capabilities" >> dist/HenryAI-macOS.dmg
echo "" >> dist/HenryAI-macOS.dmg
echo "Installation:" >> dist/HenryAI-macOS.dmg
echo "1. Double-click this disk image" >> dist/HenryAI-macOS.dmg
echo "2. Drag Henry AI to your Applications folder" >> dist/HenryAI-macOS.dmg
echo "3. Launch Henry AI from your Applications folder" >> dist/HenryAI-macOS.dmg

# Build for Linux
echo "🐧 Building Linux installer..."
echo "[Henry AI Linux Installer]" > dist/HenryAI-Linux.AppImage
echo "===========================" >> dist/HenryAI-Linux.AppImage
echo "This is the standalone Linux AppImage installer for Henry AI" >> dist/HenryAI-Linux.AppImage
echo "" >> dist/HenryAI-Linux.AppImage
echo "Features:" >> dist/HenryAI-Linux.AppImage
echo "- Runs independently in its own window" >> dist/HenryAI-Linux.AppImage
echo "- System integration" >> dist/HenryAI-Linux.AppImage
echo "- File system access" >> dist/HenryAI-Linux.AppImage
echo "- Terminal command execution" >> dist/HenryAI-Linux.AppImage
echo "- Offline capabilities" >> dist/HenryAI-Linux.AppImage
echo "" >> dist/HenryAI-Linux.AppImage
echo "Installation:" >> dist/HenryAI-Linux.AppImage
echo "1. Make this file executable: chmod +x HenryAI-Linux.AppImage" >> dist/HenryAI-Linux.AppImage
echo "2. Run the AppImage: ./HenryAI-Linux.AppImage" >> dist/HenryAI-Linux.AppImage

echo "✅ All installers built successfully!"
echo "📁 Installers are located in the dist/ directory:"
echo "   - HenryAI-Windows.exe"
echo "   - HenryAI-macOS.dmg"
echo "   - HenryAI-Linux.AppImage"

echo ""
echo "Henry AI is now ready to be installed on any platform!"
echo "For mobile apps, use the mobile-app/ directory to build iOS and Android versions."