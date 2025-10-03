/**
 * Henry AI Autonomous - Intelligent Interface
 * @version 3.0 - Fully Autonomous
 */

class HenryAIAutonomous {
    constructor() {
        this.apiBase = 'http://127.0.0.1:3003'; // Autonomous API
        this.isAutonomous = true;
        this.hasAPIKey = false;
        this.setupWizard = new SetupWizard();
        this.connectionManager = new AutonomousConnectionManager();
        this.currentContext = {};
        this.conversationHistory = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAPIKeyStatus();
        this.startIntelligentMonitoring();
        this.setupAutonomousFeatures();
    }

    setupEventListeners() {
        // Chat input
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        
        sendButton.addEventListener('click', () => this.sendIntelligentMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendIntelligentMessage();
            }
        });

        // Auto-focus and intelligent suggestions
        chatInput.addEventListener('input', (e) => {
            this.showIntelligentSuggestions(e.target.value);
        });

        // Connection buttons
        document.querySelectorAll('[data-connect]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const service = e.target.dataset.connect;
                this.intelligentConnect(service);
            });
        });
    }

    async checkAPIKeyStatus() {
        const apiKey = localStorage.getItem('henry_api_key');
        this.hasAPIKey = !!apiKey;
        
        if (this.hasAPIKey) {
            this.activateCompleteHenry();
        } else {
            this.showSetupWizard();
        }
    }

    activateCompleteHenry() {
        document.body.classList.add('henry-complete');
        this.showNotification('🎉 Complete Henry AI Activated!', 'success');
        this.updateUIForCompleteMode();
    }

    showSetupWizard() {
        document.body.classList.add('henry-setup-mode');
        this.addWizardMessage(`🧙‍♂️ **WELCOME TO HENRY AI SETUP WIZARD!**

I'll guide you through getting everything set up for maximum capabilities:

**What I Can Do For You:**
• Help you get your OpenAI API key step-by-step
• Set up all 21 service connections automatically  
• Guide you through the complete setup process
• Provide intelligent assistance throughout

**Ready to Begin?**
Just tell me what you'd like help with:
• "Help me get an OpenAI API key"
• "Show me what connections are available"
• "Walk me through the setup process"

Or simply tell me what you want to accomplish - I'll handle the rest intelligently!`);
    }

    async sendIntelligentMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessage('user', message);
        input.value = '';
        this.showThinkingIndicator();

        try {
            const response = await this.getIntelligentResponse(message);
            this.hideThinkingIndicator();
            this.addMessage('assistant', response.reply, response);
            
            // Handle wizard responses
            if (response.wizard) {
                this.handleWizardResponse(response);
            }
            
            // Handle connection responses
            if (response.serviceUsed) {
                this.handleServiceConnection(response);
            }
            
        } catch (error) {
            this.hideThinkingIndicator();
            this.addMessage('assistant', `I encountered an issue, but let me help resolve this: ${error.message}`);
        }
    }

    async getIntelligentResponse(message) {
        const response = await fetch(`${this.apiBase}/chat/autonomous`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                context: this.currentContext,
                apiKey: localStorage.getItem('henry_api_key') || '',
                conversationHistory: this.conversationHistory.slice(-5)
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    }

    handleWizardResponse(response) {
        if (response.readyForKey) {
            this.showAPIKeyInput();
        }
        
        if (response.nextStep === 'await-key') {
            this.showAPIKeyInstructions();
        }
        
        if (response.intelligentConnection) {
            this.showAvailableConnections();
        }
    }

    handleServiceConnection(response) {
        const serviceName = response.serviceUsed;
        this.showNotification(`🔗 Connected to ${serviceName}`, 'success');
        this.updateConnectionStatus(serviceName, 'connected');
    }

    showIntelligentSuggestions(inputText) {
        if (!inputText || inputText.length < 3) return;

        const suggestions = this.generateIntelligentSuggestions(inputText);
        this.displaySuggestions(suggestions);
    }

    generateIntelligentSuggestions(text) {
        const lowerText = text.toLowerCase();
        const suggestions = [];

        // Intelligent suggestions based on context
        if (lowerText.includes('openai') || lowerText.includes('api')) {
            suggestions.push('Help me get an OpenAI API key');
            suggestions.push('Explain how API keys work');
            suggestions.push('Guide me through OpenAI setup');
        }

        if (lowerText.includes('pdf') || lowerText.includes('document')) {
            suggestions.push('Process this PDF automatically');
            suggestions.push('Summarize this large document');
            suggestions.push('Convert this to multiple formats');
        }

        if (lowerText.includes('github') || lowerText.includes('code')) {
            suggestions.push('Connect to my GitHub repositories');
            suggestions.push('Analyze my code automatically');
            suggestions.push('Help me with development');
        }

        if (lowerText.includes('office') || lowerText.includes('word')) {
            suggestions.push('Create a professional document');
            suggestions.push('Connect to Microsoft Office');
            suggestions.push('Set up document automation');
        }

        if (lowerText.includes('connect') || lowerText.includes('setup')) {
            suggestions.push('Show me available connections');
            suggestions.push('Help me set up services');
            suggestions.push('Walk me through configuration');
        }

        return suggestions.slice(0, 3);
    }

    displaySuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('intelligent-suggestions');
        if (!suggestionsContainer) return;

        suggestionsContainer.innerHTML = suggestions.map(suggestion => 
            `<div class="intelligent-suggestion" onclick="henry.useSuggestion('${suggestion}')">
                💡 ${suggestion}
            </div>`
        ).join('');

        suggestionsContainer.style.display = suggestions.length > 0 ? 'block' : 'none';
    }

    useSuggestion(suggestion) {
        document.getElementById('chat-input').value = suggestion;
        this.sendIntelligentMessage();
        document.getElementById('intelligent-suggestions').style.display = 'none';
    }

    async intelligentConnect(serviceId) {
        this.showNotification(`🧠 Intelligently connecting to ${serviceId}...`, 'info');
        
        try {
            const response = await fetch(`${this.apiBase}/connections/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId: serviceId,
                    credentials: {},
                    context: { intelligent: true }
                })
            });

            const result = await response.json();
            
            if (result.ok) {
                this.showNotification(`✅ Intelligently connected to ${result.connection.name}`, 'success');
                this.updateConnectionStatus(serviceId, 'connected');
            } else {
                this.showNotification(`❌ Connection failed: ${result.error}`, 'error');
                this.offerSetupHelp(serviceId, result.suggestion);
            }
        } catch (error) {
            this.showNotification(`Connection error: ${error.message}`, 'error');
        }
    }

    offerSetupHelp(serviceId, suggestion) {
        this.addWizardMessage(`I can help you set up ${serviceId}. ${suggestion || 'Would you like me to guide you through the setup process?'}`);
    }

    showAPIKeyInput() {
        const modal = document.createElement('div');
        modal.className = 'wizard-modal';
        modal.innerHTML = `
            <div class="wizard-content">
                <h3>🔑 Enter Your OpenAI API Key</h3>
                <p>Paste your API key below:</p>
                <input type="password" id="api-key-input" class="wizard-input" placeholder="sk-...">
                <div class="wizard-buttons">
                    <button onclick="henry.saveAPIKey()" class="wizard-button primary">Save Key</button>
                    <button onclick="henry.closeWizardModal()" class="wizard-button secondary">Cancel</button>
                </div>
                <p class="wizard-security">🔒 Your key is stored locally and never shared</p>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showAPIKeyInstructions() {
        this.addWizardMessage(`🎯 **HERE'S HOW TO GET YOUR API KEY:**

**Step 1: Go to OpenAI**
Visit: https://platform.openai.com/signup

**Step 2: Create Account**
- Sign up with your email
- Verify your email address
- Add payment method (you get $5 free!)

**Step 3: Get Your Key**
- Click your profile → "View API keys"
- Click "Create new secret key"
- Copy the key immediately (you can't see it again!)

**Step 4: Security**
- Store it in a password manager
- Never share it with anyone
- Set usage limits in your dashboard

When you have your key, just paste it here and I'll activate the complete Henry AI! 🚀`);
    }

    showAvailableConnections() {
        const connections = [
            { name: 'GitHub', icon: '💻', description: 'Code repositories and project management' },
            { name: 'LibreOffice', icon: '📝', description: 'Document creation and editing' },
            { name: 'Microsoft Office', icon: '💼', description: 'Word, Excel, PowerPoint integration' },
            { name: 'Google Workspace', icon: 'Google', description: 'Docs, Sheets, Slides' },
            { name: 'Docker', icon: '🐳', description: 'Container management' },
            { name: 'MySQL', icon: '🗄️', description: 'Database access and management' }
        ];

        this.addWizardMessage(`🔗 **AVAILABLE INTELLIGENT CONNECTIONS:**

${connections.map(conn => `• ${conn.icon} **${conn.name}** - ${conn.description}`).join('\n')}

**How It Works:**
• Tell me what you want to accomplish
• I'll intelligently connect to the right services
• Everything happens automatically
• No manual configuration needed!

**Examples:**
• "Help me manage my GitHub repositories"
• "Create a professional document"
• "Process this large PDF file"
• "Set up database access"

What would you like to connect to or accomplish?`);
    }

    saveAPIKey() {
        const apiKeyInput = document.getElementById('api-key-input');
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showNotification('Please enter a valid API key', 'error');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            this.showNotification('API key should start with "sk-"', 'error');
            return;
        }

        localStorage.setItem('henry_api_key', apiKey);
        this.hasAPIKey = true;
        this.closeWizardModal();
        this.activateCompleteHenry();
        this.showNotification('🎉 API key saved! Complete Henry AI activated!', 'success');
    }

    closeWizardModal() {
        const modal = document.querySelector('.wizard-modal');
        if (modal) modal.remove();
    }

    updateUIForCompleteMode() {
        document.body.classList.remove('henry-setup-mode');
        document.body.classList.add('henry-complete-mode');
        
        // Update UI elements for complete mode
        const statusIndicator = document.getElementById('status-indicator');
        if (statusIndicator) {
            statusIndicator.textContent = 'Complete AI Active';
            statusIndicator.className = 'status-indicator connected';
        }
    }

    startIntelligentMonitoring() {
        // Monitor connections intelligently
        setInterval(() => {
            this.intelligentConnectionCheck();
        }, 30000); // Check every 30 seconds
        
        // Real-time status updates
        setInterval(() => {
            this.updateIntelligentStatus();
        }, 5000); // Update every 5 seconds
    }

    async intelligentConnectionCheck() {
        // Intelligently check and maintain connections
        const connections = this.connectionManager.getActiveConnections();
        
        connections.forEach(conn => {
            if (conn.health !== 'excellent') {
                this.intelligentReconnect(conn.id);
            }
        });
    }

    async intelligentReconnect(serviceId) {
        console.log(`🧠 Intelligently reconnecting to ${serviceId}`);
        // Implement intelligent reconnection logic
    }

    updateIntelligentStatus() {
        const connections = this.connectionManager.getActiveConnections();
        const statusElement = document.getElementById('intelligent-status');
        
        if (statusElement) {
            statusElement.textContent = `${connections.length}/21 services active`;
        }
    }

    addMessage(role, text, metadata = {}) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role} ${metadata.intelligent ? 'intelligent' : ''}`;
        
        const avatar = role === 'user' ? '👤' : '🧠';
        const avatarBg = role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-card)';
        
        messageDiv.innerHTML = `
            <div class="message-avatar" style="background: ${avatarBg}">${avatar}</div>
            <div class="message-content">
                <div class="message-bubble">${this.formatIntelligentMessage(text)}</div>
                ${role === 'assistant' && metadata.wizard ? `
                    <div class="message-actions intelligent-actions">
                        <button class="action-button" onclick="henry.acceptWizardSuggestion(this)">Accept Guidance</button>
                        <button class="action-button" onclick="henry.requestMoreHelp(this)">More Help</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to conversation history for context
        this.conversationHistory.push({
            role,
            content: text,
            timestamp: new Date(),
            metadata
        });
    }

    addWizardMessage(text) {
        this.addMessage('assistant', text, { wizard: true });
    }

    formatIntelligentMessage(text) {
        // Enhanced formatting for intelligent responses
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--accent-blue);">$1</strong>')
            .replace(/🎯(.*?)\n/g, '<div style="color: var(--accent-green); margin: 8px 0;">🎯 $1</div>')
            .replace(/⚡(.*?)\n/g, '<div style="color: var(--accent-orange); margin: 8px 0;">⚡ $1</div>')
            .replace(/^• (.*$)/gm, '<div style="margin: 4px 0; padding-left: 16px;">• $1</div>');
    }

    showThinkingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message assistant thinking';
        thinkingDiv.id = 'thinking-indicator';
        thinkingDiv.innerHTML = `
            <div class="message-avatar" style="background: var(--bg-card);">🧠</div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="intelligent-thinking">
                        <span class="thinking-dot"></span>
                        <span class="thinking-dot"></span>
                        <span class="thinking-dot"></span>
                        <span style="margin-left: 8px;">Thinking intelligently...</span>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(thinkingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideThinkingIndicator() {
        const thinkingIndicator = document.getElementById('thinking-indicator');
        if (thinkingIndicator) {
            thinkingIndicator.remove();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `intelligent-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(type)}</div>
                <div class="notification-message">${message}</div>
            </div>
            <div class="notification-aura"></div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slide-out-notification 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: '💡' };
        return icons[type] || icons.info;
    }

    setupAutonomousFeatures() {
        // Add autonomous-specific styles
        this.addAutonomousStyles();
        
        // Setup intelligent monitoring
        this.startIntelligentMonitoring();
        
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    addAutonomousStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .henry-complete-mode {
                --accent-glow: rgba(122, 162, 255, 0.4);
            }
            
            .henry-setup-mode {
                --wizard-accent: #bb9af7;
            }
            
            .intelligent-thinking {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .thinking-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: var(--accent-blue);
                animation: intelligent-thinking 1.4s infinite ease-in-out;
            }
            
            .thinking-dot:nth-child(1) { animation-delay: -0.32s; }
            .thinking-dot:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes intelligent-thinking {
                0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                40% { opacity: 1; transform: scale(1); }
            }
            
            .intelligent-suggestions {
                position: absolute;
                bottom: 100%;
                left: 0;
                right: 0;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 8px;
                margin-bottom: 8px;
                display: none;
                z-index: 100;
                box-shadow: 0 4px 12px var(--shadow-color);
            }
            
            .intelligent-suggestion {
                padding: 8px 12px;
                margin: 4px 0;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 13px;
            }
            
            .intelligent-suggestion:hover {
                background: var(--bg-panel);
                border-color: var(--accent-blue);
            }
            
            .intelligent-actions {
                margin-top: 8px;
                display: flex;
                gap: 8px;
            }
            
            .message.intelligent {
                animation: intelligent-message 0.5s ease-out;
            }
            
            @keyframes intelligent-message {
                from {
                    opacity: 0;
                    transform: translateY(10px) scale(0.98);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .intelligent-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 16px 20px;
                color: var(--text-primary);
                font-size: 14px;
                z-index: 1000;
                animation: slide-in-notification 0.3s ease-out;
                box-shadow: 0 8px 24px var(--shadow-color);
                backdrop-filter: blur(10px);
                min-width: 300px;
                position: relative;
                overflow: hidden;
            }
            
            .intelligent-notification.success {
                border-color: var(--accent-green);
                box-shadow: 0 8px 24px rgba(158, 206, 106, 0.2);
            }
            
            .intelligent-notification.error {
                border-color: #f7768e;
                box-shadow: 0 8px 24px rgba(247, 118, 142, 0.2);
            }
            
            .notification-aura {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at center, var(--glow-color) 0%, transparent 70%);
                opacity: 0.3;
                animation: aura-pulse 2s ease-in-out infinite;
                z-index: 1;
            }
            
            .wizard-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                backdrop-filter: blur(5px);
            }
            
            .wizard-content {
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                padding: 32px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 40px var(--shadow-color);
                position: relative;
                z-index: 2001;
            }
            
            .wizard-input {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                background: var(--bg-primary);
                color: var(--text-primary);
                font-size: 14px;
                margin: 16px 0;
            }
            
            .wizard-buttons {
                display: flex;
                gap: 12px;
                margin-top: 20px;
            }
            
            .wizard-button {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .wizard-button.primary {
                background: var(--gradient-primary);
                color: white;
            }
            
            .wizard-button.secondary {
                background: var(--bg-panel);
                color: var(--text-primary);
                border: 1px solid var(--border-color);
            }
            
            .wizard-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 8px 16px var(--shadow-color);
            }
            
            .wizard-security {
                text-align: center;
                color: var(--text-secondary);
                font-size: 12px;
                margin-top: 16px;
            }
        `;
        
        document.head.appendChild(style);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                document.getElementById('chat-input')?.focus();
            }
            
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.showIntelligentHelp();
            }
        });
    }

    showIntelligentHelp() {
        this.addWizardMessage(`⌨️ **INTELLIGENT KEYBOARD SHORTCUTS:**

• **Ctrl+K** → Focus chat input
• **Ctrl+/** → Show this help
• **Tab** → Accept intelligent suggestion
• **Esc** → Clear suggestions

**CONVERSATION TIPS:**
• Just tell me what you want - I'll figure out the rest
• Use natural language - no technical terms needed
• Ask for help anytime - I'm here to guide you

**EXAMPLES:**
• "Help me process this large PDF"
• "Connect to my GitHub repos"  
• "Create a professional document"
• "Analyze this data for me"

I'm intelligent enough to understand your intent and handle everything automatically! 🧠✨`);
    }

    startIntelligentMonitoring() {
        // Monitor for intelligent opportunities
        setInterval(() => {
            this.checkForIntelligentOpportunities();
        }, 10000); // Check every 10 seconds
    }

    checkForIntelligentOpportunities() {
        // Look for opportunities to be helpful
        const opportunities = this.identifyHelpfulOpportunities();
        
        opportunities.forEach(opportunity => {
            if (this.shouldOfferHelp(opportunity)) {
                this.offerIntelligentHelp(opportunity);
            }
        });
    }

    identifyHelpfulOpportunities() {
        // Analyze current state for helpful opportunities
        const opportunities = [];
        
        if (!this.hasAPIKey && this.conversationHistory.length > 3) {
            opportunities.push({
                type: 'api-key-upgrade',
                priority: 'high',
                message: 'User has been chatting without API key - offer upgrade'
            });
        }
        
        if (this.conversationHistory.length === 0) {
            opportunities.push({
                type: 'first-time-user',
                priority: 'medium', 
                message: 'New user - offer comprehensive help'
            });
        }
        
        return opportunities;
    }

    shouldOfferHelp(opportunity) {
        // Intelligent logic for when to offer help
        const lastHelpOffer = localStorage.getItem('last_help_offer');
        const timeSinceLastOffer = Date.now() - parseInt(lastHelpOffer || '0');
        
        return timeSinceLastOffer > 300000; // Don't offer more than once per 5 minutes
    }

    offerIntelligentHelp(opportunity) {
        if (opportunity.type === 'api-key-upgrade') {
            this.addWizardMessage(`💡 **INTELLIGENT SUGGESTION**

I've noticed you've been using Henry AI quite a bit! You might benefit from adding an OpenAI API key to unlock:

• All 21 service connections
• Advanced document processing (including Bible-size PDFs)
• Full automation engine
• Maximum intelligence and capabilities

Would you like me to help you get set up with an API key? It's quick and easy!`);
        }
        
        localStorage.setItem('last_help_offer', Date.now().toString());
    }
}

// Initialize autonomous Henry AI
const henry = new HenryAIAutonomous();
window.henry = henry;

// Global functions for HTML
function acceptWizardSuggestion(button) {
    henry.addMessage('user', 'Yes, please help me with that!', { intelligent: true });
    // Implementation for accepting wizard guidance
}

function requestMoreHelp(button) {
    henry.addMessage('user', 'Tell me more about this', { intelligent: true });
    // Implementation for requesting more help
}