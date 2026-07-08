import { useState } from 'react';
import { Send, X, Bot } from 'lucide-react';
import api from '../utils/axios';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your team assistant. Ask me anything about reports." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: input
      });

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I could not generate a response right now.' }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: error.response?.data?.reply || "Sorry, I'm having trouble right now. Try again later."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl z-50 flex items-center gap-2"
      >
        <Bot size={24} />
        AI Assistant
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-8 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-3xl shadow-2xl z-50 flex flex-col h-[520px] max-h-[calc(100vh-6rem)]">
          <div className="bg-[#0A2540] text-white p-4 rounded-t-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="text-blue-400" />
              <div>
                <p className="font-semibold">Team AI Assistant</p>
                <p className="text-xs text-blue-300">Ask about team activity</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-black shadow-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-center text-gray-500">Thinking...</div>}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="What did design team work on last week?"
                className="flex-1 p-4 bg-gray-400 rounded-2xl focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;