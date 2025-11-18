// ESM Jest test for nlpClient
// - Uses `jest.unstable_mockModule` to mock `axios` (ESM mock API)
// - Verifies parseText/classifyText behavior, caching, and error propagation

import { jest } from '@jest/globals';

// Create a post mock we control
const postMock = jest.fn();

// Mock the axios module before importing the client
await jest.unstable_mockModule('axios', () => ({
  default: {
    create: () => ({ post: postMock }),
  },
}));

const nlpClientModule = await import('../services/nlpClient.js');
const { parseText, classifyText } = nlpClientModule;

describe('nlpClient (ESM)', () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  test('parseText calls microservice and caches result', async () => {
    const fakeResult = {
      tokens: [],
      entities: [],
      noun_chunks: ['test product'],
      sentences: ['test sentence'],
      deps: [],
      intent: { name: 'search_product', confidence: 0.8, action: 'search' },
    };

    postMock.mockResolvedValueOnce({ data: { ok: true, result: fakeResult } });

    const res1 = await parseText('find test product');
    expect(res1).toEqual(fakeResult);
    expect(postMock).toHaveBeenCalledTimes(1);

    // Second call should hit cache and not call post again
    const res2 = await parseText('find test product');
    expect(res2).toEqual(fakeResult);
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  test('classifyText returns intent and caches it', async () => {
    const fakeIntent = { name: 'greeting', confidence: 0.95 };
    postMock.mockResolvedValueOnce({ data: { ok: true, intent: fakeIntent } });

    const res1 = await classifyText('hello');
    expect(res1).toEqual(fakeIntent);
    expect(postMock).toHaveBeenCalledTimes(1);

    // cached
    const res2 = await classifyText('hello');
    expect(res2).toEqual(fakeIntent);
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  test('parseText throws on empty input', async () => {
    await expect(parseText('')).rejects.toThrow('parseText: text must be a non-empty string');
  });

  test('post errors propagate for 4xx responses', async () => {
    // Simulate axios error with response.status 400
    const error = new Error('Bad Request');
    error.response = { status: 400, data: { message: 'bad' } };
    postMock.mockRejectedValueOnce(error);

    await expect(parseText('trigger 4xx')).rejects.toThrow(/NLP service client got 400/);
  });
});
