/**
 * Henry AI Advanced - Automated Connections & Fancy Features
 * @version 2.0
 */

class HenryAIAdvanced {
    constructor() {
        this.apiBase = 'http://127.0.0.1:3000';
        this.connections = new Map();
        this.automations = new Map();
        this.auraEffects = new AuraEffects();
        this.connectionManager = new ConnectionManager();
        this.automationEngine = new AutomationEngine();
        this.init();
    }

    init() {
        this.setupAuraEffects();
        this.initializeConnections();
        this.startAutomationEngine();
        this.setupEventListeners();
        this.startBackgroundServices();
    }

    setupAuraEffects() {
        // Initialize fancy aura effects
        this.auraEffects.createBackgroundAurora();
        this.auraEffects.addShimmerEffects();
        this.auraEffects.setupHoverGlows();
        this.auraEffects.addParticleEffects();
    }

    initializeConnections() {
        // Define all available automated connections
        const connectionTypes = [
            {
                id: 'local-files',
                name: 'Local File System',
                icon: '📁',
                description: 'Read, write, and manage local files automatically',
                autoConnect: true,
                capabilities: ['read', 'write', 'browse', 'analyze'],
                color: '#9ece6a'
            },
            {
                id: 'web-browser',
                name: 'Web Browser',
                icon: '🌐',
                description: 'Browse websites, extract content, and interact with web services',
                autoConnect: true,
                capabilities: ['browse', 'extract', 'interact', 'monitor'],
                color: '#7aa2ff'
            },
            {
                id: 'github',
                name: 'GitHub Integration',
                icon: '💻',
                description: 'Access repositories, read code, manage projects',
                autoConnect: false,
                capabilities: ['read', 'write', 'manage', 'analyze'],
                color: '#ff9e64'
            },
            {
                id: 'notion',
                name: 'Notion Workspace',
                icon: '📝',
                description: 'Read and edit Notion pages, databases, and content',
                autoConnect: false,
                capabilities: ['read', 'write', 'organize', 'search'],
                color: '#bb9af7'
            },
            {
                id: 'slack',
                name: 'Slack Workspace',
                icon: '💬',
                description: 'Send messages, read channels, and manage communications',
                autoConnect: true,
                capabilities: ['send', 'read', 'manage', 'notify'],
                color: '#7aa2ff'
            },
            {
                id: 'google-drive',
                name: 'Google Drive',
                icon: '🗂️',
                description: 'Access files, folders, and documents in Google Drive',
                autoConnect: false,
                capabilities: ['read', 'write', 'organize', 'search'],
                color: '#9ece6a'
            },
            {
                id: 'dropbox',
                name: 'Dropbox',
                icon: '📦',
                description: 'Sync and manage Dropbox files and folders',
                autoConnect: false,
                capabilities: ['sync', 'read', 'write', 'backup'],
                color: '#7aa2ff'
            },
            {
                id: 'spotify',
                name: 'Spotify',
                icon: '🎵',
                description: 'Control music, get recommendations, and manage playlists',
                autoConnect: true,
                capabilities: ['play', 'control', 'recommend', 'manage'],
                color: '#bb9af7'
            },
            {
                id: 'calendar',
                name: 'Calendar',
                icon: '📅',
                description: 'Read events, create appointments, and manage schedule',
                autoConnect: true,
                capabilities: ['read', 'create', 'manage', 'remind'],
                color: '#ff9e64'
            },
            {
                id: 'email',
                name: 'Email',
                icon: '📧',
                description: 'Send emails, read messages, and manage inbox',
                autoConnect: false,
                capabilities: ['send', 'read', 'organize', 'filter'],
                color: '#9ece6a'
            }
        ];

        // Initialize each connection
        connectionTypes.forEach(type => {
            const connection = new AutomatedConnection(type);
            this.connections.set(type.id, connection);
        });
    }

