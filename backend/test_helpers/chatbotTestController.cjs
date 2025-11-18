/*
A small CommonJS test helper that mirrors the controller's external behavior needed
for integration tests. It keeps controllers thin: validates input, generates sessionId,
delegates to `chatbotService.handleMessage`, and maps service results to a stable
response payload consumed by the frontend.

This helper is intended only for tests to avoid mixing ESM/CJS in Jest. It intentionally
keeps logic minimal and forwards most responsibilities to the service layer.
*/

const crypto = require('crypto');

async function handleChatbotQuery(req, res) {
  try {
    const { message, userId, conversationId } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const sessionId = conversationId || (crypto.randomUUID ? crypto.randomUUID() : `sess-${Date.now()}-${Math.random().toString(36).slice(2,8)}`);

    // Lazy-require the service so tests can `doMock`/`mock` it before the module is loaded.
    // This avoids module-resolution order issues in Jest when the helper itself is required
    // after the test sets up module mocks.
    const chatbotService = require('../services/chatbotService');
    const serviceResult = await chatbotService.handleMessage({ sessionId, userId, text: message.trim() });

    const intentName = serviceResult && serviceResult.metadata && serviceResult.metadata.intent && serviceResult.metadata.intent.name ? serviceResult.metadata.intent.name : (serviceResult && serviceResult.metadata && serviceResult.metadata.intent ? serviceResult.metadata.intent : 'unknown');

    const responsePayload = {
      intent: intentName,
      responseText: serviceResult.reply || serviceResult.responseText || '',
      metadata: serviceResult.metadata || {},
      sessionId,
    };

    if (serviceResult.results) responsePayload.results = serviceResult.results;
    if (serviceResult.products) responsePayload.results = serviceResult.products;

    return res.json(responsePayload);
  } catch (error) {
    console.error('test helper handleChatbotQuery error:', error);
    return res.status(500).json({ error: 'Failed to process your request', message: 'The chatbot encountered an error. Please try again.' });
  }
}

module.exports = { handleChatbotQuery };
