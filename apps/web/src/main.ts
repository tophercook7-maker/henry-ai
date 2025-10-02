type Role = 'user'|'assistant';
type Mode = 'general'|'writer'|'developer';
const $ = <T extends HTMLElement>(id:string)=>document.getElementById(id) as T;

// Baked-in API base so you don't need console/settings
const BAKED_API_BASE = 'http://127.0.0.1:3000';

const app=$('app'), panelChat=$('panel-chat'), panelSets=$('panel-settings'), panelHelp=$('panel-help'), panelProjects=$('panel-projects'), panelApiKeys=$('panel-api-keys');
const thread=$('panel-chat'); const form=$('composer') as HTMLFormElement; const input=$('input') as HTMLTextAreaElement; const sendBtn=$('send') as HTMLButtonElement;
const pillModel=$('pill-model'), pillChars=$('pill-chars'), pillCost=$('pill-cost');
const btnToggle=$('btn-toggle') as HTMLButtonElement, btnNew=$('btn-new') as HTMLButtonElement;
const tabChat=$('tab-chat') as HTMLButtonElement, tabSets=$('tab-settings') as HTMLButtonElement, tabHelpBtn=$('tab-help') as HTMLButtonElement, tabProjects=$('tab-projects') as HTMLButtonElement, tabApiKeys=$('tab-api-keys') as HTMLButtonElement;
const inpApi=$('inp-api') as HTMLInputElement, inpKey=$('inp-key') as HTMLInputElement, btnSave=$('btn-save-settings') as HTMLButtonElement;
const modeSelector=$('mode-selector') as HTMLSelectElement;

let currentMode: Mode = 'general';
let currentProject: string | null = null;

const apiBase = ()=> (localStorage.getItem('__henry_api_base__') || BAKED_API_BASE).replace(/\/+$/,'');
const apiKey  = ()=> (localStorage.getItem('henry_api_key') || '').trim();

function showPanel(which:'chat'|'settings'|'help'|'projects'|'api-keys'){
  panelChat.classList.toggle('hidden', which!=='chat');
  panelSets.classList.toggle('hidden', which!=='settings');
  panelHelp.classList.toggle('hidden', which!=='help');
  panelProjects.classList.toggle('hidden', which!=='projects');
  panelApiKeys.classList.toggle('hidden', which!=='api-keys');
  (document.getElementById('composer') as HTMLElement).style.display = which==='chat' ? 'flex' : 'none';
  
  if (which === 'api-keys') {
    initializeApiKeyPanel();
  }
}

function setBusy(on:boolean){ 
  input.disabled=on; 
  sendBtn.disabled=on; 
  input.style.opacity=on?'.7':'1';
  sendBtn.textContent = on ? 'Thinking...' : 'Send';
}

function addBubble(role:Role, text:string){
  const row=document.createElement('div'); 
  row.className='msg '+role;
  
  const bubble=document.createElement('div'); 
  bubble.className='bubble';
  
  // Enhanced formatting for different content types
  if (text.includes('```')) {
    // Code blocks
    bubble.innerHTML = formatCodeBlocks(text);
  } else if (text.includes('**') || text.includes('•') || text.includes('#')) {
    // Markdown-style formatting
    bubble.innerHTML = formatMarkdown(text);
  } else {
    bubble.textContent = text;
  }
  
  row.appendChild(bubble);
  
  if(role==='assistant'){ 
    const actions = document.createElement('div');
    actions.className = 'bubble-actions';
    
    const copy=document.createElement('button'); 
    copy.type='button'; 
    copy.className='copy'; 
    copy.textContent='Copy';
    copy.addEventListener('click', async e=>{ 
      e.stopPropagation(); 
      try{ 
        await navigator.clipboard.writeText(text); 
        copy.textContent='Copied!'; 
        setTimeout(()=>copy.textContent='Copy',1200);
      }catch{} 
    });
    
    const save=document.createElement('button'); 
    save.type='button'; 
    save.className='save'; 
    save.textContent='Save';
    save.addEventListener('click', ()=> saveToProject(text));
    
    actions.appendChild(copy);
    actions.appendChild(save);
    row.appendChild(actions);
  }
  thread.appendChild(row); 
  thread.scrollTop = thread.scrollHeight;
}

