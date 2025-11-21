import { Request, Response } from 'express'
import { DeleteTaskController } from '@/presentation/http/controller/task/delete-task.controller'
import { TaskService } from '@/services/task.service'

vi.mock('@/services/task.service', () => ({
  TaskService: {
    delete: vi.fn(),
  },
}))

describe('src :: presentation :: http :: controller :: task :: delete-task.controller', () => {
  let controller: DeleteTaskController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>
  let sendMock: ReturnType<typeof vi.fn>

  const userId = 'user-123'
  const taskId = 'task-456'

  beforeEach(() => {
    controller = new DeleteTaskController()
    jsonMock = vi.fn()
    sendMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock, send: sendMock })

    mockRequest = {
      params: { id: taskId },
      userId: userId,
    }

    mockResponse = {
      status: statusMock as any,
      json: jsonMock as any,
      send: sendMock as any,
    }

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('handle', () => {
    it('should delete a task successfully and return 204', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.delete).toHaveBeenCalledWith(taskId, userId)
      expect(statusMock).toHaveBeenCalledWith(204)
      expect(sendMock).toHaveBeenCalled()
      expect(jsonMock).not.toHaveBeenCalled()
    })

    it('should return 404 when task not found', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(false)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.delete).toHaveBeenCalledWith(taskId, userId)
      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Not Found',
        message:
          'Tarefa não encontrada ou você não tem permissão para deletá-la.',
      })
      expect(sendMock).not.toHaveBeenCalled()
    })

    it('should return 404 when user has no permission', async () => {
      const differentUserId = 'user-999'
      mockRequest.userId = differentUserId

      vi.mocked(TaskService.delete).mockResolvedValue(false)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.delete).toHaveBeenCalledWith(taskId, differentUserId)
      expect(statusMock).toHaveBeenCalledWith(404)
    })

    it('should use task id from params', async () => {
      const differentTaskId = 'task-789'
      mockRequest.params = { id: differentTaskId }

      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.delete).toHaveBeenCalledWith(differentTaskId, userId)
    })

    it('should use userId from request', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.delete).toHaveBeenCalledWith(
        expect.any(String),
        userId,
      )
    })

    it('should return 500 when TaskService.delete throws an error', async () => {
      const error = new Error('Database connection failed')

      vi.mocked(TaskService.delete).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Database connection failed',
      })
    })

    it('should return 500 when unexpected error occurs', async () => {
      const error = new Error('Unexpected error')

      vi.mocked(TaskService.delete).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Unexpected error',
      })
    })

    it('should handle error without message property', async () => {
      const error = { toString: () => 'Unknown error' }

      vi.mocked(TaskService.delete).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: undefined,
      })
    })

    it('should not call send when task not found', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(false)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(sendMock).not.toHaveBeenCalled()
    })

    it('should not call json when task deleted successfully', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).not.toHaveBeenCalled()
    })

    it('should call status before send on success', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledBefore(sendMock)
    })

    it('should call status before json on not found', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(false)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledBefore(jsonMock)
    })

    it('should return early when task not found', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(false)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(statusMock).not.toHaveBeenCalledWith(204)
    })

    it('should call TaskService.delete only once', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.delete).toHaveBeenCalledTimes(1)
    })

    it('should handle deletion of multiple different tasks', async () => {
      const task1 = 'task-111'
      const task2 = 'task-222'

      mockRequest.params = { id: task1 }
      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.delete).toHaveBeenCalledWith(task1, userId)

      vi.clearAllMocks()

      mockRequest.params = { id: task2 }
      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.delete).toHaveBeenCalledWith(task2, userId)
    })

    it('should not call send twice on success', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(sendMock).toHaveBeenCalledTimes(1)
    })

    it('should not call json twice on not found', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(false)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledTimes(1)
    })

    it('should handle concurrent delete requests for different users', async () => {
      const user1 = 'user-111'
      const user2 = 'user-222'

      mockRequest.userId = user1
      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.delete).toHaveBeenCalledWith(taskId, user1)

      vi.clearAllMocks()

      mockRequest.userId = user2
      vi.mocked(TaskService.delete).mockResolvedValue(false)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.delete).toHaveBeenCalledWith(taskId, user2)
      expect(statusMock).toHaveBeenCalledWith(404)
    })

    it('should send empty response body on successful deletion', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(true)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(sendMock).toHaveBeenCalledWith()
      expect(sendMock).toHaveBeenCalledWith()
    })

    it('should include proper error message for not found', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(false)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Not Found',
          message: expect.stringContaining('Tarefa não encontrada'),
        }),
      )
    })

    it('should not throw when TaskService.delete returns false', async () => {
      vi.mocked(TaskService.delete).mockResolvedValue(false)

      await expect(
        controller.handle(mockRequest as Request, mockResponse as Response),
      ).resolves.not.toThrow()
    })
  })
})
