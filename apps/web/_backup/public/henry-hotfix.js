(() => {
  const API = window.HENRY_API_BASE || "http://127.0.0.1:3000";

  const toast = (msg, kind="info") => {
    let t = document.getElementById("henry-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "henry-toast";
      Object.assign(t.style, {position:"fixed",right:"12px",bottom:"80px",maxWidth:"60ch",
        background:"rgba(20,20,22,.96)",color:"#e7ebf3",border:"1px solid #333",
        borderRadius:"10px",padding:"10px 12px",zIndex:99999,fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,sans-serif"});
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.display="block";
    t.style.borderColor = kind==="error" ? "#a33" : "#333";
    t.style.color       = kind==="error" ? "#ffd6d6" : "#e7ebf3";
    clearTimeout(t._h); t._h=setTimeout(()=>t.style.display="none", 3000);
  };

  // Sticky bar + minimal styles
  if (!document.getElementById("henry-hotfix")) {
    const bar = document.createElement("div");
    bar.id="henry-hotfix";
    bar.innerHTML = `
      <span id="hf-model" class="pill">model: …</span>
      <textarea id="hf-input" placeholder="Enter sends; Shift+Enter = newline"></textarea>
      <label class="btn" title="Attach file"><input id="hf-file" type="file" multiple />📎</label>
      <button id="hf-mic"   class="btn" title="Hold to speak">🎙</button>
      <button id="hf-speak" class="btn" title="Toggle voice">🔊</button>
      <button id="hf-copy"  class="btn" title="Copy last">⧉</button>
      <button id="hf-send"  class="btn">Send</button>
    `;
    document.body.appendChild(bar);
    const s = document.createElement("style"); s.textContent = `
      #henry-hotfix{position:fixed;left:0;right:0;bottom:0;display:flex;gap:8px;align-items:center;padding:10px;background:rgba(20,20,22,.96);border-top:1px solid #333;z-index:9999;backdrop-filter:blur(6px);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
      #henry-hotfix textarea{flex:1;min-height:42px;max-height:160px;resize:vertical;background:#0f1115;color:#e7ebf3;border:1px solid #2a2f3a;border-radius:8px;padding:10px 12px;line-height:1.3}
      #henry-hotfix .btn{padding:8px 10px;font-size:12px;line-height:1;border-radius:8px;background:#1f2633;color:#e7ebf3;border:1px solid #2b3342;cursor:pointer}
      .henry-msg{max-width:800px;margin:8px auto;padding:10px 12px;border-radius:14px}
      .henry-user{background:#173b7a;color:#e7f0ff}
      .henry-bot{background:#0f1115;color:#e7ebf3;border:1px solid #2a2f3a}
      body{background:#0b0d12}
      .pill{font-size:11px;padding:6px 8px;border-radius:999px;border:1px solid #2b3342;color:#9fb3ff}
      #henry-hotfix input[type=file]{display:none}
    `;
    document.head.appendChild(s);
  }

  const scrollEl = document.scrollingElement || document.body;
  const ensureMsg = (role, text) => {
    let host = document.getElementById("henry-msg-host");
    if (!host) { host = document.createElement("div"); host.id="henry-msg-host"; host.style.padding="16px 10px 120px"; document.body.appendChild(host); }
    const div = document.createElement("div");
    div.className = `henry-msg ${role==="user"?"henry-user":"henry-bot"}`;
    div.textContent = text;
    host.appendChild(div);
    setTimeout(()=>scrollEl.scrollTo({top:scrollEl.scrollHeight,behavior:"smooth"}),0);
    return div;
  };

  // preflight: show API health quickly
  fetch(`${API}/ping`).then(r=>r.json()).then(j=>toast(`API ${j?.ok?"OK":"?"} pid:${j?.pid}`)).catch(()=>toast("API unreachable","error"));

  // Model badge
  fetch(`${API}/key-verify`).then(r=>r.json()).then(j=>{
    const b=document.getElementById("hf-model");
    if(j?.ok && Array.isArray(j.models)){const pref=j.models.find(m=>/gpt-5|o1|gpt-4o|gpt-4\.1/.test(m))||j.models[0]; b.textContent=`model: ${pref}`; b.dataset.model=pref;}
    else{b.textContent="model: gpt-4o-mini"; b.dataset.model="gpt-4o-mini";}
  }).catch(()=>{});

  const $=id=>document.getElementById(id);
  const input=$("hf-input"), send=$("hf-send"), copyB=$("hf-copy"), spkB=$("hf-speak"), micB=$("hf-mic"), fileI=$("hf-file");
  let lastBot="", voiceOn=false;

  const speak=(t)=>{ if(!voiceOn) return; try{ const u=new SpeechSynthesisUtterance(t); speechSynthesis.cancel(); speechSynthesis.speak(u);}catch{} };

  const fetchWithTimeout = (url, opts={}, ms=8000) => {
    const c=new AbortController(); const t=setTimeout(()=>c.abort(), ms);
    return fetch(url,{...opts,signal:c.signal}).finally(()=>clearTimeout(t));
  };

  const sendNow = async () => {
    const raw=input.value; const text=raw.trim(); const model=document.getElementById("hf-model")?.dataset.model || "gpt-4o-mini";
    if(!text){ toast("Type something first"); return; }

    ensureMsg("user", text);
    send.disabled=true; input.disabled=true;
    const thinking = ensureMsg("bot", "…thinking");

    let fileNotes=""; if(fileI?.files?.length){ const names=[...fileI.files].map(f=>f.name).join(", "); fileNotes=`\n\n(Attached files: ${names})`; }

    try{
      const r = await fetchWithTimeout(`${API}/chat`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model, messages:[{role:"system",content:"You are Henry, a warm, helpful assistant."},{role:"user",content:text+fileNotes}] })
      });

      const ct=r.headers.get("content-type")||""; const isJSON=ct.includes("application/json");
      const data=isJSON ? await r.json().catch(()=>null) : await r.text();

      thinking.remove();

      if(!r.ok){
        console.error("chat failed", r.status, data);
        toast(`Chat failed ${r.status}`, "error");
        ensureMsg("bot", typeof data==="string"? data : (data?.error || data?.reason || "Chat failed"));
        return;
      }

      const reply=(isJSON?(data?.reply||data?.content):data)||"No reply";
      lastBot=reply; ensureMsg("bot", reply); speak(reply);
      input.value=""; if(fileI) fileI.value="";
    }catch(e){
      thinking.remove();
      const msg = (e?.name==="AbortError") ? "Timeout (8s)" : "Network error";
      toast(msg, "error");
      ensureMsg("bot", msg+" talking to API.");
      console.error("chat error", e);
    }finally{
      send.disabled=false; input.disabled=false; input.focus();
    }
  };

  send.onclick=sendNow;
  input.addEventListener("keydown",e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendNow(); } });

  copyB.onclick=async()=>{ if(!lastBot) return; try{ await navigator.clipboard.writeText(lastBot); copyB.textContent="✓"; setTimeout(()=>copyB.textContent="⧉",800);}catch{} };
  spkB.onclick=()=>{ voiceOn=!voiceOn; spkB.textContent=voiceOn?"🔈":"🔊"; };
  micB.onmousedown=async()=>{ try{ const s=await navigator.mediaDevices.getUserMedia({audio:true}); const rec=new MediaRecorder(s); rec.onstop=()=>ensureMsg("user","[voice note recorded]"); rec.start(); micB._rec=rec; micB.textContent="●"; }catch{ ensureMsg("bot","Mic not available."); } };
  micB.onmouseup=()=>{ try{ micB._rec?.stop(); micB.textContent="🎙"; }catch{} };

  ensureMsg("bot","Howdy — Henry’s here. Enter sends; Shift+Enter = newline.");
})();
