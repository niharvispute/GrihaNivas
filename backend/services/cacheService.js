const { getRedisClient } = require('../config/redis');

const TTL = {
  SHORT: 60,    // 1 min — volatile data
  LIST: 300,    // 5 min — property listing pages
  DETAIL: 600,  // 10 min — individual property pages
};

const get = async (key) => {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

const set = async (key, value, ttlSeconds = TTL.LIST) => {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
    // non-blocking — cache misses are acceptable
  }
};

// Deletes all keys matching a prefix using SCAN (safe for production).
const delByPrefix = async (prefix) => {
  const client = getRedisClient();
  if (!client) return;
  try {
    let cursor = 0;
    do {
      const result = await client.scan(cursor, { MATCH: `${prefix}*`, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length) {
        await client.del(result.keys);
      }
    } while (cursor !== 0);
  } catch {
    // non-blocking
  }
};

// Builds a stable, sorted cache key from a query params object.
const queryKey = (params) => {
  const relevantKeys = [
    'category', 'bhk', 'area', 'minPrice', 'maxPrice',
    'furnishing', 'isFeatured', 'hasMedia', 'builder',
    'builderSlug', 'launchWindow', 'sortBy', 'page', 'limit',
  ];
  const filtered = {};
  for (const k of relevantKeys) {
    if (params[k] !== undefined) filtered[k] = params[k];
  }
  return JSON.stringify(filtered);
};

module.exports = { get, set, delByPrefix, queryKey, TTL };
