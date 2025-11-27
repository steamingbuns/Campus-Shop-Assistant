import { useState } from 'react';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import avatarImg from '../../assets/chatbot.jpg';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your Campus Shop Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickActions = [
    { id: 1, label: 'Purchase info', query: 'How do I make a purchase?' },
    { id: 2, label: 'Order status', query: 'Check my order status' },
    { id: 3, label: 'Refund info', query: 'How do refunds work?' },
  ];

  const handleSend = (text = inputValue) => {
    if (!text.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const botReply = {
        id: messages.length + 2,
        text: "Thanks for your message! I'm processing your request...",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botReply]);
      // TODO: Add API call to backend here
    }, 600);
  };

  const handleQuickAction = (query) => {
    handleSend(query);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-500 shadow-sm shadow-blue-50 ring-1 ring-blue-100">
          <Sparkles className="h-4 w-4" />
          Chat Assistant
        </div>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Chat Assistant</h1>
        <p className="text-sm text-slate-600">Get instant help finding deals or connecting with the right sellers.</p>
      </div>

      <div className="rounded-2xl bg-white/90 shadow-xl shadow-blue-200 ring-1 ring-blue-100 backdrop-blur">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-blue-100 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Campus Shop Bot</h3>
            <p className="text-xs text-slate-500">Online • Typically replies instantly</p>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <img
                  src={avatarImg}
                  alt="Bot"
                  className="h-8 w-8 flex-shrink-0 rounded-full ring-2 ring-blue-100"
                />
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-blue-50 text-slate-800 ring-1 ring-blue-100'
                }`}
              >
                <p>{message.text}</p>
                <p
                  className={`mt-1 text-xs ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="border-t border-blue-100 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quick actions
            </p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.query)}
                  className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 ring-1 ring-blue-100 transition hover:bg-blue-100"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 border-t border-blue-100 p-4"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500 transition placeholder:text-slate-400 focus:ring-2"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200 transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
