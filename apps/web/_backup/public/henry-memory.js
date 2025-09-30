(function(){
  const LS_KEY = "__henry_chat_memory__";
  const LIMIT = 200;

  function loadMem(){ try { return JSON.parse(localStorage.getItem(LS_KEY)||"[]"); } catch { return []; } }
  function saveMem(mem){ localStorage.setItem(LS_KEY, JSON.stringify(mem.slice(-LIMIT))); }

  window.henryMemory = {
    push: (msg) => {
      const mem = loadMem();
      mem.push({...msg, ts: Date.now()});
      saveMem(mem);
    },
    all: () => loadMem(),
    clear: () => localStorage.removeItem(LS_KEY),
    export: () => JSON.stringify(loadMem(), null, 2),
    import: (json) => saveMem(JSON.parse(json))
  };

  console.log("✅ Henry memory shim loaded");
})();
