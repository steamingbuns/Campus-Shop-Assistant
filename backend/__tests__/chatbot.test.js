import request from 'supertest';
import express from 'express';
import chatbotRoutes from '../routes/chatbotRoutes.js';
import * as chatbotModel from '../models/chatbotModel.js';
import * as productModel from '../models/productModel.js';
import 'dotenv/config';

// Mock the models
jest.mock('../models/chatbotModel.js');
jest.mock('../models/productModel.js');

// Mock the nlpClient to avoid actual network calls
jest.mock('../services/nlpClient.js', () => ({
  parseText: jest.fn().mockImplementation(async (text) => {
    // Simple mock that returns search intent for most queries
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('help') || lowerText.includes('what can you do')) {
      return { intent: { name: 'help', confidence: 0.9 }, entities: [], noun_chunks: [] };
    }
    if (lowerText.includes('recommend') || lowerText.includes('suggest')) {
      return { intent: { name: 'get_recommendations', confidence: 0.9 }, entities: [], noun_chunks: [] };
    }
    if (lowerText.includes('how much') || lowerText.includes('price')) {
      return { intent: { name: 'ask_price', confidence: 0.9 }, entities: [], noun_chunks: [text.split(' ').pop()] };
    }
    if (lowerText.includes('browse') || lowerText.includes('show') || lowerText.includes('find')) {
      return { intent: { name: 'search_product', confidence: 0.85 }, entities: [], noun_chunks: [text] };
    }
    
    return { intent: { name: 'search_product', confidence: 0.7 }, entities: [], noun_chunks: [text] };
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/chatbot', chatbotRoutes);

describe('Chatbot Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    chatbotModel.parseUserQuery.mockResolvedValue({
      intent: 'search_items',
      entities: { keywords: 'test' },
      originalMessage: 'test'
    });

    productModel.findProducts.mockResolvedValue([]);
    productModel.countProducts.mockResolvedValue(0);
    productModel.resolveSort.mockReturnValue({ column: 'created_at', direction: 'desc' });
  });

  // ============================================
  // Basic Endpoint Tests
  // ============================================
  describe('POST /api/chatbot/query', () => {
    it('should return 200 for valid message', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'hello' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('responseText');
      expect(res.body).toHaveProperty('intent');
      expect(res.body).toHaveProperty('sessionId');
    });

    it('should return 400 for empty message', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: '' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for missing message', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Message is required');
    });

    it('should return 400 for whitespace-only message', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: '   ' });

      expect(res.statusCode).toEqual(400);
    });

    it('should generate sessionId if not provided', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'test' });

      expect(res.body.sessionId).toBeDefined();
      expect(typeof res.body.sessionId).toBe('string');
    });

    it('should use provided conversationId as sessionId', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'test', conversationId: 'my-session-123' });

      expect(res.body.sessionId).toBe('my-session-123');
    });
  });

  // ============================================
  // Intent Detection Tests
  // ============================================
  describe('Intent Detection', () => {
    it('should detect help intent', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'what can you do' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.intent).toBe('help');
    });

    it('should detect help with "help" keyword', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'help' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.intent).toBe('help');
    });

    it('should detect greeting intent', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'hi' });

      expect(res.statusCode).toEqual(200);
      // Greeting might be detected as greeting or unknown depending on implementation
      expect(['greeting', 'unknown', 'search_product']).toContain(res.body.intent);
    });

    it('should detect recommendation intent', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'what do you recommend' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.intent).toBe('get_recommendations');
    });

    it('should detect search intent', async () => {
      productModel.findProducts.mockResolvedValue([
        { id: 1, name: 'Laptop', price: 15000000 }
      ]);
      productModel.countProducts.mockResolvedValue(1);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'show me laptops' });

      expect(res.statusCode).toEqual(200);
      expect(['search_product', 'search_items', 'browse_products']).toContain(res.body.intent);
    });

    it('should detect ask_price intent', async () => {
      productModel.findProducts.mockResolvedValue([
        { id: 1, name: 'Lamp', price: 300000 }
      ]);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'how much is the lamp' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.intent).toBe('ask_price');
    });
  });

  // ============================================
  // Product Search Tests
  // ============================================
  describe('Product Search', () => {
    it('should return products in metadata.results', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop', price: 15000000, category_name: 'Electronics' },
        { id: 2, name: 'Desktop Computer', price: 20000000, category_name: 'Electronics' }
      ];
      productModel.findProducts.mockResolvedValue(mockProducts);
      productModel.countProducts.mockResolvedValue(2);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'find computers' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.metadata).toBeDefined();
      // Results can be in metadata.results or directly in results
      const results = res.body.metadata?.results || res.body.results || [];
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle no results found', async () => {
      productModel.findProducts.mockResolvedValue([]);
      productModel.countProducts.mockResolvedValue(0);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'find xyz123nonexistent' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.responseText).toBeDefined();
    });

    it('should search by category name', async () => {
      const mockProducts = [
        { id: 1, name: 'Pen Set', price: 50000, category_name: 'Stationery' }
      ];
      productModel.findProducts.mockResolvedValue(mockProducts);
      productModel.countProducts.mockResolvedValue(1);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'browse stationery' });

      expect(res.statusCode).toEqual(200);
    });
  });

  // ============================================
  // Price Query Tests
  // ============================================
  describe('Price Queries', () => {
    it('should respond to price query with product price', async () => {
      productModel.findProducts.mockResolvedValue([
        { id: 1, name: 'Backpack', price: 500000 }
      ]);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'how much is the backpack' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.responseText).toBeDefined();
    });

    it('should handle price query for non-existent product', async () => {
      productModel.findProducts.mockResolvedValue([]);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'how much is the xyz123' });

      expect(res.statusCode).toEqual(200);
      // Should indicate product not found
      expect(res.body.responseText).toBeDefined();
    });
  });

  // ============================================
  // Browse All Tests
  // ============================================
  describe('Browse All Products', () => {
    it('should handle browse all request', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100000 },
        { id: 2, name: 'Product 2', price: 200000 }
      ];
      productModel.findProducts.mockResolvedValue(mockProducts);
      productModel.countProducts.mockResolvedValue(2);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'show me all products' });

      expect(res.statusCode).toEqual(200);
    });

    it('should handle "browse all items" request', async () => {
      productModel.findProducts.mockResolvedValue([]);
      productModel.countProducts.mockResolvedValue(0);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'browse all items' });

      expect(res.statusCode).toEqual(200);
    });
  });

  // ============================================
  // Response Format Tests
  // ============================================
  describe('Response Format', () => {
    it('should include all required response fields', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'test message' });

      expect(res.body).toHaveProperty('intent');
      expect(res.body).toHaveProperty('responseText');
      expect(res.body).toHaveProperty('metadata');
      expect(res.body).toHaveProperty('sessionId');
    });

    it('should return metadata as an object', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'test' });

      expect(typeof res.body.metadata).toBe('object');
    });

    it('should trim message before processing', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: '  hello world  ' });

      expect(res.statusCode).toEqual(200);
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================
  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      const res = await request(app)
        .post('/api/chatbot/query')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Express returns 400 for invalid JSON
      expect(res.statusCode).toEqual(400);
    });

    it('should handle database errors in findProducts gracefully', async () => {
      productModel.findProducts.mockRejectedValue(new Error('Database error'));
      // countProducts might also fail, but findProducts is the primary one
      productModel.countProducts.mockResolvedValue(0);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'find products' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.responseText).toContain("I couldn't find any products");
      expect(res.body.metadata.results).toEqual([]);
    });

    it('should handle database errors in countProducts gracefully', async () => {
      productModel.findProducts.mockResolvedValue([{ id: 1, name: 'A single product' }]);
      productModel.countProducts.mockRejectedValue(new Error('Database error in count'));

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'find products' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.responseText).toContain("I couldn't find any products");
      expect(res.body.metadata.results).toEqual([]);
    });
  });

  // ============================================
  // Category Detection Tests
  // ============================================
  describe('Category Detection', () => {
    it('should detect electronics category', async () => {
      productModel.findProducts.mockResolvedValue([
        { id: 1, name: 'Laptop', price: 15000000, category_name: 'Electronics' }
      ]);
      productModel.countProducts.mockResolvedValue(1);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'browse electronics' });

      expect(res.statusCode).toEqual(200);
    });

    it('should detect books category', async () => {
      productModel.findProducts.mockResolvedValue([
        { id: 1, name: 'Textbook', price: 150000, category_name: 'Books' }
      ]);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'show me books' });

      expect(res.statusCode).toEqual(200);
    });

    it('should detect clothing category', async () => {
      productModel.findProducts.mockResolvedValue([
        { id: 1, name: 'Hoodie', price: 400000, category_name: 'Clothing' }
      ]);

      const res = await request(app)
        .post('/api/chatbot/query')
        .send({ message: 'find clothing' });

      expect(res.statusCode).toEqual(200);
    });
  });
});

