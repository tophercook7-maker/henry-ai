(() => {
  // --- Elements ---
  const root   = document;                         // current page
  const chat   = root.querySelector('#chat') || root.querySelector('[data-chat]');
  const input  = root.querySelector('#prompt') || root.querySelector('textarea, input[type=text]');
  const sendBtn= root.querySelector('#sendBtn') || root.querySelector('button[data-send]');
  const header = root.querySelector('#header') || root.querySelector('header');

  // Inject a Back button in the header if missing
  let back = root.querySelector('#btn-back');
  if (!back && header) {
    back = root.createElement('button');
    back.id = 'btn-back';
    back.className = 'btn small';
    back.title = 'Undo last turn';
    back.textContent = '⟲ Back';
    header.appendChild(back);
  }

  // --- History store (persists across refresh) ---
  const LS_KEY = 'henry_chat_log';
  const log = (() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
  })();
  const save = () => localStorage.setItem(LS_KEY, JSON.stringify(log));

  // --- Rendering helpers (very lightweight) ---
  function bubble(role, content) {
    const div = root.createElement('div');
    div.className = role === 'user' ? 'bubble user' : 'bubble bot';
    div.textContent = content;
    chat?.appendChild(div);
    chat?.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
  }
  function rebuild() {
    chat && (chat.innerHTML = '');
    for (const m of log) bubble(m.role, m.content);
  }

  function add(role, content) {
    log.push({ role, content });
    save(); bubble(role, content);
  }

  // --- Undo last (user + assistant) ---
  function undoLastTurn() {
    if (log.length >= 2) {
      log.splice(-2, 2); save(); rebuild();
      // Put the last user message (if any) back into the input for easy edit
      const u = [...log].reverse().find(m => m.role === 'user');
      if (u && input) input.value = u.content;
    }
  }
  back?.addEventListener('click', undoLastTurn);

  // --- Send handler: sends full history + new user msg ---
  async function send() {
    const msg = (input?.value || '').trim();
    if (!msg) return;
    add('user', msg);
    if (input) input.value = '';

    // Build payload: full history + newest user msg is already in `log`
    const payload = { messages: log.map(m => ({ role: m.role, content: m.content })) };
    try {
      const r = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const t = await r.text();
      // Try to parse assistant reply from JSON; fallback to raw text
      let reply = t;
      try {
        const j = JSON.parse(t);
        reply = j.reply || j.choices?.[0]?.message?.content || t;
      } catch (_e) {}
      add('assistant', reply || '(no reply)');
    } catch (e) {
      add('assistant', 'Network error to API');
    }
  }

  // Wire send button + Enter
  sendBtn?.addEventListener('click', (e) => { e.preventDefault(); send(); });
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  // Expose for quick testing in Console: henry.undo(), henry.send('hi')
  window.henry = { send, undo: undoLastTurn, add, log };

  rebuild(); // render any existing history on load
})();