    startAutomationEngine() {
        // Start the automation engine for background tasks
        this.automationEngine.start();
        
        // Set up automated connection attempts
        setInterval(() => {
            this.attemptAutoConnections();
        }, 30000); // Check every 30 seconds

        // Set up automated task execution
        setInterval(() => {
            this.executeAutomatedTasks();
        }, 60000); // Execute every minute

        // Start real-time monitoring
        this.startRealTimeMonitoring();
    }

    attemptAutoConnections() {
        this.connections.forEach(connection => {
            if (connection.config.autoConnect && !connection.isConnected()) {
                this.connectToService(connection.config.id);
            }
        });
    }

    async connectToService(serviceId) {
        const connection = this.connections.get(serviceId);
        if (!connection) return;

        try {
            this.showConnectionProgress(serviceId, 'connecting');
            
            // Simulate connection process with fancy animations
            await connection.connect();
            
            this.showConnectionProgress(serviceId, 'connected');
            this.showNotification(`✅ Connected to ${connection.config.name}`, 'success');
            
            // Start automated capabilities
            this.startAutomatedCapabilities(serviceId);
            
        } catch (error) {
            this.showConnectionProgress(serviceId, 'failed');
            this.showNotification(`❌ Failed to connect to ${connection.config.name}`, 'error');
        }
    }

    startAutomatedCapabilities(serviceId) {
        const connection = this.connections.get(serviceId);
        if (!connection) return;

        // Start service-specific automated capabilities
        switch (serviceId) {
            case 'local-files':
                this.startFileSystemMonitoring();
                break;
            case 'web-browser':
                this.startWebContentMonitoring();
                break;
            case 'github':
                this.startGitHubAutomation();
                break;
            case 'slack':
                this.startSlackAutomation();
                break;
            case 'spotify':
                this.startSpotifyAutomation();
                break;
            case 'calendar':
                this.startCalendarAutomation();
                break;
        }
    }

