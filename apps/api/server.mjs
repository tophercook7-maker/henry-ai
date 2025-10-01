import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({limit:'50mb'}));

// Utilities
const ok = (res, obj) => res.json(obj);
const now = () => Date.now();

// Basic health
app.get('/ping',  (req,res)=> ok(res,{ok:true}));
app.get('/health',(req,res)=> ok(res,{ok:true, service:'henry-api', ts: now()}));
app.get('/key-status',(req,res)=>{
  const k = (req.headers['x-api-key']||'').toString().trim();
  ok(res,{ok:true, hasKey: !!k, keyPrefix: k ? k.slice(0,8) : ''});
});

// Enhanced system prompt for master writer & developer
const getSystemPrompt = (mode = 'general') => {
  const prompts = {
    writer: `You are Henry, a master writer and editor with decades of experience in:
- Ebook creation and publishing
- Large-scale book projects (novels, non-fiction, technical books)
- Professional editing (developmental, line, copy, proofreading)
- Research and fact-checking
- Story structure and narrative development
- Technical writing and documentation
- Academic writing and citations
- Creative writing across all genres

You excel at:
- Breaking down complex writing projects into manageable phases
- Providing detailed outlines and chapter structures
- Offering constructive feedback and revision suggestions
- Maintaining consistency in tone, style, and voice
- Research methodology and source verification
- Publishing industry knowledge and best practices`,

    developer: `You are Henry, a master full-stack developer and architect with expertise in:
- Complete app development from concept to deployment
- Frontend: React, Vue, Angular, vanilla JS, HTML5, CSS3
- Backend: Node.js, Python, PHP, Java, C#, Go, Rust
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite
- Cloud platforms: AWS, Azure, GCP, Vercel, Netlify
- DevOps: Docker, Kubernetes, CI/CD, monitoring
- Mobile: React Native, Flutter, native iOS/Android
- Desktop: Electron, Tauri, Qt, .NET

You provide:
- Complete project architecture and planning
- Step-by-step implementation guides
- Best practices and security considerations
- Performance optimization strategies
- Testing and deployment procedures
- Troubleshooting and debugging assistance`,

    general: `You are Henry, a master AI assistant combining the expertise of:

🖋️ MASTER WRITER & EDITOR:
- Ebook creation, large book projects, all genres
- Professional editing (developmental, line, copy, proof)
- Research, fact-checking, citations
- Story structure, narrative development
- Publishing industry expertise

💻 MASTER DEVELOPER & ARCHITECT:
- Full-stack development (frontend, backend, mobile, desktop)
- All major languages and frameworks
- Database design and optimization
- Cloud platforms and DevOps
- Security, performance, testing
- Complete project lifecycle management

🎯 CAPABILITIES:
- Break complex projects into actionable steps
- Provide detailed implementation plans
- Offer expert guidance and best practices
- Troubleshoot and debug issues
- Research and verify information
- Maintain high quality standards

Be comprehensive, practical, and provide specific, actionable advice.`
  };
  
  return prompts[mode] || prompts.general;
};

