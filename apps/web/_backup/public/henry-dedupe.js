(function(){
  function visible(el){ try{ const s=getComputedStyle(el); return s && s.display!=='none' && s.visibility!=='hidden' && el.offsetParent!==null; }catch{ return false; } }

  function keepLastVisible(list){
    const vis = list.filter(visible);
    if (vis.length <= 1) return;
    // hide everything except the last
    vis.slice(0, -1).forEach(el => { el.style.display = 'none'; el.setAttribute('data-henry-dupe', 'hidden'); });
  }

  function dedupe(){
    // A) Composers: textarea, text inputs, contenteditable, role=textbox
    const composers = Array.from(document.querySelectorAll(
      'textarea,[contenteditable="true"],input[type="text"],input[type="search"],[role="textbox"]'
    ));
    keepLastVisible(composers);

    // B) Threads: common wrappers that render messages
    const maybeThreads = Array.from(document.querySelectorAll(
      '[role="log"], .messages, .message-list, .chat, .chat-body, .thread, .conversation, [data-thread], [data-messages]'
    ))
    // Heuristic: real threads are taller than tiny toolbars
    .filter(el => el.getBoundingClientRect().height > 120);
    keepLastVisible(maybeThreads);
  }

  // Run now, then on any DOM changes
  const run = () => requestAnimationFrame(dedupe);
  run();

  const mo = new MutationObserver(() => run());
  mo.observe(document.documentElement, {subtree:true, childList:true, attributes:false});
})();