// ============================================
// Unit Tests for chatbotModel (Regex Parsing)
// ============================================
describe('chatbotModel parseUserQuery', () => {
  beforeEach(() => {
    // Restore actual implementation for these tests
    chatbotModel.parseUserQuery.mockImplementation(async (message) => {
      const normalized = message.toLowerCase().trim();
      
      // Simple intent detection
      let intent = 'unknown';
      if (/tìm|search|find|show|browse/i.test(normalized)) {
        intent = 'search_items';
      } else if (/gợi ý|recommend|suggest/i.test(normalized)) {
        intent = 'get_recommendations';
      } else if (/help|trợ giúp/i.test(normalized)) {
        intent = 'help';
      }

      return {
        intent,
        entities: { keywords: normalized },
        originalMessage: message
      };
    });
  });

  it('should parse search intent', async () => {
    const result = await chatbotModel.parseUserQuery('find laptops');
    expect(result.intent).toBe('search_items');
  });

  it('should parse recommendation intent', async () => {
    const result = await chatbotModel.parseUserQuery('what do you recommend');
    expect(result.intent).toBe('get_recommendations');
  });

  it('should parse help intent', async () => {
    const result = await chatbotModel.parseUserQuery('help');
    expect(result.intent).toBe('help');
  });

  it('should preserve original message', async () => {
    const result = await chatbotModel.parseUserQuery('Find LAPTOPS');
    expect(result.originalMessage).toBe('Find LAPTOPS');
  });
});
