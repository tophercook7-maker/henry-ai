(() => {
  const $ = s => document.querySelector(s);
  const chatEl = $('#chat');
  const input  = $('#input');
  const fileEl = $('#file');
  const chips  = $('#chips');

  // Persisted settings
  const getKey  = () => (localStorage.getItem('henry_api_key')   || '').trim();
  const getBase = () => (localStorage.getItem('henry_api_base')  || '').trim()
                       || (window.API_BASE || 'http://127.0.0.1:3000');

  // Small helpers
  function bubble(cls, text) {
    const div = document.createElement('div');
    div.className = 'bubble ' + (cls || '');
    div.textContent = text;
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
    return div;
  }
  function lastReplyText() {
    const b = chatEl.querySelectorAll('.bubble');
    return b.length ? b[b.length - 1].textContent : '';
  }

  // Copy last reply
  const copyBtn = document.getElementById('copyLast');
  if (copyBtn) copyBtn.onclick = async () => {
    const t = lastReplyText();
    if (t) await navigator.clipboard.writeText(t);
  };

  // Attach (uploads go to API, not the web port)
  const attachBtn = document.getElementById('attachBtn');
  if (attachBtn) attachBtn.onclick = () => fileEl?.click();

  if (fileEl) fileEl.onchange = async () => {
    if (!fileEl.files || !fileEl.files[0]) return;
    const fd = new FormData();
    fd.append('file', fileEl.files[0]);

    try {
      const r = await fetch(getBase() + '/files/upload', { method: 'POST', body: fd, headers: { 'x-api-key': getKey() } });
      if (!r.ok) throw new Error('upload_failed');
      const j = await r.json();
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = j.file?.originalName || j.file?.name || 'file';
      chip.dataset.url = j.file?.url || '';
      chips?.appendChild(chip);
    } catch (e) {
      bubble('', 'Upload failed');
    }
  };

  // Send (chat to API with key)
  async function send() {
    const text = (input?.value || '').trim();
    if (!text) return;
    bubble('user', text);
    if (input) input.value = '';

    // Include any uploaded file URLs up front for the model
    const files = Array.from(chips?.querySelectorAll('.chip') || []).map(c => c.dataset.url).filter(Boolean);
    const preface = files.length ? `Attached files:\n${files.map(u => (location.origin + u)).join('\n')}\n\n` : '';
    const body = { messages: [{ role: 'user', content: preface + text }] };

    try {
      const r = await fetch(getBase() + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': getKey() },
        body: JSON.stringify(body)
      });
      const j = await r.json().catch(() => ({}));
      const reply = j.reply || j.choices?.[0]?.message?.content || 'Error: load failed';
      bubble('', reply);
    } catch {
      bubble('', 'Network error to API');
    }
  }

  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) sendBtn.onclick = send;
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
  }

  // Greet
  bubble('', "Hi, I'm Henry. I’m ready.");
})();
