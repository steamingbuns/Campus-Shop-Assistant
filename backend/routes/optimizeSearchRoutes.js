import express from 'express';
import * as productController from '../controllers/productController.js';
import * as productModel from '../models/productModel.js';

const router = express.Router();

// GET /api/search - Enhanced search with autocomplete and suggestions
// This is optional - you can use the existing /api/product endpoint instead
router.get('/', async (req, res) => {
  try {
    // This is essentially the same as productController.listProducts
    // but with additional features like autocomplete
    
    const { q, categoryId, minPrice, maxPrice, sort, page, pageSize } = req.query;
    
    // Reuse existing listProducts logic
    return productController.listProducts(req, res);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/search/autocomplete - Search suggestions as user types
router.get('/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const query = q.trim();

    // Search in product descriptions (limit to 5 suggestions)
    const filters = {
      searchTerm: query,
      includeAllStatuses: false,
      statusFilter: 'active'
    };

    const products = await productModel.findProducts({
      filters,
      orderBy: productModel.resolveSort('latest'),
      limit: 5,
      offset: 0
    });

    // Extract unique keywords from results
    const suggestions = products.map(p => ({
      text: p.description || p.name,
      productId: p.id,
      category: p.category_name,
      price: Number(p.price)
    }));

    res.json({ suggestions, query });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Autocomplete failed' });
  }
});

// GET /api/search/trending - Get trending/popular search terms
router.get('/trending', async (req, res) => {
  try {
    // TODO: Implement based on actual search analytics
    // For MVP, return static popular categories
    
    res.json({
      trending: [
        { term: 'laptop', count: 245 },
        { term: 'textbook', count: 189 },
        { term: 'calculator', count: 156 },
        { term: 'backpack', count: 134 },
        { term: 'phone', count: 128 }
      ]
    });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ error: 'Failed to fetch trending searches' });
  }
});

export default router;