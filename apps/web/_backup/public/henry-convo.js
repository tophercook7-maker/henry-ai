(function(){
  const LS = "__henry_convo__";
  const MAX = 40; // send last 40 turns

  function load(){ try{ return JSON.parse(localStorage.getItem(LS)||"[]"); }catch{ return []; } }
  function save(arr){ localStorage.setItem(LS, JSON.stringify(arr.slice(-MAX))); }

  // expose a simple API
  window.henryConvo = {
    push: (role, content) => { if(!role || !content) return;
      const arr = load(); arr.push({role, content, ts: Date.now()}); save(arr);
    },
    recent: (n=MAX) => load().slice(-n),
    clear: () => localStorage.removeItem(LS)
  };
})();
