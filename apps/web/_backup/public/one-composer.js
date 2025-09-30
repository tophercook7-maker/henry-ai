(function () {
  const once = () => {
    // remove duplicate forms/areas
    const areas = Array.from(document.querySelectorAll('textarea, .composer textarea'));
    if (areas.length > 1) {
      areas.slice(1).forEach(a => (a.closest('form') || a.parentElement)?.remove());
    }
    // ensure only one visible Send button next to the kept textarea
    const sends = Array.from(document.querySelectorAll('button, .send'));
    if (sends.length > 1) sends.slice(1).forEach(b => b.remove());
    // re-wire Enter=send, Shift+Enter=newline
    const ta = areas[0];
    if (ta && !ta.__henrySendWired) {
      const send = () => document.querySelector('[data-henry-send]')?.click() || document.querySelector('button[type=submit]')?.click();
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
      });
      ta.__henrySendWired = true;
      console.log('✅ single composer active');
    }
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', once) : once();
})();
