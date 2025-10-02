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
              {role:'system', content:'You are Henry, an AI assistant who talks naturally like a helpful friend. Be conversational and warm - no bullet points, no formal language, no robotic responses. Just talk like a real person who genuinely wants to help. When explaining things, use natural flowing sentences. Ask questions when you need clarity. Be enthusiastic but not over the top. If something is complex, break it down in a conversational way, not a list. Think of how you would explain something to a friend over coffee - that is your style. You can write code, access GitHub, run terminal commands, and help with any technical task. Just be natural about it.'},
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

    // Local helpful fallback - natural and conversational
    let reply;
    if (!user) {
      reply = "Hey! I'm Henry. What would you like to work on today? I can help with coding, GitHub, terminal commands, or pretty much anything technical. Just let me know what you need!";
    } else if (/hello|hi|hey/i.test(user)) {
      reply = "Hey there! Great to chat with you. I'm Henry, and I'm here to help with whatever you're working on. Whether it's building something new, debugging code, or just figuring out how to do something - I've got you covered. What's on your mind?";
    } else if (/error|failed|timeout|404|502|load failed/i.test(user)) {
      reply = "Ah, looks like we hit a snag! Let me help you troubleshoot this. First, can you tell me exactly what you were trying to do when this error popped up? That'll help me figure out the best way to fix it. In the meantime, make sure the API server is running on http://127.0.0.1:3000 - that's usually the culprit!";
    } else {
      reply = "I'd love to help with that! To make sure I give you exactly what you need, could you tell me a bit more about what you're trying to accomplish? Once I understand the goal, I can walk you through it step by step or even handle it for you if you'd like. What sounds good?";
    }
    return ok(res,{ok:true, model:'local-helper', reply, usage:{model:'local-helper'}});
  }catch(err){
    console.error(err);
    return res.status(500).json({ok:false, error:String(err)});
  }
});

