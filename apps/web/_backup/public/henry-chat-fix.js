(function(){
  const input = document.querySelector('textarea, input[type="text"]');
  const send  = document.querySelector('#sendBtn') || document.querySelector('button[type="submit"]');
  const chat  = document.querySelector('#chat') || document.body;

  function bubble(cls, txt){
    const d = document.createElement('div');
    d.className = 'bubble ' + (cls||'');
    d.textContent = txt;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }

  async function sendNow(){
    const text = (input.value||'').trim();
    if(!text) return;
    bubble('user', text);
    input.value = '';
    const r = await fetch('/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({messages:[{role:'user',content:text}]})
    });
    const j = await r.json();
    bubble('henry', j.reply || JSON.stringify(j));
  }

  if(input){
    input.addEventListener('keydown', e=>{
      if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendNow(); }
    });
  }
  if(send){ send.onclick = sendNow; }
})();
