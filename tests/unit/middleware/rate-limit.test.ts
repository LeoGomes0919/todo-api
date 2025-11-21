import { NextFunction, Response } from 'express'
import { env } from '@/config/env'
import { rateLimit } from '@/middleware/rate-limit'
import { redisClient } from '@/shared/caching'

vi.mock('@/config/env', () => ({
  env: {
    rateLimit: {
      max: 100,
      windowSeconds: 60,
    },
  },
}))

vi.mock('@/shared/caching', () => ({
  redisClient: {
    multi: vi.fn(),
  },
}))

describe('src :: middleware :: rate-limit', () => {
  let mockRequest: any
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>
  let setHeaderMock: ReturnType<typeof vi.fn>
  let mockMulti: any
  let consoleErrorSpy: ReturnType<typeof vi.fn>
  let dateNowSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    setHeaderMock = vi.fn()
    mockNext = vi.fn()

    mockRequest = {
      apiKey: undefined,
    }

    mockResponse = {
      status: statusMock as any,
      json: jsonMock as any,
      setHeader: setHeaderMock as any,
    }

    const mockZRemRangeByScore = vi.fn()
    const mockZAdd = vi.fn()
    const mockZCard = vi.fn()
    const mockExpire = vi.fn()
    const mockExec = vi.fn()

    mockMulti = {
      zRemRangeByScore: mockZRemRangeByScore,
      zAdd: mockZAdd,
      zCard: mockZCard,
      expire: mockExpire,
      exec: mockExec,
    }

    vi.mocked(redisClient.multi).mockReturnValue(mockMulti)

    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1000000)

    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    dateNowSpy.mockRestore()
    vi.restoreAllMocks()
  })

  describe('rateLimit', () => {
    it('should call next when apiKey is not present', async () => {
      mockRequest.apiKey = undefined

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(redisClient.multi).not.toHaveBeenCalled()
    })

    it('should not check rate limit when apiKey is missing', async () => {
      mockRequest.apiKey = null

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(redisClient.multi).not.toHaveBeenCalled()
    })

    it('should create redis key with apiKey', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 10, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      const expectedKey = 'rate_limit:test-api-key'
      expect(mockMulti.zRemRangeByScore).toHaveBeenCalledWith(
        expectedKey,
        0,
        expect.any(Number),
      )
    })

    it('should remove old requests outside the time window', async () => {
      mockRequest.apiKey = 'test-api-key'
      const now = 1000000
      const windowStart = now - env.rateLimit.windowSeconds * 1000
      mockMulti.exec.mockResolvedValue([null, null, 10, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockMulti.zRemRangeByScore).toHaveBeenCalledWith(
        'rate_limit:test-api-key',
        0,
        windowStart,
      )
    })

    it('should add current request to sorted set', async () => {
      mockRequest.apiKey = 'test-api-key'
      const now = 1000000
      mockMulti.exec.mockResolvedValue([null, null, 10, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockMulti.zAdd).toHaveBeenCalledWith('rate_limit:test-api-key', {
        score: now,
        value: `${now}`,
      })
    })

    it('should count requests in current window', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 10, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockMulti.zCard).toHaveBeenCalledWith('rate_limit:test-api-key')
    })

    it('should set expiration on the key', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 10, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockMulti.expire).toHaveBeenCalledWith(
        'rate_limit:test-api-key',
        env.rateLimit.windowSeconds,
      )
    })

    it('should execute redis transaction', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 10, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockMulti.exec).toHaveBeenCalledTimes(1)
    })

    it('should set rate limit headers', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 50, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        env.rateLimit.max,
      )
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', 50)
      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(Number),
      )
    })

    it('should calculate remaining requests correctly', async () => {
      mockRequest.apiKey = 'test-api-key'
      const requestCount = 30
      mockMulti.exec.mockResolvedValue([null, null, requestCount, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        env.rateLimit.max - requestCount,
      )
    })

    it('should set remaining to 0 when limit exceeded', async () => {
      mockRequest.apiKey = 'test-api-key'
      const requestCount = 150
      mockMulti.exec.mockResolvedValue([null, null, requestCount, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', 0)
    })

    it('should call next when under rate limit', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 50, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('should return 429 when rate limit exceeded', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 150, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(statusMock).toHaveBeenCalledWith(429)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return error message when rate limit exceeded', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 150, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Too Many Requests',
        message: `The limit of ${env.rateLimit.max} requests per ${env.rateLimit.windowSeconds / 60} minutes has been exceeded.`,
        retryAfter: env.rateLimit.windowSeconds,
      })
    })

    it('should include retryAfter in 429 response', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 150, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          retryAfter: env.rateLimit.windowSeconds,
        }),
      )
    })

    it('should handle exactly at the limit', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 100, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('should handle one request over the limit', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 101, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(statusMock).toHaveBeenCalledWith(429)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle redis error gracefully', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockRejectedValue(new Error('Redis connection failed'))

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro no rate limit:',
        expect.any(Error),
      )
      expect(mockNext).toHaveBeenCalled()
    })

    it('should call next on redis error without blocking request', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockRejectedValue(new Error('Redis error'))

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('should handle null exec result', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue(null)

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })

    it('should treat null result as 0 requests', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue(null)

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        env.rateLimit.max,
      )
    })

    it('should calculate reset timestamp correctly', async () => {
      mockRequest.apiKey = 'test-api-key'
      const now = 1000000
      mockMulti.exec.mockResolvedValue([null, null, 50, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      const expectedReset = Math.ceil(now / 1000) + env.rateLimit.windowSeconds
      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expectedReset,
      )
    })

    it('should use environment configuration for max limit', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 50, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        env.rateLimit.max,
      )
    })

    it('should use environment configuration for window seconds', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 50, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockMulti.expire).toHaveBeenCalledWith(
        expect.any(String),
        env.rateLimit.windowSeconds,
      )
    })

    it('should handle different apiKeys separately', async () => {
      const apiKey1 = 'api-key-1'
      const apiKey2 = 'api-key-2'

      mockRequest.apiKey = apiKey1
      mockMulti.exec.mockResolvedValue([null, null, 50, null])
      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockMulti.zRemRangeByScore).toHaveBeenCalledWith(
        `rate_limit:${apiKey1}`,
        expect.any(Number),
        expect.any(Number),
      )

      vi.clearAllMocks()

      mockRequest.apiKey = apiKey2
      mockMulti.exec.mockResolvedValue([null, null, 30, null])
      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockMulti.zRemRangeByScore).toHaveBeenCalledWith(
        `rate_limit:${apiKey2}`,
        expect.any(Number),
        expect.any(Number),
      )
    })

    it('should be an async function', () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 50, null])

      const result = rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(result).toBeInstanceOf(Promise)
    })

    it('should return void promise', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 50, null])

      const result = await rateLimit(
        mockRequest,
        mockResponse as Response,
        mockNext,
      )

      expect(result).toBeUndefined()
    })

    it('should set all three rate limit headers', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 50, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(setHeaderMock).toHaveBeenCalledTimes(3)
    })

    it('should handle first request (count = 1)', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 1, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        env.rateLimit.max - 1,
      )
      expect(mockNext).toHaveBeenCalled()
    })

    it('should calculate window start correctly', async () => {
      mockRequest.apiKey = 'test-api-key'
      const now = 1000000
      const expectedWindowStart = now - env.rateLimit.windowSeconds * 1000
      mockMulti.exec.mockResolvedValue([null, null, 50, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(mockMulti.zRemRangeByScore).toHaveBeenCalledWith(
        'rate_limit:test-api-key',
        0,
        expectedWindowStart,
      )
    })

    it('should use Date.now() for timestamp', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 50, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(dateNowSpy).toHaveBeenCalled()
    })

    it('should format error message with correct time unit', async () => {
      mockRequest.apiKey = 'test-api-key'
      mockMulti.exec.mockResolvedValue([null, null, 150, null])

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      const expectedMinutes = env.rateLimit.windowSeconds / 60
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(`${expectedMinutes} minutes`),
        }),
      )
    })

    it('should not set headers when apiKey is missing', async () => {
      mockRequest.apiKey = undefined

      await rateLimit(mockRequest, mockResponse as Response, mockNext)

      expect(setHeaderMock).not.toHaveBeenCalled()
    })
  })
})
