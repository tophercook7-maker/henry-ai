(function(){
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  // ---- Dedupe composers: keep the last visible input, hide others ----
  function hideDupes(){
    const inputs = $$('textarea,[contenteditable="true"],input[type="text"],input[type="search"],[role="textbox"]')
      .filter(el => getComputedStyle(el).display !== 'none');
    if(inputs.length > 1){
      inputs.slice(0,-1).forEach(el => {
        const shell = el.closest('form,.composer,.compose-wrap,.input,.message-composer') || el;
        shell.classList.add('dupe-composer');
        shell.style.display = 'none';
      });
    }
  }
  hideDupes();
  new MutationObserver(hideDupes).observe(document.documentElement,{childList:true,subtree:true});

  // ---- Pills (top-right): model, chars, $ est. ----
  function ensurePills(){
    if($('.h-pills')) return;
    const bar = document.createElement('div');
    bar.className = 'h-pills';
    bar.innerHTML = `<span class="h-pill" id="pill-model">model: gpt-4o-mini</span>
                     <span class="h-pill" id="pill-chars">chars: 0</span>
                     <span class="h-pill" id="pill-cost">$ 0.00</span>`;
    document.body.appendChild(bar);
  }
  ensurePills();

  const LS_COST='__henry_cost__';
  function fmt2(n){ return (Math.round(n*100)/100).toFixed(2); }
  function updatePills(deltaChars=0){
    const pc = $('#pill-chars'), pm = $('#pill-model'), $p = $('#pill-cost');
    const model = (localStorage.getItem('__henry_model__') || 'gpt-4o-mini');
    const prev = Number(localStorage.getItem(LS_COST) || '0');
    // very conservative estimate: 1k chars ≈ 250 tokens; $0.15 / 1M input tokens → adjust later per your pricing
    const add = (deltaChars/1000) * 0.00015 * 250;
    const now = prev + (deltaChars>0 ? add : 0);
    localStorage.setItem(LS_COST, String(now));
    pm && (pm.textContent = 'model: ' + model);
    pc && (pc.textContent = 'chars: ' + (Number(pc.textContent.replace(/\D/g,'')||0) + Math.max(0,deltaChars)));
    $p && ($p.textContent = '$ ' + fmt2(now));
  }
  updatePills(0);

  // ---- Assistant-only Copy buttons ----
  function wireCopy(){
    // Heuristic: assistant bubbles often have a role or class;
    // fall back to anything not marked "user"
    const nodes = $$('.message.assistant, .bubble.assistant, .msg.assistant, [data-role="assistant"], .assistant');
    nodes.forEach(n=>{
      if(n.querySelector('.h-copy')) return;
      const btn = document.createElement('button');
      btn.className='h-copy';
      btn.type='button';
      btn.textContent='Copy';
      btn.onclick = ()=>{
        const text = n.innerText || n.textContent || '';
        navigator.clipboard.writeText(text.trim());
      };
      // put it in a top-right corner-ish place
      (n.querySelector('header, .meta, .top') || n).appendChild(btn);
    });
  }
  wireCopy();
  new MutationObserver(wireCopy).observe(document.documentElement,{childList:true,subtree:true});

  // ---- Enter sends, Shift+Enter newline; refocus after send ----
  function composer(){
    const el = $('textarea,[contenteditable="true"],input[type="text"],[role="textbox"]');
    if(!el || el.dataset.henryKeyed) return;
    el.dataset.henryKeyed = '1';

    const isTA = el.tagName==='TEXTAREA' || el.getAttribute('contenteditable')==='true';
    if(isTA){
      el.addEventListener('keydown', (e)=>{
        if(e.key==='Enter' && !e.shiftKey){
          // try to click an adjacent Send button; else let host handler run
          const btn = el.closest('form,.composer,.compose-wrap,.message-composer')?.querySelector('button[type="submit"], .send, [aria-label="Send"], [title="Send"]');
          if(btn){ e.preventDefault(); btn.click(); setTimeout(()=>el.focus(),120); }
        }
      });
    }
    // keep pills updated as you type
    el.addEventListener('input', ()=>updatePills((el.value||'').length));
  }
  composer();
  new MutationObserver(composer).observe(document.documentElement,{childList:true,subtree:true});
})();
