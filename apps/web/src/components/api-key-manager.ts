import { API_KEY_STORAGE_KEY } from '../constants';

export class ApiKeyManager {
  private modal: HTMLElement | null = null;
  private isOpen: boolean = false;

  constructor() {
    this.initializeModal();
    this.bindEvents();
  }

  private initializeModal() {
    const modalHTML = `
      <div id="api-key-modal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>API Key Management</h2>
          
          <div class="api-key-section">
            <h3>OpenAI API Key</h3>
            <div class="input-group">
              <label for="openai-key">OpenAI API Key:</label>
              <input type="password" id="openai-key" placeholder="sk-..." />
              <button type="button" id="toggle-key-visibility">👁️</button>
            </div>
            <p class="help-text">
              Your API key is stored locally in your browser and never shared with anyone.
              <a href="https://platform.openai.com/api-keys" target="_blank">
                Get your API key from OpenAI
              </a>
            </p>
          </div>

          <div class="api-key-section">
            <h3>Current Status</h3>
            <div id="key-status">
              <span id="status-indicator" class="status-unknown">Checking...</span>
            </div>
          </div>

          <div class="button-group">
            <button id="save-api-key" class="btn btn-primary">Save Key</button>
            <button id="test-api-key" class="btn btn-secondary">Test Connection</button>
            <button id="remove-api-key" class="btn btn-danger">Remove Key</button>
          </div>

          <div id="test-result" class="test-result" style="display: none;"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('api-key-modal');
    this.applyStyles();
  }

  private applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.4);
      }

      .modal-content {
        background-color: #fefefe;
        margin: 15% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 500px;
        border-radius: 8px;
      }

      .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }

      .close:hover,
      .close:focus {
        color: black;
      }

      .api-key-section {
        margin: 20px 0;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }

      .api-key-section h3 {
        margin-top: 0;
        color: #333;
      }

      .input-group {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px 0;
      }

      .input-group label {
        min-width: 120px;
        font-weight: bold;
      }

      .input-group input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .input-group button {
        padding: 8px 12px;
        border: 1px solid #ddd;
        background: #f9f9f9;
        border-radius: 4px;
        cursor: pointer;
      }

      .help-text {
        font-size: 0.9em;
        color: #666;
        margin-top: 5px;
      }

      .help-text a {
        color: #007bff;
        text-decoration: none;
      }

      .help-text a:hover {
        text-decoration: underline;
      }

      #key-status {
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
      }

      .status-valid {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .status-invalid {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      .status-unknown {
        background-color: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
      }

      .button-group {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-danger {
        background-color: #dc3545;
        color: white;
      }

      .btn:hover {
        opacity: 0.8;
      }

      .test-result {
        margin-top: 15px;
        padding: 10px;
        border-radius: 4px;
      }

      .test-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .test-error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
    `;
    document.head.appendChild(style);
  }

  private bindEvents() {
    if (!this.modal) return;

    const closeBtn = this.modal.querySelector('.close');
    closeBtn?.addEventListener('click', () => this.close());

    const saveBtn = document.getElementById('save-api-key');
    saveBtn?.addEventListener('click', () => this.saveApiKey());

    const testBtn = document.getElementById('test-api-key');
    testBtn?.addEventListener('click', () => this.testApiKey());

    const removeBtn = document.getElementById('remove-api-key');
    removeBtn?.addEventListener('click', () => this.removeApiKey());

    const toggleBtn = document.getElementById('toggle-key-visibility');
    toggleBtn?.addEventListener('click', () => this.toggleKeyVisibility());

    window.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    });
  }

  open() {
    if (this.modal) {
      this.modal.style.display = 'block';
      this.isOpen = true;
      this.loadCurrentKey();
      this.updateStatus();
    }
  }

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      this.isOpen = false;
    }
  }

  private loadCurrentKey() {
    const keyInput = document.getElementById('openai-key') as HTMLInputElement;
    if (keyInput) {
      const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      keyInput.value = storedKey || '';
    }
  }

  private updateStatus() {
    const statusIndicator = document.getElementById('status-indicator');
    if (!statusIndicator) return;

    const hasKey = !!localStorage.getItem(API_KEY_STORAGE_KEY);
    if (hasKey) {
      statusIndicator.textContent = 'API Key Stored Locally';
      statusIndicator.className = 'status-valid';
    } else {
      statusIndicator.textContent = 'No API Key Found';
      statusIndicator.className = 'status-invalid';
    }
  }

  private saveApiKey() {
    const keyInput = document.getElementById('openai-key') as HTMLInputElement;
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

    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    this.updateStatus();
    alert('API key saved successfully!');
    this.close();
  }

  private async testApiKey() {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
      alert('Please save an API key first');
      return;
    }

    const testResult = document.getElementById('test-result');
    if (!testResult) return;

    testResult.style.display = 'block';
    testResult.textContent = 'Testing API connection...';
    testResult.className = 'test-result status-unknown';

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.ok) {
        testResult.textContent = 'API connection successful!';
        testResult.className = 'test-result test-success';
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      testResult.textContent = `API test failed: ${error.message}`;
      testResult.className = 'test-result test-error';
    }
  }

  private removeApiKey() {
    if (confirm('Are you sure you want to remove the stored API key?')) {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      this.loadCurrentKey();
      this.updateStatus();
      alert('API key removed successfully');
    }
  }

  private toggleKeyVisibility() {
    const keyInput = document.getElementById('openai-key') as HTMLInputElement;
    const toggleBtn = document.getElementById('toggle-key-visibility');
    
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

  getApiKey(): string | null {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  }
}