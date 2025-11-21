import { Request, Response } from 'express'
import { CreateTaskController } from '@/presentation/http/controller/task/create-task.controller'
import { TaskService } from '@/services/task.service'

vi.mock('@/services/task.service', () => ({
  TaskService: {
    create: vi.fn(),
  },
}))

describe('src :: presentation :: http :: controller :: task :: create-task.controller', () => {
  let controller: CreateTaskController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  const userId = 'user-123'

  beforeEach(() => {
    controller = new CreateTaskController()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })

    mockRequest = {
      body: {},
      userId: userId,
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
    it('should create a task successfully and return 201', async () => {
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'New Task',
        description: 'Task Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.create).toHaveBeenCalledWith({
        user_id: userId,
        title: requestBody.title,
        description: requestBody.description,
      })
      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith(createdTask)
    })

    it('should create a task without description', async () => {
      const requestBody = {
        title: 'New Task',
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'New Task',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask as any)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.create).toHaveBeenCalledWith({
        user_id: userId,
        title: requestBody.title,
        description: undefined,
      })
      expect(statusMock).toHaveBeenCalledWith(201)
    })

    it('should create a task with long title', async () => {
      const longTitle = 'A'.repeat(200)
      const requestBody = {
        title: longTitle,
        description: 'Task Description',
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: longTitle,
        description: 'Task Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.create).toHaveBeenCalledWith({
        user_id: userId,
        title: longTitle,
        description: requestBody.description,
      })
    })

    it('should create a task with long description', async () => {
      const longDescription = 'B'.repeat(1000)
      const requestBody = {
        title: 'New Task',
        description: longDescription,
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'New Task',
        description: longDescription,
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.create).toHaveBeenCalledWith({
        user_id: userId,
        title: requestBody.title,
        description: longDescription,
      })
    })

    it('should use userId from request', async () => {
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'New Task',
        description: 'Task Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
        }),
      )
    })

    it('should create task with different userId', async () => {
      const differentUserId = 'user-999'
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const createdTask = {
        id: 'task-123',
        user_id: differentUserId,
        title: 'New Task',
        description: 'Task Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody
      mockRequest.userId = differentUserId

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.create).toHaveBeenCalledWith({
        user_id: differentUserId,
        title: requestBody.title,
        description: requestBody.description,
      })
    })

    it('should return task with done false by default', async () => {
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'New Task',
        description: 'Task Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          done: false,
        }),
      )
    })

    it('should return 500 when TaskService.create throws an error', async () => {
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const error = new Error('Database connection failed')

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Database connection failed',
      })
    })

    it('should return 500 when validation error occurs', async () => {
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const error = new Error('Validation failed')

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Validation failed',
      })
    })

    it('should handle error without message property', async () => {
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const error = { toString: () => 'Unknown error' }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: undefined,
      })
    })

    it('should extract title and description from request body', async () => {
      const requestBody = {
        title: 'Test Title',
        description: 'Test Description',
        extraField: 'should not be passed',
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'Test Title',
        description: 'Test Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.create).toHaveBeenCalledWith({
        user_id: userId,
        title: 'Test Title',
        description: 'Test Description',
      })
    })

    it('should return all task fields in response', async () => {
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'New Task',
        description: 'Task Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          user_id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          done: expect.any(Boolean),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      )
    })

    it('should call status before json', async () => {
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'New Task',
        description: 'Task Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledBefore(jsonMock)
    })

    it('should not modify request body', async () => {
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const originalBody = { ...requestBody }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'New Task',
        description: 'Task Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(mockRequest.body).toEqual(originalBody)
    })

    it('should create task with special characters in title', async () => {
      const requestBody = {
        title: 'Tarefa com çãõ e ñ',
        description: 'Task Description',
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'Tarefa com çãõ e ñ',
        description: 'Task Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tarefa com çãõ e ñ',
        }),
      )
    })

    it('should call TaskService.create only once', async () => {
      const requestBody = {
        title: 'New Task',
        description: 'Task Description',
      }

      const createdTask = {
        id: 'task-123',
        user_id: userId,
        title: 'New Task',
        description: 'Task Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = requestBody

      vi.mocked(TaskService.create).mockResolvedValue(createdTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.create).toHaveBeenCalledTimes(1)
    })
  })
})
