(function () {
  const NAME = localStorage.getItem('henry_name') || 'Henry';
  // Title bar
  try { if (document.title) document.title = NAME; } catch {}
  // First greeting bubble “Howdy — Henry’s here …” → swap name only
  const firstBot = document.querySelector('.bubble,.msg,.bot, .assistant');
  if (firstBot && firstBot.textContent && /Henry/i.test(firstBot.textContent)) {
    firstBot.textContent = firstBot.textContent.replace(/Henry/gi, NAME);
  }
  // Little pill on top-right if present
  const header = document.querySelector('#app-title,.header-title,[data-henry-title]');
  if (header) header.textContent = NAME;
  console.log('✨ name set to', NAME);
})();
