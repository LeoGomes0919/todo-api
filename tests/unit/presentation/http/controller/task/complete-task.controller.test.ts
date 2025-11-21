import { Request, Response } from 'express'
import { CompleteTaskController } from '@/presentation/http/controller/task/complete-task.controller'
import { TaskService } from '@/services/task.service'

vi.mock('@/services/task.service', () => ({
  TaskService: {
    complete: vi.fn(),
  },
}))

describe('src :: presentation :: http :: controller :: task :: complete-task.controller', () => {
  let controller: CompleteTaskController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  const userId = 'user-123'
  const taskId = 'task-456'

  beforeEach(() => {
    controller = new CompleteTaskController()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })

    mockRequest = {
      params: { id: taskId },
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
    it('should complete a task successfully and return 200', async () => {
      const completedTask = {
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        description: 'Test Description',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.complete).mockResolvedValue(completedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.complete).toHaveBeenCalledWith(taskId, userId)
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith(completedTask)
    })

    it('should return completed task with done true', async () => {
      const completedTask = {
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        description: 'Test Description',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.complete).mockResolvedValue(completedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          done: true,
        }),
      )
    })

    it('should return 404 when task not found', async () => {
      vi.mocked(TaskService.complete).mockResolvedValue(null)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.complete).toHaveBeenCalledWith(taskId, userId)
      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Not Found',
        message:
          'Tarefa não encontrada ou você não tem permissão para completá-la.',
      })
    })

    it('should return 404 when user has no permission', async () => {
      const differentUserId = 'user-999'
      mockRequest.userId = differentUserId

      vi.mocked(TaskService.complete).mockResolvedValue(null)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.complete).toHaveBeenCalledWith(taskId, differentUserId)
      expect(statusMock).toHaveBeenCalledWith(404)
    })

    it('should use task id from params', async () => {
      const differentTaskId = 'task-789'
      mockRequest.params = { id: differentTaskId }

      const completedTask = {
        id: differentTaskId,
        user_id: userId,
        title: 'Test Task',
        description: 'Test Description',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.complete).mockResolvedValue(completedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.complete).toHaveBeenCalledWith(differentTaskId, userId)
    })

    it('should use userId from request', async () => {
      const completedTask = {
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        description: 'Test Description',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.complete).mockResolvedValue(completedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.complete).toHaveBeenCalledWith(
        expect.any(String),
        userId,
      )
    })

    it('should return 500 when TaskService.complete throws an error', async () => {
      const error = new Error('Database connection failed')

      vi.mocked(TaskService.complete).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Database connection failed',
      })
    })

    it('should return 500 when unexpected error occurs', async () => {
      const error = new Error('Unexpected error')

      vi.mocked(TaskService.complete).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Unexpected error',
      })
    })

    it('should handle error without message property', async () => {
      const error = { toString: () => 'Unknown error' }

      vi.mocked(TaskService.complete).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: undefined,
      })
    })

    it('should return task with all fields', async () => {
      const completedTask = {
        id: taskId,
        user_id: userId,
        title: 'Complete Task',
        description: 'Complete Description',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.complete).mockResolvedValue(completedTask)

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

    it('should not call json twice on success', async () => {
      const completedTask = {
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        description: 'Test Description',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.complete).mockResolvedValue(completedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledTimes(1)
    })

    it('should not call json twice on not found', async () => {
      vi.mocked(TaskService.complete).mockResolvedValue(null)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledTimes(1)
    })

    it('should call status before json on success', async () => {
      const completedTask = {
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        description: 'Test Description',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.complete).mockResolvedValue(completedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledBefore(jsonMock)
    })

    it('should call status before json on not found', async () => {
      vi.mocked(TaskService.complete).mockResolvedValue(null)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledBefore(jsonMock)
    })

    it('should complete task without description', async () => {
      const completedTask = {
        id: taskId,
        user_id: userId,
        title: 'Test Task',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.complete).mockResolvedValue(completedTask as any)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith(completedTask)
    })

    it('should handle task with long title', async () => {
      const longTitle = 'A'.repeat(200)
      const completedTask = {
        id: taskId,
        user_id: userId,
        title: longTitle,
        description: 'Test Description',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.complete).mockResolvedValue(completedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: longTitle,
        }),
      )
    })

    it('should return early when task not found', async () => {
      vi.mocked(TaskService.complete).mockResolvedValue(null)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(statusMock).not.toHaveBeenCalledWith(200)
    })
  })
})
