import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, ShoppingCart, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import * as chatbotService from '../../services/chatbotService';
import avatarImg from '../../assets/chatbot.jpg';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([chatbotService.getInitialMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle adding product to cart
  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    // Add feedback message
    setMessages(prev => [...prev, chatbotService.createBotMessage(
      `✅ Added "${product.name}" to your cart!`
    )]);
  };

  // Handle viewing product details
  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Send message to backend API using chatbotService
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    
    // Add user message to chat
    setMessages(prev => [...prev, chatbotService.createUserMessage(userMessage)]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(userMessage);
      
      // Add bot reply
      setMessages(prev => [...prev, chatbotService.createBotMessage(
        response.responseText || "I couldn't process that request.",
        response.metadata
      )]);

    } catch (error) {
      console.error('Chatbot API error:', error);
      setMessages(prev => [...prev, chatbotService.createBotMessage(
        "Sorry, I'm having trouble connecting. Please try again later."
      )]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.type === 'guide') {
      // Show guide message instead of sending query
      setMessages(prev => [...prev, chatbotService.createBotMessage(action.message)]);
    } else {
      handleSendMessage(action.message);
    }
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
            <div key={message.id} className="space-y-3">
              {/* Message row */}
              <div
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
                  <p className="whitespace-pre-wrap">{message.text}</p>

                  {/* Timestamp */}
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

              {/* Product Results Cards - displayed below bot message */}
              {message.metadata?.results?.length > 0 && (
                <div className="ml-11 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {message.metadata.results.slice(0, 6).map((product) => (
                    <div
                      key={product.id || product.product_id}
                      className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-blue-100 transition hover:shadow-lg"
                    >
                      <img
                        src={product.image || '/placeholder-image-200.png'}
                        alt={product.name || product.description || 'Product'}
                        className="h-28 w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image-200.png';
                        }}
                      />
                      <div className="p-3">
                        <h4 className="truncate text-sm font-semibold text-slate-800">
                          {product.name || product.description}
                        </h4>
                        <p className="text-sm font-bold text-blue-600">{chatbotService.formatPrice(product.price)}</p>
                        {(product.category_name || product.category) && (
                          <p className="text-xs text-slate-500">
                            {product.category_name || product.category}
                          </p>
                        )}
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-500 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            Add
                          </button>
                          <button
                            onClick={() => handleViewDetails(product.id)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {message.metadata.results.length > 6 && (
                    <p className="col-span-full text-center text-xs text-slate-500">
                      +{message.metadata.results.length - 6} more items found
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start gap-3">
              <img
                src={avatarImg}
                alt="Bot"
                className="h-8 w-8 flex-shrink-0 rounded-full ring-2 ring-blue-100"
              />
              <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-sm text-slate-600 ring-1 ring-blue-100">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '300ms' }}></span>
                </div>
                Searching...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="border-t border-blue-100 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quick actions
            </p>
            <div className="flex flex-wrap gap-2">
              {chatbotService.quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
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
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-2 border-t border-blue-100 p-4"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500 transition placeholder:text-slate-400 focus:ring-2 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
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
