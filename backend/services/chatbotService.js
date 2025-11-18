/*
chatbotService.js

A thin orchestration layer that demonstrates how to use `nlpClient` to parse a user's message,
handle action intents (e.g., search), and compose a response.

This file is a scaffold: it includes error handling, edge case checks, and comments where
you should plug in DB persistence (`models/chatbotModel.js`) and product search (`services/searchClient`).

Best practice notes included inline:
- Keep controller logic slim; controllers should call these service methods.
- Services coordinate work, call models/other services, and return domain objects.
- Keep external calls (NLP, DB, third-party) behind adapters for easier testing.
*/

const nlpClient = require('./nlpClient');
// const chatbotModel = require('../models/chatbotModel'); // uncomment if model methods exist
// const productService = require('./productService'); // example: existing product search wrapper

async function handleMessage({ sessionId, userId, text }) {
  if (!text || !text.trim()) {
    throw new Error('handleMessage: text must be a non-empty string');
  }

  // Persist incoming user message (if you have a chatbotModel). Wrap in try/catch and continue on failure.
  try {
    // await chatbotModel.saveMessage(sessionId, userId, 'user', text, {});
  } catch (err) {
    // Log but do not block response generation
    console.warn('Failed to persist incoming message', err && err.message);
  }

  // Parse text with NLP service. Use caching where appropriate inside nlpClient.
  let parseResult;
  try {
    parseResult = await nlpClient.parseText(text);
  } catch (err) {
    // If NLP service is unavailable, fail gracefully with a canned reply
    console.error('NLP parse failed', err && err.message);
    const fallback = { reply: "Sorry, I'm having trouble understanding right now. Please try again later.", metadata: {} };
    // Save bot message if models available
    // await chatbotModel.saveMessage(sessionId, null, 'bot', fallback.reply, { error: err.message });
    return fallback;
  }

  // parseResult.intent example: { name: 'search_product', confidence: 0.75, action: 'search' }
  const intent = parseResult.intent || { name: 'unknown', confidence: 0 };

  // Simple rule-based flow: if intent.action === 'search', call search service
  try {
    if (intent.action === 'search' || intent.name === 'search_product') {
      // Example: extract query from text or noun_chunks/entities
      const query = extractQueryFromParse(text, parseResult);
      // Call productService or productModel to perform a product search
      // const results = await productService.search(query, { limit: 10 });

      // For the scaffold, we'll return a placeholder response
      const reply = `I found some products related to "${query}". Would you like to see them?`;
      const metadata = { intent, query /*, results */ };

      // Persist bot reply
      try {
        // await chatbotModel.saveMessage(sessionId, null, 'bot', reply, metadata);
      } catch (err) {
        console.warn('Failed to persist bot message', err && err.message);
      }

      return { reply, metadata };
    }

    // Other intents (greeting, ask_price, purchase_intent) can be handled similarly with dedicated handlers
    if (intent.name === 'greeting') {
      const reply = 'Hello! How can I help you today?';
      try {
        // await chatbotModel.saveMessage(sessionId, null, 'bot', reply, { intent });
      } catch (err) {
        console.warn('Failed to persist bot message', err && err.message);
      }
      return { reply, metadata: { intent } };
    }

    // Fallback: no recognized action, produce a safe default reply or call an LLM for generation
    {
      // Example: short template reply. For more advanced flows, call an LLM adapter
      const reply = "I'm not sure I understand. Could you rephrase or provide more details?";
      try {
        // await chatbotModel.saveMessage(sessionId, null, 'bot', reply, { intent });
      } catch (err) {
        console.warn('Failed to persist bot message', err && err.message);
      }
      return { reply, metadata: { intent } };
    }
  } catch (err) {
    console.error('Error handling intent flow', err && err.message);
    const reply = "Sorry, something went wrong while processing your request.";
    return { reply, metadata: { error: err && err.message } };
  }
}

function extractQueryFromParse(originalText, parseResult) {
  // Priority: entities -> noun_chunks -> fallback to entire text
  try {
    if (parseResult.entities && parseResult.entities.length > 0) {
      // Prefer PERSON/PRODUCT-like entities; just join all entity texts for now
      return parseResult.entities.map((e) => e.text).join(' ');
    }
    if (parseResult.noun_chunks && parseResult.noun_chunks.length > 0) {
      // Use the longest noun chunk as a heuristic
      const sorted = parseResult.noun_chunks.slice().sort((a, b) => b.length - a.length);
      return sorted[0];
    }
  } catch (err) {
    console.warn('extractQueryFromParse failed', err && err.message);
  }
  return originalText;
}

module.exports = {
  handleMessage,
};
