type Role='user'|'assistant';
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;

const BAKED_API_BASE='http://127.0.0.1:3000';
const apiBase=()=> (localStorage.getItem('__henry_api_base__')||BAKED_API_BASE).replace(/\/+$/,'');
const apiKey =()=> (localStorage.getItem('henry_api_key')||'').trim();
const localAdmin=()=> localStorage.getItem('__henry_local_admin__')==='1';

const app=$('app');
const pillModel=$('pill-model'), pillChars=$('pill-chars'), pillCost=$('pill-cost');
const panels={
  chat:$('panel-chat'), files:$('panel-files'), projects:$('panel-projects'),
  terminal:$('panel-terminal'), writer:$('panel-writer'), settings:$('panel-settings'), help:$('panel-help')
} as const;

function showPanel(which:keyof typeof panels){
  Object.entries(panels).forEach(([k,el])=> el.classList.toggle('hidden', k!==which));
  ($('composer') as HTMLElement).style.display = which==='chat' ? 'flex':'none';
}

function addBubble(role:Role, text:string){
  const thread=panels.chat;
  const row=document.createElement('div'); row.className='msg '+role;
  const bubble=document.createElement('div'); bubble.className='bubble'; bubble.textContent=text; row.appendChild(bubble);
  if(role==='assistant'){ const copy=document.createElement('button'); copy.type='button'; copy.className='copy'; copy.textContent='Copy';
    copy.addEventListener('click', async e=>{ e.stopPropagation(); try{ await navigator.clipboard.writeText(text); copy.textContent='Copied!'; setTimeout(()=>copy.textContent='Copy',1200);}catch{} });
    row.appendChild(copy);
  }
  thread.appendChild(row); thread.scrollTop=thread.scrollHeight;
}
function setBusy(on:boolean){ ( $('input') as HTMLTextAreaElement ).disabled=on; ( $('send') as HTMLButtonElement ).disabled=on; }
function updatePills(model:string,chars:number,cost:number){ pillModel.textContent=model||'–'; pillChars.textContent=String(chars); pillCost.textContent=cost.toFixed(4); }

async function callChat(text:string){
  const headers:Record<string,string>={'Content-Type':'application/json'};
  const k=apiKey(); if(k) headers['x-api-key']=k;
  const r=await fetch(`${apiBase()}/chat`,{method:'POST',headers,body:JSON.stringify({messages:[{role:'user',content:text}]})});
  if(!r.ok) throw new Error(`API ${r.status}`);
  const j=await r.json();
  const reply=j.reply ?? j.message ?? j.content ?? JSON.stringify(j);
  const usage=j.usage||{};
  const prev=Number(pillChars.textContent||'0');
  updatePills(usage.model || j.model || '–', usage.chars ?? (prev+text.length+String(reply).length), usage.cost ?? (prev/1000*0.002));
  return reply;
}
async function runSystem(cmd:string,args:string[]=[],cwd?:string){
  const headers:Record<string,string>={'Content-Type':'application/json'};
  if(localAdmin()) headers['x-local-admin']='1';
  const r=await fetch(`${apiBase()}/system/run`,{method:'POST',headers,body:JSON.stringify({cmd,args,cwd})});
  return r.json();
}

document.querySelectorAll('.navbtn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const tab=(btn as HTMLElement).dataset.tab as keyof typeof panels;
    showPanel(tab);
  });
});
$('btn-toggle')?.addEventListener('click', e=>{ e.stopPropagation(); app.classList.toggle('collapsed'); });

const form=$('composer') as HTMLFormElement;
const input=$('input') as HTMLTextAreaElement;
form.addEventListener('submit', async e=>{
  e.preventDefault();
  const text=input.value.trim(); if(!text) return;
  input.value=''; addBubble('user',text); setBusy(true);
  try{ const reply=await callChat(text); addBubble('assistant',reply); }
  catch(err:any){ addBubble('assistant',`⚠️ ${err?.message||err}`); }
  finally{ setBusy(false); input.focus(); }
});
input.addEventListener('keydown',(e:KeyboardEvent)=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); form.requestSubmit(); }});

