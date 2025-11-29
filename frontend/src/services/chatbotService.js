/**
 * Chatbot Service
 * 
 * Frontend service for interacting with the chatbot API.
 * Follows the same patterns as other services in the project.
 */

import api from './api';

// Session ID management - persists across page reloads within same browser session
const SESSION_KEY = 'chatbot_session_id';

function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Send a message to the chatbot and get a response
 * @param {string} message - The user's message
 * @returns {Promise<Object>} - { responseText, intent, metadata, sessionId }
 */
export async function sendMessage(message) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Message cannot be empty');
  }

  const sessionId = getSessionId();
  
  const response = await api.post('/chatbot/query', {
    data: {
      message: message.trim(),
      sessionId
    }
  });
  
  return {
    responseText: response.responseText || response.reply,
    intent: response.intent || response.metadata?.intent,
    metadata: response.metadata || {},
    sessionId: response.sessionId || sessionId
  };
}

/**
 * Format price to VND currency
 * @param {number} price - The price value
 * @returns {string} - Formatted price string
 */
export function formatPrice(price) {
  if (price == null || isNaN(price)) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(price);
}

/**
 * Quick action templates for the chatbot UI
 */
export const quickActions = [
  { label: '🔍 Browse products', type: 'guide', message: 'You can browse products by category! Try:\n• "browse electronics" - see Electronics\n• "show me books" - see Books\n• "find clothing" - see Clothing' },
  { label: '💰 Check prices', type: 'guide', message: 'You can ask me about prices! Try "how much is [product name]?" e.g. "how much is the laptop?"' },
  { label: '⭐ Recommendations', type: 'query', message: 'what do you recommend?' },
  { label: '❓ Help', type: 'query', message: 'what can you do?' }
];

/**
 * Get the initial greeting message
 * @returns {Object} - Initial bot message
 */
export function getInitialMessage() {
  return {
    id: 'welcome',
    sender: 'bot',
    text: `Welcome to Campus Shop! 👋\nI can help you find products, check prices, and give recommendations. What are you looking for?`,
    timestamp: new Date()
  };
}

/**
 * Create a user message object
 * @param {string} text - The message text
 * @returns {Object} - Message object
 */
export function createUserMessage(text) {
  return {
    id: `user_${Date.now()}`,
    sender: 'user',
    text,
    timestamp: new Date()
  };
}

/**
 * Create a bot message object
 * @param {string} text - The message text
 * @param {Object} metadata - Optional metadata (products, etc.)
 * @returns {Object} - Message object
 */
export function createBotMessage(text, metadata = {}) {
  return {
    id: `bot_${Date.now()}`,
    sender: 'bot',
    text,
    metadata,
    timestamp: new Date()
  };
}

/**
 * Clear the session and start fresh
 */
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default {
  sendMessage,
  formatPrice,
  quickActions,
  getInitialMessage,
  createUserMessage,
  createBotMessage,
  clearSession
};
