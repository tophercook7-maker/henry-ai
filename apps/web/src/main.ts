type Role = 'user'|'assistant';
const $ = <T extends HTMLElement>(id:string)=>document.getElementById(id) as T;

// Baked-in API base so you don't need console/settings
const BAKED_API_BASE = 'http://127.0.0.1:3000';

const app=$('app'), panelChat=$('panel-chat'), panelSets=$('panel-settings'), panelHelp=$('panel-help');
const thread=$('panel-chat'); const form=$('composer') as HTMLFormElement; const input=$('input') as HTMLTextAreaElement; const sendBtn=$('send') as HTMLButtonElement;
const pillModel=$('pill-model'), pillChars=$('pill-chars'), pillCost=$('pill-cost');
const btnToggle=$('btn-toggle') as HTMLButtonElement, btnNew=$('btn-new') as HTMLButtonElement;
const tabChat=$('tab-chat') as HTMLButtonElement, tabSets=$('tab-settings') as HTMLButtonElement, tabHelpBtn=$('tab-help') as HTMLButtonElement;
const inpApi=$('inp-api') as HTMLInputElement, inpKey=$('inp-key') as HTMLInputElement, btnSave=$('btn-save-settings') as HTMLButtonElement;

const apiBase = ()=> (localStorage.getItem('__henry_api_base__') || BAKED_API_BASE).replace(/\/+$/,'');
const apiKey  = ()=> (localStorage.getItem('henry_api_key') || '').trim();

function showPanel(which:'chat'|'settings'|'help'){
  panelChat.classList.toggle('hidden', which!=='chat');
  panelSets.classList.toggle('hidden', which!=='settings');
  panelHelp.classList.toggle('hidden', which!=='help');
  (document.getElementById('composer') as HTMLElement).style.display = which==='chat' ? 'flex' : 'none';
}
function setBusy(on:boolean){ input.disabled=on; sendBtn.disabled=on; input.style.opacity=on?'.7':'1'; }
function addBubble(role:Role, text:string){
  const row=document.createElement('div'); row.className='msg '+role;
  const bubble=document.createElement('div'); bubble.className='bubble'; bubble.textContent=text; row.appendChild(bubble);
  if(role==='assistant'){ const copy=document.createElement('button'); copy.type='button'; copy.className='copy'; copy.textContent='Copy';
    copy.addEventListener('click', async e=>{ e.stopPropagation(); try{ await navigator.clipboard.writeText(text); copy.textContent='Copied!'; setTimeout(()=>copy.textContent='Copy',1200);}catch{} });
    row.appendChild(copy);
  }
  thread.appendChild(row); thread.scrollTop = thread.scrollHeight;
}
function updatePills(model:string, chars:number, cost:number){ pillModel.textContent=model||'–'; pillChars.textContent=String(chars); pillCost.textContent=cost.toFixed(4); }

async function callChat(text:string){
  const headers:Record<string,string>={'Content-Type':'application/json'};
  const k=apiKey(); if(k) headers['x-api-key']=k;
  const r=await fetch(`${apiBase()}/chat`, { method:'POST', headers, body: JSON.stringify({messages:[{role:'user',content:text}]}) });
  if(!r.ok) throw new Error(`API ${r.status}`);
  const j=await r.json();
  const reply = j.reply ?? j.message ?? j.content ?? (typeof j==='string'? j : JSON.stringify(j));
  const usage = j.usage || {};
  const prev = Number(pillChars.textContent||'0');
  updatePills(usage.model || j.model || '–', usage.chars ?? (prev+text.length+String(reply).length), usage.cost ?? (prev/1000*0.002));
  return reply;
}

btnToggle.addEventListener('click', e=>{ e.stopPropagation(); app.classList.toggle('collapsed'); });
tabChat.addEventListener('click', ()=> showPanel('chat'));
tabSets.addEventListener('click', ()=>{ inpApi.value=apiBase(); inpKey.value=apiKey(); showPanel('settings'); });
tabHelpBtn.addEventListener('click', ()=> showPanel('help'));
btnSave.addEventListener('click', ()=>{ localStorage.setItem('__henry_api_base__', inpApi.value.trim()); localStorage.setItem('henry_api_key', inpKey.value.trim()); showPanel('chat'); });
btnNew.addEventListener('click', ()=>{ panelChat.innerHTML=''; addBubble('assistant','New chat started. How can I help?'); showPanel('chat'); });

form.addEventListener('submit', async e=>{
  e.preventDefault();
  const text=input.value.trim(); if(!text) return;
  input.value=''; addBubble('user',text); setBusy(true);
  try{ const reply=await callChat(text); addBubble('assistant', reply); }
  catch(err:any){ addBubble('assistant', `⚠️ ${err?.message ?? err}`); }
  finally{ setBusy(false); input.focus(); }
});
input.addEventListener('keydown', (e:KeyboardEvent)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); form.requestSubmit(); }});

input.focus();
