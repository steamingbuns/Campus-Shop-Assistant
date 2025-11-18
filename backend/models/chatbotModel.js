/**
 * Chatbot Service - Natural Language Processing
 * 
 * This service parses user queries and extracts:
 * - Intent (what the user wants to do)
 * - Entities (specific parameters like price, category, keywords)
 */
import sql from '../db/index.js';

// Category mapping - Vietnamese and English names
const CATEGORY_MAP = {
  'stationery': { id: 1, keywords: ['văn phòng phẩm', 'bút', 'vở', 'giấy', 'stationery', 'pen', 'notebook'] },
  'books': { id: 2, keywords: ['sách', 'giáo trình', 'textbook', 'book', 'tài liệu'] },
  'clothing': { id: 3, keywords: ['quần áo', 'áo', 'quần', 'clothing', 'shirt', 'pants'] },
  'electronics': { id: 4, keywords: ['điện tử', 'laptop', 'máy tính', 'điện thoại', 'electronics', 'computer', 'phone'] },
  'accessories': { id: 5, keywords: ['phụ kiện', 'accessories', 'túi', 'bag', 'balo'] }
};

// Intent patterns
const INTENT_PATTERNS = {
  search_items: [
    /tìm|tìm kiếm|search|find|show|hiện|cho tôi|mua/i,
    /cần|need|want|muốn/i
  ],
  get_recommendations: [
    /gợi ý|recommend|suggestion|đề xuất|nên mua|popular|trending/i
  ],
  item_details: [
    /chi tiết|details|thông tin|information|về sản phẩm/i
  ],
  help: [
    /help|trợ giúp|hướng dẫn|làm sao|how to/i
  ]
};

// Price extraction patterns
const PRICE_PATTERNS = {
  under: /dưới|under|below|không quá|tối đa|max|<\s*(\d+)/i,
  over: /trên|over|above|từ|ít nhất|min|>\s*(\d+)/i,
  exact: /khoảng|around|~|≈\s*(\d+)/i,
  range: /từ\s*(\d+)\s*đến\s*(\d+)|(\d+)\s*-\s*(\d+)|between\s*(\d+)\s*and\s*(\d+)/i
};

// Price unit multipliers
const PRICE_UNITS = {
  'k': 1000,
  'nghìn': 1000,
  'thousand': 1000,
  'tr': 1000000,
  'triệu': 1000000,
  'million': 1000000,
  'm': 1000000
};

/**
 * Main parsing function - Extracts intent and entities from user message
 */
export async function parseUserQuery(message) {
  const normalized = message.toLowerCase().trim();
  // FIX: double trim()

  // Step 1: Identify intent
  const intent = identifyIntent(normalized);

  // Step 2: Extract entities based on intent
  const entities = extractEntities(normalized, intent);

  return {
    intent,
    entities,
    originalMessage: message
  };
}

/**
 * Identify user intent from message
 */
function identifyIntent(message) {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(message))) {
      return intent;
    }
  }

  // Default to search if message contains keywords but no clear intent
  if (extractKeywords(message).length > 0) {
    return 'search_items';
  }

  return 'unknown';
}





/** FIX
 * Identify user intent with confidence scoring
 * Returns { intent: string, confidence: number, alternatives: Array }
 
function identifyIntent(message) {
  const scores = {};
  
  // Score all intents
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    const matches = patterns.filter(pattern => pattern.test(message)).length;
    if (matches > 0) {
      scores[intent] = matches / patterns.length; // 0.0 to 1.0
    }
  }

  // Get best match
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  if (sorted.length === 0) {
    // Fallback logic
    if (extractKeywords(message).length > 0) {
      return { intent: 'search_items', confidence: 0.5, alternatives: [] };
    }
    return { intent: 'unknown', confidence: 0, alternatives: [] };
  }

  return {
    intent: sorted[0][0],
    confidence: sorted[0][1],
    alternatives: sorted.slice(1, 3).map(s => ({ intent: s[0], confidence: s[1] }))
  };
}
*/





/**
 * Extract entities (parameters) from the message
 */
