import { authService } from './auth';
import { coreSystem } from './coreSystem';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  wordCount?: number;
}

export interface ChatSession {
  id: string;
  userId: string | null;
  messages: Message[];
  createdAt: string;
  lastActive: string;
}

const SESSIONS_KEY = 'ezidcode_sessions';

export const chatLogic = {
  // Create new session
  createSession: (userId: string | null = null): ChatSession => {
    const session: ChatSession = {
      id: `session-${Date.now()}`,
      userId,
      messages: [],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    const sessions = chatLogic.getAllSessions();
    sessions.push(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    return session;
  },

  // Get all sessions
  getAllSessions: (): ChatSession[] => {
    const sessionsJson = localStorage.getItem(SESSIONS_KEY);
    return sessionsJson ? JSON.parse(sessionsJson) : [];
  },

  // Get session by ID
  getSession: (sessionId: string): ChatSession | null => {
    const sessions = chatLogic.getAllSessions();
    return sessions.find(s => s.id === sessionId) || null;
  },

  // Add message to session
  addMessage: (sessionId: string, role: 'user' | 'assistant', content: string): Message => {
    const sessions = chatLogic.getAllSessions();
    const session = sessions.find(s => s.id === sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    const message: Message = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      wordCount: content.split(/\s+/).length
    };

    session.messages.push(message);
    session.lastActive = new Date().toISOString();
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    return message;
  },

  // Count words in text
  countWords: (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  },

  // Generate AI response (simulation)
  generateResponse: async (userMessage: string, sessionId: string): Promise<string> => {
    const isAuthenticated = authService.isAuthenticated();
    const config = coreSystem.getConfig();
    const activeCore = coreSystem.getActiveCore();

    // Detect language (simple detection)
    const isIndonesian = /[a-z]*[aiueo]{2,}[a-z]*/i.test(userMessage) && 
                         (userMessage.includes('apa') || userMessage.includes('bagaimana') || 
                          userMessage.includes('mengapa') || userMessage.includes('siapa'));

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate contextual response based on user message
    let response = '';

    const lowerMessage = userMessage.toLowerCase();

    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('halo')) {
      response = isIndonesian 
        ? `Halo! Saya adalah Ezidcode AI, asisten cerdas yang siap membantu Anda. Saya dapat memahami dan merespons dalam berbagai bahasa. Ada yang bisa saya bantu hari ini?`
        : `Hello! I'm Ezidcode AI, your intelligent assistant ready to help. I can understand and respond in multiple languages. How can I assist you today?`;
    }
    // Capability questions
    else if (lowerMessage.includes('apa yang bisa') || lowerMessage.includes('what can you')) {
      const capabilities = activeCore?.capabilities.join(', ') || 'various tasks';
      response = isIndonesian
        ? `Saya memiliki berbagai kemampuan termasuk: ${capabilities}. Saya dapat membantu Anda dengan percakapan natural, menjawab pertanyaan, memberikan informasi, dan banyak lagi. Versi saya saat ini adalah ${activeCore?.version || '1.0.0'}.`
        : `I have various capabilities including: ${capabilities}. I can help you with natural conversations, answering questions, providing information, and much more. My current version is ${activeCore?.version || '1.0.0'}.`;
    }
    // Who are you
    else if (lowerMessage.includes('siapa kamu') || lowerMessage.includes('who are you')) {
      response = isIndonesian
        ? `Saya adalah Ezidcode AI, sebuah sistem kecerdasan buatan yang dirancang untuk membantu Anda dengan berbagai tugas. Saya dapat memahami dan berkomunikasi dalam berbagai bahasa, memberikan informasi, dan membantu menjawab pertanyaan Anda.`
        : `I am Ezidcode AI, an artificial intelligence system designed to assist you with various tasks. I can understand and communicate in multiple languages, provide information, and help answer your questions.`;
    }
    // Help with code
    else if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('kode')) {
      response = isIndonesian
        ? `Saya dapat membantu Anda dengan pemrograman dan pengembangan aplikasi. Saya memahami berbagai bahasa pemrograman dan dapat memberikan saran, menjelaskan konsep, atau membantu debugging. Apa yang ingin Anda ketahui tentang pemrograman?`
        : `I can help you with programming and application development. I understand various programming languages and can provide suggestions, explain concepts, or assist with debugging. What would you like to know about programming?`;
    }
    // General question
    else if (lowerMessage.includes('?') || lowerMessage.includes('bagaimana') || lowerMessage.includes('how')) {
      response = isIndonesian
        ? `Terima kasih atas pertanyaan Anda. Berdasarkan pemahaman saya, saya akan mencoba memberikan jawaban yang komprehensif. ${userMessage.includes('bagaimana') ? 'Untuk menjawab pertanyaan "bagaimana", saya perlu memahami konteks lebih lanjut.' : 'Saya siap membantu menjawab pertanyaan Anda.'} Bisakah Anda memberikan lebih banyak detail agar saya dapat memberikan jawaban yang lebih spesifik?`
        : `Thank you for your question. Based on my understanding, I'll try to provide a comprehensive answer. ${userMessage.includes('how') ? 'To answer the "how" question, I need to understand more context.' : 'I\'m ready to help answer your question.'} Could you provide more details so I can give you a more specific answer?`;
    }
    // Default response
    else {
      response = isIndonesian
        ? `Saya telah memproses pesan Anda: "${userMessage}". Sebagai AI yang cerdas, saya dapat membantu Anda dengan berbagai topik. Saya memahami bahasa Indonesia dan dapat memberikan respons yang relevan. Apakah ada hal spesifik yang ingin Anda tanyakan atau diskusikan?`
        : `I've processed your message: "${userMessage}". As an intelligent AI, I can assist you with various topics. I understand multiple languages and can provide relevant responses. Is there anything specific you'd like to ask or discuss?`;
    }

    // Add some variation to make it more natural
    const variations = isIndonesian 
      ? [
          '\n\nSaya di sini untuk membantu Anda kapan saja.',
          '\n\nJangan ragu untuk bertanya lebih lanjut!',
          '\n\nSaya senang bisa membantu Anda hari ini.',
          ''
        ]
      : [
          '\n\nI\'m here to help you anytime.',
          '\n\nFeel free to ask more questions!',
          '\n\nI\'m happy to assist you today.',
          ''
        ];
    
    response += variations[Math.floor(Math.random() * variations.length)];

    // Check word limit for guests
    if (!isAuthenticated) {
      const wordCount = chatLogic.countWords(response);
      if (wordCount > config.guestWordLimit) {
        const words = response.split(/\s+/);
        response = words.slice(0, config.guestWordLimit).join(' ') + '...';
        
        const limitMessage = isIndonesian
          ? `\n\n[Batas ${config.guestWordLimit} kata tercapai. Silakan login atau daftar untuk mendapatkan respons lengkap tanpa batasan.]`
          : `\n\n[${config.guestWordLimit} word limit reached. Please login or register to get full responses without limits.]`;
        
        response += limitMessage;
      }
    }

    return response;
  },

  // Clear session
  clearSession: (sessionId: string) => {
    const sessions = chatLogic.getAllSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }
};
