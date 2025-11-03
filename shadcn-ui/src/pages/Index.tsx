import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { chatLogic, Message } from '@/lib/chatLogic';
import { coreSystem } from '@/lib/coreSystem';
import { Send, Loader2, LogOut, User, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Index() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  const activeCore = coreSystem.getActiveCore();

  useEffect(() => {
    // Create or load session
    const session = chatLogic.createSession(currentUser?.id || null);
    setSessionId(session.id);

    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: isAuthenticated 
        ? `Welcome back, ${currentUser?.username}! I'm Ezidcode AI, your intelligent assistant. I can understand and respond in multiple languages. How can I help you today?`
        : `Hello! I'm Ezidcode AI, your intelligent assistant. I can understand and respond in multiple languages. How can I help you today?\n\n💡 Note: Guest users have a ${coreSystem.getConfig().guestWordLimit}-word response limit. Register for unlimited access!`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    // Auto scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setShowLimitWarning(false);

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Add to session
      chatLogic.addMessage(sessionId, 'user', userMessage);

      // Generate AI response
      const response = await chatLogic.generateResponse(userMessage, sessionId);
      
      // Check if response was truncated
      if (response.includes('word limit reached') || response.includes('Batas') && response.includes('kata tercapai')) {
        setShowLimitWarning(true);
      }

      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        wordCount: chatLogic.countWords(response)
      };

      setMessages(prev => [...prev, aiMsg]);
      chatLogic.addMessage(sessionId, 'assistant', response);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Ezidcode AI</h1>
              <p className="text-xs text-gray-400">
                {activeCore ? `v${activeCore.version}` : 'Intelligent Assistant'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Badge variant="secondary" className="gap-2">
                  <User className="w-3 h-3" />
                  {currentUser?.username}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {showLimitWarning && !isAuthenticated && (
          <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10">
            <AlertDescription className="flex items-center justify-between">
              <span>Response limit reached. Register for unlimited access!</span>
              <Button size="sm" variant="outline" onClick={() => navigate('/register')}>
                Register Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-[calc(100vh-280px)]" ref={scrollRef}>
              <div className="p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className={message.role === 'user' ? 'bg-purple-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'}>
                      <AvatarFallback className="text-white">
                        {message.role === 'user' ? (currentUser?.username?.[0]?.toUpperCase() || 'U') : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex-1 rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-purple-600/20 border border-purple-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <p className="text-white whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      {message.wordCount && message.role === 'assistant' && (
                        <p className="text-xs text-gray-500 mt-2">
                          {message.wordCount} words
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <Avatar className="bg-gradient-to-br from-purple-500 to-pink-500">
                      <AvatarFallback className="text-white">AI</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-2xl p-4 bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  disabled={loading}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Ezidcode AI can understand and respond in multiple languages
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
