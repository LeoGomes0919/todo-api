import { Request, Response } from 'express'
import { IUpdateTaskDTO } from '@/interfaces/task.interface'
import { UpdateTaskController } from '@/presentation/http/controller/task/update-task.controller'
import { TaskService } from '@/services/task.service'

vi.mock('@/services/task.service', () => ({
  TaskService: {
    update: vi.fn(),
  },
}))

describe('src :: presentation :: http :: controller :: task :: update-task.controller', () => {
  let controller: UpdateTaskController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  const userId = 'user-123'
  const taskId = 'task-456'

  beforeEach(() => {
    controller = new UpdateTaskController()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })

    mockRequest = {
      params: { id: taskId },
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
    it('should update task title successfully', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Updated Title',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(
        taskId,
        userId,
        expect.objectContaining({ title: 'Updated Title' }),
      )
      expect(jsonMock).toHaveBeenCalledWith(updatedTask)
    })

    it('should update task description successfully', async () => {
      const updateData: IUpdateTaskDTO = {
        description: 'Updated Description',
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Original Title',
        description: 'Updated Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(
        taskId,
        userId,
        expect.objectContaining({ description: 'Updated Description' }),
      )
      expect(jsonMock).toHaveBeenCalledWith(updatedTask)
    })

    it('should update task done status successfully', async () => {
      const updateData: IUpdateTaskDTO = {
        done: true,
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Original Title',
        description: 'Original Description',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(
        taskId,
        userId,
        expect.objectContaining({ done: true }),
      )
      expect(jsonMock).toHaveBeenCalledWith(updatedTask)
    })

    it('should update multiple fields at once', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
        description: 'Updated Description',
        done: true,
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Updated Title',
        description: 'Updated Description',
        done: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(taskId, userId, {
        title: 'Updated Title',
        description: 'Updated Description',
        done: true,
      })
    })

    it('should return 400 when no data provided', async () => {
      mockRequest.body = {}

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).not.toHaveBeenCalled()
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Nenhum dado fornecido para atualização.',
      })
    })

    it('should return 404 when task not found', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(null)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Not Found',
        message:
          'Tarefa não encontrada ou você não tem permissão para atualizá-la.',
      })
    })

    it('should return 404 when user has no permission', async () => {
      const differentUserId = 'user-999'
      mockRequest.userId = differentUserId

      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(null)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(
        taskId,
        differentUserId,
        expect.any(Object),
      )
      expect(statusMock).toHaveBeenCalledWith(404)
    })

    it('should use task id from params', async () => {
      const differentTaskId = 'task-789'
      mockRequest.params = { id: differentTaskId }

      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }

      const updatedTask = {
        id: differentTaskId,
        user_id: userId,
        title: 'Updated Title',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(
        differentTaskId,
        userId,
        expect.any(Object),
      )
    })

    it('should use userId from request', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Updated Title',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(
        expect.any(String),
        userId,
        expect.any(Object),
      )
    })

    it('should return 500 when TaskService.update throws an error', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }

      const error = new Error('Database connection failed')

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Database connection failed',
      })
    })

    it('should handle error without message property', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }

      const error = { toString: () => 'Unknown error' }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: undefined,
      })
    })

    it('should update task with long title', async () => {
      const longTitle = 'A'.repeat(200)
      const updateData: IUpdateTaskDTO = {
        title: longTitle,
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: longTitle,
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(
        taskId,
        userId,
        expect.objectContaining({ title: longTitle }),
      )
    })

    it('should update task with long description', async () => {
      const longDescription = 'B'.repeat(1000)
      const updateData: IUpdateTaskDTO = {
        description: longDescription,
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Original Title',
        description: longDescription,
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(
        taskId,
        userId,
        expect.objectContaining({ description: longDescription }),
      )
    })

    it('should update task with special characters in title', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Tarefa com çãõ e ñ',
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Tarefa com çãõ e ñ',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tarefa com çãõ e ñ',
        }),
      )
    })

    it('should ignore extra fields in request body', async () => {
      mockRequest.body = {
        title: 'Updated Title',
        extraField: 'should be ignored',
        anotherExtra: 123,
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Updated Title',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(taskId, userId, {
        title: 'Updated Title',
        description: undefined,
        done: undefined,
      })
    })

    it('should return updated task with all fields', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Updated Title',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

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

    it('should only pass defined properties to update', async () => {
      mockRequest.body = { title: 'New Title' }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'New Title',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(taskId, userId, {
        title: 'New Title',
      })
    })

    it('should return early when task not found', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(null)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledTimes(1)
    })

    it('should call TaskService.update only once on success', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Updated Title',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledTimes(1)
    })

    it('should update task to mark as incomplete', async () => {
      const updateData: IUpdateTaskDTO = {
        done: false,
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Original Title',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.update).toHaveBeenCalledWith(
        taskId,
        userId,
        expect.objectContaining({ done: false }),
      )
    })

    it('should not modify request body', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Updated Title',
      }
      const originalBody = { ...updateData }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Updated Title',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(mockRequest.body).toEqual(originalBody)
    })

    it('should handle only title update without description and done', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'Only Title Updated',
      }

      const updatedTask = {
        id: taskId,
        user_id: userId,
        title: 'Only Title Updated',
        description: 'Original Description',
        done: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      mockRequest.body = updateData

      vi.mocked(TaskService.update).mockResolvedValue(updatedTask)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      const updateCall = vi.mocked(TaskService.update).mock.calls[0][2]
      expect(updateCall).toHaveProperty('title', 'Only Title Updated')
    })
  })
})
