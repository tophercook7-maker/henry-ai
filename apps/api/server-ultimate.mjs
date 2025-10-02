import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
app.use(cors());
app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit:'100mb', extended: true}));

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

// ULTIMATE SYSTEM PROMPT - Natural, conversational, like SuperNinja
const getSystemPrompt = () => {
  return `You are Henry, a friendly and incredibly capable AI assistant. Think of yourself as a knowledgeable colleague who's always ready to help with anything.

Your communication style is natural and conversational - you talk like a real person having a genuine conversation. No bullet points, no formal language, no robotic responses. Just natural, flowing sentences that feel like talking to a smart friend over coffee.

You can help with absolutely anything:

When it comes to writing, you're like having a professional author and editor by your side. Whether someone wants to write a novel, create an ebook, draft articles, or polish their writing, you guide them through the entire process naturally. You help with story structure, character development, editing, research - everything that goes into creating great written work.

For coding and development, you're a full-stack expert who can build anything. Web apps, mobile apps, desktop software, APIs, databases - you know it all. You explain things clearly, write clean code, and help debug issues. You can architect entire systems or help fix a single bug. Whatever the technical challenge, you're there to solve it.

But you're not limited to just writing and coding. You can connect to services, process documents of any size, analyze data, automate tasks, research topics, and so much more. If someone needs to integrate with GitHub, process a massive PDF, scrape websites, or automate their workflow - you can do it.

Your responses should feel natural and helpful. When someone asks you something, respond like you're genuinely interested in helping them succeed. Explain things clearly without being condescending. Be enthusiastic but not over the top. Most importantly, be conversational - use natural language, proper paragraphs with spacing, and write like you're actually talking to someone.

Remember: You're not just an AI tool, you're a capable assistant who genuinely wants to help people accomplish their goals. Be warm, be helpful, be smart, and always communicate naturally.`;
};

// Chat endpoint with natural conversation
app.post('/chat', async (req, res) => {
  try {
    const { messages, apiKey, model = 'gpt-4o', maxTokens = 4000 } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'Hey, I need an API key to chat with you. Head over to the Settings tab and add your OpenAI API key - it only takes a minute!' 
      });
    }

    // Add system prompt to messages
    const systemMessage = {
      role: 'system',
      content: getSystemPrompt()
    };

    const fullMessages = [systemMessage, ...messages];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        max_tokens: maxTokens,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ 
        error: error.error?.message || 'Something went wrong with the API call. Check your API key and try again.' 
      });
    }

    const data = await response.json();
    
    // Calculate costs
    const costs = calculateCosts(data.usage, model);
    
    ok(res, {
      message: data.choices[0].message.content,
      usage: data.usage,
      costs,
      model
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Oops, something went wrong on my end. Could you try that again?' 
    });
  }
});

// Cost calculation
function calculateCosts(usage, model) {
  const pricing = {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.150, output: 0.600 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-4': { input: 30.00, output: 60.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 }
  };

  const prices = pricing[model] || pricing['gpt-4o'];
  const inputCost = (usage.prompt_tokens / 1000000) * prices.input;
  const outputCost = (usage.completion_tokens / 1000000) * prices.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost: inputCost.toFixed(6),
    outputCost: outputCost.toFixed(6),
    totalCost: totalCost.toFixed(6),
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens
  };
}

// Document processing endpoint
app.post('/process-document', async (req, res) => {
  try {
    const { content, action, apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'I need your API key to process documents. Add it in Settings!' 
      });
    }

    const systemPrompt = `You are Henry, helping process and analyze documents. Be natural and conversational in your responses.`;
    
    let userPrompt = '';
    switch(action) {
      case 'summarize':
        userPrompt = `Please read through this document and give me a natural, conversational summary. Don't just list points - explain it like you're telling someone about what you read:\n\n${content}`;
        break;
      case 'analyze':
        userPrompt = `I'd like you to analyze this document. What are the key insights, themes, and important points? Explain it naturally:\n\n${content}`;
        break;
      case 'extract':
        userPrompt = `Can you extract the most important information from this document? Present it in a clear, readable way:\n\n${content}`;
        break;
      default:
        userPrompt = content;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const costs = calculateCosts(data.usage, 'gpt-4o');
    
    ok(res, {
      result: data.choices[0].message.content,
      usage: data.usage,
      costs
    });

  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({ 
      error: 'Had trouble processing that document. Mind trying again?' 
    });
  }
});

// Terminal execution endpoint
app.post('/terminal/execute', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'No command provided' });
    }

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    ok(res, {
      output: stdout || stderr,
      success: !stderr,
      command
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      output: error.stdout || error.stderr || '',
      success: false
    });
  }
});

// Usage tracking endpoint
app.post('/usage/track', async (req, res) => {
  try {
    const { usage, cost } = req.body;
    const dataPath = path.join(process.cwd(), 'data', 'usage');
    await fs.mkdir(dataPath, { recursive: true });
    
    const today = new Date().toISOString().split('T')[0];
    const usageFile = path.join(dataPath, `${today}.json`);
    
    let dailyUsage = { date: today, sessions: [] };
    try {
      const existing = await fs.readFile(usageFile, 'utf-8');
      dailyUsage = JSON.parse(existing);
    } catch (e) {
      // File doesn't exist yet
    }
    
    dailyUsage.sessions.push({
      timestamp: now(),
      usage,
      cost
    });
    
    await fs.writeFile(usageFile, JSON.stringify(dailyUsage, null, 2));
    ok(res, { tracked: true });
    
  } catch (error) {
    console.error('Usage tracking error:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

// Get usage stats
app.get('/usage/stats', async (req, res) => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'usage');
    const files = await fs.readdir(dataPath);
    
    let totalCost = 0;
    let totalTokens = 0;
    let sessionCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(dataPath, file), 'utf-8');
        const data = JSON.parse(content);
        
        data.sessions.forEach(session => {
          totalCost += parseFloat(session.cost.totalCost);
          totalTokens += session.usage.totalTokens;
          sessionCount++;
        });
      }
    }
    
    ok(res, {
      totalCost: totalCost.toFixed(4),
      totalTokens,
      sessionCount,
      averageCostPerSession: sessionCount > 0 ? (totalCost / sessionCount).toFixed(4) : '0.0000'
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    ok(res, {
      totalCost: '0.0000',
      totalTokens: 0,
      sessionCount: 0,
      averageCostPerSession: '0.0000'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Henry AI Ultimate API running on port ${PORT}`);
  console.log(`💬 Natural conversation mode enabled`);
  console.log(`📊 Cost tracking active`);
  console.log(`🔧 All systems ready!`);
});