(function(){
  const ls=(k,v)=>v===undefined?localStorage.getItem(k):localStorage.setItem(k,v);
  if(!ls('__henry_api_base__')) ls('__henry_api_base__','http://127.0.0.1:3000');

  function ensurePills(){
    if(document.querySelector('.henry-pillbar')) return;
    const bar=document.createElement('div'); bar.className='henry-pillbar';
    bar.innerHTML=`<div id="pill-model" class="henry-pill">model: gpt-4o-mini</div>
                   <div id="pill-chars" class="henry-pill">chars: 0</div>
                   <div id="pill-cost"  class="henry-pill">$0.000</div>`;
    document.body.appendChild(bar);
  }
  function updatePills(chars){
    const m=document.getElementById('pill-model'), c=document.getElementById('pill-chars'), d=document.getElementById('pill-cost');
    if(m) m.textContent='model: '+(localStorage.getItem('__henry_model__')||'gpt-4o-mini');
    if(c) c.textContent='chars: '+(chars|0);
    const dollars=((chars/4)*0.000003); if(d) d.textContent='$'+(Math.round(dollars*1000)/1000).toFixed(3);
  }

  function dedupeInputs(){
    const xs=[...document.querySelectorAll('textarea,[contenteditable="true"],input[type="text"],input[type="search"],[role="textbox"]')]
      .filter(e=>getComputedStyle(e).display!=='none');
    if(!xs.length) return;
    const main=xs[0]; xs.slice(1).forEach(e=>e.classList.add('henry-dupe'));
    const val=()=>('value'in main?main.value:main.textContent)||'';
    updatePills(val().length);
    main.addEventListener('input',()=>updatePills(val().length));
  }

  function dedupeThreads(){
    const els=[...document.querySelectorAll('[role="log"], .messages, .message-list, .chat, .chat-body, .thread, .conversation, [data-thread], [data-messages]')]
      .filter(e=>getComputedStyle(e).display!=='none');
    if(els.length<=1) return;
    let keep=els[0],kh=keep.getBoundingClientRect().height;
    els.forEach(e=>{const h=e.getBoundingClientRect().height; if(h>kh){keep=e;kh=h;}});
    els.forEach(e=>{if(e!==keep) e.classList.add('henry-dupe');});
  }

  function copyButtons(){
    document.querySelectorAll('.assistant,[data-role="assistant"],[data-message-role="assistant"]').forEach(n=>{
      if(n.querySelector('.henry-copy')) return;
      const b=document.createElement('button'); b.className='henry-copy'; b.textContent='Copy';
      b.addEventListener('click',()=>navigator.clipboard.writeText((n.innerText||'').trim()).catch(()=>{}));
      (n.firstElementChild||n).appendChild(b);
      n.classList.add('henry-bubble');
    });
    document.querySelectorAll('.user,[data-role="user"],[data-message-role="user"]').forEach(n=>n.classList.add('henry-bubble'));
  }

  function tick(){ ensurePills(); dedupeInputs(); dedupeThreads(); copyButtons(); }
  tick();
  new MutationObserver(()=>requestAnimationFrame(tick)).observe(document.documentElement,{childList:true,subtree:true});
})();
