/*
Node client for calling the spaCy microservice.

Features:
- Reads `NLP_SERVICE_URL` from environment (defaults to http://localhost:8000)
- Axios instance with timeout
- Small retry loop for transient failures
- In-memory TTL cache (simple LRU-like eviction by insertion order)
- Exports `parseText(text)` and `classifyText(text)` returning parsed JSON from microservice
- Clear error handling and thrown errors for caller to handle
*/

const axios = require('axios');

// Environment-configurable options with sensible defaults
const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://127.0.0.1:8000';
const DEFAULT_TIMEOUT = parseInt(process.env.NLP_CLIENT_TIMEOUT_MS || '5000', 10);
const RETRY_COUNT = parseInt(process.env.NLP_CLIENT_RETRIES || '2', 10);
const CACHE_TTL_MS = parseInt(process.env.NLP_CLIENT_CACHE_TTL_MS || '60000', 10); // 60s
const CACHE_MAX = parseInt(process.env.NLP_CLIENT_CACHE_MAX || '500', 10);

// Create a configured axios instance used for all calls. Using a single instance
// lets us centralize timeout and headers, and makes it easier to mock in tests.
const axiosInstance = axios.create({
  baseURL: NLP_SERVICE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Simple in-memory cache with TTL and max-size eviction
class SimpleCache {
  constructor(ttlMs = CACHE_TTL_MS, maxSize = CACHE_MAX) {
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
    this.map = new Map(); // preserves insertion order
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expireAt) {
      this.map.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    // Evict if needed
    if (this.map.size >= this.maxSize) {
      // delete oldest entry
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
    this.map.set(key, { value, expireAt: Date.now() + this.ttlMs });
  }
}

const cache = new SimpleCache();

async function _postWithRetries(path, body) {
  let lastErr = null;
  for (let i = 0; i <= RETRY_COUNT; i++) {
    try {
      const res = await axiosInstance.post(path, body);
      return res.data;
    } catch (err) {
      lastErr = err;
      // For timeouts or 5xx, retry; for 4xx, break
      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        throw new Error(`NLP service client got ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      }
      // else transient -> wait a bit then retry
      await new Promise((r) => setTimeout(r, 200 * (i + 1)));
    }
  }
  throw new Error(`NLP service request failed after ${RETRY_COUNT + 1} attempts: ${lastErr && lastErr.message}`);
}

function _cacheKey(prefix, text) {
  return `${prefix}:${text}`;
}

async function parseText(text, { useCache = true } = {}) {
  if (!text || !text.trim()) {
    throw new Error('parseText: text must be a non-empty string');
  }

  const key = _cacheKey('parse', text);
  if (useCache) {
    const cached = cache.get(key);
    if (cached) return cached;
  }

  const payload = { text };
  const data = await _postWithRetries('/parse', payload);

  if (!data || !data.ok) {
    throw new Error(`NLP service /parse error: ${JSON.stringify(data)}`);
  }

  const result = data.result;

  if (useCache) cache.set(key, result);
  return result;
}

async function classifyText(text, { useCache = true } = {}) {
  if (!text || !text.trim()) {
    throw new Error('classifyText: text must be a non-empty string');
  }

  const key = _cacheKey('classify', text);
  if (useCache) {
    const cached = cache.get(key);
    if (cached) return cached;
  }

  const payload = { text };
  const data = await _postWithRetries('/classify', payload);

  if (!data || !data.ok) {
    throw new Error(`NLP service /classify error: ${JSON.stringify(data)}`);
  }

  const result = data.intent;

  if (useCache) cache.set(key, result);
  return result;
}

// Export named functions so callers can import only what they need.
module.exports = {
  parseText,
  classifyText,
};
