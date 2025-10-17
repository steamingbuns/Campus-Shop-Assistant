import { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

import avatarImg from 'D:\\Huy\\Uni stuffs\\Studying\\Year 3\\Đồ án Tổng Hợp\\chatbot-chat-message-vectorart\\Chatbot Chat Message.jpg'

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
      <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
        <img src={avatarImg} 
        alt="Open chat" 
        className="chatbot-avatar-img" />
      </button>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-info">
          <div className="chatbot-header-avatar">
          <img 
            src={avatarImg}
            alt="Bot Avatar" 
            style={{ borderRadius: '50%' }}
          />
          </div>
          <div>
            <div>Campus Helper</div>
            <div className="online-status">Online</div>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
            ✕
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} className="message-container">
            <div
              className={`chat-bubble ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {messages.length <= 2 && (
          <div className="quick-actions">
            {quickActions.map(action => (
              <button
                key={action.id}
                className="action-button"
                onClick={() => handleQuickAction(action.id, action.text)}
              >
                {action.text}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="input-area">
        <input
          type="text"
          placeholder="Enter your message..."
          className="message-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit" className="send-button">
          ➤
        </button>
      </form>
    </div>
  );
};

export default Chatbot;