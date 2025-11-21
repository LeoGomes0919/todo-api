export const env = {
  port: parseInt(process.env.PORT || '3333', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-api',
  },
  redis: {
    uri: process.env.REDIS_URI || 'redis://localhost:6379',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '60', 10),
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW || '900', 10),
  },
}
