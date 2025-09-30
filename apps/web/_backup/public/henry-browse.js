(function(){
  const bar=document.querySelector('.pillbar')||(()=>{const b=document.createElement('div');b.className='pillbar';document.body.appendChild(b);return b;})();
  const btn=document.createElement('button');btn.className='pill';btn.textContent='🌐 browse';bar.prepend(btn);
  const post=(u,d)=>fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json());
  function addAssistantBubble(t){const thread=document.querySelector('.thread')||document.body;const wrap=document.createElement('div');wrap.className='msg assistant';const c=document.createElement('div');c.className='content';c.textContent=t;wrap.appendChild(c);thread.appendChild(wrap);window.scrollTo(0,document.body.scrollHeight);}
  btn.onclick=async()=>{const url=prompt('Paste a URL to fetch'); if(!url) return; addAssistantBubble('Fetching… '+url);
    try{const r=await post('/browse',{url}); if(!r.ok) throw new Error(r.error||'fetch failed');
      let arr=[];try{arr=JSON.parse(localStorage.getItem('__henry_convo__')||'[]')}catch{} 
      arr.push({role:'system',content:`SOURCE: ${r.title}\nURL: ${url}\n\n${r.text}`});
      localStorage.setItem('__henry_convo__',JSON.stringify(arr.slice(-200)));
      addAssistantBubble(`Fetched “${r.title}” (${r.len} chars). I stored the content in this chat. Ask me to summarize or answer questions about it.`);
    }catch(e){addAssistantBubble('Browse failed: '+e.message);}
  };
})();
