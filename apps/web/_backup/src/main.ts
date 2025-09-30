const apiBase = localStorage.getItem('__henry_api_base__') || 'http://127.0.0.1:3000';
const threadEl = document.getElementById('thread')!;
const form = document.getElementById('composer-form') as HTMLFormElement;
const input = document.getElementById('composer-input') as HTMLTextAreaElement;
const pillModel = document.getElementById('pill-model')!;
const pillChars = document.getElementById('pill-chars')!;
const pillCost = document.getElementById('pill-cost')!;
const btnCopyLast = document.getElementById('btn-copy-last') as HTMLButtonElement;

function addBubble(role:'user'|'assistant', text:string){
  const row = document.createElement('div');
  row.className = `msg ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  row.appendChild(bubble);

  // copy button only on assistant
  if (role === 'assistant') {
    const copy = document.createElement('button');
    copy.className = 'copy';
    copy.type = 'button';
    copy.textContent = 'Copy';
    copy.onclick = () => navigator.clipboard.writeText(text);
    row.appendChild(copy);
  }

  threadEl.appendChild(row);
  threadEl.scrollTop = threadEl.scrollHeight;
}
function updatePills(model:string, chars:number, cost:number){
  pillModel.textContent = model || '–';
  pillChars.textContent = String(chars);
  pillCost.textContent = cost.toFixed(2);
}

async function chat(content:string){
  // optimistic UI
  addBubble('user', content);
  input.value = '';
  updatePills(pillModel.textContent || '–', content.length, parseFloat(pillCost.textContent || '0'));

  try{
    const r = await fetch(`${apiBase}/chat`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({messages:[{role:'user', content}]})
    });
    if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    const j = await r.json();
    // Expect { message, usage: { model, chars, cost } } or similar
    const reply = j.message || j.content || (typeof j === 'string' ? j : JSON.stringify(j));
    addBubble('assistant', reply);
    const usage = j.usage || {};
    updatePills(usage.model || pillModel.textContent || '–', usage.chars || content.length, usage.cost || 0);
  }catch(err:any){
    addBubble('assistant', `⚠️ ${err.message ?? err}`);
  }
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const val = input.value.trim();
  if(!val) return;
  chat(val);
});

// Textarea: Enter=send, Shift+Enter=newline
input.addEventListener('keydown', (e:KeyboardEvent)=>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    form.requestSubmit();
  }
});

// Copy last assistant button
btnCopyLast.addEventListener('click', ()=>{
  const nodes = Array.from(threadEl.querySelectorAll('.assistant .bubble')) as HTMLDivElement[];
  const last = nodes[nodes.length-1];
  if (last) navigator.clipboard.writeText(last.textContent || '');
});

// Guard: NO global document click handler (prevents random clicks sending)
