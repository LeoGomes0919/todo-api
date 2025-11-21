import { Request, Response } from 'express'
import { ICreateUserDTO } from '@/interfaces/user.interface'
import { CreateUserController } from '@/presentation/http/controller/user/create-user.controller'
import { UserService } from '@/services/user.service'

vi.mock('@/services/user.service', () => ({
  UserService: {
    create: vi.fn(),
  },
}))

describe('src :: presentation :: http :: controller :: user :: create-user.controller', () => {
  let controller: CreateUserController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    controller = new CreateUserController()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })

    mockRequest = {
      body: {},
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

  describe('handle', () => {
    it('should create a user successfully and return 201', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'John Doe',
      }

      const createdUser = {
        id: 'user-id-123',
        user_id: 'user-uuid-123',
        name: 'John Doe',
        api_key: 'abc123def456',
        created_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        updated_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      }

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockResolvedValue(createdUser)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(UserService.create).toHaveBeenCalledWith(createUserDTO)
      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith(createdUser)
    })

    it('should create a user with a long name', async () => {
      const longName = 'A'.repeat(200)
      const createUserDTO: ICreateUserDTO = {
        name: longName,
      }

      const createdUser = {
        id: 'user-id-123',
        user_id: 'user-uuid-123',
        name: longName,
        api_key: 'abc123def456',
        created_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        updated_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      }

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockResolvedValue(createdUser)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(UserService.create).toHaveBeenCalledWith(createUserDTO)
      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith(createdUser)
    })

    it('should create a user with special characters in name', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'José da Silva Júnior (Zé)',
      }

      const createdUser = {
        id: 'user-id-123',
        user_id: 'user-uuid-123',
        name: 'José da Silva Júnior (Zé)',
        api_key: 'abc123def456',
        created_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        updated_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      }

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockResolvedValue(createdUser)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(UserService.create).toHaveBeenCalledWith(createUserDTO)
      expect(statusMock).toHaveBeenCalledWith(201)
    })

    it('should return user with api_key in response', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'John Doe',
      }

      const createdUser = {
        id: 'user-id-123',
        user_id: 'user-uuid-123',
        name: 'John Doe',
        api_key: 'generated-api-key',
        created_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        updated_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      }

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockResolvedValue(createdUser)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          api_key: expect.any(String),
        }),
      )
    })

    it('should return 500 when UserService.create throws an error', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'John Doe',
      }

      const error = new Error('Database connection failed')

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Database connection failed',
      })
    })

    it('should return 500 when UserService.create throws error creating user', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'John Doe',
      }

      const error = new Error('Error creating user')

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Error creating user',
      })
    })

    it('should return 500 when UserService.create throws error creating API key', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'John Doe',
      }

      const error = new Error('Error creating API key')

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Error creating API key',
      })
    })

    it('should handle duplicate user error', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'John Doe',
      }

      const error = new Error('Duplicate key error')
      ;(error as any).code = 11000

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Duplicate key error',
      })
    })

    it('should handle error without message property', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'John Doe',
      }

      const error = { toString: () => 'Unknown error' }

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: undefined,
      })
    })

    it('should pass exact request body to UserService.create', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'Test User',
      }

      const createdUser = {
        id: 'user-id-123',
        user_id: 'user-uuid-123',
        name: 'Test User',
        api_key: 'abc123def456',
        created_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        updated_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      }

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockResolvedValue(createdUser)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(UserService.create).toHaveBeenCalledTimes(1)
      expect(UserService.create).toHaveBeenCalledWith(createUserDTO)
    })

    it('should return all user fields in response', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'John Doe',
      }

      const createdUser = {
        id: 'user-id-123',
        user_id: 'user-uuid-123',
        name: 'John Doe',
        api_key: 'abc123def456',
        created_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        updated_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      }

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockResolvedValue(createdUser)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          user_id: expect.any(String),
          name: expect.any(String),
          api_key: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      )
    })

    it('should not modify request body', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'John Doe',
      }

      const originalBody = { ...createUserDTO }

      const createdUser = {
        id: 'user-id-123',
        user_id: 'user-uuid-123',
        name: 'John Doe',
        api_key: 'abc123def456',
        created_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        updated_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      }

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockResolvedValue(createdUser)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(mockRequest.body).toEqual(originalBody)
    })

    it('should call status and json in correct order', async () => {
      const createUserDTO: ICreateUserDTO = {
        name: 'John Doe',
      }

      const createdUser = {
        id: 'user-id-123',
        user_id: 'user-uuid-123',
        name: 'John Doe',
        api_key: 'abc123def456',
        created_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        updated_at: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      }

      mockRequest.body = createUserDTO

      vi.mocked(UserService.create).mockResolvedValue(createdUser)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledBefore(jsonMock)
    })
  })
})
