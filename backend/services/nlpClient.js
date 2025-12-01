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

import axios from 'axios';

// Environment-configurable options with sensible defaults
const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://127.0.0.1:5001';
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
  // Prefer the compact `/query` endpoint which returns a small JSON optimized
  // for frontend consumption: { ok, text, entities, intent, features }
  // If `/query` is not available on the server (404), fall back to `/parse`.
  let data;
  try {
    data = await _postWithRetries('/query', payload);
  } catch (err) {
    // If the remote endpoint doesn't exist (404) or route missing, try /parse
    if (err.message && err.message.includes('404')) {
      data = await _postWithRetries('/parse', payload);
    } else {
      throw err;
    }
  }

  if (!data) {
    throw new Error('NLP service returned no data');
  }

  // `/query` returns { ok, text, entities, intent, features }
  // `/parse` returns { ok, result: { ... } }
  let result = null;
  if (data.ok && data.result) {
    result = data.result;
  } else if (data.ok && (data.entities || data.intent || data.text)) {
    // compact /query response
    result = {
      entities: data.entities || [],
      intent: data.intent || {},
      text: data.text || text,
      features: data.features || {},
    };
  } else {
    throw new Error(`NLP service parse error: ${JSON.stringify(data)}`);
  }

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
  // Use `/query` which returns the intent in a compact way; fallback to `/classify`.
  let data;
  try {
    data = await _postWithRetries('/query', payload);
  } catch (err) {
    if (err.message && err.message.includes('404')) {
      data = await _postWithRetries('/classify', payload);
    } else {
      throw err;
    }
  }

  if (!data) {
    throw new Error('NLP service returned no data');
  }

  let result = null;
  // `/classify` may return { ok, intent } while `/query` returns { ok, intent }
  if (data.ok && data.intent) {
    result = data.intent;
  } else if (data.ok && data.result && data.result.intent) {
    result = data.result.intent;
  } else {
    throw new Error(`NLP service classify error: ${JSON.stringify(data)}`);
  }

  if (useCache) cache.set(key, result);
  return result;
}

// Export named functions so callers can import only what they need.
export { parseText, classifyText };
