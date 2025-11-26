import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles } from 'lucide-react';
import avatarImg from '../../assets/chatbot.jpg';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to our store! 👋",
      sender: "bot",
      timestamp: new Date()
    },
    {
      id: 2,
      text: "How can I help you?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);

  const quickActions = [
    { id: 'purchase', text: 'Purchase info' },
    { id: 'order', text: 'Order status' },
    { id: 'refund', text: 'Refund info' },
  ];

  const handleQuickAction = (actionId, actionText) => {
    // Add user message
    setMessages(prev => [...prev, {
      text: actionText,
      sender: 'user'
    }]);

    // Simulate bot response
    setTimeout(() => {
      let response = '';
      switch (actionId) {
        case 'purchase':
          response = 'You can purchase items by adding them to cart and checking out.\n Need help with anything specific?';
          break;
        case 'order':
          response = 'To check your order status, please provide your order number.';
          break;
        case 'refund':
          response = 'For refunds, please check our refund policy. Would you like me to explain the process?';
          break;
        default:
          response = 'How else can I help you?';
      }

      setMessages(prev => [...prev, {
        text: response,
        sender: 'bot'
      }]);
    }, 500);
  };

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputMessage, sender: 'user' }]);
    
    // TODO: Add API call to backend here
    // For now, simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I'm searching for relevant items...", 
        sender: 'bot' 
      }]);
    }, 1000);

    setInputMessage('');
  };

  if (!isOpen) {
    return (
      <button
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-xl shadow-blue-200 transition hover:scale-105"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full max-w-sm rounded-2xl bg-white/90 shadow-2xl shadow-indigo-200 ring-1 ring-indigo-100 backdrop-blur">
      <div className="flex items-center justify-between border-b border-indigo-50 bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-white/40">
            <img src={avatarImg} alt="Bot Avatar" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-sm font-semibold">Campus Helper</div>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Online
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-full p-2 text-white/80 transition hover:bg-white/10"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm shadow-sm ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-blue-200'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:border-indigo-200"
                onClick={() => handleQuickAction(action.id, action.text)}
              >
                <Sparkles className="h-3 w-3" />
                {action.text}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-indigo-50 px-3 py-3">
        <input
          type="text"
          placeholder="Enter your message..."
          className="h-11 flex-1 rounded-xl border border-indigo-100 bg-white/80 px-3 text-sm text-slate-800 outline-none ring-indigo-100 transition focus:ring-2 focus:ring-indigo-500"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button
          type="submit"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