function formatCodeBlocks(text: string): string {
  return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
  });
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^• (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updatePills(model:string, chars:number, cost:number){ 
  pillModel.textContent=model||'–'; 
  pillChars.textContent=String(chars); 
  pillCost.textContent=cost.toFixed(4); 
}

async function callChat(text:string, mode: Mode = currentMode){
  const headers:Record<string,string>={'Content-Type':'application/json'};
  const k=apiKey(); if(k) headers['x-api-key']=k;
  
  const body = {
    messages:[{role:'user',content:text}],
    mode: mode,
    project: currentProject
  };
  
  const r=await fetch(`${apiBase()}/chat`, { 
    method:'POST', 
    headers, 
    body: JSON.stringify(body)
  });
  
  if(!r.ok) throw new Error(`API ${r.status}`);
  const j=await r.json();
  const reply = j.reply ?? j.message ?? j.content ?? (typeof j==='string'? j : JSON.stringify(j));
  const usage = j.usage || {};
  const prev = Number(pillChars.textContent||'0');
  updatePills(usage.model || j.model || '–', usage.chars ?? (prev+text.length+String(reply).length), usage.cost ?? (prev/1000*0.002));
  return reply;
}

async function createProject(name: string, type: 'book'|'app') {
  const headers:Record<string,string>={'Content-Type':'application/json'};
  const r = await fetch(`${apiBase()}/project/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, type })
  });
  if (!r.ok) throw new Error(`Failed to create project: ${r.status}`);
  return r.json();
}

async function loadProjects() {
  try {
    const r = await fetch(`${apiBase()}/project/list`);
    if (!r.ok) throw new Error(`Failed to load projects: ${r.status}`);
    const data = await r.json();
    return data.projects || [];
  } catch (err) {
    console.error('Failed to load projects:', err);
    return [];
  }
}

async function saveToProject(content: string) {
  if (!currentProject) {
    alert('No project selected. Create or select a project first.');
    return;
  }
  
  const filename = prompt('Save as filename:', `note-${Date.now()}.md`);
  if (!filename) return;
  
  try {
    const headers:Record<string,string>={'Content-Type':'application/json'};
    await fetch(`${apiBase()}/file/save`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filePath: `projects/${currentProject}/${filename}`,
        content
      })
    });
    alert('Content saved to project!');
  } catch (err) {
    alert('Failed to save content: ' + err);
  }
}

async function refreshProjectsList() {
  const projects = await loadProjects();
  const projectsList = $('projects-list');
  projectsList.innerHTML = '';
  
  projects.forEach((project: string) => {
    const item = document.createElement('div');
    item.className = 'project-item';
    item.innerHTML = `
      <span class="project-name">${project}</span>
      <button class="select-project" data-project="${project}">Select</button>
    `;
    projectsList.appendChild(item);
  });
  
  // Add event listeners for select buttons
  document.querySelectorAll('.select-project').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const project = (e.target as HTMLElement).dataset.project;
      if (project) {
        currentProject = project;
        updateProjectStatus();
      }
    });
  });
}

function updateProjectStatus() {
  const status = $('current-project');
  status.textContent = currentProject ? `Project: ${currentProject}` : 'No project selected';
}

// Event Listeners
btnToggle.addEventListener('click', e=>{ e.stopPropagation(); app.classList.toggle('collapsed'); });
tabChat.addEventListener('click', ()=> showPanel('chat'));
tabSets.addEventListener('click', ()=>{ inpApi.value=apiBase(); inpKey.value=apiKey(); showPanel('settings'); });
tabHelpBtn.addEventListener('click', ()=> showPanel('help'));
tabProjects.addEventListener('click', ()=> { showPanel('projects'); refreshProjectsList(); });
tabApiKeys.addEventListener('click', ()=> showPanel('api-keys'));
btnSave.addEventListener('click', ()=>{ localStorage.setItem('__henry_api_base__', inpApi.value.trim()); localStorage.setItem('henry_api_key', inpKey.value.trim()); showPanel('chat'); });
btnNew.addEventListener('click', ()=>{ panelChat.innerHTML=''; addBubble('assistant','New chat started. How can I help with your writing or development project?'); showPanel('chat'); });

modeSelector.addEventListener('change', (e) => {
  currentMode = (e.target as HTMLSelectElement).value as Mode;
  addBubble('assistant', `Switched to ${currentMode} mode. How can I assist you?`);
});

// Project creation
$('create-book-project').addEventListener('click', async () => {
  const name = prompt('Book project name:');
  if (name) {
    try {
      await createProject(name, 'book');
      currentProject = name;
      updateProjectStatus();
      refreshProjectsList();
      addBubble('assistant', `📚 Book project "${name}" created! I'm ready to help with your writing project.`);
    } catch (err) {
      alert('Failed to create project: ' + err);
    }
  }
});

