import { env } from '@/config/env'
import { IPaginatedResponse, ITask } from '@/interfaces/task.interface'
import { CacheService } from '@/services/cache.service'
import { redisClient } from '@/shared/caching'

describe('src :: services :: cache.service', () => {
  const userId = crypto.randomUUID()
  const mockTask: ITask = {
    id: 'task1',
    title: 'Test Task',
    description: 'Test Description',
    done: false,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const mockPaginatedResponse: IPaginatedResponse<ITask> = {
    data: [mockTask],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      total_pages: 1,
      has_next_page: false,
      has_prev_page: false,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('get', () => {
    it('should return data from the cache when it exists', async () => {
      const cacheKey = `tasks:${userId}`
      vi.mocked(redisClient.get).mockResolvedValue(
        JSON.stringify(mockPaginatedResponse),
      )

      const result = await CacheService.get(userId)

      expect(redisClient.get).toHaveBeenCalledWith(cacheKey)
      expect(result).toEqual(mockPaginatedResponse)
    })

    it('should return null when the cache does not exist', async () => {
      vi.mocked(redisClient.get).mockResolvedValue(null)

      const result = await CacheService.get(userId)

      expect(result).toBeNull()
    })

    it('should generate cache key with sorted filters', async () => {
      const filters = { done: true, page: 2, limit: 20 }
      const expectedKey = `tasks:${userId}:done=true:limit=20:page=2`

      vi.mocked(redisClient.get).mockResolvedValue(
        JSON.stringify(mockPaginatedResponse),
      )

      await CacheService.get(userId, filters)

      expect(redisClient.get).toHaveBeenCalledWith(expectedKey)
    })

    it('should ignore undefined filters in the cache key', async () => {
      const filters = { done: undefined, page: 1 }
      const expectedKey = `tasks:${userId}:page=1`

      vi.mocked(redisClient.get).mockResolvedValue(
        JSON.stringify(mockPaginatedResponse),
      )

      await CacheService.get(userId, filters)

      expect(redisClient.get).toHaveBeenCalledWith(expectedKey)
    })

    it('should return null in case of error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      vi.mocked(redisClient.get).mockRejectedValue(new Error('Redis error'))

      const result = await CacheService.get(userId)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao buscar cache:',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })

    it('should correctly parse complex JSON from cache', async () => {
      const complexResponse: IPaginatedResponse<ITask> = {
        data: [mockTask, { ...mockTask, id: 'task2', title: 'Task 2' }],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          total_pages: 1,
          has_next_page: false,
          has_prev_page: false,
        },
      }

      vi.mocked(redisClient.get).mockResolvedValue(
        JSON.stringify(complexResponse),
      )

      const result = await CacheService.get(userId)

      expect(result).toEqual(complexResponse)
      expect(result?.data).toHaveLength(2)
    })
  })

  describe('set', () => {
    it('should save data to the cache with the correct TTL', async () => {
      const cacheKey = `tasks:${userId}`
      vi.mocked(redisClient.setEx).mockResolvedValue('OK')

      await CacheService.set(userId, mockPaginatedResponse)

      expect(redisClient.setEx).toHaveBeenCalledWith(
        cacheKey,
        env.cache.ttl,
        JSON.stringify(mockPaginatedResponse),
      )
    })

    it('should save data to the cache with filters', async () => {
      const filters = { done: false, page: 1, limit: 10 }
      const expectedKey = `tasks:${userId}:done=false:limit=10:page=1`

      vi.mocked(redisClient.setEx).mockResolvedValue('OK')

      await CacheService.set(userId, mockPaginatedResponse, filters)

      expect(redisClient.setEx).toHaveBeenCalledWith(
        expectedKey,
        env.cache.ttl,
        JSON.stringify(mockPaginatedResponse),
      )
    })

    it('should correctly serialize complex data', async () => {
      const complexResponse: IPaginatedResponse<ITask> = {
        data: Array(5)
          .fill(null)
          .map((_, i) => ({
            ...mockTask,
            _id: `task${i}`,
            title: `Task ${i}`,
          })),
        meta: {
          total: 100,
          page: 2,
          limit: 5,
          total_pages: 20,
          has_next_page: true,
          has_prev_page: true,
        },
      }

      vi.mocked(redisClient.setEx).mockResolvedValue('OK')

      await CacheService.set(userId, complexResponse)

      expect(redisClient.setEx).toHaveBeenCalledWith(
        expect.any(String),
        env.cache.ttl,
        JSON.stringify(complexResponse),
      )
    })

    it('should not throw an error if saving to cache fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      vi.mocked(redisClient.setEx).mockRejectedValue(new Error('Redis error'))

      await expect(
        CacheService.set(userId, mockPaginatedResponse),
      ).resolves.not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao salvar cache:',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('invalidate', () => {
    it('should invalidate all user caches', async () => {
      const keys = [
        `tasks:${userId}`,
        `tasks:${userId}:done=true`,
        `tasks:${userId}:page=2`,
      ]

      vi.mocked(redisClient.keys).mockResolvedValue(keys)
      vi.mocked(redisClient.del).mockResolvedValue(keys.length)

      await CacheService.invalidate(userId)

      expect(redisClient.keys).toHaveBeenCalledWith(`tasks:${userId}*`)
      expect(redisClient.del).toHaveBeenCalledWith(keys)
    })

    it('should not call del when there are no keys', async () => {
      vi.mocked(redisClient.keys).mockResolvedValue([])

      await CacheService.invalidate(userId)

      expect(redisClient.keys).toHaveBeenCalledWith(`tasks:${userId}*`)
      expect(redisClient.del).not.toHaveBeenCalled()
    })

    it('should not throw an error if invalidating cache fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      vi.mocked(redisClient.keys).mockRejectedValue(new Error('Redis error'))

      await expect(CacheService.invalidate(userId)).resolves.not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao invalidar cache:',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })

    it('should delete only keys of the specific user', async () => {
      const userId2 = 'user456'
      const keys = [`tasks:${userId}`, `tasks:${userId}:done=true`]

      vi.mocked(redisClient.keys).mockResolvedValue(keys)
      vi.mocked(redisClient.del).mockResolvedValue(keys.length)

      await CacheService.invalidate(userId)

      expect(redisClient.keys).toHaveBeenCalledWith(`tasks:${userId}*`)
      expect(redisClient.keys).not.toHaveBeenCalledWith(`tasks:${userId2}*`)
    })
  })
})
