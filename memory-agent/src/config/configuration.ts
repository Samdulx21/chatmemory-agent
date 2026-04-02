export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
  prefix: process.env.PREFIX || 'api/v1',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    db: parseInt(process.env.REDIS_DB ?? '0', 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || '',
    tls: process.env.REDIS_TLS === 'true',
    maxRetries: parseInt(process.env.REDIS_MAX_RETRIES ?? '3', 10) || 3,
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT ?? '10000', 10) || 10000,
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT ?? '5000', 10) || 5000,
    enableOfflineQueue: process.env.REDIS_ENABLE_OFFLINE_QUEUE !== 'false',
  },
  cacheTtl: parseInt(process.env.CACHE_TTL ?? '1800', 10) || 1800,
  gemini: {
    apiKey: process.env.API_KEY_GENAI,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
});
