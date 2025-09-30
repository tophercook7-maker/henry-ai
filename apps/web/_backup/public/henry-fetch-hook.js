(() => {
  const API = "http://127.0.0.1:3000";
  const orig = window.fetch.bind(window);
  const key = () => (localStorage.getItem('henry_api_key') || '').trim();
  window.fetch = function(u, opts = {}) {
    // Route common endpoints to API, not preview port
    if (typeof u === 'string' && /^\/(ping|chat|upload|files\/upload)/.test(u)) {
      u = API + u;
    }
    const h = new Headers(opts.headers || {});
    if (key() && !h.has('x-api-key')) h.set('x-api-key', key());
    if (!h.has('Content-Type') && !(opts.body instanceof FormData)) {
      h.set('Content-Type','application/json');
    }
    return orig(u, { ...opts, headers: h });
  };
  console.log('✅ fetch patched to', API);
})();
