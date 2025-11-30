import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import * as chatbotService from '../../services/chatbotService';
import avatarImg from '../../assets/chatbot.jpg';

// ProductCard component for displaying products in chat
const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {/* Product Image */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <ShoppingCart className="h-6 w-6" />
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="text-sm font-medium text-slate-800 line-clamp-1">
            {product.name || 'Unnamed Product'}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-1">
            {product.category_name || 'Uncategorized'}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-blue-600">
            {chatbotService.formatPrice(product.price)}
          </span>
          
          <div className="flex gap-1">
            <button
              onClick={() => onViewDetails(product.id)}
              className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
            >
              View
            </button>
            <button
              onClick={() => onAddToCart(product)}
              className="rounded-lg bg-blue-500 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([chatbotService.getInitialMessage()]);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleQuickAction = (action) => {
    if (action.type === 'guide') {
      // Show guide message instead of sending query
      setMessages(prev => [...prev, chatbotService.createBotMessage(action.message)]);
    } else {
      handleSendMessage(action.message);
    }
  };

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

  // Handle view product details
  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
    setIsOpen(false); // Close chatbot when navigating
  };

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message to backend API using chatbotService
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    
    // Add user message to chat
    setMessages(prev => [...prev, chatbotService.createUserMessage(userMessage)]);
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    await handleSendMessage(message);
  };

  if (!isOpen) {
    return (
      <button
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-500 text-white shadow-xl shadow-blue-200 transition hover:scale-105"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full max-w-sm rounded-2xl bg-white/90 shadow-2xl shadow-blue-200 ring-1 ring-blue-100 backdrop-blur">
      <div className="flex items-center justify-between border-b border-blue-50 bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-3 text-white">
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
          <div key={index} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
            {/* Message bubble */}
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm shadow-sm ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-blue-200'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {message.text}
            </div>
            
            {/* Product cards (if message has products in metadata) */}
            {message.metadata?.results && message.metadata.results.length > 0 && (
              <div className="mt-2 w-full space-y-2">
                {message.metadata.results.slice(0, 5).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                  />
                ))}
                {message.metadata.results.length > 5 && (
                  <p className="text-center text-xs text-slate-500">
                    +{message.metadata.results.length - 5} more items available
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }}></span>
              </div>
              Searching...
            </div>
          </div>
        )}

        {/* Quick actions shown at start */}
        {messages.length <= 1 && !isLoading && (
          <div className="flex flex-wrap gap-2">
            {chatbotService.quickActions.map((action, index) => (
              <button
                key={index}
                className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-100"
                onClick={() => handleQuickAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-blue-50 px-3 py-3">
        <input
          type="text"
          placeholder="Ask me anything..."
          className="h-11 flex-1 rounded-xl border border-blue-100 bg-white/80 px-3 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
