(function(){
  const oldBubble = window.bubble;
  window.bubble = function(role, text){
    oldBubble(role, text);
    if(role && text) henryMemory.push({role, content: text});
  };
})();
