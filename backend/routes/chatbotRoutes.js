import express from 'express';
import * as chatbotController from '../controllers/chatbotController.js';

const router = express.Router();

// POST /api/chatbot/query - Main chatbot interaction endpoint
// Accepts natural language queries and returns structured results
router.post('/query', chatbotController.handleChatbotQuery);

// POST /api/chatbot/parse - Debug endpoint to test NLP parsing
// (Optional - useful during development)
router.post('/parse', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const chatbotService = await import('../services/chatbotService.js');
    const parsed = await chatbotService.parseUserQuery(message);
    const explanation = chatbotService.explainParsedQuery(parsed);

    res.json({
      parsed,
      explanation,
      originalMessage: message
    });
  } catch (error) {
    console.error('Parse debug error:', error);
    res.status(500).json({ error: 'Failed to parse message' });
  }
});

// GET /api/chatbot/suggestions - Get suggested queries for UI hints
router.get('/suggestions', (req, res) => {
  res.json({
    suggestions: [
      'Tìm laptop dưới 10 triệu',
      'Show me cheap textbooks',
      'Sách giáo trình toán',
      'Electronics under 5 million',
      'Quần áo mới nhất',
      'Recommend something for me'
    ],
    categories: [
      { id: 1, name: 'Stationery', viName: 'Văn phòng phẩm' },
      { id: 2, name: 'Books', viName: 'Sách' },
      { id: 3, name: 'Clothing', viName: 'Quần áo' },
      { id: 4, name: 'Electronics', viName: 'Điện tử' },
      { id: 5, name: 'Accessories', viName: 'Phụ kiện' }
    ]
  });
});

export default router;