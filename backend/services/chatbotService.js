/*
chatbotService.js

A thin orchestration layer that demonstrates how to use `nlpClient` to parse a user's message,
handle action intents (e.g., search), and compose a response.

This file is a scaffold: it includes error handling, edge case checks, and comments where
you should plug in DB persistence (`models/chatbotModel.js`) and product search (`services/searchClient`).

Best practice notes included inline:
- Keep controller logic slim; controllers should call these service methods.
- Services coordinate work, call models/other services, and return domain objects.
- Keep external calls (NLP, DB, third-party) behind adapters for easier testing.
*/

import * as nlpClient from './nlpClient.js';
import * as productModel from '../models/productModel.js';
import * as chatbotModel from '../models/chatbotModel.js'; // Regex-based fallback parser

// Product type to category ID mapping for smart fallbacks
// When user searches for "laptops" but no exact match, we can show Electronics category
const PRODUCT_TYPE_TO_CATEGORY = {
  // Category names (direct match)
  'electronics': 4, 'electronic': 4,
  'books': 2, 'book': 2,
  'clothing': 3, 'clothes': 3,
  'stationery': 1, 'stationary': 1,
  'accessories': 5, 'accessory': 5,
  
  // Electronics (ID: 4)
  'laptop': 4, 'laptops': 4, 'computer': 4, 'computers': 4,
  'phone': 4, 'phones': 4, 'smartphone': 4, 'smartphones': 4,
  'tablet': 4, 'tablets': 4, 'ipad': 4,
  'airpods': 4, 'earbuds': 4, 'headphones': 4,
  'monitor': 4, 'monitors': 4, 'screen': 4,
  'keyboard': 4, 'keyboards': 4, 'mouse': 4,
  'charger': 4, 'chargers': 4, 'cable': 4, 'cables': 4,
  'calculator': 4, 'calculators': 4,
  
  // Books (ID: 2)
  'book': 2, 'books': 2, 'textbook': 2, 'textbooks': 2,
  'novel': 2, 'novels': 2, 'manual': 2, 'guide': 2,
  
  // Clothing (ID: 3)
  'hoodie': 3, 'hoodies': 3, 'jacket': 3, 'jackets': 3,
  'shirt': 3, 'shirts': 3, 'pants': 3, 'jeans': 3,
  'coat': 3, 'coats': 3, 'shoes': 3, 'sneakers': 3,
  'shorts': 3, 'gown': 3,
  
  // Stationery (ID: 1)
  'pen': 1, 'pens': 1, 'pencil': 1, 'pencils': 1,
  'notebook': 1, 'notebooks': 1, 'paper': 1,
  'highlighter': 1, 'highlighters': 1, 'marker': 1, 'markers': 1,
  'eraser': 1, 'erasers': 1, 'ruler': 1,
  
  // Accessories (ID: 5)
  'backpack': 5, 'backpacks': 5, 'bag': 5, 'bags': 5,
  'lamp': 5, 'lamps': 5, 'bottle': 5, 'bottles': 5,
  'umbrella': 5, 'umbrellas': 5, 'mirror': 5,
  'mat': 5, 'mats': 5, 'racket': 5,
};

// Helper to detect category from product type keywords
function detectCategoryFromProductType(searchTerm) {
  if (!searchTerm) return null;
  const term = searchTerm.toLowerCase().trim();
  
  // Direct match
  if (PRODUCT_TYPE_TO_CATEGORY[term]) {
    return PRODUCT_TYPE_TO_CATEGORY[term];
  }
  
  // Check if any keyword is contained in the search term
  for (const [keyword, categoryId] of Object.entries(PRODUCT_TYPE_TO_CATEGORY)) {
    if (term.includes(keyword) || keyword.includes(term)) {
      return categoryId;
    }
  }
  
  return null;
}
// const productService = require('./productService'); // example: existing product search wrapper