    startFileSystemMonitoring() {
        // Monitor file system for changes and auto-process
        console.log('🔄 Starting file system automation...');
        
        // Simulate automated file processing
        setInterval(async () => {
            try {
                const response = await fetch(`${this.apiBase}/file/read?filePath=auto-monitor.json`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.content) {
                        this.processAutomatedFileData(JSON.parse(data.content));
                    }
                }
            } catch (error) {
                // File doesn't exist yet, create it
                this.createAutomationFile();
            }
        }, 10000); // Check every 10 seconds
    }

    createAutomationFile() {
        const automationData = {
            lastProcessed: new Date().toISOString(),
            tasks: [],
            connections: {}
        };
        
        fetch(`${this.apiBase}/file/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filePath: 'auto-monitor.json',
                content: JSON.stringify(automationData, null, 2)
            })
        });
    }

    processAutomatedFileData(data) {
        // Process automated tasks from the monitoring file
        if (data.tasks && data.tasks.length > 0) {
            data.tasks.forEach(task => {
                this.executeAutomatedTask(task);
            });
        }
    }

    startWebContentMonitoring() {
        // Monitor web content for changes
        console.log('🌐 Starting web content automation...');
        
        setInterval(() => {
            this.checkWebContentUpdates();
        }, 30000); // Check every 30 seconds
    }

    async checkWebContentUpdates() {
        // Simulate checking for web content updates
        const webConnections = Array.from(this.connections.values())
            .filter(c => c.config.id === 'web-browser' && c.isConnected());
        
        if (webConnections.length > 0) {
            console.log('🔍 Checking for web content updates...');
            // Implementation for web content monitoring
        }
    }

    startGitHubAutomation() {
        // Automate GitHub repository monitoring
        console.log('💻 Starting GitHub automation...');
        
        setInterval(() => {
            this.checkGitHubUpdates();
        }, 120000); // Check every 2 minutes
    }

    async checkGitHubUpdates() {
        const githubConnection = this.connections.get('github');
        if (githubConnection && githubConnection.isConnected()) {
            console.log('📊 Checking GitHub repository updates...');
            // Implementation for GitHub automation
        }
    }

    startSlackAutomation() {
        // Automate Slack message handling
        console.log('💬 Starting Slack automation...');
        
        setInterval(() => {
            this.checkSlackMessages();
        }, 15000); // Check every 15 seconds
    }

    async checkSlackMessages() {
        const slackConnection = this.connections.get('slack');
        if (slackConnection && slackConnection.isConnected()) {
            console.log('📨 Checking Slack messages...');
            // Implementation for Slack automation
        }
    }

    startSpotifyAutomation() {
        // Automate Spotify music control
        console.log('🎵 Starting Spotify automation...');
        
        setInterval(() => {
            this.checkSpotifyStatus();
        }, 45000); // Check every 45 seconds
    }

    async checkSpotifyStatus() {
        const spotifyConnection = this.connections.get('spotify');
        if (spotifyConnection && spotifyConnection.isConnected()) {
            console.log('🎧 Checking Spotify status...');
            // Implementation for Spotify automation
        }
    }

    startCalendarAutomation() {
        // Automate calendar event handling
        console.log('📅 Starting calendar automation...');
        
        setInterval(() => {
            this.checkCalendarEvents();
        }, 60000); // Check every minute
    }

    async checkCalendarEvents() {
        const calendarConnection = this.connections.get('calendar');
        if (calendarConnection && calendarConnection.isConnected()) {
            console.log('📋 Checking calendar events...');
            // Implementation for calendar automation
        }
    }

    startRealTimeMonitoring() {
        // Set up real-time monitoring for all connections
        setInterval(() => {
            this.updateConnectionStatuses();
            this.updateAutomationStatus();
            this.checkForAlerts();
        }, 5000); // Update every 5 seconds
    }

    updateConnectionStatuses() {
        let connectedCount = 0;
        let totalCount = this.connections.size;

        this.connections.forEach(connection => {
            if (connection.isConnected()) {
                connectedCount++;
            }
        });

        // Update UI with connection status
        this.updateConnectionStatusUI(connectedCount, totalCount);
    }

    updateConnectionStatusUI(connected, total) {
        const statusText = document.querySelector('.connection-status span');
        if (statusText) {
            statusText.textContent = `${connected}/${total} Connections Active`;
        }

        const statusDot = document.querySelector('.status-dot');
        if (statusDot) {
            if (connected > 0) {
                statusDot.style.background = 'var(--accent-green)';
                statusDot.style.animation = 'pulse-green 2s infinite';
            } else {
                statusDot.style.background = 'var(--text-secondary)';
                statusDot.style.animation = 'none';
            }
        }
    }

    updateAutomationStatus() {
        // Update automation engine status
        const automationCount = this.automationEngine.getActiveAutomationCount();
        
        // Update UI if needed
        if (automationCount > 0) {
            this.showAutomationIndicator(automationCount);
        }
    }

    showAutomationIndicator(count) {
        // Show subtle automation activity indicator
        const indicator = document.getElementById('automation-indicator');
        if (indicator) {
            indicator.textContent = `⚡ ${count} automations active`;
            indicator.style.display = 'block';
        }
    }

    checkForAlerts() {
        // Check for important alerts from automated services
        this.connections.forEach(connection => {
            if (connection.isConnected() && connection.hasAlerts()) {
                const alerts = connection.getAlerts();
                alerts.forEach(alert => {
                    this.showNotification(alert.message, alert.type);
                });
                connection.clearAlerts();
            }
        });
    }

    executeAutomatedTasks() {
        // Execute scheduled automated tasks
        const tasks = this.automationEngine.getPendingTasks();
        
        tasks.forEach(task => {
            this.executeAutomatedTask(task);
        });
    }

    async executeAutomatedTask(task) {
        try {
            console.log(`🤖 Executing automated task: ${task.name}`);
            
            // Execute task based on type
            switch (task.type) {
                case 'file-sync':
                    await this.syncFiles(task.config);
                    break;
                case 'web-monitor':
                    await this.monitorWebContent(task.config);
                    break;
                case 'git-sync':
                    await this.syncGitHub(task.config);
                    break;
                case 'message-check':
                    await this.checkMessages(task.config);
                    break;
                case 'calendar-sync':
                    await this.syncCalendar(task.config);
                    break;
            }
            
            this.automationEngine.markTaskComplete(task.id);
            this.showNotification(`✅ Completed: ${task.name}`, 'success');
            
        } catch (error) {
            console.error(`❌ Automated task failed: ${task.name}`, error);
            this.showNotification(`❌ Failed: ${task.name}`, 'error');
        }
    }

    // UI and Notification Methods
    showConnectionProgress(connectionId, status) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        const card = document.querySelector(`[data-connection-id="${connectionId}"]`);
        if (card) {
            card.classList.remove('connecting', 'connected', 'failed');
            card.classList.add(status);
        }
    }

    showNotification(message, type = 'info') {
        // Create fancy notification with aura effect
        const notification = document.createElement('div');
        notification.className = `henry-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(type)}</div>
                <div class="notification-message">${message}</div>
            </div>
            <div class="notification-aura"></div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .henry-notification {
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
            
            .henry-notification.success {
                border-color: var(--accent-green);
                box-shadow: 0 8px 24px rgba(158, 206, 106, 0.2);
            }
            
            .henry-notification.error {
                border-color: #f7768e;
                box-shadow: 0 8px 24px rgba(247, 118, 142, 0.2);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                position: relative;
                z-index: 2;
            }
            
            .notification-icon {
                font-size: 18px;
                flex-shrink: 0;
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
            
            @keyframes slide-in-notification {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes aura-pulse {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.6; }
            }
        `;

        if (!document.querySelector('.henry-notification-styles')) {
            style.className = 'henry-notification-styles';
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-remove after delay
        setTimeout(() => {
            notification.style.animation = 'slide-in-notification 0.3s ease-in reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    setupEventListeners() {
        // Set up advanced event listeners for enhanced UI
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                document.getElementById('chat-input')?.focus();
            }
        });

        // Add mouse tracking for aura effects
        document.addEventListener('mousemove', (e) => {
            this.auraEffects.updateMousePosition(e.clientX, e.clientY);
        });
    }

    startBackgroundServices() {
        // Start various background services
        this.startPerformanceMonitoring();
        this.startResourceOptimization();
        this.startCacheManagement();
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            const performance = this.getPerformanceMetrics();
            this.updatePerformanceUI(performance);
        }, 1000);
    }

    getPerformanceMetrics() {
        return {
            memory: performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0,
            cpu: Math.random() * 100, // Simulated
            connections: this.getActiveConnectionCount(),
            automations: this.automationEngine.getActiveAutomationCount()
        };
    }

    updatePerformanceUI(metrics) {
        // Update performance indicators in UI
        const memoryElement = document.getElementById('memory-usage');
        if (memoryElement) {
            memoryElement.textContent = `${metrics.memory.toFixed(1)} MB`;
        }
    }

    startResourceOptimization() {
        // Optimize resources periodically
        setInterval(() => {
            this.optimizeResources();
        }, 30000);
    }

    optimizeResources() {
        // Clean up old messages, cache, etc.
        const messages = document.querySelectorAll('.message');
        if (messages.length > 100) {
            // Keep only last 50 messages
            for (let i = 0; i < messages.length - 50; i++) {
                messages[i].remove();
            }
        }
    }

    startCacheManagement() {
        // Manage cache periodically
        setInterval(() => {
            this.clearOldCache();
        }, 600000); // Every 10 minutes
    }

    clearOldCache() {
        // Clear old cached data
        console.log('🧹 Clearing old cache...');
    }

    // Utility methods
    getActiveConnectionCount() {
        return Array.from(this.connections.values()).filter(c => c.isConnected()).length;
    }

    generateAuraGradient() {
        const colors = ['#7aa2ff', '#bb9af7', '#9ece6a', '#ff9e64'];
        const angle = Math.random() * 360;
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    }
}

// Aura Effects Class for fancy visual effects
class AuraEffects {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.particles = [];
    }

    createBackgroundAurora() {
        // Create animated background aurora effect
        const aurora = document.createElement('div');
        aurora.className = 'background-aurora';
        aurora.innerHTML = `
            <div class="aurora-layer layer-1"></div>
            <div class="aurora-layer layer-2"></div>
            <div class="aurora-layer layer-3"></div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .background-aurora {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: -1;
                overflow: hidden;
            }
            
            .aurora-layer {
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                border-radius: 50%;
                opacity: 0.3;
                animation: aurora-float 20s infinite ease-in-out;
            }
            
            .layer-1 {
                background: radial-gradient(ellipse, rgba(122, 162, 255, 0.15) 0%, transparent 70%);
                animation-duration: 25s;
                animation-delay: 0s;
            }
            
            .layer-2 {
                background: radial-gradient(ellipse, rgba(187, 154, 247, 0.15) 0%, transparent 70%);
                animation-duration: 30s;
                animation-delay: -10s;
            }
            
            .layer-3 {
                background: radial-gradient(ellipse, rgba(158, 206, 106, 0.1) 0%, transparent 70%);
                animation-duration: 35s;
                animation-delay: -20s;
            }
            
            @keyframes aurora-float {
                0%, 100% {
                    transform: translate(0, 0) rotate(0deg);
                }
                25% {
                    transform: translate(-10%, -10%) rotate(90deg);
                }
                50% {
                    transform: translate(10%, -5%) rotate(180deg);
                }
                75% {
                    transform: translate(-5%, 10%) rotate(270deg);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(aurora);
    }

    addShimmerEffects() {
        // Add shimmer effects to interactive elements
        const shimmerStyle = document.createElement('style');
        shimmerStyle.textContent = `
            .shimmer-effect {
                position: relative;
                overflow: hidden;
            }
            
            .shimmer-effect::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transition: left 0.5s ease;
            }
            
            .shimmer-effect:hover::before {
                left: 100%;
            }
        `;
        document.head.appendChild(shimmerStyle);
        
        // Apply to buttons and interactive elements
        document.querySelectorAll('button, .nav-button, .connection-card').forEach(el => {
            el.classList.add('shimmer-effect');
        });
    }

    setupHoverGlows() {
        // Add glow effects on hover
        const glowStyle = document.createElement('style');
        glowStyle.textContent = `
            .glow-hover {
                transition: all 0.3s ease;
                position: relative;
            }
            
            .glow-hover::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: var(--gradient-primary);
                border-radius: inherit;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: -1;
            }
            
            .glow-hover:hover::before {
                opacity: 0.3;
            }
            
            .glow-hover:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px var(--shadow-color);
            }
        `;
        document.head.appendChild(glowStyle);
        
        // Apply to cards and important elements
        document.querySelectorAll('.connection-card, .message-bubble').forEach(el => {
            el.classList.add('glow-hover');
        });
    }

    addParticleEffects() {
        // Create floating particles for extra fancy effect
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(particleContainer);
        
        // Create particles periodically
        setInterval(() => {
            this.createParticle(particleContainer);
        }, 3000);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--accent-blue);
            border-radius: 50%;
            opacity: 0.6;
            left: ${Math.random() * 100}%;
            top: 100%;
            animation: float-up 8s linear forwards;
        `;
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 8000);
        
        // Add animation if not exists
        if (!document.querySelector('#particle-animation')) {
            const style = document.createElement('style');
            style.id = 'particle-animation';
            style.textContent = `
                @keyframes float-up {
                    to {
                        transform: translateY(-100vh);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateMousePosition(x, y) {
        this.mouseX = x;
        this.mouseY = y;
        
        // Update cursor glow effect
        this.updateCursorGlow();
    }

    updateCursorGlow() {
        // Create cursor glow effect
        let cursorGlow = document.getElementById('cursor-glow');
        if (!cursorGlow) {
            cursorGlow = document.createElement('div');
            cursorGlow.id = 'cursor-glow';
            cursorGlow.style.cssText = `
                position: fixed;
                width: 300px;
                height: 300px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(122, 162, 255, 0.1) 0%, transparent 70%);
                pointer-events: none;
                z-index: 999;
                transform: translate(-50%, -50%);
                transition: all 0.1s ease;
                opacity: 0;
            `;
            document.body.appendChild(cursorGlow);
        }
        
        cursorGlow.style.left = this.mouseX + 'px';
        cursorGlow.style.top = this.mouseY + 'px';
        cursorGlow.style.opacity = '1';
    }
}

// Connection Manager for handling all automated connections
class ConnectionManager {
    constructor() {
        this.activeConnections = new Map();
        this.connectionHistory = [];
    }

    async establishConnection(connectionConfig) {
        try {
            // Simulate connection establishment with fancy progress
            const connection = new AutomatedConnection(connectionConfig);
            await connection.connect();
            
            this.activeConnections.set(connectionConfig.id, connection);
            this.recordConnectionHistory(connectionConfig.id, 'connected');
            
            return connection;
        } catch (error) {
            this.recordConnectionHistory(connectionConfig.id, 'failed', error);
            throw error;
        }
    }

    recordConnectionHistory(connectionId, status, error = null) {
        this.connectionHistory.push({
            connectionId,
            status,
            timestamp: new Date(),
            error: error?.message
        });
        
        // Keep only last 100 records
        if (this.connectionHistory.length > 100) {
            this.connectionHistory = this.connectionHistory.slice(-100);
        }
    }

    getConnectionStatus(connectionId) {
        const connection = this.activeConnections.get(connectionId);
        return connection ? connection.getStatus() : 'disconnected';
    }

    getAllConnectionStatuses() {
        const statuses = {};
        this.activeConnections.forEach((connection, id) => {
            statuses[id] = connection.getStatus();
        });
        return statuses;
    }
}

// Automation Engine for managing automated tasks
class AutomationEngine {
    constructor() {
        this.tasks = new Map();
        this.activeAutomations = new Map();
        this.taskHistory = [];
    }

    start() {
        console.log('🤖 Automation Engine started');
        this.loadAutomatedTasks();
        this.startTaskScheduler();
    }

    loadAutomatedTasks() {
        // Load predefined automated tasks
        const predefinedTasks = [
            {
                id: 'file-sync',
                name: 'File System Sync',
                type: 'file-sync',
                schedule: '*/5 * * * *', // Every 5 minutes
                config: { paths: ['/workspace', '/documents'] }
            },
            {
                id: 'web-monitor',
                name: 'Web Content Monitor',
                type: 'web-monitor',
                schedule: '*/10 * * * *', // Every 10 minutes
                config: { urls: ['https://news.ycombinator.com', 'https://reddit.com'] }
            },
            {
                id: 'git-sync',
                name: 'GitHub Repository Sync',
                type: 'git-sync',
                schedule: '*/30 * * * *', // Every 30 minutes
                config: { repos: ['user/repo1', 'user/repo2'] }
            },
            {
                id: 'message-check',
                name: 'Message Check',
                type: 'message-check',
                schedule: '*/2 * * * *', // Every 2 minutes
                config: { services: ['slack', 'email'] }
            }
        ];

        predefinedTasks.forEach(task => {
            this.tasks.set(task.id, task);
        });
    }

    startTaskScheduler() {
        // Start cron-like scheduler for tasks
        setInterval(() => {
            this.checkScheduledTasks();
        }, 60000); // Check every minute
    }

    checkScheduledTasks() {
        const now = new Date();
        
        this.tasks.forEach(task => {
            if (this.shouldExecuteTask(task, now)) {
                this.executeTask(task);
            }
        });
    }

    shouldExecuteTask(task, currentTime) {
        // Simple schedule checking (in real implementation, use a cron library)
        const minute = currentTime.getMinutes();
        const hour = currentTime.getHours();
        
        switch (task.schedule) {
            case '*/2 * * * *':
                return minute % 2 === 0;
            case '*/5 * * * *':
                return minute % 5 === 0;
            case '*/10 * * * *':
                return minute % 10 === 0;
            case '*/30 * * * *':
                return minute % 30 === 0;
            default:
                return false;
        }
    }

    async executeTask(task) {
        try {
            console.log(`🔄 Executing task: ${task.name}`);
            
            this.activeAutomations.set(task.id, {
                task,
                startTime: new Date(),
                status: 'running'
            });

            // Simulate task execution
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.recordTaskCompletion(task.id, 'success');
            this.showTaskNotification(task, 'success');
            
        } catch (error) {
            console.error(`❌ Task failed: ${task.name}`, error);
            this.recordTaskCompletion(task.id, 'failed', error);
            this.showTaskNotification(task, 'error');
        } finally {
            this.activeAutomations.delete(task.id);
        }
    }

    recordTaskCompletion(taskId, status, error = null) {
        this.taskHistory.push({
            taskId,
            status,
            timestamp: new Date(),
            error: error?.message
        });
        
        // Keep only last 50 records
        if (this.taskHistory.length > 50) {
            this.taskHistory = this.taskHistory.slice(-50);
        }
    }

    showTaskNotification(task, status) {
        const message = status === 'success' 
            ? `✅ Completed: ${task.name}`
            : `❌ Failed: ${task.name}`;
        
        // This would integrate with the main notification system
        console.log(message);
    }

    getActiveAutomationCount() {
        return this.activeAutomations.size;
    }

    getPendingTasks() {
        return Array.from(this.tasks.values()).filter(task => {
            return !this.activeAutomations.has(task.id);
        });
    }
}

// Automated Connection Class
class AutomatedConnection {
    constructor(config) {
        this.config = config;
        this.status = 'disconnected';
        this.lastConnected = null;
        this.alerts = [];
        this.capabilities = new Map();
    }

    async connect() {
        this.status = 'connecting';
        
        // Simulate connection process with delays
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Simulate successful connection
        this.status = 'connected';
        this.lastConnected = new Date();
        
        // Initialize capabilities
        this.initializeCapabilities();
        
        return true;
    }

    disconnect() {
        this.status = 'disconnected';
        this.capabilities.clear();
        return true;
    }

    isConnected() {
        return this.status === 'connected';
    }

    getStatus() {
        return this.status;
    }

    initializeCapabilities() {
        this.config.capabilities.forEach(capability => {
            this.capabilities.set(capability, {
                enabled: true,
                lastUsed: null,
                usageCount: 0
            });
        });
    }

    hasCapability(capability) {
        return this.capabilities.has(capability);
    }

    useCapability(capability) {
        const cap = this.capabilities.get(capability);
        if (cap) {
            cap.lastUsed = new Date();
            cap.usageCount++;
        }
    }

    hasAlerts() {
        return this.alerts.length > 0;
    }

    getAlerts() {
        return [...this.alerts];
    }

    clearAlerts() {
        this.alerts = [];
    }

    addAlert(message, type = 'info') {
        this.alerts.push({ message, type, timestamp: new Date() });
    }
}

// Initialize the advanced Henry AI
const henry = new HenryAIAdvanced();

// Make it globally available
window.henry = henry;