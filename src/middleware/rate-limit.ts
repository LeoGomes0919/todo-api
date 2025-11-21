import { NextFunction, Response } from 'express'
import { env } from '@/config/env'
import { redisClient } from '@/shared/caching'

export const rateLimit = async (
  req: any,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const apiKey = req.apiKey

    if (!apiKey) {
      next()
      return
    }

    const key = `rate_limit:${apiKey}`
    const now = Date.now()
    const windowStart = now - env.rateLimit.windowSeconds * 1000

    const multi = redisClient.multi()

    multi.zRemRangeByScore(key, 0, windowStart)

    multi.zAdd(key, { score: now, value: `${now}` })

    multi.zCard(key)

    multi.expire(key, env.rateLimit.windowSeconds)

    const results = await multi.exec()

    const requestCount = results ? Number(results[2]) : 0

    res.setHeader('X-RateLimit-Limit', env.rateLimit.max)
    res.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, env.rateLimit.max - requestCount),
    )
    res.setHeader(
      'X-RateLimit-Reset',
      Math.ceil(now / 1000) + env.rateLimit.windowSeconds,
    )

    if (requestCount > env.rateLimit.max) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: `The limit of ${env.rateLimit.max} requests per ${env.rateLimit.windowSeconds / 60} minutes has been exceeded.`,
        retryAfter: env.rateLimit.windowSeconds,
      })
      return
    }

    next()
  } catch (error) {
    console.error('Erro no rate limit:', error)
    next()
  }
}