const inpApi=$('inp-api') as HTMLInputElement, inpKey=$('inp-key') as HTMLInputElement;
const saveOK=$('save-ok');
$('btn-save')?.addEventListener('click', ()=>{
  if(inpApi.value.trim()) localStorage.setItem('__henry_api_base__', inpApi.value.trim());
  if(inpKey.value.trim()) localStorage.setItem('henry_api_key', inpKey.value.trim());
  saveOK.textContent='Saved'; setTimeout(()=>saveOK.textContent='',1500);
  showPanel('chat');
});

const chkAdmin=$('chk-admin') as HTMLInputElement;
chkAdmin.checked = localAdmin();
chkAdmin.addEventListener('change', ()=> localStorage.setItem('__henry_local_admin__', chkAdmin.checked ? '1':'0'));

$('btn-upload')?.addEventListener('click', async ()=>{
  const log=$('files-log'); log.textContent='';
  const fp = document.getElementById('filepick') as HTMLInputElement;
  if(!fp.files || fp.files.length===0){ log.textContent='Pick file(s) first.'; return; }
  for(const f of Array.from(fp.files)){
    const fd=new FormData(); fd.append('file', f);
    const r=await fetch(`${apiBase()}/upload`,{method:'POST',body:fd});
    const t=await r.text(); const p=document.createElement('pre'); p.className='log'; p.textContent=t; log.appendChild(p);
  }
});

$('btn-gh')?.addEventListener('click', async ()=>{
  const log=$('gh-log'); log.textContent='…';
  try{
    const r=await fetch(`${apiBase()}/gh/view`);
    const j=await r.json();
    log.textContent = j.ok ? JSON.stringify(j.info,null,2) : JSON.stringify(j,null,2);
  }catch(e){ log.textContent=String(e); }
});

$('btn-git-status')?.addEventListener('click', async ()=>{
  const log=$('term-log'); log.textContent='…';
  const j=await runSystem('git',['status'], undefined);
  log.textContent = JSON.stringify(j,null,2);
});
$('btn-gh-view')?.addEventListener('click', async ()=>{
  const log=$('term-log'); log.textContent='…';
  const j=await runSystem('gh',['repo','view','--web'], undefined); // will show error JSON if blocked or not allowed (intended)
  log.textContent = JSON.stringify(j,null,2);
});
$('btn-xcode-sdks')?.addEventListener('click', async ()=>{
  const log=$('term-log'); log.textContent='…';
  const j=await runSystem('xcodebuild',['-showsdks'], undefined);
  log.textContent = JSON.stringify(j,null,2);
});

const wLog=$('writer-log');
$('btn-outline')?.addEventListener('click', async ()=>{
  const topic=(document.getElementById('w-topic') as HTMLInputElement).value.trim();
  const intent=(document.getElementById('w-intent') as HTMLInputElement).value.trim()||'outline';
  const aud=(document.getElementById('w-aud') as HTMLInputElement).value.trim();
  const notes=(document.getElementById('w-notes') as HTMLTextAreaElement).value.trim();
  const prompt=`Write a ${intent} about "${topic}" for ${aud||'a general audience'}. Notes: ${notes||'(none)'}.\nReturn sections with short summaries.`;
  wLog.textContent='…'; try{ const r=await callChat(prompt); wLog.textContent=r; }catch(e){ wLog.textContent=String(e); }
});
$('btn-section')?.addEventListener('click', async ()=>{
  const topic=(document.getElementById('w-topic') as HTMLInputElement).value.trim();
  const notes=(document.getElementById('w-notes') as HTMLTextAreaElement).value.trim();
  const prompt=`Draft a detailed section for: ${topic}. Respect these constraints: ${notes||'(none)'}.`;
  wLog.textContent='…'; try{ const r=await callChat(prompt); wLog.textContent=r; }catch(e){ wLog.textContent=String(e); }
});

// On load: seed Settings form & focus
inpApi.value = apiBase(); inpKey.value = apiKey();
($('input') as HTMLTextAreaElement).focus();
