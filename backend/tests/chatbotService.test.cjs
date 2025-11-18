// chatbotService.test.cjs
// Unit tests for `services/chatbotService.js`.
// - Mocks `nlpClient` to control parse results and test branching logic.

// chatbotService.test.cjs
// CommonJS test that dynamically imports the ESM `chatbotService` module.
// - Mocks `../services/nlpClient.js` before importing so the service sees the mock

jest.mock('../services/nlpClient', () => ({
  parseText: jest.fn(),
}));

const path = require('path');
const nlpClient = require(path.join('..', 'services', 'nlpClient'));
const chatbotService = require(path.join('..', 'services', 'chatbotService'));

describe('chatbotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleMessage handles search intent and extracts query', async () => {
    nlpClient.parseText.mockResolvedValueOnce({
      intent: { name: 'search_product', confidence: 0.8, action: 'search' },
      entities: [{ text: 'blue hoodie' }],
      noun_chunks: ['blue hoodie'],
    });

    const out = await chatbotService.handleMessage({ sessionId: 's1', userId: 'u1', text: 'Find blue hoodie' });

    expect(out.reply).toMatch(/blue hoodie/);
    expect(out.metadata).toBeDefined();
    expect(out.metadata.intent.name).toBe('search_product');
  });

  test('handleMessage returns fallback when NLP parse fails', async () => {
    nlpClient.parseText.mockRejectedValueOnce(new Error('nlp down'));

    const out = await chatbotService.handleMessage({ sessionId: 's1', userId: 'u1', text: 'anything' });

    expect(out.reply).toMatch(/having trouble/);
    expect(out.metadata).toEqual({});
  });
});
