(function(){
  const oldBubble = window.bubble;
  window.bubble = function(role, text){
    oldBubble(role, text);
    try { window.henryConvo.push(role, text); } catch{}
  };
})();
