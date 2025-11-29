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
  const intent = identifyIntent(normalized);
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

  // Check for "under" pattern - look for number AFTER the keyword
  const underMatch = message.match(PRICE_PATTERNS.under);
  if (underMatch) {
    // Try to find price after keywords like "under", "below", "dưới"
    const priceStr = underMatch[1] || extractNumberAfterKeyword(message, ['dưới', 'under', 'below', 'max', 'không quá', 'tối đa']);
    if (priceStr) {
      constraints.maxPrice = parsePrice(priceStr, message);
    }
  }

  // Check for "over" pattern - look for number AFTER the keyword
  const overMatch = message.match(PRICE_PATTERNS.over);
  if (overMatch) {
    const priceStr = overMatch[1] || extractNumberAfterKeyword(message, ['trên', 'over', 'above', 'min', 'từ', 'ít nhất']);
    if (priceStr) {
      constraints.minPrice = parsePrice(priceStr, message);
    }
  }

  return constraints;
}

/**
 * Parse price string with unit detection (k, tr, million, etc.)
 * Handles formats like: "500k", "500 k", "500000", "1tr", "1.5m"
 */
function parsePrice(priceStr, fullMessage) {
  if (!priceStr) return null;
  
  // First check if the priceStr itself contains a unit (e.g., "500k")
  const unitInStrMatch = priceStr.match(/^(\d+(?:[.,]?\d*)?)\s*([kKmM]|tr|triệu|nghìn|thousand|million)?$/i);
  if (unitInStrMatch) {
    const numPart = unitInStrMatch[1].replace(/[,.]/g, '');
    const unitPart = (unitInStrMatch[2] || '').toLowerCase();
    let basePrice = Number.parseFloat(numPart);
    
    if (Number.isNaN(basePrice)) return null;
    
    // Apply unit multiplier if present
    if (unitPart) {
      const multiplier = PRICE_UNITS[unitPart];
      if (multiplier) {
        return Math.round(basePrice * multiplier);
      }
    }
    
    // If price is small (< 1000), assume it's in thousands
    if (basePrice < 1000) {
      return Math.round(basePrice * 1000);
    }
    
    return Math.round(basePrice);
  }

  // Fallback: Remove commas and dots used as thousand separators
  const cleanStr = priceStr.replace(/[,.]/g, '');
  let basePrice = Number.parseFloat(cleanStr);

  if (Number.isNaN(basePrice)) return null;

  // Check for unit multipliers in the full message near the price
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
 * Extract number that appears AFTER certain keywords (e.g., "under 500k")
 */
function extractNumberAfterKeyword(message, keywords) {
  for (const keyword of keywords) {
    // Match keyword followed by optional space, then number with optional unit (k, tr, etc.)
    const regex = new RegExp(`${keyword}\\s*(\\d+(?:[.,]\\d+)?\\s*[kKmMtr]*)`, 'i');
    const match = message.match(regex);
    if (match && match[1]) {
      // Return the number part (may include unit like "500k")
      return match[1].trim();
    }
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