$('create-app-project').addEventListener('click', async () => {
  const name = prompt('App project name:');
  if (name) {
    try {
      await createProject(name, 'app');
      currentProject = name;
      updateProjectStatus();
      refreshProjectsList();
      addBubble('assistant', `💻 App project "${name}" created! Let's build something amazing together.`);
    } catch (err) {
      alert('Failed to create project: ' + err);
    }
  }
});

form.addEventListener('submit', async e=>{
  e.preventDefault();
  const text=input.value.trim(); if(!text) return;
  input.value=''; addBubble('user',text); setBusy(true);
  try{ 
    const reply=await callChat(text, currentMode); 
    addBubble('assistant', reply); 
  }
  catch(err:any){ 
    addBubble('assistant', `⚠️ ${err?.message ?? err}`); 
  }
  finally{ setBusy(false); input.focus(); }
});

input.addEventListener('keydown', (e:KeyboardEvent)=>{ 
  if(e.key==='Enter' && !e.shiftKey){ 
    e.preventDefault(); 
    form.requestSubmit(); 
  }
});

// API Key Management Functions
function initializeApiKeyPanel() {
  const keyInput = $('openai-key-input') as HTMLInputElement;
  const statusIndicator = $('status-indicator');
  const testResult = $('test-result');
  
  if (!keyInput || !statusIndicator) return;
  
  // Load existing key
  const storedKey = apiKey();
  keyInput.value = storedKey || '';
  
  // Update status
  updateKeyStatus();
  
  // Bind events
  const saveBtn = $('save-api-key-btn');
  const testBtn = $('test-api-key-btn');
  const removeBtn = $('remove-api-key-btn');
  const toggleBtn = $('toggle-key-visibility');
  
  saveBtn?.addEventListener('click', saveApiKey);
  testBtn?.addEventListener('click', testApiKey);
  removeBtn?.addEventListener('click', removeApiKey);
  toggleBtn?.addEventListener('click', toggleKeyVisibility);
}

function updateKeyStatus() {
  const statusIndicator = $('status-indicator');
  if (!statusIndicator) return;
  
  const hasKey = !!apiKey();
  if (hasKey) {
    statusIndicator.textContent = '✅ API Key Stored Locally';
    statusIndicator.className = 'status-valid';
  } else {
    statusIndicator.textContent = '❌ No API Key Found';
    statusIndicator.className = 'status-invalid';
  }
}

function saveApiKey() {
  const keyInput = $('openai-key-input') as HTMLInputElement;
  if (!keyInput) return;
  
  const apiKey = keyInput.value.trim();
  if (!apiKey) {
    alert('Please enter an API key');
    return;
  }
  
  if (!apiKey.startsWith('sk-')) {
    alert('Invalid OpenAI API key format. Keys should start with "sk-"');
    return;
  }
  
  localStorage.setItem('henry_api_key', apiKey);
  updateKeyStatus();
  alert('API key saved successfully!');
}

async function testApiKey() {
  const apiKeyValue = apiKey();
  if (!apiKeyValue) {
    alert('Please save an API key first');
    return;
  }
  
  const testResult = $('test-result');
  if (!testResult) return;
  
  testResult.style.display = 'block';
  testResult.textContent = 'Testing API connection...';
  testResult.className = 'test-result status-unknown';
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKeyValue}`
      }
    });
    
    if (response.ok) {
      testResult.textContent = '✅ API connection successful!';
      testResult.className = 'test-result test-success';
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    testResult.textContent = `❌ API test failed: ${error.message}`;
    testResult.className = 'test-result test-error';
  }
}

function removeApiKey() {
  if (confirm('Are you sure you want to remove the stored API key?')) {
    localStorage.removeItem('henry_api_key');
    const keyInput = $('openai-key-input') as HTMLInputElement;
    if (keyInput) keyInput.value = '';
    updateKeyStatus();
    const testResult = $('test-result');
    if (testResult) testResult.style.display = 'none';
    alert('API key removed successfully');
  }
}

function toggleKeyVisibility() {
  const keyInput = $('openai-key-input') as HTMLInputElement;
  const toggleBtn = $('toggle-key-visibility');
  
  if (keyInput && toggleBtn) {
    if (keyInput.type === 'password') {
      keyInput.type = 'text';
      toggleBtn.textContent = '🙈';
    } else {
      keyInput.type = 'password';
      toggleBtn.textContent = '👁️';
    }
  }
}

// Initialize
updateProjectStatus();
input.focus();