// File operations for projects
app.post('/project/create', async (req, res) => {
  try {
    const { name, type, structure } = req.body;
    const projectPath = path.join(process.cwd(), 'data', 'projects', name);
    
    await fs.mkdir(projectPath, { recursive: true });
    
    if (type === 'book') {
      await fs.mkdir(path.join(projectPath, 'chapters'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'research'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'drafts'), { recursive: true });
      await fs.writeFile(
        path.join(projectPath, 'outline.md'),
        '# Book Outline\n\n## Structure\n\n## Chapters\n\n## Research Notes\n'
      );
    } else if (type === 'app') {
      await fs.mkdir(path.join(projectPath, 'src'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'docs'), { recursive: true });
      await fs.mkdir(path.join(projectPath, 'tests'), { recursive: true });
      await fs.writeFile(
        path.join(projectPath, 'README.md'),
        `# ${name}\n\n## Project Overview\n\n## Setup Instructions\n\n## Architecture\n`
      );
    }
    
    ok(res, { created: true, path: projectPath });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get('/project/list', async (req, res) => {
  try {
    const projectsPath = path.join(process.cwd(), 'data', 'projects');
    await fs.mkdir(projectsPath, { recursive: true });
    const projects = await fs.readdir(projectsPath);
    ok(res, { projects });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.post('/file/save', async (req, res) => {
  try {
    const { filePath, content } = req.body;
    const fullPath = path.join(process.cwd(), 'data', filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
    ok(res, { saved: true, path: fullPath });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get('/file/read', async (req, res) => {
  try {
    const { filePath } = req.query;
    const fullPath = path.join(process.cwd(), 'data', filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    ok(res, { content });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Enhanced chat endpoint with mode detection
app.post('/chat', async (req,res)=>{
  try{
    const messages = (req.body && req.body.messages) || [];
    const mode = req.body.mode || 'general';
    const user = (messages.find(m => m.role==='user')?.content || '').toString().trim();
    const apiKey = (req.headers['x-api-key']||'').toString().trim();

    // If we have an OpenAI-style key, try OpenAI first
    if (apiKey) {
      try{
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method:'POST',
          headers:{
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {role:'system', content: getSystemPrompt(mode)},
              ...messages
            ],
            temperature: 0.7,
            max_tokens: 4000
          })
        });
        if (!r.ok) {
          const t = await r.text();
          return res.status(502).json({ok:false, error:'upstream', detail:t.slice(0,500)});
        }
        const j = await r.json();
        const reply = j.choices?.[0]?.message?.content || '(no content)';
        return ok(res,{ok:true, model:j.model || 'openai', reply, usage:{model:j.model || 'openai'}});
      } catch(e){
        // fall through to local fallback
      }
    }

    // Enhanced local responses based on mode and content
    let reply;
    if (!user) {
      reply = "Hello! I'm Henry, your master writer and developer assistant. I can help you with:\n\n📚 **Writing Projects**: Ebooks, novels, technical documentation, research\n💻 **App Development**: Full-stack applications, mobile apps, desktop software\n🎯 **Project Management**: Planning, structure, implementation\n\nWhat would you like to create today?";
    } else if (/write|book|ebook|novel|story|chapter|edit/i.test(user)) {
      reply = "🖋️ **Writing Mode Activated**\n\nI'm ready to help with your writing project! I can assist with:\n\n• **Planning**: Outlines, chapter structures, character development\n• **Writing**: Drafting, style guidance, narrative flow\n• **Editing**: Developmental, line, copy, and proofreading\n• **Research**: Fact-checking, source verification, citations\n• **Publishing**: Formatting, distribution, marketing strategies\n\nTell me about your project - what are you writing?";
    } else if (/app|develop|code|build|program|software/i.test(user)) {
      reply = "💻 **Developer Mode Activated**\n\nReady to build something amazing! I can help with:\n\n• **Planning**: Architecture, tech stack, project structure\n• **Frontend**: React, Vue, Angular, responsive design\n• **Backend**: APIs, databases, authentication, deployment\n• **Mobile**: React Native, Flutter, native development\n• **Desktop**: Electron, Tauri, cross-platform apps\n• **DevOps**: CI/CD, cloud deployment, monitoring\n\nWhat kind of application do you want to build?";
    } else if (/error|failed|timeout|404|502|load failed/i.test(user)) {
      reply = "🔧 **Troubleshooting Mode**\n\nI see you're encountering an issue. Let me help debug this:\n\n1. **Check the basics**: API server running on http://127.0.0.1:3000?\n2. **Network connectivity**: Can you access the health endpoint?\n3. **Logs and errors**: Share the exact error message\n4. **Environment**: What OS, browser, or development setup?\n\nPaste the full error message and I'll provide specific solutions.";
    } else {
      reply = "I'm Henry, your comprehensive assistant for writing and development projects. Based on your message, I can help you:\n\n📋 **Next Steps**:\n1. Clarify your specific goal or challenge\n2. Choose the approach (writing project, app development, or both)\n3. Create a detailed action plan\n4. Implement step-by-step with my guidance\n\nWhat's your main objective? I'll provide a complete roadmap to achieve it.";
    }
    return ok(res,{ok:true, model:'henry-enhanced', reply, usage:{model:'henry-enhanced'}});
  }catch(err){
    console.error(err);
    return res.status(500).json({ok:false, error:String(err)});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Enhanced Henry API listening on http://127.0.0.1:${PORT}`));