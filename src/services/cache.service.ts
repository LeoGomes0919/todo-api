import { env } from '@/config/env'
import { IPaginatedResponse, ITask } from '@/interfaces/task.interface'
import { redisClient } from '@/shared/caching'

interface CacheFilters {
  done?: boolean
  page?: number
  limit?: number
}

export class CacheService {
  private static getCacheKey(userId: string, filters?: CacheFilters): string {
    const parts = [`tasks:${userId}`]

    Object.keys(filters || {})
      .sort()
      .forEach((key) => {
        const value = (filters as any)[key]
        if (value !== undefined) {
          parts.push(`${key}=${value}`)
        }
      })

    return parts.join(':')
  }

  static async get(
    userId: string,
    filters?: CacheFilters,
  ): Promise<IPaginatedResponse<ITask> | null> {
    try {
      const key = this.getCacheKey(userId, filters)
      const cached = await redisClient.get(key)

      if (cached) {
        return JSON.parse(cached) as IPaginatedResponse<ITask>
      }

      return null
    } catch (error) {
      console.error('Erro ao buscar cache:', error)
      return null
    }
  }

  static async set(
    userId: string,
    data: IPaginatedResponse<ITask>,
    filters?: CacheFilters,
  ): Promise<void> {
    try {
      const key = this.getCacheKey(userId, filters)
      await redisClient.setEx(key, env.cache.ttl, JSON.stringify(data))
    } catch (error) {
      console.error('Erro ao salvar cache:', error)
    }
  }

  static async invalidate(userId: string): Promise<void> {
    try {
      const pattern = `tasks:${userId}*`
      const keys = await redisClient.keys(pattern)

      if (keys.length > 0) {
        await redisClient.del(keys)
      }
    } catch (error) {
      console.error('Erro ao invalidar cache:', error)
    }
  }
}
