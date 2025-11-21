import { Request, Response } from 'express'
import { IPaginatedResponse, ITask } from '@/interfaces/task.interface'
import { ListTaskController } from '@/presentation/http/controller/task/list-task.controller'
import { TaskService } from '@/services/task.service'

vi.mock('@/services/task.service', () => ({
  TaskService: {
    listTasks: vi.fn(),
  },
}))

describe('src :: presentation :: http :: controller :: task :: list-task.controller', () => {
  let controller: ListTaskController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  const userId = 'user-123'

  const mockTask: ITask = {
    id: 'task-123',
    user_id: userId,
    title: 'Test Task',
    description: 'Test Description',
    done: false,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  const mockPaginatedResponse: IPaginatedResponse<ITask> = {
    data: [mockTask],
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      total_pages: 1,
      has_next_page: false,
      has_prev_page: false,
    },
  }

  beforeEach(() => {
    controller = new ListTaskController()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })

    mockRequest = {
      query: {},
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
    it('should list tasks successfully and return 200', async () => {
      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(userId, {})
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith(mockPaginatedResponse)
    })

    it('should list tasks with pagination filters', async () => {
      mockRequest.query = { page: '2', limit: '20' }

      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(userId, {
        page: '2',
        limit: '20',
      })
    })

    it('should list tasks filtered by done status', async () => {
      mockRequest.query = { done: 'true' }

      const completedTasks: IPaginatedResponse<ITask> = {
        data: [{ ...mockTask, done: true }],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          total_pages: 1,
          has_next_page: false,
          has_prev_page: false,
        },
      }

      vi.mocked(TaskService.listTasks).mockResolvedValue(completedTasks)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(userId, {
        done: 'true',
      })
    })

    it('should list incomplete tasks', async () => {
      mockRequest.query = { done: 'false' }

      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(userId, {
        done: 'false',
      })
    })

    it('should list tasks with multiple filters', async () => {
      mockRequest.query = { done: 'true', page: '2', limit: '5' }

      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(userId, {
        done: 'true',
        page: '2',
        limit: '5',
      })
    })

    it('should return empty list when no tasks found', async () => {
      const emptyResponse: IPaginatedResponse<ITask> = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          total_pages: 0,
          has_next_page: false,
          has_prev_page: false,
        },
      }

      vi.mocked(TaskService.listTasks).mockResolvedValue(emptyResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [],
          meta: expect.objectContaining({
            total: 0,
          }),
        }),
      )
    })

    it('should return paginated response with multiple tasks', async () => {
      const multipleTasks: IPaginatedResponse<ITask> = {
        data: [
          mockTask,
          { ...mockTask, id: 'task-456', title: 'Task 2' },
          { ...mockTask, id: 'task-789', title: 'Task 3' },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 3,
          total_pages: 1,
          has_next_page: false,
          has_prev_page: false,
        },
      }

      vi.mocked(TaskService.listTasks).mockResolvedValue(multipleTasks)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ id: 'task-123' }),
            expect.objectContaining({ id: 'task-456' }),
            expect.objectContaining({ id: 'task-789' }),
          ]),
        }),
      )
    })

    it('should use userId from request', async () => {
      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(
        userId,
        expect.any(Object),
      )
    })

    it('should list tasks for different user', async () => {
      const differentUserId = 'user-999'
      mockRequest.userId = differentUserId

      const userTasks: IPaginatedResponse<ITask> = {
        data: [{ ...mockTask, user_id: differentUserId }],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          total_pages: 1,
          has_next_page: false,
          has_prev_page: false,
        },
      }

      vi.mocked(TaskService.listTasks).mockResolvedValue(userTasks)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(
        differentUserId,
        expect.any(Object),
      )
    })

    it('should return 500 when TaskService.listTasks throws an error', async () => {
      const error = new Error('Database connection failed')

      vi.mocked(TaskService.listTasks).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Database connection failed',
      })
    })

    it('should return 500 when unexpected error occurs', async () => {
      const error = new Error('Unexpected error')

      vi.mocked(TaskService.listTasks).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Unexpected error',
      })
    })

    it('should handle error without message property', async () => {
      const error = { toString: () => 'Unknown error' }

      vi.mocked(TaskService.listTasks).mockRejectedValue(error)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: undefined,
      })
    })

    it('should return meta information with pagination', async () => {
      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            page: expect.any(Number),
            limit: expect.any(Number),
            total: expect.any(Number),
            total_pages: expect.any(Number),
            has_next_page: expect.any(Boolean),
            has_prev_page: expect.any(Boolean),
          }),
        }),
      )
    })

    it('should return has_next_page true when more pages available', async () => {
      const responseWithNextPage: IPaginatedResponse<ITask> = {
        data: [mockTask],
        meta: {
          page: 1,
          limit: 10,
          total: 25,
          total_pages: 3,
          has_next_page: true,
          has_prev_page: false,
        },
      }

      vi.mocked(TaskService.listTasks).mockResolvedValue(responseWithNextPage)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            has_next_page: true,
          }),
        }),
      )
    })

    it('should return has_prev_page true when not on first page', async () => {
      mockRequest.query = { page: '2' }

      const responseWithPrevPage: IPaginatedResponse<ITask> = {
        data: [mockTask],
        meta: {
          page: 2,
          limit: 10,
          total: 25,
          total_pages: 3,
          has_next_page: true,
          has_prev_page: true,
        },
      }

      vi.mocked(TaskService.listTasks).mockResolvedValue(responseWithPrevPage)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            has_prev_page: true,
          }),
        }),
      )
    })

    it('should call status before json', async () => {
      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledBefore(jsonMock)
    })

    it('should call TaskService.listTasks only once', async () => {
      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledTimes(1)
    })

    it('should pass query as filters to TaskService', async () => {
      const filters = { done: 'true', page: '3', limit: '15' }
      mockRequest.query = filters

      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(userId, filters)
    })

    it('should handle empty query object', async () => {
      mockRequest.query = {}

      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(userId, {})
    })

    it('should return tasks with all fields', async () => {
      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              user_id: expect.any(String),
              title: expect.any(String),
              description: expect.any(String),
              done: expect.any(Boolean),
              created_at: expect.any(String),
              updated_at: expect.any(String),
            }),
          ]),
        }),
      )
    })

    it('should handle large page numbers', async () => {
      mockRequest.query = { page: '100' }

      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(userId, {
        page: '100',
      })
    })

    it('should handle custom limit values', async () => {
      mockRequest.query = { limit: '50' }

      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(TaskService.listTasks).toHaveBeenCalledWith(userId, {
        limit: '50',
      })
    })

    it('should not modify query object', async () => {
      const filters = { done: 'true', page: '1' }
      const originalFilters = { ...filters }
      mockRequest.query = filters

      vi.mocked(TaskService.listTasks).mockResolvedValue(mockPaginatedResponse)

      await controller.handle(mockRequest as Request, mockResponse as Response)

      expect(mockRequest.query).toEqual(originalFilters)
    })
  })
})