function extractEntities(message, intent) {
  const entities = {};

  // Extract category
  const category = extractCategory(message);
  if (category) {
    entities.categoryId = category.id;
    entities.category = category.name;
  }

  // Extract price constraints
  const priceConstraints = extractPriceConstraints(message);
  if (priceConstraints.minPrice !== null) {
    entities.minPrice = priceConstraints.minPrice;
  }
  if (priceConstraints.maxPrice !== null) {
    entities.maxPrice = priceConstraints.maxPrice;
  }

  // Extract sorting preference
  const sortPreference = extractSortPreference(message);
  if (sortPreference) {
    entities.sortBy = sortPreference;
  }

  // Detect "cheap" or "expensive" keywords
  if (/rẻ|cheap|giá tốt|affordable/i.test(message)) {
    entities.cheapest = true;
    entities.sortBy = entities.sortBy || 'price_asc';
  }
  if (/đắt|expensive|cao cấp|premium/i.test(message)) {
    entities.expensive = true;
    entities.sortBy = entities.sortBy || 'price_desc';
  }

  // Extract keywords (remaining meaningful words)
  const keywords = extractKeywords(message);
  if (keywords.length > 0) {
    entities.keywords = keywords.join(' ');
  }

  // Extract limit (how many results)
  const limit = extractLimit(message);
  if (limit) {
    entities.limit = limit;
  }

  // Extract condition (new/used)
  const condition = extractCondition(message);
  if (condition) {
    entities.condition = condition;
  }

  return entities;
}

/**
 * Extract category from message
 */
function extractCategory(message) {
  for (const [name, category] of Object.entries(CATEGORY_MAP)) {
    if (category.keywords.some(keyword => message.includes(keyword))) {
      return { id: category.id, name };
    }
  }
  return null;
}

/**
 * Extract price constraints (min/max)
 */
function extractPriceConstraints(message) {
  const constraints = { minPrice: null, maxPrice: null };

  // Check for range first
  const rangeMatch = message.match(PRICE_PATTERNS.range);
  if (rangeMatch) {
    const nums = rangeMatch.slice(1).filter(Boolean);
    if (nums.length >= 2) {
      constraints.minPrice = parsePrice(nums[0], message);
      constraints.maxPrice = parsePrice(nums[1], message);
      return constraints;
    }
  }

  // Check for "under" pattern
  const underMatch = message.match(PRICE_PATTERNS.under);
  if (underMatch) {
    const priceStr = underMatch[1] || extractNumberBeforeKeyword(message, ['dưới', 'under', 'max']);
    if (priceStr) {
      constraints.maxPrice = parsePrice(priceStr, message);
    }
  }

  // Check for "over" pattern
  const overMatch = message.match(PRICE_PATTERNS.over);
  if (overMatch) {
    const priceStr = overMatch[1] || extractNumberBeforeKeyword(message, ['trên', 'over', 'min']);
    if (priceStr) {
      constraints.minPrice = parsePrice(priceStr, message);
    }
  }

  return constraints;
}

/**
 * Parse price string with unit detection (k, tr, million, etc.)
 */
function parsePrice(priceStr, fullMessage) {
  // Remove commas and dots used as thousand separators
  const cleanStr = priceStr.replace(/[,.]/g, '');
  let basePrice = Number.parseFloat(cleanStr);

  if (Number.isNaN(basePrice)) return null;

  // Check for unit multipliers in the message near the price
  for (const [unit, multiplier] of Object.entries(PRICE_UNITS)) {
    const unitRegex = new RegExp(`${priceStr}\\s*${unit}\\b`, 'i');
    if (unitRegex.test(fullMessage)) {
      return Math.round(basePrice * multiplier);
    }
  }

  // If price is small (< 1000), assume it's in thousands
  if (basePrice < 1000) {
    return Math.round(basePrice * 1000);
  }

  return Math.round(basePrice);
}

/**
 * Extract number that appears before certain keywords
 */
