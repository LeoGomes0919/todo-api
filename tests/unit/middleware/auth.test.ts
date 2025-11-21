import { NextFunction, Response } from 'express'
import { authenticate } from '@/middleware/auth'
import { ApiKeyModel } from '@/models/api-key.model'

vi.mock('@/models/api-key.model', () => ({
  ApiKeyModel: {
    findOne: vi.fn(),
  },
}))

describe('src :: middleware :: auth', () => {
  let mockRequest: any
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    mockNext = vi.fn()

    mockRequest = {
      headers: {},
    }

    mockResponse = {
      status: statusMock as any,
      json: jsonMock as any,
    }

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('authenticate', () => {
    it('should return 401 when x-api-key header is missing', async () => {
      mockRequest.headers = {}

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'API key is required. Please provide the x-api-key header.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 401 when x-api-key header is empty string', async () => {
      mockRequest.headers['x-api-key'] = ''

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'API key is required. Please provide the x-api-key header.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 401 when API key is not found in database', async () => {
      mockRequest.headers['x-api-key'] = 'invalid-api-key'

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue(null)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(ApiKeyModel.findOne).toHaveBeenCalledWith({
        key: 'invalid-api-key',
      })
      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid API key.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should set userId and apiKey on request and call next when valid', async () => {
      const validApiKey = 'valid-api-key-123'
      const userId = 'user-456'

      mockRequest.headers['x-api-key'] = validApiKey

      const mockApiKeyDoc = {
        key: validApiKey,
        user_id: userId,
      }

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue(mockApiKeyDoc as any)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(ApiKeyModel.findOne).toHaveBeenCalledWith({ key: validApiKey })
      expect(mockRequest.userId).toBe(userId)
      expect(mockRequest.apiKey).toBe(validApiKey)
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('should return 500 when database query throws error', async () => {
      mockRequest.headers['x-api-key'] = 'some-api-key'

      const error = new Error('Database connection failed')
      vi.mocked(ApiKeyModel.findOne).mockRejectedValue(error)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Error validating authentication.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should query database with correct key', async () => {
      const apiKey = 'test-key-789'
      mockRequest.headers['x-api-key'] = apiKey

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue(null)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(ApiKeyModel.findOne).toHaveBeenCalledWith({ key: apiKey })
    })

    it('should call findOne exactly once', async () => {
      mockRequest.headers['x-api-key'] = 'valid-key'

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue({
        key: 'valid-key',
        user_id: 'user-123',
      } as any)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(ApiKeyModel.findOne).toHaveBeenCalledTimes(1)
    })

    it('should not modify request when API key is invalid', async () => {
      mockRequest.headers['x-api-key'] = 'invalid-key'

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue(null)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(mockRequest.userId).toBeUndefined()
      expect(mockRequest.apiKey).toBeUndefined()
    })

    it('should handle API key with special characters', async () => {
      const specialKey = 'key-with-special-chars-@#$%'
      mockRequest.headers['x-api-key'] = specialKey

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue({
        key: specialKey,
        user_id: 'user-123',
      } as any)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(mockRequest.apiKey).toBe(specialKey)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should handle API key with UUID format', async () => {
      const uuidKey = '123e4567-e89b-12d3-a456-426614174000'
      mockRequest.headers['x-api-key'] = uuidKey

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue({
        key: uuidKey,
        user_id: 'user-123',
      } as any)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(mockRequest.apiKey).toBe(uuidKey)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should not call next when API key is missing', async () => {
      mockRequest.headers = {}

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should not call next when API key is invalid', async () => {
      mockRequest.headers['x-api-key'] = 'invalid-key'

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue(null)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should not call next when database error occurs', async () => {
      mockRequest.headers['x-api-key'] = 'some-key'

      vi.mocked(ApiKeyModel.findOne).mockRejectedValue(
        new Error('Database error'),
      )

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should set both userId and apiKey on successful authentication', async () => {
      const apiKey = 'valid-key'
      const userId = 'user-789'

      mockRequest.headers['x-api-key'] = apiKey

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue({
        key: apiKey,
        user_id: userId,
      } as any)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(mockRequest.userId).toBe(userId)
      expect(mockRequest.apiKey).toBe(apiKey)
    })

    it('should handle case-sensitive header name', async () => {
      mockRequest.headers['X-API-KEY'] = 'some-key'

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      // Express normalizes headers to lowercase, so this should fail
      expect(statusMock).toHaveBeenCalledWith(401)
    })

    it('should return early when API key is missing without calling database', async () => {
      mockRequest.headers = {}

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(ApiKeyModel.findOne).not.toHaveBeenCalled()
      expect(statusMock).toHaveBeenCalledWith(401)
    })

    it('should return early when API key is invalid without calling next', async () => {
      mockRequest.headers['x-api-key'] = 'invalid'

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue(null)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(mockNext).not.toHaveBeenCalled()
      expect(statusMock).toHaveBeenCalledWith(401)
    })

    it('should handle database timeout error', async () => {
      mockRequest.headers['x-api-key'] = 'some-key'

      const timeoutError = new Error('Query timeout')
      vi.mocked(ApiKeyModel.findOne).mockRejectedValue(timeoutError)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Error validating authentication.',
      })
    })

    it('should handle database connection error', async () => {
      mockRequest.headers['x-api-key'] = 'some-key'

      const connectionError = new Error('Connection refused')
      vi.mocked(ApiKeyModel.findOne).mockRejectedValue(connectionError)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Error validating authentication.',
      })
    })

    it('should pass correct user_id from database document', async () => {
      const apiKey = 'key-123'
      const expectedUserId = 'user-999'

      mockRequest.headers['x-api-key'] = apiKey

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue({
        key: apiKey,
        user_id: expectedUserId,
      } as any)

      await authenticate(mockRequest, mockResponse as Response, mockNext)

      expect(mockRequest.userId).toBe(expectedUserId)
    })

    it('should be an async function', () => {
      const result = authenticate(
        mockRequest,
        mockResponse as Response,
        mockNext,
      )

      expect(result).toBeInstanceOf(Promise)
    })

    it('should return void promise on success', async () => {
      mockRequest.headers['x-api-key'] = 'valid-key'

      vi.mocked(ApiKeyModel.findOne).mockResolvedValue({
        key: 'valid-key',
        user_id: 'user-123',
      } as any)

      const result = await authenticate(
        mockRequest,
        mockResponse as Response,
        mockNext,
      )

      expect(result).toBeUndefined()
    })

    it('should return void promise on error', async () => {
      mockRequest.headers = {}

      const result = await authenticate(
        mockRequest,
        mockResponse as Response,
        mockNext,
      )

      expect(result).toBeUndefined()
    })
  })
})
