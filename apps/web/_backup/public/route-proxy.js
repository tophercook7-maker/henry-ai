(function(){
  try{
    var API_BASE = "http://127.0.0.1:3000";
    var getKey = function(){ try { return (localStorage.getItem('henry_api_key') || localStorage.getItem('API_KEY') || '').trim(); } catch { return '' } };
    var orig = window.fetch.bind(window);
    window.fetch = function(u, opts){
      u = String(u||''); opts = opts || {};
      var headers = new Headers(opts.headers || {});
      var key = getKey(); if (key && !headers.has('x-api-key')) headers.set('x-api-key', key);
      if (u.startsWith('/ping') || u.startsWith('/chat') || u.startsWith('/upload') || u.startsWith('/files/upload')) {
        u = API_BASE + u;
      }
      return orig(u, Object.assign({}, opts, { headers }));
    };
  }catch(e){ console.error('route-proxy failed', e); }
})();
