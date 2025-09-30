(function(){
  const API = localStorage.getItem('__henry_api_base__') || 'http://127.0.0.1:3000';
  const orig = window.fetch.bind(window);
  function key(){ return (localStorage.getItem('henry_api_key')||'').trim(); }

  window.fetch = function(u, opts={}){
    // Normalize Request object to URL string if needed
    let url = (typeof u === 'string') ? u : (u && u.url ? u.url : String(u));
    // Patch API-relative calls
    if (/^\/(ping|health|chat|upload|browse|files\/upload)/.test(url)) {
      url = API + url;
    }
    const headers = new Headers(opts.headers || {});
    const k = key();
    if (k && !headers.has('x-api-key') && !headers.has('authorization')) {
      headers.set('x-api-key', k);                 // accepts sk-proj-… or sk-…
    }
    return orig(url, { ...opts, headers });
  };

  console.log('🔗 Henry bridge active →', API);
})();
