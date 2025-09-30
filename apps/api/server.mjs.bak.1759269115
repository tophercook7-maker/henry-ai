import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({limit:'10mb'}));

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

// --- Chat endpoint ---
app.post('/chat', async (req,res)=>{
  try{
    const messages = (req.body && req.body.messages) || [];
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
            model: 'gpt-4o-mini',
            messages: [
              {role:'system', content:'You are Henry, a concise, friendly assistant. Be helpful and concrete.'},
              ...messages
            ],
            temperature: 0.3
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

    // Local helpful fallback (NO echo)
    let reply;
    if (!user) {
      reply = "Hey there—tell me what you want to do, and I’ll walk you through it step by step.";
    } else if (/hello|hi|hey/i.test(user)) {
      reply = "Howdy! I’m Henry. Tell me what you’re building and I’ll help—UI tweaks, API calls, debugging, anything.";
    } else if (/error|failed|timeout|404|502|load failed/i.test(user)) {
      reply = "Sounds like a bridge error. Try: 1) ensure API is on http://127.0.0.1:3000, 2) reload the page, 3) check PM2 logs. I can give exact commands if you paste the last error.";
    } else {
      reply = "Here’s a plan:\n1) Tell me the exact goal in one sentence.\n2) I’ll produce the bash you can paste.\n3) We’ll test, then polish the UI.\nReady when you are.";
    }
    return ok(res,{ok:true, model:'local-helper', reply, usage:{model:'local-helper'}});
  }catch(err){
    console.error(err);
    return res.status(500).json({ok:false, error:String(err)});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Henry API listening on http://127.0.0.1:${PORT}`));
