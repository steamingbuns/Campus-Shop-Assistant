// ESM Jest test for chatbotService
// - Mocks `../services/nlpClient.js` to control intent outputs
// - Verifies intent flows and fallback behavior

import { jest } from '@jest/globals';

// Mock parseText implementation
const parseTextMock = jest.fn();

await jest.unstable_mockModule('../services/nlpClient.js', () => ({
  // export named functions from the mocked module
  parseText: parseTextMock,
}));

const chatbotServiceModule = await import('../services/chatbotService.js');
const { handleMessage } = chatbotServiceModule;

describe('chatbotService (ESM)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleMessage handles search intent and extracts query', async () => {
    parseTextMock.mockResolvedValueOnce({
      intent: { name: 'search_product', confidence: 0.8, action: 'search' },
      entities: [{ text: 'blue hoodie' }],
      noun_chunks: ['blue hoodie'],
    });

    const out = await handleMessage({ sessionId: 's1', userId: 'u1', text: 'Find blue hoodie' });

    expect(out.reply).toMatch(/blue hoodie/);
    expect(out.metadata).toBeDefined();
    expect(out.metadata.intent.name).toBe('search_product');
  });

  test('handleMessage returns fallback when NLP parse fails', async () => {
    parseTextMock.mockRejectedValueOnce(new Error('nlp down'));

    const out = await handleMessage({ sessionId: 's1', userId: 'u1', text: 'anything' });

    expect(out.reply).toMatch(/having trouble/);
    expect(out.metadata).toEqual({});
  });
});
