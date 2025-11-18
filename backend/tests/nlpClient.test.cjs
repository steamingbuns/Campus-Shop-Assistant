// nlpClient.test.cjs
// CommonJS test that dynamically imports the ESM `nlpClient` module.
// - Mocks axios before importing the module so the module sees the mocked axios
// - Uses dynamic import inside beforeAll to load ESM module

jest.mock('axios', () => {
  const post = jest.fn();
  return {
    create: jest.fn(() => ({ post })),
  };
});

const axios = require('axios');
const path = require('path');

let parseText, classifyText;

// Import the CommonJS module directly
const nlpClient = require(path.join('..', 'services', 'nlpClient'));
parseText = nlpClient.parseText;
classifyText = nlpClient.classifyText;

describe('nlpClient', () => {
  beforeEach(() => {
    axios.create.mockClear();
    axios.create().post.mockClear();
  });

  test('parseText calls microservice and caches result', async () => {
    const postMock = axios.create().post;

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
    const postMock = axios.create().post;

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
    const postMock = axios.create().post;
    const error = new Error('Bad Request');
    error.response = { status: 400, data: { message: 'bad' } };
    postMock.mockRejectedValueOnce(error);

    await expect(parseText('trigger 4xx')).rejects.toThrow(/NLP service client got 400/);
  });
});
