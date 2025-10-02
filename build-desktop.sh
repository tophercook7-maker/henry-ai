#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Building Henry AI Desktop App..."
echo ""

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed!"
    echo "Please install Rust from: https://rustup.rs/"
    exit 1
fi

echo "✅ Rust found: $(rustc --version)"
echo ""

# Navigate to web directory
cd apps/web

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the desktop app
echo "🔨 Building desktop application..."
npm run tauri:build

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Built files are in: apps/web/src-tauri/target/release/bundle/"
echo ""