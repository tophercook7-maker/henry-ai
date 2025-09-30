(() => {
  if (window.__HENRY_OVERLAY_WIRED__) return;
  window.__HENRY_OVERLAY_WIRED__ = true;

  const $ = sel => document.querySelector(sel);
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn, { passive: false });

  const input   = $('#input') || document.querySelector('textarea#input');
  const sendBtn = document.getElementById('sendBtn') || document.querySelector('button[data-role="send"]');

  // Sidebar toggle (if your layout has one)
  const toggleBtn = document.getElementById('sidebar-toggle') || document.querySelector('[data-action="toggle-sidebar"]');
  on(toggleBtn, 'click', () => {
    document.body.classList.toggle('sidebar-hidden');
  });

  // Prevent form submit from re-binding/duplicating handlers
  let busy = false;
  async function doSend() {
    if (!input) return;
    const txt = (input.value || '').trim();
    if (!txt || busy) return;
    busy = true;
    try {
      // Let the page’s own send() run if it exists; otherwise fire a minimal fetch
      if (typeof window.send === 'function') {
        await window.send();
      } else {
        await fetch('/chat', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({messages:[{role:'user', content: txt}]})
        });
      }
    } catch (e) {
      console.error('Chat send error:', e);
    } finally {
      busy = false;
    }
  }

  // Only wire once, and stop default form submit clearing the box
  if (sendBtn && !sendBtn.__henryWired) {
    sendBtn.__henryWired = true;
    on(sendBtn, 'click', (e) => { e.preventDefault(); doSend(); });
  }
  if (input && !input.__henryWired) {
    input.__henryWired = true;
    on(input, 'keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    });
  }

  // Pills refresh if present (non-fatal if missing)
  const pillsModel = document.getElementById('pill-model');
  const pillsCost  = document.getElementById('pill-cost');
  function fmt2(n){ return (Math.round(n*100)/100).toFixed(2); }
  function refreshPills() {
    try {
      const mdl = localStorage.getItem('__henry_model__') || 'local';
      const cost= Number(localStorage.getItem('__henry_cost__') || '0');
      if (pillsModel) pillsModel.textContent = `model: ${mdl}`;
      if (pillsCost)  pillsCost.textContent  = `$${fmt2(cost)}`;
    } catch {}
  }
  refreshPills();

  console.log('✅ Henry overlay wired (UI cleaned, handlers guarded).');
})();
