
import * as chatbotModel from '../models/chatbotModel.js';
import * as productModel from '../models/productModel.js';
import crypto from 'crypto';
/**
 * Main chatbot query endpoint
 * POST /api/chatbot/query
 */
export async function handleChatbotQuery(req, res) {
  try {
    const { message, userId, conversationId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate or reuse a conversation/session id. Use `conversationId` if provided,
    // otherwise create a short random id. This is useful for storing conversation
    // history and for correlating follow-up messages.
    const sessionId = conversationId || (crypto.randomUUID ? crypto.randomUUID() : `sess-${Date.now()}-${Math.random().toString(36).slice(2,8)}`);

    // Import the service and the NLP client in parallel to reduce cold-start
    // latency. We'll attempt to parse the message via the NLP microservice and
    // pass the parsed result into the service. If NLP is slow/unavailable we
    // continue without it to preserve responsiveness.
    const importService = import('../services/chatbotService.js').catch(e => { console.warn('chatbotService import failed', e); return null; });
    const importNlpClient = import('../services/nlpClient.js').catch(e => { console.warn('nlpClient import failed', e); return null; });

    const [svcModule, nlpClientModule] = await Promise.all([importService, importNlpClient]);
    const chatbotService = svcModule ? (svcModule.default || svcModule) : null;
    const nlpClient = nlpClientModule ? (nlpClientModule.default || nlpClientModule) : null;

    // Try parsing text with NLP client but don't block the request indefinitely.
    let nlp = null;
    if (nlpClient && typeof nlpClient.parseText === 'function') {
      const nlpPromise = nlpClient.parseText(message.trim(), { useCache: true }).catch(err => {
        console.warn('nlpClient.parseText error (ignored):', err && err.message ? err.message : err);
        return null;
      });

      // Wait up to this many ms for NLP to respond; otherwise proceed without it.
      const NLP_TIMEOUT_MS = 1200;
      nlp = await Promise.race([nlpPromise, new Promise(r => setTimeout(() => r(null), NLP_TIMEOUT_MS))]);
    }

    // Ensure we have a service to handle business logic. Import lazily if needed.
    const svc = chatbotService || (await import('../services/chatbotService.js')).default;

    // Call the service and pass the parsed NLP (may be null). Service implementations
    // should accept and reuse `nlp` when provided to avoid duplicate NLP calls.
    const serviceResult = await svc.handleMessage({ sessionId, userId, text: message.trim(), nlp });

    // Map service result to controller response shape expected by the frontend.
    // Keep the mapping conservative: include intent (if available), responseText,
    // any structured results, and suggestions if produced by the service.
    const intentName = serviceResult?.metadata?.intent?.name || serviceResult?.metadata?.intent || 'unknown';
    const responsePayload = {
      intent: intentName,
      responseText: serviceResult.reply || serviceResult.responseText || '',
      metadata: serviceResult.metadata || {},
      sessionId,
    };

    // If the service included structured results (e.g., product list), include them
    if (serviceResult.results) responsePayload.results = serviceResult.results;
    if (serviceResult.products) responsePayload.results = serviceResult.products;

    return res.json(responsePayload);
  } catch (error) {
    console.error('handleChatbotQuery error:', error);
    res.status(500).json({ 
      error: 'Failed to process your request',
      message: 'The chatbot encountered an error. Please try again.'
    });
  }
}

/**
 * Handle search intent by converting parsed entities to product filters
 */
async function handleSearchIntent(parsed, req, res) {
  const { entities } = parsed;

  // Build filter object from extracted entities
  const filters = {
    searchTerm: entities.keywords || null,
    categoryId: entities.categoryId || null,
    minPrice: entities.minPrice || null,
    maxPrice: entities.maxPrice || null,
    includeAllStatuses: false,
    statusFilter: 'active'
  };

  // Determine sorting based on user intent
  const sortKey = entities.sortBy || 
                  (entities.cheapest ? 'price_asc' : null) ||
                  (entities.expensive ? 'price_desc' : null) ||
                  'latest';

  const orderBy = productModel.resolveSort(sortKey);

  // Use existing product search logic
  const totalItems = await productModel.countProducts(filters);
  const products = await productModel.findProducts({
    filters,
    orderBy,
    limit: entities.limit || 10,
    offset: 0
  });

  // Format response for chatbot UI
  const responseText = generateSearchResponseText(products, entities);

  return res.json({
    intent: 'search_items',
    parsedFilters: filters,
    sortBy: sortKey,
    results: products.map(mapProductForChatbot),
    totalResults: totalItems,
    responseText,
    suggestions: generateSearchSuggestions(entities, totalItems)
  });
}

/**
 * Handle recommendation intent (personalized suggestions)
 */
async function handleRecommendationIntent(parsed, userId, req, res) {
  // TODO: Implement recommendation logic based on:
  // - User's past purchases (from Order table)
  // - Browsing history
  // - Popular items in their categories
  //FIX




  /*
  async function handleRecommendationIntent(parsed, userId, req, res) {
  // Recommendation logic steps:
  // 1) If no userId -> fallback to trending / latest popular items (MVP).
  // 2) Query user's past purchases to find top categories and products they already bought (to exclude).
  // 3) Query browsing hints (if available) to prefer items the user recently viewed or asked about.
  // 4) Query popular items inside the top categories.
  // 5) Merge sources (browsing > category-popular > global-popular), remove duplicates and already-purchased items.
  // 6) Return up to `limit` recommendations with contextual suggestions.

  try {
    const limit = parsed.entities?.limit || 10;

    // If we don't have a logged-in user, return trending/latest items (safe default).
    if (!userId) {
      const products = await productModel.findProducts({
        filters: { includeAllStatuses: false, statusFilter: 'active' },
        orderBy: productModel.resolveSort('latest'),
        limit: Math.min(limit, 10),
        offset: 0
      });

      return res.json({
        intent: 'get_recommendations',
        results: products.map(mapProductForChatbot),
        responseText: 'Here are some popular items right now.',
        suggestions: ['Show more', 'Filter by category', 'Search instead']
      });
    }

    // 1) Get user's purchased product IDs (to exclude from recommendations)
    const purchasedIds = await productModel.getUserPurchasedProductIds(userId, 500);
    const purchasedSet = new Set(purchasedIds || []);

    // 2) Get categories user bought from most
    const topCategoriesRows = await productModel.getTopPurchasedCategories(userId, 4);
    const topCategoryIds = (topCategoriesRows || []).map(r => r.category_id).filter(Boolean);

    // 3) Get browsing hints (if available)
    const browsedIds = await productModel.getUserBrowsedProductIds(userId, 20);

    // Candidate aggregation
    const seen = new Set();
    const results = [];

    // Helper to push rows ensuring dedupe and not recommending already purchased items
    const pushCandidates = (rows, sourcePriority) => {
      for (const row of rows) {
        const id = row.id || row.product_id;
        if (!id) continue;
        if (purchasedSet.has(id)) continue;          // don't recommend items user already bought
        if (seen.has(id)) continue;                 // dedupe across sources
        seen.add(id);
        results.push({ row, sourcePriority });
      }
    };

    // 4) 1st source: explicit browsing hits (highest priority)
    if (browsedIds && browsedIds.length > 0) {
      const browsedProducts = await productModel.findProductsByIds(browsedIds);
      pushCandidates(browsedProducts, 1);
    }

    // 5) 2nd source: popular items in user's top purchase categories
    if (topCategoryIds.length > 0) {
      const popularInCategories = await productModel.getPopularProductsInCategories(topCategoryIds, {
        excludeIds: [...purchasedSet, ...Array.from(seen)],
        limit: Math.max(6, limit)
      });
      pushCandidates(popularInCategories, 2);
    }

    // 6) 3rd source: fill with globally popular items (by rating_count / rating_average / newest)
    if (results.length < limit) {
      const need = limit - results.length;
      const globalPopular = await productModel.findProducts({
        filters: { includeAllStatuses: false, statusFilter: 'active' },
        orderBy: productModel.resolveSort('latest'), // latest as fallback; DB ordering in findProducts already supports review joins
        limit: Math.max(need * 2, 10),
        offset: 0
      });

      // Try to sort global list by rating_count desc, rating_average desc, create_at desc in-memory to prefer highly-rated ones.
      const sortedGlobal = (globalPopular || []).sort((a, b) => {
        const ac = Number(a.rating_count || 0);
        const bc = Number(b.rating_count || 0);
        if (bc !== ac) return bc - ac;
        const aa = Number(a.rating_average || 0);
        const ba = Number(b.rating_average || 0);
        if (ba !== aa) return ba - aa;
        return new Date(b.create_at) - new Date(a.create_at);
      });

      pushCandidates(sortedGlobal.slice(0, need), 3);
    }

    // 7) Finalize: sort by sourcePriority (lower is better), then by rating_count/rating_average, limit results
    results.sort((a, b) => {
      if (a.sourcePriority !== b.sourcePriority) return a.sourcePriority - b.sourcePriority;
      const ac = Number(a.row.rating_count || 0);
      const bc = Number(b.row.rating_count || 0);
      if (bc !== ac) return bc - ac;
      const aa = Number(a.row.rating_average || 0);
      const ba = Number(b.row.rating_average || 0);
      if (ba !== aa) return ba - aa;
      return new Date(b.row.create_at) - new Date(a.row.create_at);
    });

    const finalRows = results.slice(0, Math.min(limit, 20)).map(r => r.row);

    // Build friendly response
    const responseText = (() => {
      if (browsedIds && browsedIds.length > 0) {
        return 'Based on what you viewed and your past purchases, here are some recommendations:';
      }
      if (topCategoryIds.length > 0) {
        return 'You bought from these categories before — here are popular items in those categories:';
      }
      return 'Here are some popular items you might like:';
    })();

    return res.json({
      intent: 'get_recommendations',
      results: finalRows.map(mapProductForChatbot),
      responseText,
      meta: {
        purchasedCount: purchasedIds.length,
        topCategories: topCategoriesRows,
        browsedCount: browsedIds.length
      },
      suggestions: ['Show more', 'Filter by category', 'Not interested in these']
    });
  } catch (error) {
    console.error('handleRecommendationIntent error:', error);
    // Keep error message generic for clients; log details on server for debugging.
    return res.status(500).json({
      error: 'Failed to build recommendations',
      message: 'An internal error occurred while generating recommendations. Please try again later.'
    });
  }
}
  */ 

  



  // For MVP, return trending items
  const filters = {
    includeAllStatuses: false,
    statusFilter: 'active'
  };

  const products = await productModel.findProducts({
    filters,
    orderBy: productModel.resolveSort('latest'),
    limit: 5,
    offset: 0
  });

  return res.json({
    intent: 'get_recommendations',
    results: products.map(mapProductForChatbot),
    responseText: 'Here are some popular items you might like:',
    suggestions: ['Show more', 'Filter by category', 'Search instead']
  });
}

/**
 * Handle item details intent (when user asks about specific item)
 */
async function handleItemDetailsIntent(parsed, req, res) {
  const { productId } = parsed.entities;

  if (!productId) {
    return res.status(400).json({ 
      error: 'Could not identify which item you\'re asking about' 
    });
  }

  const product = await productModel.findProductById(productId);

  if (!product) {
    return res.json({
      intent: 'item_details',
      responseText: 'Sorry, I couldn\'t find that item. It may have been sold or removed.',
      suggestions: ['Search for similar items', 'Browse categories']
    });
  }

  return res.json({
    intent: 'item_details',
    product: mapProductForChatbot(product),
    responseText: `Here's what I found about "${product.description}":`,
    suggestions: [
      'Show similar items',
      'Contact seller',
      'Add to cart'
    ]
  });
}

/**
 * Generate natural language response text based on search results
 */
function generateSearchResponseText(products, entities) {
  const count = products.length;
  
  if (count === 0) {
    return 'I couldn\'t find any items matching your criteria. Try adjusting your filters.';
  }

  let text = `I found ${count} item${count > 1 ? 's' : ''}`;
  
  if (entities.category) {
    text += ` in ${entities.category}`;
  }
  
  if (entities.maxPrice) {
    text += ` under ${formatPrice(entities.maxPrice)}`;
  }
  
  return text + ':';
}

/**
 * Generate contextual suggestions based on search results
 */
function generateSearchSuggestions(entities, totalResults) {
  const suggestions = [];

  if (totalResults === 0) {
    suggestions.push('Show all items', 'Browse categories', 'Try different keywords');
  } else {
    if (!entities.categoryId) {
      suggestions.push('Filter by category');
    }
    if (!entities.maxPrice) {
      suggestions.push('Set price limit');
    }
    suggestions.push('Sort by price', 'Show more results');
  }

  return suggestions;
}

/**
 * Map product row to chatbot-friendly format
 */
function mapProductForChatbot(row) {
  if (!row) return null;

  return {
    id: row.id || row.product_id,
    name: row.name || row.description,
    price: Number(row.price),
    priceFormatted: formatPrice(row.price),
    category: row.category_name,
    image: row.image || null,
    rating: Number(row.rating_average || 0),
    reviewCount: Number(row.rating_count || 0),
    stock: Number(row.stock || 0),
    status: row.status
  };
}

/**
 * Format price to Vietnamese Dong
 */
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}