async function handleMessage({ sessionId, userId, text, nlp = null }) {
  if (!text || !text.trim()) {
    throw new Error('handleMessage: text must be a non-empty string');
  }

  // Persist incoming user message (if you have a chatbotModel). Wrap in try/catch and continue on failure.
  try {
    // await chatbotModel.saveMessage(sessionId, userId, 'user', text, {});
  } catch (err) {
    // Log but do not block response generation
    console.warn('Failed to persist incoming message', err && err.message);
  }

  // Use `nlp` if provided (controller may have pre-fetched parse to reduce duplicate calls).
  // Otherwise, parse text with NLP service. Use caching where appropriate inside nlpClient.
  // If NLP fails, we gracefully continue with a fallback intent rather than throwing.
  let parseResult = null;
  if (nlp && typeof nlp === 'object') {
    // Basic sanity check: ensure parseResult has expected keys; if not, fall back to calling the client.
    const looksLikeParse = Array.isArray(nlp.entities) || (nlp.intent && typeof nlp.intent === 'object');
    if (looksLikeParse) {
      parseResult = nlp;
    } else {
      // Provided `nlp` is present but doesn't look like a parse result — ignore and parse normally.
      parseResult = null;
    }
  }

  if (!parseResult) {
    try {
      parseResult = await nlpClient.parseText(text);
    } catch (err) {
      // If NLP service is unavailable, use regex-based fallback from chatbotModel
      
      try {
        // chatbotModel.parseUserQuery returns { intent, entities, originalMessage }
        const fallbackParse = await chatbotModel.parseUserQuery(text);
        parseResult = {
          intent: { name: fallbackParse.intent, confidence: 0.6, source: 'regex-fallback' },
          entities: fallbackParse.entities ? Object.entries(fallbackParse.entities).map(([k, v]) => ({
            label: k.toUpperCase(),
            text: String(v),
            value: v
          })) : [],
          noun_chunks: fallbackParse.entities?.keywords ? [fallbackParse.entities.keywords] : [],
          fallback: true
        };
        console.log('Fallback parse result:', parseResult);
      } catch (fallbackErr) {
        
        parseResult = { intent: { name: 'unknown', confidence: 0 }, entities: [], noun_chunks: [] };
      }
    }
  }

  // parseResult.intent example: { name: 'search_product', confidence: 0.75, action: 'search' }
  let intent = (parseResult && parseResult.intent) ? parseResult.intent : { name: 'unknown', confidence: 0 };
  const isFallback = parseResult && parseResult.fallback === true;

  // ==========================================================================
  // RULE-BASED INTENT OVERRIDE - Handle common patterns before NLP result
  // ==========================================================================
  const lowerText = text.toLowerCase().trim();
  
  // Check for price queries FIRST (before search intent)
  if (/^(how much|what('s| is| are) the (price|cost)|price of|cost of)/i.test(lowerText)) {
    intent = { name: 'ask_price', confidence: 0.95, source: 'rule-based' };
  }
  // Check for help queries
  else if (/^(what can you do|help|how (do|does) this work|\?$)/i.test(lowerText)) {
    intent = { name: 'help', confidence: 0.95, source: 'rule-based' };
  }
  // Check for greeting
  else if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(lowerText)) {
    intent = { name: 'greeting', confidence: 0.95, source: 'rule-based' };
  }
  // Check for recommendations
  else if (/^(recommend|suggest|what('s| do you) recommend|popular|trending)/i.test(lowerText)) {
    intent = { name: 'get_recommendations', confidence: 0.95, source: 'rule-based' };
  }

  // Simple rule-based flow: if intent.action === 'search', call search service
  // Include 'search_items' which is the intent name from chatbotModel fallback
  try {
    if (intent.action === 'search' || intent.name === 'search_product' || intent.name === 'ask_product' || intent.name === 'search_items') {
      // Extract query - for fallback, use meaningful keywords only (not category names or price-related words)
      let query = null;
      let categoryName = null;
      let sortBy = null;
      
      // Non-searchable keywords (these affect filters/sorting, not text search)
      const nonSearchableWords = new Set(['cheap', 'expensive', 'affordable', 'premium', 'rẻ', 'đắt', 'giá tốt']);
      
      if (isFallback && parseResult.entities) {
        const keywordsEntity = parseResult.entities.find(e => e.label === 'KEYWORDS');
        const categoryEntity = parseResult.entities.find(e => e.label === 'CATEGORY');
        const sortEntity = parseResult.entities.find(e => e.label === 'SORTBY');
        
        categoryName = categoryEntity?.value || null;
        sortBy = sortEntity?.value || null;
        
        // Filter out non-searchable keywords from the query
        if (keywordsEntity?.value) {
          const words = keywordsEntity.value.split(/\s+/).filter(w => !nonSearchableWords.has(w.toLowerCase()));
          query = words.length > 0 ? words.join(' ') : null;
        }
        
        // If no meaningful keywords but we have category, don't use text search - rely on categoryId filter
        // If no category either, try to extract something from original text
        if (!query && !categoryName) {
          query = extractQueryFromParse(text, parseResult);
        }
      } else {
        query = extractQueryFromParse(text, parseResult);
      }

      // Check if query is a category name (like "electronics", "clothing") - use category filter instead of text search
      const categoryFromQuery = detectCategoryFromProductType(query);
      if (categoryFromQuery && !categoryName) {
        categoryName = query; // Save for display
      }
      
      // Build filters for the productModel.findProducts call. We prioritize
      // structured values detected by the NLP (entities) when possible.
      const filters = {
        searchTerm: categoryFromQuery ? null : query, // Don't text-search if we have a category match
        // We'll attempt to fill categoryId, minPrice, maxPrice below from entities
        categoryId: categoryFromQuery || undefined,
        minPrice: undefined,
        maxPrice: undefined,
        includeAllStatuses: false,
        statusFilter: 'active',
      };

      // For fallback mode, extract filters directly from the structured entities
      if (isFallback && parseResult.entities) {
        const catEntity = parseResult.entities.find(e => e.label === 'CATEGORYID');
        const minPriceEntity = parseResult.entities.find(e => e.label === 'MINPRICE');
        const maxPriceEntity = parseResult.entities.find(e => e.label === 'MAXPRICE');
        
        if (catEntity?.value) filters.categoryId = catEntity.value;
        if (minPriceEntity?.value) filters.minPrice = Number(minPriceEntity.value);
        if (maxPriceEntity?.value) filters.maxPrice = Number(maxPriceEntity.value);
      }

      // If the parser returned structured entities, map them to filters.
      try {
        if (parseResult && Array.isArray(parseResult.entities) && parseResult.entities.length) {
          // Category detection (may perform a small DB lookup of categories)
          const catId = await detectCategoryIdFromEntities(parseResult.entities);
          if (catId) filters.categoryId = catId;

          // Price extraction (min/max)
          const priceBounds = parsePriceEntities(parseResult.entities);
          if (priceBounds.minPrice !== undefined) filters.minPrice = priceBounds.minPrice;
          if (priceBounds.maxPrice !== undefined) filters.maxPrice = priceBounds.maxPrice;
        }
      } catch (err) {
        // Non-fatal: if mapping fails, continue with textual search only
        
      }

      // Pagination + ordering defaults for chatbot searches
      const limit = 10;
      const offset = 0;
      const orderBy = productModel.resolveSort(productModel.DEFAULT_SORT_KEY);

      // Query products and count in parallel for responsiveness (count useful for pagination)
      let results = [];
      let totalCount = 0;
      try {
        const [rows, count] = await Promise.all([
          productModel.findProducts({ filters, orderBy, limit, offset }),
          productModel.countProducts(filters),
        ]);
        results = rows || [];
        totalCount = Number((count !== undefined && count !== null) ? count : results.length);
      } catch (err) {
        
        results = [];
        totalCount = 0;
      }

      // Format rows for client consumption and reduce payload size
      const formattedResults = (results || []).map(formatProductForClient);

      // Build a descriptive search summary for the reply
      const searchDescription = buildSearchDescription({ query, categoryName, filters });
      
      // Detect if this is a "browse all" request (no specific query)
      const isBrowseAll = !query || query.trim() === '';

      // Compose a friendly reply and return results in metadata so the controller/frontend can render product cards.
      let reply;
      if (formattedResults && formattedResults.length) {
        if (isBrowseAll) {
          reply = `Here are ${totalCount} products available in the store:`;
        } else if (totalCount === formattedResults.length) {
          // All results fit in one page
          reply = `I found ${totalCount} product${totalCount > 1 ? 's' : ''} ${searchDescription}:`;
        } else {
          // More results than shown
          reply = `I found ${totalCount} product${totalCount > 1 ? 's' : ''} ${searchDescription}. Here are the first ${formattedResults.length}:`;
        }
      } else {
        reply = `I couldn't find any products ${searchDescription}. Try a different search term?`;
      }
      let metadata = { intent, query, filters, categoryName, results: formattedResults, totalCount, limit, offset };

      // Progressive broadening fallback: if we found nothing, try a simpler query.
      // Strategy 1: Try category-based fallback if the search term is a product type
      // Strategy 2: prefer the first entity labeled PRODUCT, otherwise the longest noun chunk
      if ((!formattedResults || formattedResults.length === 0) && text) {
        try {
          // STRATEGY 1: Category-based fallback for product types like "laptops", "phones"
          const categoryFallbackId = detectCategoryFromProductType(query);
          if (categoryFallbackId && !filters.categoryId) {
            console.log(`Trying category fallback for "${query}" -> categoryId: ${categoryFallbackId}`);
            const catFilters = { 
              ...filters, 
              searchTerm: undefined, // Remove text search
              categoryId: categoryFallbackId 
            };
            try {
              const [catRows, catCountArr] = await Promise.all([
                productModel.findProducts({ filters: catFilters, orderBy, limit: 10, offset: 0 }),
                productModel.countProducts(catFilters).then(c => [{ count: c }]).catch(() => [{ count: 0 }])
              ]);
              const catResults = (catRows || []).map(formatProductForClient);
              const catTotal = Number((catCountArr && catCountArr[0] && catCountArr[0].count) || catResults.length);
              
              if (catResults && catResults.length) {
                // Get category name for the response
                const cats = await productModel.getCategoriesWithCounts();
                const catName = cats.find(c => c.id === categoryFallbackId)?.name || 'this category';
                
                reply = `I couldn't find "${query}" specifically, but here are ${catTotal} items from ${catName}:`;
                metadata = { 
                  intent, 
                  query, 
                  filters: catFilters,
                  categoryName: catName,
                  results: catResults, 
                  totalCount: catTotal, 
                  limit: 10, 
                  offset: 0, 
                  fallbackType: 'category'
                };
              }
            } catch (err) {
              
            }
          }

          // STRATEGY 2: Broadened text search (only if category fallback didn't work)
          if (!metadata.results || metadata.results.length === 0) {
            let broadened = null;
            if (parseResult && Array.isArray(parseResult.entities)) {
              const productEntity = parseResult.entities.find(e => (e.label || '').toLowerCase() === 'product');
              if (productEntity && productEntity.text) broadened = productEntity.text;
            }
            if (!broadened && parseResult && Array.isArray(parseResult.noun_chunks) && parseResult.noun_chunks.length) {
              // choose the longest noun chunk (earlier we used it as heuristic)
              const sorted = parseResult.noun_chunks.slice().sort((a, b) => b.length - a.length);
              broadened = sorted[0];
            }
            if (!broadened) {
              // fallback to first comma segment, e.g. "Winter Coat, Black, Size L" -> "Winter Coat"
              broadened = text.split(',')[0].trim();
            }

            // If broadened query is effectively shorter/different, run a broader search without category/price
            if (broadened && broadened.length && broadened.toLowerCase() !== query?.toLowerCase()) {
              const broadFilters = { ...filters, searchTerm: broadened, categoryId: undefined, minPrice: undefined, maxPrice: undefined };
              try {
                const [bRows, bCountArr] = await Promise.all([
                  productModel.findProducts({ filters: broadFilters, orderBy, limit: 20, offset: 0 }),
                  productModel.countProducts(broadFilters).then(c => [{ count: c }]).catch(() => [{ count: 0 }])
                ]);
                const bResults = (bRows || []).map(formatProductForClient);
                const bTotal = Number((bCountArr && bCountArr[0] && bCountArr[0].count) || bResults.length);
                if (bResults && bResults.length) {
                  reply = `I couldn't find exact matches for "${query}", but here are ${bTotal} results for "${broadened}".`;
                  metadata = { intent, query: broadened, results: bResults, totalCount: bTotal, limit: 20, offset: 0, broadenedFrom: query };
                }
              } catch (err) {
                
              }
            }
          }
        } catch (err) {
          
        }
      }

      // Persist bot reply
      try {
        // await chatbotModel.saveMessage(sessionId, null, 'bot', reply, metadata);
      } catch (err) {
        
      }

      return { reply, metadata };
    }

    // =========================================================================
    // GREETING INTENT
    // =========================================================================
    if (intent.name === 'greeting' || intent.name === 'greet') {
      const greetings = [
        'Hello! 👋 How can I help you today?',
        'Hi there! Looking for something specific?',
        'Welcome to Campus Shop! What can I help you find?',
      ];
      const reply = greetings[Math.floor(Math.random() * greetings.length)];
      return { reply, metadata: { intent } };
    }

    // =========================================================================
    // ASK_PRICE INTENT - "How much is X?"
    // =========================================================================
    if (intent.name === 'ask_price') {
      // Extract product name from text by removing price-related phrases
      let productName = null;
      
      // Remove price query phrases to get the product name
      const pricePatterns = /^(how much (is|are|does|do)|what('s| is| are) the (price|cost) (of|for)?|price (of|for)|cost (of|for))\s*/i;
      productName = text.replace(pricePatterns, '').replace(/[?!.,]+$/, '').trim();
      
      // Remove leading articles
      productName = productName.replace(/^(the|a|an)\s+/i, '').trim();
      
      // If still empty, try entities
      if (!productName && parseResult.entities && parseResult.entities.length > 0) {
        const productEntity = parseResult.entities.find(e => 
          ['PRODUCT', 'ITEM'].includes((e.label || '').toUpperCase())
        );
        if (productEntity) productName = productEntity.text;
      }

      if (productName) {
        try {
          const products = await productModel.findProducts({
            filters: { searchTerm: productName, statusFilter: 'active' },
            orderBy: productModel.resolveSort('price_asc'),
            limit: 5,
            offset: 0
          });
          
          if (products && products.length > 0) {
            const formattedResults = products.map(formatProductForClient);
            const priceList = formattedResults.map(p => {
              const priceStr = p.price != null 
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)
                : 'N/A';
              return `• ${p.name || p.description}: ${priceStr}`;
            }).join('\n');
            const reply = `Here are the prices for "${productName}":\n${priceList}`;
            return { reply, metadata: { intent, query: productName, results: formattedResults } };
          } else {
            return { 
              reply: `I couldn't find any products matching "${productName}". Try searching for something else?`,
              metadata: { intent, query: productName, results: [] }
            };
          }
        } catch (err) {
          
        }
      }
      
      return { 
        reply: "Which product would you like to know the price of? Please specify the item name.",
        metadata: { intent }
      };
    }

    // =========================================================================
    // GET_RECOMMENDATIONS INTENT - "What do you recommend?"
    // =========================================================================
    if (intent.name === 'get_recommendations') {
      try {
        // Get top-rated products
        const topProducts = await productModel.findProducts({
          filters: { statusFilter: 'active' },
          orderBy: productModel.resolveSort('price_desc'), // Could also sort by ratings
          limit: 5,
          offset: 0
        });
        
        if (topProducts && topProducts.length > 0) {
          const formattedResults = topProducts.map(formatProductForClient);
          return {
            reply: `Here are some popular items you might like! 🌟`,
            metadata: { intent, results: formattedResults, totalCount: formattedResults.length }
          };
        }
      } catch (err) {
        
      }
      
      return { 
        reply: "I'd love to recommend something! What type of item are you looking for?",
        metadata: { intent }
      };
    }

    // =========================================================================
    // HELP INTENT - "What can you do?"
    // =========================================================================
    if (intent.name === 'help' || intent.name === 'item_details') {
      const helpMessage = `I can help you with:
🔍 **Search products** - "find laptops under 500", "show me books"
💰 **Check prices** - "how much is the calculator?"
⭐ **Get recommendations** - "what do you recommend?"
📦 **Browse categories** - "show electronics", "browse clothing"

Just type what you're looking for!`;
      return { reply: helpMessage, metadata: { intent } };
    }

    // =========================================================================
    // FALLBACK - Unknown intent
    // =========================================================================
    {
      // Check if text looks like a product search even though intent wasn't recognized
      const possibleSearchTerms = extractQueryFromParse(text, parseResult);
      if (possibleSearchTerms && possibleSearchTerms.length > 2) {
        // Treat as implicit search
        try {
          const products = await productModel.findProducts({
            filters: { searchTerm: possibleSearchTerms, statusFilter: 'active' },
            orderBy: productModel.resolveSort('latest'),
            limit: 5,
            offset: 0
          });
          
          if (products && products.length > 0) {
            const formattedResults = products.map(formatProductForClient);
            return {
              reply: `I'm not sure what you meant, but here are some items that might be relevant:`,
              metadata: { intent, query: possibleSearchTerms, results: formattedResults }
            };
          }
        } catch (err) {
          
        }
      }

      const fallbackReplies = [
        "I'm not sure I understand. Try asking me to find products, check prices, or get recommendations!",
        "Could you rephrase that? I can help you search for products, check prices, or suggest items.",
        "I didn't quite catch that. What are you looking for today?",
      ];
      const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      return { reply, metadata: { intent } };
    }
  } catch (err) {
    
    const reply = "Sorry, something went wrong while processing your request.";
    return { reply, metadata: { error: err && err.message } };
  }
}

function extractQueryFromParse(originalText, parseResult) {
  // Extract meaningful product search terms from the text
  // Priority: PRODUCT entities -> noun_chunks -> cleaned original text
  try {
    // First, try to find PRODUCT-type entities (if the model is trained with custom entities)
    if (parseResult.entities && parseResult.entities.length > 0) {
      const productEntities = parseResult.entities.filter(e => 
        ['PRODUCT', 'ITEM', 'OBJECT', 'ORG'].includes(e.label)
      );
      if (productEntities.length > 0) {
        return productEntities.map(e => e.text).join(' ');
      }
    }
    
    // Use noun_chunks if available (these are usually product names)
    if (parseResult.noun_chunks && parseResult.noun_chunks.length > 0) {
      // Filter out chunks that are just numbers or price-related
      const meaningfulChunks = parseResult.noun_chunks.filter(chunk => 
        !/^\d+$/.test(chunk) && !/^\$?\d/.test(chunk)
      );
      if (meaningfulChunks.length > 0) {
        const sorted = meaningfulChunks.slice().sort((a, b) => b.length - a.length);
        return sorted[0];
      }
    }
    
    // Check for "browse all" / "show all products" patterns - return null to trigger browse-all
    const browseAllPattern = /^(show|browse|list|display|get|find)?\s*(me\s+)?(all\s+)?(the\s+)?(products?|items?|everything|stuff|things?)(\s+available)?[?!.]*$/i;
    if (browseAllPattern.test(originalText.trim())) {
      return null; // Triggers browse-all behavior
    }
    
    // Fallback: extract meaningful words from original text (remove stop words, numbers, price indicators)
    const stopWords = new Set([
      'find', 'search', 'show', 'me', 'i', 'want', 'need', 'looking', 'for', 'a', 'an', 'the',
      'under', 'over', 'below', 'above', 'less', 'than', 'more', 'around', 'about',
      'cheap', 'expensive', 'affordable', 'do', 'you', 'have', 'any', 'some', 'please',
      'all', 'products', 'items', 'browse', 'everything', 'anything', 'stuff', 'things'
    ]);
    
    const words = originalText.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !stopWords.has(word) && 
        !/^\d+[kmtr]*$/i.test(word) // Remove numbers like 500, 500k, 2tr
      );
    
    if (words.length > 0) {
      return words.join(' ');
    }
    
    // If no meaningful words found after filtering, return null (browse all)
    return null;
  } catch (err) {
    
  }
  return null; // Return null instead of originalText to allow browse-all behavior
}

// Parse numeric price-like values from recognized entities. Returns an object
// with optional minPrice and/or maxPrice (numbers). This is a best-effort
// heuristic: it strips non-digits and parses floats. Keep robust to malformed
// inputs and return an empty object if nothing parseable is found.
function parsePriceEntities(entities) {
  try {
    if (!entities || !entities.length) return {};
    const prices = [];
    for (const e of entities) {
      if (!e || !e.text) continue;
      const label = (e.label || '').toUpperCase();
      
      // Accept CARDINAL, MONEY, QUANTITY labels (common spaCy entity types for numbers)
      // Also accept custom labels like PRICE, AMOUNT
      if (['CARDINAL', 'MONEY', 'QUANTITY', 'PRICE', 'AMOUNT', 'NUMBER'].includes(label)) {
        const cleaned = (e.text || '').replace(/[^0-9.\,]/g, '').replace(/,/g, '');
        const n = parseFloat(cleaned);
        if (!Number.isNaN(n) && n > 0) prices.push(n);
      }
      // Also attempt to parse bare numeric-looking entities even when label is generic
      if (!label && /^\$?\d/.test(e.text || '')) {
        const cleaned = (e.text || '').replace(/[^0-9.\,]/g, '').replace(/,/g, '');
        const n = parseFloat(cleaned);
        if (!Number.isNaN(n) && n > 0) prices.push(n);
      }
    }
    if (!prices.length) return {};
    if (prices.length === 1) return { maxPrice: prices[0] };
    return { minPrice: Math.min(...prices), maxPrice: Math.max(...prices) };
  } catch (err) {
    
    return {};
  }
}

// Try to detect a category id from entities by fuzzy-matching entity text to
// existing category names. This uses `productModel.getCategoriesWithCounts()`
// which is cheap for small numbers of categories. If you have many categories
// consider adding a dedicated lookup table or caching layer.
async function detectCategoryIdFromEntities(entities) {
  try {
    if (!entities || !entities.length) return null;
    const cats = await productModel.getCategoriesWithCounts();
    if (!cats || !cats.length) return null;

    for (const e of entities) {
      if (!e || !e.text) continue;
      const t = e.text.trim().toLowerCase();
      // Try exact match then contains checks
      const exact = cats.find((c) => (c.name || '').toLowerCase() === t);
      if (exact) return exact.id;
      const includes = cats.find((c) => (c.name || '').toLowerCase().includes(t) || t.includes((c.name || '').toLowerCase()));
      if (includes) return includes.id;
    }
    return null;
  } catch (err) {
    
    return null;
  }
}

// Reduce product rows returned by the DB to a minimal shape the frontend needs.
// This prevents leaking internal fields and keeps responses small.
function formatProductForClient(row) {
  return {
    id: row.id,
    name: row.name || row.description || null,
    description: row.description || null,
    price: row.price != null ? Number(row.price) : null,
    image: row.image || null,
    stock: row.stock != null ? Number(row.stock) : null,
    rating_average: row.rating_average != null ? Number(row.rating_average) : 0,
    rating_count: row.rating_count != null ? Number(row.rating_count) : 0,
    category_name: row.category_name || null,
  };
}

// Build a human-readable description of the search criteria
function buildSearchDescription({ query, categoryName, filters }) {
  const parts = [];
  
  // Check if query is the same as categoryName (avoid "matching 'electronics' in electronics")
  const queryIsCategoryName = query && categoryName && 
    query.toLowerCase().trim() === categoryName.toLowerCase().trim();
  
  if (query && !queryIsCategoryName) {
    parts.push(`matching "${query}"`);
  }
  
  if (categoryName || filters?.categoryId) {
    parts.push(`in ${categoryName || 'this category'}`);
  }
  
  if (filters?.maxPrice) {
    const maxPriceStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(filters.maxPrice);
    parts.push(`under ${maxPriceStr}`);
  }
  
  if (filters?.minPrice) {
    const minPriceStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(filters.minPrice);
    parts.push(`above ${minPriceStr}`);
  }
  
  return parts.length > 0 ? parts.join(' ') : 'in the store';
}

export { handleMessage };
