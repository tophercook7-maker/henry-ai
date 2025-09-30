(function(){
  function $(id){ return document.getElementById(id); }
  function bubble(txt){
    var chat = document.querySelector('#chat');
    if(!chat){ return; }
    var d = document.createElement('div');
    d.className = 'bubble';
    d.textContent = txt;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }
  var attachBtn = $('attachBtn');
  var fileEl    = $('file');
  var chips     = $('chips');

  if (attachBtn && fileEl) attachBtn.onclick = () => fileEl.click();

  if (fileEl) fileEl.onchange = async function(){
    try{
      if (!fileEl.files || !fileEl.files[0]) return;
      var fd = new FormData();
      fd.append('file', fileEl.files[0]);
      // hit /upload (server also accepts /files/upload)
      var r = await fetch('/upload', { method:'POST', body: fd });
      if (!r.ok) throw new Error('upload_failed: '+r.status);
      var j = await r.json();
      if (!j || j.ok !== true || !j.file) throw new Error('bad_json');
      var name = j.file.originalName || j.file.savedName || 'file';
      var url  = j.file.url || '';
      if (chips){
        var chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = name;
        chip.dataset.url = url;
        chips.appendChild(chip);
      } else {
        bubble('Attached: '+name);
      }
    }catch(e){
      bubble('Upload failed');
      console.error('upload failed', e);
    } finally {
      try { fileEl.value = ''; } catch{}
    }
  };
})();
