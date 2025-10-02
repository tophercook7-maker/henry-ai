const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('henryAPI', {
    // File operations
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    listDirectory: (dirPath) => ipcRenderer.invoke('list-directory', dirPath),
    
    // Command execution
    executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
    
    // File dialogs
    selectFile: () => ipcRenderer.invoke('select-file'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    
    // Settings
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    
    // Events
    onNewChat: (callback) => ipcRenderer.on('new-chat', callback),
    onRequestAccess: (callback) => ipcRenderer.on('request-access', callback),
    onOpenFileManager: (callback) => ipcRenderer.on('open-file-manager', callback),
    onOpenTerminal: (callback) => ipcRenderer.on('open-terminal', callback),
    onOpenDocumentProcessor: (callback) => ipcRenderer.on('open-document-processor', callback),
    onOpenDataAnalyzer: (callback) => ipcRenderer.on('open-data-analyzer', callback),
    onCheckUpdates: (callback) => ipcRenderer.on('check-updates', callback),
    onShowAbout: (callback) => ipcRenderer.on('show-about', callback)
});