function extractNumberBeforeKeyword(message, keywords) {
  for (const keyword of keywords) {
    const regex = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${keyword}`, 'i');
    const match = message.match(regex);
    if (match) return match[1];
  }
  return null;
}

/**
 * Extract sorting preference
 */
function extractSortPreference(message) {
  if (/mới nhất|newest|latest|mới/i.test(message)) {
    return 'latest';
  }
  if (/cũ nhất|oldest/i.test(message)) {
    return 'oldest';
  }
  if (/giá tăng|price.*asc|rẻ.*đắt/i.test(message)) {
    return 'price_asc';
  }
  if (/giá giảm|price.*desc|đắt.*rẻ/i.test(message)) {
    return 'price_desc';
  }
  return null;
}

/**
 * Extract meaningful keywords from message (after removing stop words)
 */
function extractKeywords(message) {
  // Vietnamese and English stop words
  const stopWords = new Set([
    'tôi', 'cần', 'muốn', 'tìm', 'cho', 'một', 'cái', 'con', 'chiếc', 'bộ',
    'i', 'need', 'want', 'find', 'show', 'me', 'a', 'an', 'the', 'for',
    'dưới', 'trên', 'under', 'over', 'below', 'above', 'less', 'more', 'than',
    'giá', 'price', 'nghìn', 'triệu', 'thousand', 'million', 'vnd', 'đồng'
  ]);

  // Remove category keywords so they don't appear in search query
  let cleaned = message;
  for (const category of Object.values(CATEGORY_MAP)) {
    for (const keyword of category.keywords) {
      cleaned = cleaned.replace(new RegExp(keyword, 'gi'), '');
    }
  }

  // Split into words and filter
  const words = cleaned
    .split(/\s+/)
    .map(word => word.replace(/[^\w\sÀ-ỹ]/g, '').toLowerCase())
    .filter(word => 
      word.length > 2 && 
      !stopWords.has(word) &&
      !/^\d+$/.test(word) // Remove pure numbers
    );

  return [...new Set(words)]; // Remove duplicates
}

/**
 * Extract result limit from message
 */
function extractLimit(message) {
  const match = message.match(/(\d+)\s*(items?|sản phẩm|kết quả|results?)/i);
  if (match) {
    const limit = Number.parseInt(match[1], 10);
    return Math.min(limit, 50); // Cap at 50
  }
  return null;
}

/**
 * Extract condition (new/used)
 */
function extractCondition(message) {
  if (/mới|new|brand new|chưa qua sử dụng/i.test(message)) {
    return 'new';
  }
  if (/cũ|used|đã qua sử dụng|second hand/i.test(message)) {
    return 'used';
  }
  return null;
}

/**
 * Validate parsed entities (optional - add business rules)
 */
export function validateEntities(entities) {
  const errors = [];

  if (entities.minPrice !== null && entities.minPrice < 0) {
    errors.push('Minimum price cannot be negative');
  }

  if (entities.maxPrice !== null && entities.maxPrice < 0) {
    errors.push('Maximum price cannot be negative');
  }

  if (entities.minPrice !== null && entities.maxPrice !== null) {
    if (entities.minPrice > entities.maxPrice) {
      errors.push('Minimum price cannot be greater than maximum price');
    }
  }

  return errors;
}

/**
 * Generate human-readable explanation of parsed query (for debugging/testing)
 */
export function explainParsedQuery(parsed) {
  const { intent, entities } = parsed;
  const parts = [`Intent: ${intent}`];

  if (entities.category) {
    parts.push(`Category: ${entities.category}`);
  }
  if (entities.keywords) {
    parts.push(`Keywords: "${entities.keywords}"`);
  }
  if (entities.minPrice !== null) {
    parts.push(`Min Price: ${entities.minPrice.toLocaleString()} VND`);
  }
  if (entities.maxPrice !== null) {
    parts.push(`Max Price: ${entities.maxPrice.toLocaleString()} VND`);
  }
  if (entities.sortBy) {
    parts.push(`Sort: ${entities.sortBy}`);
  }
  if (entities.condition) {
    parts.push(`Condition: ${entities.condition}`);
  }

  return parts.join(' | ');
}



// Save user data
export async function saveConversation(userId, conversationData) {
  return sql`
    INSERT INTO "Chatbot_Conversations" (user_id, started_at)
    VALUES (${userId}, NOW())
    RETURNING conversation_id
  `;
}

export async function saveMessage(conversationId, role, message) {
  return sql`
    INSERT INTO "Chatbot_Messages" (conversation_id, role, message_text)
    VALUES (${conversationId}, ${role}, ${message})
  `;
}

export async function saveUserPreferences(userId, preferences) {
  return sql`
    INSERT INTO "User_Chatbot_Preferences" (user_id, preferences)
    VALUES (${userId}, ${preferences})
    ON CONFLICT (user_id) DO UPDATE SET preferences = ${preferences}
  `;
}


/* FIX: Expand on NLP
export async function logSearchQuery(userId, query, parsedIntent, resultsCount) {
  return sql`
    INSERT INTO "Search_Analytics" (user_id, search_query, parsed_intent, results_count)
    VALUES (${userId}, ${query}, ${parsedIntent}, ${resultsCount})
  `;
}


export async function getTrendingSearches(limit = 10) {
  return sql`
    SELECT search_query, COUNT(*) as frequency
    FROM "Search_Analytics"
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY search_query
    ORDER BY frequency DESC
    LIMIT ${limit}
  `;
}
*/



// FIX: Helper functions for recommendation
/* 
export async function findCompletedOrderForProductByUser({ userId, productId }) {
  const [order] = await sql`
    SELECT o.order_id
    FROM "Order" o
    JOIN "Order_Item" oi ON o.order_id = oi.order_id
    WHERE o.buyer_id = ${userId}
      AND oi.item_id = ${productId}
      AND o.status = 'completed'
    ORDER BY o.create_at DESC
    LIMIT 1
  `;
  return order || null;
}

export async function hasReviewForOrder({ productId, orderId, userId }) {
    const [{ already_reviewed }] = await sql`
        SELECT EXISTS (
            SELECT 1
            FROM "Review"
            WHERE item_id = ${productId}
                AND order_id = ${orderId}
                AND user_id = ${userId}
        ) AS already_reviewed
    `;
    return Boolean(already_reviewed);
}
*/





/* ------------------------------------------------------------------
   New recommendation-support helpers
   - getTopPurchasedCategories: categories user bought most from
   - getUserPurchasedProductIds: product ids user has already bought (for exclusion)
   - getUserBrowsedProductIds: try to infer from chatbot conversation parsed_entities
   - getPopularProductsInCategories: popular items inside given categories
   - findProductsByIds: fetch product rows for explicit ids (shared shape)
   ------------------------------------------------------------------*/

/**
 * Get top categories (by purchase count) for a user.
 * Returns array of { category_id, name, purchase_count }.
 */


/*

export async function getTopPurchasedCategories(userId, limit = 3) {
  if (!userId) return [];

  return sql`
    SELECT
      p.category_id,
      c.name,
      COUNT(*)::int AS purchase_count
    FROM "Order" o
    JOIN "Order_Item" oi ON oi.order_id = o.order_id
    JOIN "Product" p ON p.product_id = oi.item_id
    LEFT JOIN "Categories" c ON c.category_id = p.category_id
    WHERE o.buyer_id = ${userId}
      AND (o.order_status = 'completed' OR o.order_status = 'delivered' OR o.order_status IS NULL)
    GROUP BY p.category_id, c.name
    ORDER BY purchase_count DESC
    LIMIT ${limit}
  `;
}


//List distinct product ids that the user has purchased (recent first).
//Useful to exclude from recommendations.

export async function getUserPurchasedProductIds(userId, limit = 200) {
  if (!userId) return [];

  const rows = await sql`
    SELECT DISTINCT oi.item_id::int AS product_id
    FROM "Order" o
    JOIN "Order_Item" oi ON oi.order_id = o.order_id
    WHERE o.buyer_id = ${userId}
      AND (o.order_status = 'completed' OR o.order_status = 'delivered' OR o.order_status IS NULL)
    ORDER BY o.create_at DESC
    LIMIT ${limit}
  `;
  return rows.map(r => r.product_id);
}


//Try to infer product ids the user viewed/discussed from chatbot messages.
//This uses parsed_entities JSONB stored in "Chatbot_Messages" if available.
//If the table/field is not used, returns an empty array (safe fallback).

export async function getUserBrowsedProductIds(userId, limit = 20) {
  if (!userId) return [];

  try {
    const rows = await sql`
      SELECT DISTINCT (m.parsed_entities ->> 'productId')::int AS product_id
      FROM "Chatbot_Messages" m
      JOIN "Chatbot_Conversations" c ON c.conversation_id = m.conversation_id
      WHERE c.user_id = ${userId}
        AND m.role = 'user'
        AND m.parsed_entities ? 'productId'
      ORDER BY m.sent_at DESC
      LIMIT ${limit}
    `;
    return rows.filter(r => r.product_id).map(r => r.product_id);
  } catch (err) {
    // If Chatbot_Messages or parsed_entities aren't available/used, silently fallback.
    return [];
  }
}

//Get popular (high-rated / high-review-count / recent) products for given categories.
//Excludes product ids in the excludeIds array.

export async function getPopularProductsInCategories(categoryIds = [], { excludeIds = [], limit = 10 } = {}) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return [];

  // Build exclusion clause safely
  const excludeClause = excludeIds && excludeIds.length ? sql`AND p.product_id NOT IN (${sql(excludeIds)})` : sql``;

  return sql`
    WITH ProductReviews AS (
      SELECT
        item_id,
        COALESCE(AVG(rating), 0)::numeric(10, 2) AS rating_average,
        COUNT(*)::int AS rating_count
      FROM "Review"
      GROUP BY item_id
    ),
    RankedImages AS (
      SELECT
        item_id,
        image_url,
        ROW_NUMBER() OVER(PARTITION BY item_id ORDER BY image_id ASC) as rn
      FROM "Product_Image"
    )
    SELECT
      p.product_id AS id,
      p.seller_id,
      p.category_id,
      c.name AS category_name,
      p.description AS description,
      p.description AS name,
      p.price,
      p.stock,
      p.ratings,
      p.status,
      p.create_at,
      p.updated_at,
      COALESCE(pr.rating_average, 0) AS rating_average,
      COALESCE(pr.rating_count, 0) AS rating_count,
      ri.image_url AS image
    FROM "Product" p
    LEFT JOIN "Categories" c ON c.category_id = p.category_id
    LEFT JOIN ProductReviews pr ON pr.item_id = p.product_id
    LEFT JOIN RankedImages ri ON ri.item_id = p.product_id AND ri.rn = 1
    WHERE p.category_id IN (${sql(categoryIds)})
      AND p.status = 'active'
      ${excludeClause}
    ORDER BY COALESCE(pr.rating_count, 0) DESC, COALESCE(pr.rating_average, 0) DESC, p.create_at DESC
    LIMIT ${limit}
  `;
}


// Find products by a list of product ids (keeps the same projection as findProducts)

export async function findProductsByIds(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  return sql`
    WITH ProductReviews AS (
      SELECT
        item_id,
        COALESCE(AVG(rating), 0)::numeric(10, 2) AS rating_average,
        COUNT(*)::int AS rating_count
      FROM "Review"
      GROUP BY item_id
    ),
    RankedImages AS (
      SELECT
        item_id,
        image_url,
        ROW_NUMBER() OVER(PARTITION BY item_id ORDER BY image_id ASC) as rn
      FROM "Product_Image"
    )
    SELECT
      p.product_id AS id,
      p.seller_id,
      p.category_id,
      c.name AS category_name,
      p.description AS description,
      p.description AS name,
      p.price,
      p.stock,
      p.ratings,
      p.status,
      p.create_at,
      p.updated_at,
      COALESCE(pr.rating_average, 0) AS rating_average,
      COALESCE(pr.rating_count, 0) AS rating_count,
      ri.image_url AS image
    FROM "Product" p
    LEFT JOIN "Categories" c ON c.category_id = p.category_id
    LEFT JOIN ProductReviews pr ON pr.item_id = p.product_id
    LEFT JOIN RankedImages ri ON ri.item_id = p.product_id AND ri.rn = 1
    WHERE p.product_id IN (${sql(ids)})
      AND p.status = 'active'
  `;
}
*/