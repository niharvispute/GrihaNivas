const { createClient } = require('redis');

let redisClient = null;
let redisReady = false;

const getBlacklistMode = () => (process.env.JWT_BLACKLIST_STORE || 'auto').toLowerCase();

const shouldAttemptRedis = () => {
  const mode = getBlacklistMode();
  return mode === 'redis' || mode === 'auto';
};

const initRedis = async () => {
  const mode = getBlacklistMode();

  if (mode === 'memory') {
    console.info('JWT blacklist store: memory');
    return;
  }

  if (!shouldAttemptRedis()) {
    return;
  }

  if (!process.env.REDIS_URL) {
    if (mode === 'redis') {
      throw new Error('JWT_BLACKLIST_STORE=redis requires REDIS_URL.');
    }
    console.warn('REDIS_URL not set. Falling back to in-memory JWT blacklist store.');
    return;
  }

  try {
    redisClient = createClient({ url: process.env.REDIS_URL });

    redisClient.on('error', (err) => {
      // Keep the server alive in auto mode. In redis mode, startup will fail.
      console.error('Redis error:', err.message);
    });

    await redisClient.connect();
    redisReady = true;
    console.info('JWT blacklist store: redis');
  } catch (err) {
    redisClient = null;
    redisReady = false;

    if (mode === 'redis') {
      throw new Error(`Failed to connect to Redis: ${err.message}`);
    }

    console.warn(`Redis unavailable (${err.message}). Falling back to in-memory JWT blacklist store.`);
  }
};

const getRedisClient = () => {
  if (!redisReady || !redisClient || !redisClient.isOpen) return null;
  return redisClient;
};

const getRedisRuntimeStatus = () => {
  const mode = getBlacklistMode();
  const hasUrl = Boolean(process.env.REDIS_URL);
  const connected = Boolean(redisClient && redisClient.isOpen && redisReady);

  return {
    mode,
    hasUrl,
    connected,
  };
};

const closeRedis = async () => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      console.info('Redis connection closed.');
    }
  } catch (err) {
    console.error('Failed to close Redis connection:', err.message);
  } finally {
    redisReady = false;
    redisClient = null;
  }
};

module.exports = {
  initRedis,
  closeRedis,
  getRedisClient,
  getBlacklistMode,
  getRedisRuntimeStatus,
};