// Terminal command execution endpoint
app.post('/terminal/execute', async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) return res.status(400).json({ ok: false, error: 'No command provided' });
    
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: process.cwd(),
        timeout: 30000 // 30 second timeout
      });
      res.json({ ok: true, output: stdout || stderr });
    } catch (error) {
      res.json({ ok: true, output: error.message, error: true });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Henry API listening on http://127.0.0.1:${PORT}`));

// HENRY_SYSTEM_HELPERS_BEGIN
import os from "node:os";
import child_process from "node:child_process";
const ex = (cmd,args,opts={}) => new Promise((resolve)=>{
  const ps = child_process.spawn(cmd,args,{shell:false,env:process.env,...opts});
  let out="", err=""; ps.stdout.on("data",d=>out+=d); ps.stderr.on("data",d=>err+=d);
  ps.on("close",code=>resolve({code,out,err}));
});
function safeStr(s){ return String(s??"").trim(); }
function isPlainNumber(s){ return /^[0-9]+$/.test(s); }
function rejectPathy(a){ return a.some(x => /(^\/|\.{2}\/|\/\.{2}|~)/.test(x)); }
function capArgs(args, limit=16){ if(args.length>limit) throw new Error("too-many-args"); return args; }

const ALLOWED = {
  git: new Set(["status","branch","rev-parse","log","show","diff","ls-files","add","commit","push"]),
  gh:  new Set(["repo","pr","issue","auth"]),
  xcodebuild: new Set(["-showsdks","-version","-list"]),
  uname: new Set(["-a"]),
  node: new Set(["-v"]),
  npm:  new Set(["-v"])
};

app.post("/system/run", async (req,res)=>{
  try{
    const admin = safeStr(req.headers["x-local-admin"])==="1";
    const dang  = safeStr(req.headers["x-dangerous"])==="1"; // required for writey git ops
    if(!admin) return res.status(403).json({ok:false,error:"admin-off"});

    const body=req.body||{};
    const cmd = safeStr(body.cmd);
    let args = Array.isArray(body.args)? body.args.map(safeStr) : [];
    const cwd  = safeStr(body.cwd)||process.cwd();

    if(!cmd) return res.status(400).json({ok:false,error:"missing-cmd"});
    if(!Object.prototype.hasOwnProperty.call(ALLOWED, cmd)) {
      return res.status(400).json({ok:false,error:"not-allowed-cmd"});
    }
    args = capArgs(args, 16);
    if(rejectPathy(args)) return res.status(400).json({ok:false,error:"blocked-path-arg"});

    if(cmd==="git"){
      const sub=args[0]||"";
      if(!ALLOWED.git.has(sub)) return res.status(400).json({ok:false,error:"git-subcmd-blocked",sub});
      // read-only: no dangerous header required
      const writeSubs = new Set(["add","commit","push"]);
      if(writeSubs.has(sub) && !dang) return res.status(403).json({ok:false,error:"danger-confirm-missing"});
      // Validate specific subs conservatively
      if(sub==="rev-parse"){
        const okArgs=new Set(["rev-parse","--abbrev-ref","HEAD"]);
        for(const x of args){ if(!okArgs.has(x)) return res.status(400).json({ok:false,error:"git-arg-blocked",arg:x}); }
      }
      if(sub==="log"){
        const expect=new Set(["log","--oneline","-n"]);
        if(args.length<2) return res.status(400).json({ok:false,error:"git-log-needs-flags"});
        if(!(expect.has(args[0]) && expect.has(args[1]))) return res.status(400).json({ok:false,error:"git-log-flags"});
        if(args[2] && args[2]!=="-n") return res.status(400).json({ok:false,error:"git-log-only-n"});
        if(args[3] && !isPlainNumber(args[3])) return res.status(400).json({ok:false,error:"git-log-n-not-number"});
      }
      if(sub==="show"){
        if(args.length!==2) return res.status(400).json({ok:false,error:"git-show-one-ref"});
        if(args[1].length>64) return res.status(400).json({ok:false,error:"git-ref-too-long"});
      }
      if(sub==="diff"){
        if(args.length<2) return res.status(400).json({ok:false,error:"git-diff-needs--name-only"});
        if(args[0]!=="diff"||args[1]!=="--name-only") return res.status(400).json({ok:false,error:"git-diff-only-name-only"});
      }
      if(sub==="add"){
        if(!(args.length===2 && args[1]==="-A")) return res.status(400).json({ok:false,error:"git-add-only-A"});
      }
      if(sub==="commit"){
        // git commit -m "msg"
        if(!(args.length>=3 && args[1]==="-m")) return res.status(400).json({ok:false,error:"git-commit-requires-m"});
        if(args.slice(2).join(" ").length>500) return res.status(400).json({ok:false,error:"commit-msg-too-long"});
      }
      if(sub==="push"){
        if(args.length!==1) return res.status(400).json({ok:false,error:"git-push-no-extra-args"});
      }
    }

    const {code,out,err} = await ex(cmd,args,{cwd});
    return res.json({ok:true,code,out,err});
  }catch(e){
    return res.status(500).json({ok:false,error:String(e)});
  }
});
// HENRY_SYSTEM_HELPERS_END




// HENRY_WRITE_CAPS_BEGIN
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = path.resolve(process.cwd(), ".."); // apps/api -> apps -> henry (root)
function safePath(p){
  const raw = String(p ?? "").trim();
  if(!raw) throw new Error("missing-path");
  if(raw.startsWith("/") || raw.includes("..")) throw new Error("unsafe-path");
  const abs = path.resolve(PROJECT_ROOT, raw);
  if(!abs.startsWith(PROJECT_ROOT)) throw new Error("escaped-root");
  return abs;
}

function requireDanger(req){
  const admin = String(req.headers["x-local-admin"]||"").trim()==="1";
  const dang  = String(req.headers["x-dangerous"]||"").trim()==="1";
  if(!admin) throw new Error("admin-off");
  if(!dang)  throw new Error("danger-confirm-missing");
}

/** List directory relative to repo root: { path } */
app.post("/fs/list", async (req,res)=>{
  try{
    const rel = (req.body && req.body.path) || ".";
    const abs = safePath(rel);
    const ents = await fsp.readdir(abs, { withFileTypes:true });
    const items = ents.map(e=>({name:e.name, dir:e.isDirectory(), file:e.isFile()}));
    res.json({ok:true, root:PROJECT_ROOT, path:rel, items});
  }catch(e){ res.status(400).json({ok:false, error:String(e.message||e)}); }
});

/** Read a small text file: { path, max=200000 } */
app.post("/fs/read", async (req,res)=>{
  try{
    const rel = (req.body && req.body.path);
    const abs = safePath(rel);
    const max = Math.min(Number(req.body?.max||200000), 2_000_000);
    const buf = await fsp.readFile(abs);
    const txt = buf.slice(0, max).toString("utf8");
    res.json({ok:true, path:rel, size:buf.length, content:txt, truncated: buf.length>max});
  }catch(e){ res.status(400).json({ok:false, error:String(e.message||e)}); }
});

/** Write text file (create/overwrite): { path, content } */
app.post("/fs/write", async (req,res)=>{
  try{
    requireDanger(req);
    const rel = (req.body && req.body.path);
    const abs = safePath(rel);
    const content = String(req.body?.content ?? "");
    await fsp.mkdir(path.dirname(abs), { recursive:true });
    await fsp.writeFile(abs, content, "utf8");
    res.json({ok:true, path:rel, bytes: Buffer.byteLength(content, "utf8")});
  }catch(e){ res.status(400).json({ok:false, error:String(e.message||e)}); }
});

/** Git commit (and optional push): { message, push=false } */
app.post("/git/commit", async (req,res)=>{
  try{
    requireDanger(req);
    const msg = String(req.body?.message ?? "").trim();
    if(!msg) throw new Error("missing-commit-message");
    // Run from PROJECT_ROOT
    const {code:ca,out:oa,err:ea} = await ex("git",["add","-A"],{cwd:PROJECT_ROOT});
    if(ca!==0) return res.status(500).json({ok:false,step:"add",out:oa,err:ea});
    const {code:cc,out:oc,err:ec} = await ex("git",["commit","-m",msg],{cwd:PROJECT_ROOT});
    // commit might be no-op if nothing changed
    let push = false, pushResult=null;
    if(req.body?.push){
      const {code:cp,out:op,err:ep} = await ex("git",["push"],{cwd:PROJECT_ROOT});
      push = true; pushResult={code:cp,out:op,err:ep};
    }
    res.json({ok:true, add:{code:ca,out:oa,err:ea}, commit:{code:cc,out:oc,err:ec}, push, pushResult});
  }catch(e){ res.status(400).json({ok:false, error:String(e.message||e)}); }
});
// HENRY_WRITE_CAPS_END

