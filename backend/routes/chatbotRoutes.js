import express from 'express';
import { handleChatbotQuery } from '../controllers/chatbotController.js';

const router = express.Router();

// POST /api/chatbot/query
router.post('/query', handleChatbotQuery);

export default router;
