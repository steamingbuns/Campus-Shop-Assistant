// chatbotService.test.js - Tests for the chatbot frontend service
// Uses Vitest with globals enabled (no imports needed for describe, it, expect, vi)

import * as chatbotService from '../src/services/chatbotService';
import api from '../src/services/api';

// Mock the api module
vi.mock('../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock sessionStorage for session ID management
const mockSessionStorage = {
  store: {},
  getItem: vi.fn((key) => mockSessionStorage.store[key] || null),
  setItem: vi.fn((key, value) => { mockSessionStorage.store[key] = value; }),
  removeItem: vi.fn((key) => { delete mockSessionStorage.store[key]; }),
  clear: vi.fn(() => { mockSessionStorage.store = {}; }),
};

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('chatbotService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();
  });

  // ============================================
  // sendMessage() Tests
  // ============================================
  describe('sendMessage', () => {
    it('sends a message and returns response with correct structure', async () => {
      const mockResponse = {
        responseText: 'Here are some products for you!',
        intent: 'search_items',
        metadata: { results: [{ id: 1, name: 'Laptop' }] },
        sessionId: 'session_123'
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await chatbotService.sendMessage('show me laptops');

      expect(api.post).toHaveBeenCalledWith('/chatbot/query', {
        data: expect.objectContaining({
          message: 'show me laptops',
          sessionId: expect.any(String)
        })
      });
      expect(result).toHaveProperty('responseText', 'Here are some products for you!');
      expect(result).toHaveProperty('intent', 'search_items');
      expect(result).toHaveProperty('metadata');
    });

    it('trims whitespace from message before sending', async () => {
      api.post.mockResolvedValue({ responseText: 'OK' });

      await chatbotService.sendMessage('  hello world  ');

      expect(api.post).toHaveBeenCalledWith('/chatbot/query', {
        data: expect.objectContaining({
          message: 'hello world'
        })
      });
    });

    it('throws error for empty message', async () => {
      await expect(chatbotService.sendMessage('')).rejects.toThrow('Message cannot be empty');
      await expect(chatbotService.sendMessage('   ')).rejects.toThrow('Message cannot be empty');
      await expect(chatbotService.sendMessage(null)).rejects.toThrow('Message cannot be empty');
      await expect(chatbotService.sendMessage(undefined)).rejects.toThrow('Message cannot be empty');
    });

    it('throws error for non-string message', async () => {
      await expect(chatbotService.sendMessage(123)).rejects.toThrow('Message cannot be empty');
      await expect(chatbotService.sendMessage({})).rejects.toThrow('Message cannot be empty');
    });

    it('handles response with reply field instead of responseText', async () => {
      api.post.mockResolvedValue({
        reply: 'Fallback response text',
        metadata: {}
      });

      const result = await chatbotService.sendMessage('test');

      expect(result.responseText).toBe('Fallback response text');
    });

    it('extracts intent from metadata if not at top level', async () => {
      api.post.mockResolvedValue({
        responseText: 'OK',
        metadata: { intent: 'browse_products' }
      });

      const result = await chatbotService.sendMessage('browse all');

      expect(result.intent).toBe('browse_products');
    });

    it('reuses session ID across multiple calls', async () => {
      api.post.mockResolvedValue({ responseText: 'OK' });

      await chatbotService.sendMessage('first message');
      const firstCallData = api.post.mock.calls[0][1].data;

      await chatbotService.sendMessage('second message');
      const secondCallData = api.post.mock.calls[1][1].data;

      expect(firstCallData.sessionId).toBe(secondCallData.sessionId);
    });
  });

  // ============================================
  // formatPrice() Tests
  // ============================================
  describe('formatPrice', () => {
    it('formats price in VND currency', () => {
      const result = chatbotService.formatPrice(300000);
      // Vietnamese format uses dots as thousand separators
      expect(result).toContain('300');
      expect(result).toContain('₫');
    });

    it('handles zero price', () => {
      const result = chatbotService.formatPrice(0);
      expect(result).toContain('0');
      expect(result).toContain('₫');
    });

    it('handles large prices', () => {
      const result = chatbotService.formatPrice(15000000);
      expect(result).toContain('15');
      expect(result).toContain('₫');
    });

    it('returns N/A for null or undefined', () => {
      expect(chatbotService.formatPrice(null)).toBe('N/A');
      expect(chatbotService.formatPrice(undefined)).toBe('N/A');
    });

    it('returns N/A for NaN', () => {
      expect(chatbotService.formatPrice(NaN)).toBe('N/A');
      expect(chatbotService.formatPrice('not a number')).toBe('N/A');
    });
  });

  // ============================================
  // getInitialMessage() Tests
  // ============================================
  describe('getInitialMessage', () => {
    it('returns a valid bot message object', () => {
      const message = chatbotService.getInitialMessage();

      expect(message).toHaveProperty('id', 'welcome');
      expect(message).toHaveProperty('sender', 'bot');
      expect(message).toHaveProperty('text');
      expect(message).toHaveProperty('timestamp');
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('includes welcome text mentioning Campus Shop', () => {
      const message = chatbotService.getInitialMessage();
      expect(message.text).toContain('Campus Shop');
    });
  });

  // ============================================
  // createUserMessage() Tests
  // ============================================
  describe('createUserMessage', () => {
    it('creates a user message with correct structure', () => {
      const message = chatbotService.createUserMessage('Hello bot');

      expect(message).toHaveProperty('sender', 'user');
      expect(message).toHaveProperty('text', 'Hello bot');
      expect(message).toHaveProperty('timestamp');
      expect(message.id).toMatch(/^user_\d+$/);
    });

    it('generates unique IDs for each message', async () => {
      const msg1 = chatbotService.createUserMessage('First');
      // Add small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 5));
      const msg2 = chatbotService.createUserMessage('Second');

      expect(msg1.id).not.toBe(msg2.id);
    });
  });

  // ============================================
  // createBotMessage() Tests
  // ============================================
  describe('createBotMessage', () => {
    it('creates a bot message with correct structure', () => {
      const message = chatbotService.createBotMessage('Here are your results');

      expect(message).toHaveProperty('sender', 'bot');
      expect(message).toHaveProperty('text', 'Here are your results');
      expect(message).toHaveProperty('metadata', {});
      expect(message).toHaveProperty('timestamp');
      expect(message.id).toMatch(/^bot_\d+$/);
    });

    it('includes metadata when provided', () => {
      const metadata = { 
        results: [{ id: 1, name: 'Product' }],
        intent: 'search_items'
      };
      const message = chatbotService.createBotMessage('Found products', metadata);

      expect(message.metadata).toEqual(metadata);
      expect(message.metadata.results).toHaveLength(1);
    });

    it('uses empty object as default metadata', () => {
      const message = chatbotService.createBotMessage('Hello');
      expect(message.metadata).toEqual({});
    });
  });

  // ============================================
  // clearSession() Tests
  // ============================================
  describe('clearSession', () => {
    it('removes session ID from sessionStorage', () => {
      // Set a session first
      mockSessionStorage.store['chatbot_session_id'] = 'old_session';
      
      chatbotService.clearSession();

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('chatbot_session_id');
    });
  });

  // ============================================
  // quickActions Tests
  // ============================================
  describe('quickActions', () => {
    it('exports an array of quick actions', () => {
      expect(Array.isArray(chatbotService.quickActions)).toBe(true);
      expect(chatbotService.quickActions.length).toBeGreaterThan(0);
    });

    it('each quick action has required properties', () => {
      chatbotService.quickActions.forEach(action => {
        expect(action).toHaveProperty('label');
        expect(action).toHaveProperty('type');
        expect(action).toHaveProperty('message');
        expect(['guide', 'query']).toContain(action.type);
      });
    });

    it('contains browse products action', () => {
      const browseAction = chatbotService.quickActions.find(a => 
        a.label.toLowerCase().includes('browse')
      );
      expect(browseAction).toBeDefined();
      expect(browseAction.type).toBe('guide');
    });

    it('contains check prices action', () => {
      const priceAction = chatbotService.quickActions.find(a => 
        a.label.toLowerCase().includes('price')
      );
      expect(priceAction).toBeDefined();
      expect(priceAction.type).toBe('guide');
    });

    it('contains recommendations action', () => {
      const recsAction = chatbotService.quickActions.find(a => 
        a.label.toLowerCase().includes('recommend')
      );
      expect(recsAction).toBeDefined();
      expect(recsAction.type).toBe('query');
    });

    it('contains help action', () => {
      const helpAction = chatbotService.quickActions.find(a => 
        a.label.toLowerCase().includes('help')
      );
      expect(helpAction).toBeDefined();
      expect(helpAction.type).toBe('query');
    });
  });

  // ============================================
  // Default Export Tests
  // ============================================
  describe('default export', () => {
    it('exports all functions as default object', () => {
      const defaultExport = chatbotService.default;
      
      expect(defaultExport).toHaveProperty('sendMessage');
      expect(defaultExport).toHaveProperty('formatPrice');
      expect(defaultExport).toHaveProperty('quickActions');
      expect(defaultExport).toHaveProperty('getInitialMessage');
      expect(defaultExport).toHaveProperty('createUserMessage');
      expect(defaultExport).toHaveProperty('createBotMessage');
      expect(defaultExport).toHaveProperty('clearSession');
    });
  });
});
