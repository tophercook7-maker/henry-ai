import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [currentDepth, setCurrentDepth] = useState(3);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [outputContent, setOutputContent] = useState('Your generated content will appear here. Henry will provide detailed responses based on your requests.');
  const [activeTab, setActiveTab] = useState('home');
  const [codingInput, setCodingInput] = useState('');
  const [writingInput, setWritingInput] = useState('');

  // Depth descriptions for different levels with enhanced personality
  const depthDescriptions = {
    1: 'Basic (Simple responses)',
    2: 'Intermediate (Detailed but concise)',
    3: 'Professional (Comprehensive and thorough)',
    4: 'Expert (Highly detailed with examples)',
    5: 'Academic (Extremely detailed with citations)'
  };

  // Enhanced system prompts with friendlier personality
  const systemPrompts = {
    1: 'You are Henry, a friendly and helpful AI assistant. Provide simple, clear responses. Avoid technical jargon. Be encouraging and supportive. Use emojis occasionally to make the conversation more engaging.',
    2: 'You are Henry, a friendly and knowledgeable AI assistant. Provide detailed but concise responses. Include relevant examples. Be helpful and personable. Use a warm and encouraging tone.',
    3: 'You are Henry, a professional yet friendly AI assistant. Provide comprehensive and thorough responses. Include context and best practices. Be supportive and encouraging. Help users feel confident in their abilities.',
    4: 'You are Henry, an expert AI assistant who is also a great friend. Provide highly detailed responses with examples, code snippets, and technical explanations when relevant. Be warm and helpful. Guide users through complex topics step by step.',
    5: 'You are Henry, an academic AI assistant with a friendly personality. Provide extremely detailed responses with citations, references, and comprehensive analysis. Use formal language but be supportive and encouraging. Help users understand advanced concepts clearly.'
  };

  // Model options
  const modelOptions = [
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'o1-preview', value: 'o1-preview' },
    { label: 'o1-mini', value: 'o1-mini' },
    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
  ];

  // Project type options for coding
  const projectTypeOptions = [
    'web app', 'mobile app', 'desktop app', 'script', 'api', 'library', 'other'
  ];

  // Tech stack options for coding
  const techStackOptions = [
    'React + Node.js', 'Vue + Express', 'Angular + NestJS', 'Python Flask', 
    'Python Django', 'Java Spring Boot', 'C# ASP.NET', 'Ruby on Rails', 'other'
  ];

  // Task type options for coding
  const codingTaskOptions = [
    'create new', 'debug', 'optimize', 'refactor', 'security', 'documentation', 'other'
  ];

  // Book type options for writing
  const bookTypeOptions = [
    'novel', 'short story', 'non-fiction book', 'article', 'script', 'poetry', 'other'
  ];

  // Fiction genre options for writing
  const fictionGenreOptions = [
    'fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'historical', 'literary', 'other'
  ];

  // Writing stage options
  const writingStageOptions = [
    'brainstorming', 'outline', 'draft', 'revision', 'proofreading', 'publishing', 'research'
  ];

  // Word count options
  const wordCountOptions = [
    'short', 'medium', 'long', 'chapter', 'flexible'
  ];

  // Quick start categories
  const quickStartCategories = [
    { name: 'Research', icon: '🔬', description: 'Get help with research projects, fact-checking, and information gathering' },
    { name: 'Writing', icon: '✍️', description: 'Assist with novels, articles, scripts, and all types of writing projects' },
    { name: 'Coding', icon: '💻', description: 'Get coding help, debugging, and project development assistance' },
    { name: 'Learning', icon: '📚', description: 'Learn new topics with structured explanations and examples' },
    { name: 'Analysis', icon: '📊', description: 'Analyze data, documents, and complex problems' },
    { name: 'Creative', icon: '🎨', description: 'Brainstorm ideas, creative projects, and artistic endeavors' }
  ];

  useEffect(() => {
    // Load saved API key from device storage
    // In a real implementation, this would use AsyncStorage or similar
    const savedKey = ''; // Placeholder - would load from storage
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
  };

  const quickStart = (category) => {
    switchTab('chat');
    const prompts = {
      'Research': 'Help me research ',
      'Writing': 'Help me write ',
      'Coding': 'Help me build ',
      'Learning': 'Teach me about ',
      'Analysis': 'Analyze ',
      'Creative': 'Help me brainstorm ideas for '
    };
    setMessageInput(prompts[category]);
  };

  // Reusable function to send messages to OpenAI
  const sendToOpenAI = async (message, useHistory = false) => {
    if (!apiKey) {
      throw new Error('Please configure your OpenAI API key in the Setup tab first!');
    }

    const messages = [
      {
        role: 'system',
        content: systemPrompts[currentDepth]
      }
    ];

    if (useHistory) {
      messages.push(...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    } else {
      messages.push({
        role: 'user',
        content: message
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const sendMessage = async () => {
    const message = messageInput.trim();
    
    if (!message) return;

    if (!apiKey) {
      Alert.alert('API Key Required', 'Please configure your OpenAI API key in the Setup tab first!');
      switchTab('setup');
      return;
    }

    try {
      // Add user message to history
      const newHistory = [...conversationHistory, { role: 'user', content: message }];
      setConversationHistory(newHistory);
      
      // Clear input
      setMessageInput('');
      
      // Show thinking message
      setOutputContent('Henry is thinking... 🤔');
      
      const assistantMessage = await sendToOpenAI(message, true);
      setOutputContent(assistantMessage);
      
      // Add assistant message to history
      setConversationHistory([...newHistory, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      const errorMessage = `Sorry, I encountered an error: ${error.message}`;
      setOutputContent(errorMessage);
    }
  };

  const copyOutput = async () => {
    await Clipboard.setString(outputContent);
    Alert.alert('Copied!', 'Content has been copied to clipboard');
  };

  const saveApiKey = () => {
    if (!apiKey.startsWith('sk-')) {
      Alert.alert('Invalid API Key', 'OpenAI API keys start with "sk-"');
      return;
    }
    
    // In a real implementation, this would save to device storage
    Alert.alert('Success!', 'API key saved successfully! You can now use Henry AI.');
    switchTab('chat');
  };

  const downloadMobile = (platform) => {
    const messages = {
      'android': 'Android mobile app (.apk) download would start here!\n\nIn a real implementation, this would download the actual Android APK file.',
      'ios': 'iOS mobile app (.ipa) download would start here!\n\nIn a real implementation, this would download the actual iOS IPA file.'
    };
    
    Alert.alert(
      'Download Starting',
      messages[platform],
      [
        { text: 'OK' }
      ]
    );
  };

  const renderHomeTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.homeContent}>
        <Text style={styles.title}>Welcome to Henry AI!</Text>
        <Text style={styles.description}>
          Hello there! I'm Henry, your friendly AI assistant. I'm here to help you with research, 
          writing, coding, learning, analysis, and creative projects. What would you like to work on today?
        </Text>
        
        <View style={styles.quickStartContainer}>
          {quickStartCategories.map((category, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.quickCard}
              onPress={() => quickStart(category.name)}
            >
              <Text style={styles.quickCardIcon}>{category.icon}</Text>
              <Text style={styles.quickCardTitle}>{category.name}</Text>
              <Text style={styles.quickCardDescription}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.downloadSection}>
          <Text style={styles.downloadTitle}>📱 Download Henry AI for Mobile</Text>
          <Text style={styles.downloadDescription}>
            Get the full standalone mobile version with:
          </Text>
          <View style={styles.downloadList}>
            <Text style={styles.downloadListItem}>• Native mobile app experience</Text>
            <Text style={styles.downloadListItem}>• Offline capabilities</Text>
            <Text style={styles.downloadListItem}>• Device integration (camera, files, etc.)</Text>
            <Text style={styles.downloadListItem}>• Faster performance than web version</Text>
          </View>
          <View style={styles.downloadButtons}>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={() => downloadMobile('android')}
            >
              <Text style={styles.downloadButtonText}>📱 Android (.apk)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={() => downloadMobile('ios')}
            >
              <Text style={styles.downloadButtonText}>🍎 iOS (.ipa)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderChatTab = () => (
    <View style={styles.tabContent}>
      <ScrollView style={styles.chatHistory}>
        {conversationHistory.map((msg, index) => (
          <View key={index} style={[
            styles.message, 
            msg.role === 'user' ? styles.userMessage : styles.assistantMessage
          ]}>
            <View style={[
              styles.messageAvatar,
              msg.role === 'user' ? styles.userAvatar : styles.assistantAvatar
            ]}>
              <Text style={styles.avatarText}>
                {msg.role === 'user' ? 'Y' : 'H'}
              </Text>
            </View>
            <View style={styles.messageContent}>
              <Text style={styles.messageText}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.inputArea}>
        <TextInput
          style={styles.messageInput}
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder="Type your message here..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.outputContainer}>
        <View style={styles.outputHeader}>
          <Text style={styles.outputTitle}>📝 Output</Text>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={copyOutput}
          >
            <Text style={styles.copyButtonText}>📋 Copy</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.outputContent}>
          <Text style={styles.outputText}>{outputContent}</Text>
        </ScrollView>
      </View>
    </View>
  );

  const renderCodingTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>💻 Coding Assistant</Text>
        <Text style={styles.description}>
          Tell me about your coding project and I'll help you build it!
        </Text>
        
        {/* In a real implementation, you would have form elements here */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Type:</Text>
          <View style={styles.optionsContainer}>
            {projectTypeOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.optionButton}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Technology Stack:</Text>
          <View style={styles.optionsContainer}>
            {techStackOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.optionButton}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Type:</Text>
          <View style={styles.optionsContainer}>
            {codingTaskOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.optionButton}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Describe your coding task:</Text>
          <TextInput
            style={styles.textArea}
            value={codingInput}
            onChangeText={setCodingInput}
            placeholder="Examples:
• Create a React component for a user dashboard
• Debug this Python function that's causing memory leaks
• Optimize this database query for better performance
• Review this API endpoint for security vulnerabilities
• Set up a CI/CD pipeline for a Node.js application"
            multiline
          />
        </View>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setOutputContent('Henry is working on your coding task... 💻');
            // In a real implementation, this would send the coding request
          }}
        >
          <Text style={styles.actionButtonText}>Start Coding</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderWritingTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>✍️ Writing Assistant</Text>
        <Text style={styles.description}>
          Let me help you with your writing project!
        </Text>
        
        {/* In a real implementation, you would have form elements here */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Type:</Text>
          <View style={styles.optionsContainer}>
            {bookTypeOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.optionButton}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Genre (if fiction):</Text>
          <View style={styles.optionsContainer}>
            {fictionGenreOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.optionButton}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Current Stage:</Text>
          <View style={styles.optionsContainer}>
            {writingStageOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.optionButton}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Target Length:</Text>
          <View style={styles.optionsContainer}>
            {wordCountOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.optionButton}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Describe your writing project:</Text>
          <TextInput
            style={styles.textArea}
            value={writingInput}
            onChangeText={setWritingInput}
            placeholder="Examples:
• Write a fantasy novel about a young wizard's journey
• Help me outline a mystery thriller with plot twists
• Edit this short story for clarity and pacing
• Proofread this article for grammar and style
• Research the historical context for my novel"
            multiline
          />
        </View>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setOutputContent('Henry is crafting your content... ✍️');
            // In a real implementation, this would send the writing request
          }}
        >
          <Text style={styles.actionButtonText}>Start Writing</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSetupTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.setupCard}>
        <Text style={styles.setupTitle}>🔑 OpenAI API Key Setup</Text>
        <Text style={styles.setupDescription}>
          Enter your OpenAI API key to enable Henry AI's capabilities:
        </Text>
        <TextInput
          style={styles.apiKeyInput}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="sk-..."
          secureTextEntry
        />
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveApiKey}
        >
          <Text style={styles.saveButtonText}>Save API Key</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.setupCard}>
        <Text style={styles.setupTitle}>⚙️ Configuration Guide</Text>
        <Text style={styles.setupDescription}>
          Henry AI is ready to use! Here's how to get started:
        </Text>
        <View style={styles.setupList}>
          <Text style={styles.setupListItem}>1. Enter your OpenAI API key above (get one from OpenAI Platform)</Text>
          <Text style={styles.setupListItem}>2. Choose your preferred AI model from the dropdown</Text>
          <Text style={styles.setupListItem}>3. Adjust the Depth slider to control response detail level</Text>
          <Text style={styles.setupListItem}>4. Switch between tabs to access different features</Text>
          <Text style={styles.setupListItem}>5. Use the Chat tab for general conversations</Text>
          <Text style={styles.setupListItem}>6. Use the Coding tab for programming assistance</Text>
          <Text style={styles.setupListItem}>7. Use the Writing tab for creative writing help</Text>
        </View>
        <Text style={styles.note}>
          Note: Your API key is stored locally on your device and never sent to any server except OpenAI's.
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 Henry AI</Text>
        <View style={styles.headerControls}>
          <Text style={styles.depthLabel}>Depth: {depthDescriptions[currentDepth]}</Text>
          {/* Model selector would be implemented here */}
        </View>
      </View>
      
      {/* Navigation Tabs */}
      <View style={styles.navTabs}>
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'home' && styles.activeTab]}
          onPress={() => switchTab('home')}
        >
          <Text style={[styles.navTabText, activeTab === 'home' && styles.activeTabText]}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => switchTab('chat')}
        >
          <Text style={[styles.navTabText, activeTab === 'chat' && styles.activeTabText]}>💬 Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'coding' && styles.activeTab]}
          onPress={() => switchTab('coding')}
        >
          <Text style={[styles.navTabText, activeTab === 'coding' && styles.activeTabText]}>💻 Coding</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'writing' && styles.activeTab]}
          onPress={() => switchTab('writing')}
        >
          <Text style={[styles.navTabText, activeTab === 'writing' && styles.activeTabText]}>✍️ Writing</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'setup' && styles.activeTab]}
          onPress={() => switchTab('setup')}
        >
          <Text style={[styles.navTabText, activeTab === 'setup' && styles.activeTabText]}>⚙️ Setup</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'chat' && renderChatTab()}
      {activeTab === 'coding' && renderCodingTab()}
      {activeTab === 'writing' && renderWritingTab()}
      {activeTab === 'setup' && renderSetupTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  depthLabel: {
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 5,
    borderRadius: 10,
  },
  navTabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  navTab: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  navTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#86868b',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#667eea',
  },
  activeTabText: {
    color: '#667eea',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  homeContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#86868b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  quickStartContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  quickCard: {
    backgroundColor: '#667eea',
    padding: 20,
    borderRadius: 12,
    width: width * 0.4,
    alignItems: 'center',
    minHeight: 120,
  },
  quickCardIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  quickCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  quickCardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  downloadSection: {
    backgroundColor: '#667eea',
    padding: 25,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
  },
  downloadTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  downloadDescription: {
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
  },
  downloadList: {
    marginBottom: 20,
  },
  downloadListItem: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  downloadButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  downloadButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  chatHistory: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  message: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#667eea',
  },
  assistantAvatar: {
    backgroundColor: '#0071e3',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageContent: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputArea: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  messageInput: {
    flex: 1,
    padding: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: 'white',
    maxHeight: 150,
  },
  sendButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  outputContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    minHeight: 150,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  outputTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#667eea',
    padding: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
  },
  outputContent: {
    minHeight: 100,
  },
  outputText: {
    fontSize: 16,
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 14,
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: 'white',
  },
  actionButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  setupCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  setupDescription: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
  },
  apiKeyInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  setupList: {
    marginBottom: 15,
  },
  setupListItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#86868b',
  },
});