import { NextFunction, Request, Response } from 'express'
import { errorHandler } from '@/middleware/error-handler'

describe('src :: middleware :: error-handler', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>
  let consoleErrorSpy: ReturnType<typeof vi.fn>
  let originalNodeEnv: string | undefined

  beforeEach(() => {
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    mockNext = vi.fn()

    mockRequest = {}

    mockResponse = {
      status: statusMock as any,
      json: jsonMock as any,
      headersSent: false,
    }

    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    originalNodeEnv = process.env.NODE_ENV

    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    process.env.NODE_ENV = originalNodeEnv
    vi.restoreAllMocks()
  })

  describe('errorHandler', () => {
    it('should log error to console', () => {
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error)
    })

    it('should return 500 status code', () => {
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(statusMock).toHaveBeenCalledWith(500)
    })

    it('should return error message in development mode', () => {
      process.env.NODE_ENV = 'development'
      const error = new Error('Detailed error message')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Detailed error message',
      })
    })

    it('should return generic message in production mode', () => {
      process.env.NODE_ENV = 'production'
      const error = new Error('Sensitive error message')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An internal error occurred.',
      })
    })

    it('should call next if headers already sent', () => {
      const error = new Error('Test error')
      mockResponse.headersSent = true

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledWith(error)
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('should not call next if headers not sent', () => {
      const error = new Error('Test error')
      mockResponse.headersSent = false

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).not.toHaveBeenCalled()
      expect(statusMock).toHaveBeenCalled()
    })

    it('should not send response when headers already sent', () => {
      const error = new Error('Test error')
      mockResponse.headersSent = true

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).not.toHaveBeenCalled()
    })

    it('should handle Error objects', () => {
      const error = new Error('Standard error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error)
    })

    it('should handle TypeError', () => {
      const error = new TypeError('Type error occurred')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error)
    })

    it('should handle ReferenceError', () => {
      const error = new ReferenceError('Reference error occurred')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error)
    })

    it('should return error name as "Internal Server Error"', () => {
      process.env.NODE_ENV = 'production'
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal Server Error',
        }),
      )
    })

    it('should not expose error stack in production', () => {
      process.env.NODE_ENV = 'production'
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An internal error occurred.',
      })
    })

    it('should expose error message in development', () => {
      process.env.NODE_ENV = 'development'
      const errorMessage = 'Database connection failed'
      const error = new Error(errorMessage)

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: errorMessage,
      })
    })

    it('should handle error with empty message', () => {
      process.env.NODE_ENV = 'development'
      const error = new Error('')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: '',
      })
    })

    it('should handle error when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An internal error occurred.',
      })
    })

    it('should handle error when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'An internal error occurred.',
      })
    })

    it('should log error before checking headersSent', () => {
      const error = new Error('Test error')
      mockResponse.headersSent = true

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should call status before json', () => {
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(statusMock).toHaveBeenCalledBefore(jsonMock)
    })

    it('should always return status 500', () => {
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(statusMock).not.toHaveBeenCalledWith(400)
      expect(statusMock).not.toHaveBeenCalledWith(404)
    })

    it('should pass error to next when headers sent', () => {
      const error = new Error('Test error')
      mockResponse.headersSent = true

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledWith(error)
    })

    it('should not modify the error object', () => {
      const error = new Error('Test error')
      const originalMessage = error.message

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(error.message).toBe(originalMessage)
    })

    it('should handle multiple errors sequentially', () => {
      const error1 = new Error('First error')
      const error2 = new Error('Second error')

      errorHandler(
        error1,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )
      errorHandler(
        error2,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2)
      expect(statusMock).toHaveBeenCalledTimes(2)
    })

    it('should not crash when error is logged', () => {
      const error = new Error('Test error')

      expect(() => {
        errorHandler(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        )
      }).not.toThrow()
    })

    it('should return void', () => {
      const error = new Error('Test error')

      const result = errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(result).toBeUndefined()
    })

    it('should handle error with special characters in message', () => {
      process.env.NODE_ENV = 'development'
      const error = new Error('Error with special chars: @#$%^&*()')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Error with special chars: @#$%^&*()',
      })
    })

    it('should handle error with unicode characters', () => {
      process.env.NODE_ENV = 'development'
      const error = new Error('Erro com caracteres especiais: é, ã, ç')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Erro com caracteres especiais: é, ã, ç',
      })
    })

    it('should call json exactly once when headers not sent', () => {
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledTimes(1)
    })

    it('should call status exactly once when headers not sent', () => {
      const error = new Error('Test error')

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(statusMock).toHaveBeenCalledTimes(1)
    })

    it('should handle long error messages in development', () => {
      process.env.NODE_ENV = 'development'
      const longMessage = 'a'.repeat(1000)
      const error = new Error(longMessage)

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: longMessage,
      })
    })

    it('should always use generic message in non-development environments', () => {
      const environments = ['production', 'test', 'staging', '']

      environments.forEach((env) => {
        process.env.NODE_ENV = env
        const error = new Error('Sensitive information')

        errorHandler(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        )

        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Internal Server Error',
          message: 'An internal error occurred.',
        })

        vi.clearAllMocks()
      })
    })
  })
})
