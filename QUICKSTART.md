# Henry AI - Quick Start Guide

Get Henry AI running in 5 minutes!

## 🚀 Fastest Way to Run

### Step 1: Install Dependencies

```bash
# Install API dependencies
cd apps/api
npm install

# Install Web dependencies
cd ../web
npm install
```

### Step 2: Start Henry AI

**Option A: Web Version (Easiest)**

```bash
# Terminal 1 - Start API
cd apps/api
npm start

# Terminal 2 - Start Web
cd apps/web
npm run dev
```

Then open: http://localhost:5173

**Option B: Desktop App**

```bash
# Terminal 1 - Start API
cd apps/api
npm start

# Terminal 2 - Start Desktop App
cd apps/web
npm run tauri:dev
```

### Step 3: Configure (Optional)

1. Click **Settings** in the sidebar
2. Add your OpenAI API key (optional)
3. Click **Save Settings**

That's it! Start chatting with Henry! 🎉

## 🔧 Building Desktop App

```bash
# From root directory
./build-desktop.sh
```

Built app will be in: `apps/web/src-tauri/target/release/bundle/`

## 💡 Tips

- **No API Key?** Henry works with helpful local responses
- **Enter** sends messages, **Shift+Enter** adds new lines
- **Copy button** on each response for easy copying
- **New Chat** button to start fresh conversations

## ❓ Need Help?

See the full [README.md](README.md) for detailed documentation.