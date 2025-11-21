import {
  ICreateTaskDTO,
  IPaginatedResponse,
  ITask,
  ITaskQuery,
  IUpdateTaskDTO,
} from '@/interfaces/task.interface'
import { TaskModel } from '@/models/task.model'
import { CacheService } from '@/services/cache.service'
import { TaskService } from '@/services/task.service'

vi.mock('@/models/task.model', () => ({
  TaskModel: {
    create: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
  },
}))

vi.mock('@/services/cache.service', () => ({
  CacheService: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
  },
}))

describe('src :: services :: task.service', () => {
  const userId = crypto.randomUUID()
  const taskId = 'task-456'

  const mockTask: ITask = {
    id: taskId,
    user_id: userId,
    title: 'Test Task',
    description: 'Test Description',
    done: false,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  const mockTaskDocument = {
    ...mockTask,
    toJSON: vi.fn().mockReturnValue(mockTask),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('create', () => {
    it('should create a task successfully', async () => {
      const createTaskDTO: ICreateTaskDTO = {
        user_id: userId,
        title: 'New Task',
        description: 'New Description',
      }

      vi.mocked(TaskModel.create).mockResolvedValue(mockTaskDocument as any)
      vi.mocked(CacheService.invalidate).mockResolvedValue(undefined)

      const result = await TaskService.create(createTaskDTO)

      expect(TaskModel.create).toHaveBeenCalledWith({
        user_id: createTaskDTO.user_id,
        title: createTaskDTO.title,
        description: createTaskDTO.description,
      })
      expect(CacheService.invalidate).toHaveBeenCalledWith(userId)
      expect(result).toEqual(mockTask)
    })

    it('should create a task without description', async () => {
      const createTaskDTO: ICreateTaskDTO = {
        user_id: userId,
        title: 'Task without description',
      }

      const taskWithoutDescription = {
        ...mockTask,
        description: undefined,
      }

      const docWithoutDescription = {
        ...taskWithoutDescription,
        toJSON: vi.fn().mockReturnValue(taskWithoutDescription),
      }

      vi.mocked(TaskModel.create).mockResolvedValue(
        docWithoutDescription as any,
      )
      vi.mocked(CacheService.invalidate).mockResolvedValue(undefined)

      const result = await TaskService.create(createTaskDTO)

      expect(TaskModel.create).toHaveBeenCalledWith({
        user_id: createTaskDTO.user_id,
        title: createTaskDTO.title,
        description: undefined,
      })
      expect(result.description).toBeUndefined()
    })

    it('should invalidate cache after creating task', async () => {
      const createTaskDTO: ICreateTaskDTO = {
        user_id: userId,
        title: 'New Task',
        description: 'New Description',
      }

      vi.mocked(TaskModel.create).mockResolvedValue(mockTaskDocument as any)
      vi.mocked(CacheService.invalidate).mockResolvedValue(undefined)

      await TaskService.create(createTaskDTO)

      expect(CacheService.invalidate).toHaveBeenCalledTimes(1)
      expect(CacheService.invalidate).toHaveBeenCalledWith(userId)
    })

    it('should throw error when task creation fails', async () => {
      const createTaskDTO: ICreateTaskDTO = {
        user_id: userId,
        title: 'New Task',
      }

      const error = new Error('Database error')
      vi.mocked(TaskModel.create).mockRejectedValue(error)

      await expect(TaskService.create(createTaskDTO)).rejects.toThrow(error)
      expect(CacheService.invalidate).not.toHaveBeenCalled()
    })
  })

  describe('listTasks', () => {
    it('should return cached tasks if available', async () => {
      const cachedResponse: IPaginatedResponse<ITask> = {
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

      vi.mocked(CacheService.get).mockResolvedValue(cachedResponse)

      const result = await TaskService.listTasks(userId)

      expect(CacheService.get).toHaveBeenCalledWith(userId, {
        done: undefined,
        page: 1,
        limit: 10,
      })
      expect(result).toEqual(cachedResponse)
      expect(TaskModel.find).not.toHaveBeenCalled()
    })

    it('should fetch tasks from database when cache is empty', async () => {
      vi.mocked(CacheService.get).mockResolvedValue(null)
      vi.mocked(TaskModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockTaskDocument]),
          }),
        }),
      } as any)
      vi.mocked(TaskModel.countDocuments).mockResolvedValue(1)
      vi.mocked(CacheService.set).mockResolvedValue(undefined)

      const result = await TaskService.listTasks(userId)

      expect(TaskModel.find).toHaveBeenCalledWith({ user_id: userId })
      expect(TaskModel.countDocuments).toHaveBeenCalledWith({ user_id: userId })
      expect(result.data).toEqual([mockTask])
      expect(result.meta.total).toBe(1)
    })

    it('should filter tasks by done status', async () => {
      const filters: ITaskQuery = { done: 'true', page: 1, limit: 10 }

      vi.mocked(CacheService.get).mockResolvedValue(null)
      vi.mocked(TaskModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockTaskDocument]),
          }),
        }),
      } as any)
      vi.mocked(TaskModel.countDocuments).mockResolvedValue(1)
      vi.mocked(CacheService.set).mockResolvedValue(undefined)

      await TaskService.listTasks(userId, filters)

      expect(TaskModel.find).toHaveBeenCalledWith({
        user_id: userId,
        done: true,
      })
    })

    it('should handle pagination correctly', async () => {
      const filters: ITaskQuery = { page: 2, limit: 5 }

      vi.mocked(CacheService.get).mockResolvedValue(null)
      vi.mocked(TaskModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockTaskDocument]),
          }),
        }),
      } as any)
      vi.mocked(TaskModel.countDocuments).mockResolvedValue(10)
      vi.mocked(CacheService.set).mockResolvedValue(undefined)

      const result = await TaskService.listTasks(userId, filters)

      expect(result.meta.page).toBe(2)
      expect(result.meta.limit).toBe(5)
      expect(result.meta.total).toBe(10)
      expect(result.meta.total_pages).toBe(2)
      expect(result.meta.has_next_page).toBe(false)
      expect(result.meta.has_prev_page).toBe(true)
    })

    it('should enforce minimum page value of 1', async () => {
      const filters: ITaskQuery = { page: 0, limit: 10 }

      vi.mocked(CacheService.get).mockResolvedValue(null)
      vi.mocked(TaskModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any)
      vi.mocked(TaskModel.countDocuments).mockResolvedValue(0)

      const result = await TaskService.listTasks(userId, filters)

      expect(result.meta.page).toBe(1)
    })

    it('should enforce maximum limit value of 100', async () => {
      const filters: ITaskQuery = { limit: 200, page: 1 }

      vi.mocked(CacheService.get).mockResolvedValue(null)
      vi.mocked(TaskModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any)
      vi.mocked(TaskModel.countDocuments).mockResolvedValue(0)

      const result = await TaskService.listTasks(userId, filters)

      expect(result.meta.limit).toBe(100)
    })

    it('should cache the result after fetching from database', async () => {
      vi.mocked(CacheService.get).mockResolvedValue(null)
      vi.mocked(TaskModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockTaskDocument]),
          }),
        }),
      } as any)
      vi.mocked(TaskModel.countDocuments).mockResolvedValue(1)
      vi.mocked(CacheService.set).mockResolvedValue(undefined)

      const result = await TaskService.listTasks(userId)

      expect(CacheService.set).toHaveBeenCalledWith(userId, result, {
        done: undefined,
        page: 1,
        limit: 10,
      })
    })

    it('should calculate skip value correctly for pagination', async () => {
      const filters: ITaskQuery = { page: 3, limit: 5 }

      vi.mocked(CacheService.get).mockResolvedValue(null)

      const skipMock = vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([mockTaskDocument]),
      })

      vi.mocked(TaskModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: skipMock,
        }),
      } as any)

      vi.mocked(TaskModel.countDocuments).mockResolvedValue(15)

      await TaskService.listTasks(userId, filters)

      expect(skipMock).toHaveBeenCalledWith(10)
    })

    it('should return empty array when no tasks found', async () => {
      vi.mocked(CacheService.get).mockResolvedValue(null)
      vi.mocked(TaskModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any)
      vi.mocked(TaskModel.countDocuments).mockResolvedValue(0)

      const result = await TaskService.listTasks(userId)

      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
      expect(result.meta.total_pages).toBe(0)
    })
  })

  describe('complete', () => {
    it('should complete a task successfully', async () => {
      const completedTask = { ...mockTask, done: true }
      const completedTaskDoc = {
        ...completedTask,
        toJSON: vi.fn().mockReturnValue(completedTask),
      }

      vi.mocked(TaskModel.findOneAndUpdate).mockResolvedValue(
        completedTaskDoc as any,
      )
      vi.mocked(CacheService.invalidate).mockResolvedValue(undefined)

      const result = await TaskService.complete(taskId, userId)

      expect(TaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskId, user_id: userId },
        { $set: { done: true } },
        { new: true, runValidators: true },
      )
      expect(CacheService.invalidate).toHaveBeenCalledWith(userId)
      expect(result).toEqual(completedTask)
      expect(result?.done).toBe(true)
    })

    it('should return null when task not found', async () => {
      vi.mocked(TaskModel.findOneAndUpdate).mockResolvedValue(null)

      const result = await TaskService.complete(taskId, userId)

      expect(result).toBeNull()
      expect(CacheService.invalidate).not.toHaveBeenCalled()
    })

    it('should not invalidate cache when task not found', async () => {
      vi.mocked(TaskModel.findOneAndUpdate).mockResolvedValue(null)

      await TaskService.complete(taskId, userId)

      expect(CacheService.invalidate).not.toHaveBeenCalled()
    })

    it('should complete task for correct user only', async () => {
      const differentUserId = 'user-999'

      vi.mocked(TaskModel.findOneAndUpdate).mockResolvedValue(null)

      const result = await TaskService.complete(taskId, differentUserId)

      expect(TaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskId, user_id: differentUserId },
        { $set: { done: true } },
        { new: true, runValidators: true },
      )
      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should update task title successfully', async () => {
      const updateData: IUpdateTaskDTO = { title: 'Updated Title' }
      const updatedTask = { ...mockTask, title: 'Updated Title' }
      const updatedTaskDoc = {
        ...updatedTask,
        toJSON: vi.fn().mockReturnValue(updatedTask),
      }

      vi.mocked(TaskModel.findOneAndUpdate).mockResolvedValue(
        updatedTaskDoc as any,
      )
      vi.mocked(CacheService.invalidate).mockResolvedValue(undefined)

      const result = await TaskService.update(taskId, userId, updateData)

      expect(TaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskId, user_id: userId },
        { $set: updateData },
        { new: true, runValidators: true },
      )
      expect(result).toEqual(updatedTask)
      expect(result?.title).toBe('Updated Title')
    })

    it('should update task description successfully', async () => {
      const updateData: IUpdateTaskDTO = { description: 'Updated Description' }
      const updatedTask = { ...mockTask, description: 'Updated Description' }
      const updatedTaskDoc = {
        ...updatedTask,
        toJSON: vi.fn().mockReturnValue(updatedTask),
      }

      vi.mocked(TaskModel.findOneAndUpdate).mockResolvedValue(
        updatedTaskDoc as any,
      )
      vi.mocked(CacheService.invalidate).mockResolvedValue(undefined)

      const result = await TaskService.update(taskId, userId, updateData)

      expect(result?.description).toBe('Updated Description')
    })

    it('should update multiple fields at once', async () => {
      const updateData: IUpdateTaskDTO = {
        title: 'New Title',
        description: 'New Description',
      }
      const updatedTask = {
        ...mockTask,
        title: 'New Title',
        description: 'New Description',
      }
      const updatedTaskDoc = {
        ...updatedTask,
        toJSON: vi.fn().mockReturnValue(updatedTask),
      }

      vi.mocked(TaskModel.findOneAndUpdate).mockResolvedValue(
        updatedTaskDoc as any,
      )
      vi.mocked(CacheService.invalidate).mockResolvedValue(undefined)

      const result = await TaskService.update(taskId, userId, updateData)

      expect(result?.title).toBe('New Title')
      expect(result?.description).toBe('New Description')
    })

    it('should return null when task not found', async () => {
      const updateData: IUpdateTaskDTO = { title: 'Updated Title' }

      vi.mocked(TaskModel.findOneAndUpdate).mockResolvedValue(null)

      const result = await TaskService.update(taskId, userId, updateData)

      expect(result).toBeNull()
      expect(CacheService.invalidate).not.toHaveBeenCalled()
    })

    it('should invalidate cache after successful update', async () => {
      const updateData: IUpdateTaskDTO = { title: 'Updated Title' }
      const updatedTaskDoc = {
        ...mockTask,
        toJSON: vi.fn().mockReturnValue(mockTask),
      }

      vi.mocked(TaskModel.findOneAndUpdate).mockResolvedValue(
        updatedTaskDoc as any,
      )
      vi.mocked(CacheService.invalidate).mockResolvedValue(undefined)

      await TaskService.update(taskId, userId, updateData)

      expect(CacheService.invalidate).toHaveBeenCalledTimes(1)
      expect(CacheService.invalidate).toHaveBeenCalledWith(userId)
    })

    it('should update task for correct user only', async () => {
      const differentUserId = 'user-999'
      const updateData: IUpdateTaskDTO = { title: 'Updated Title' }

      vi.mocked(TaskModel.findOneAndUpdate).mockResolvedValue(null)

      const result = await TaskService.update(
        taskId,
        differentUserId,
        updateData,
      )

      expect(TaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: taskId, user_id: differentUserId },
        { $set: updateData },
        { new: true, runValidators: true },
      )
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete task successfully', async () => {
      vi.mocked(TaskModel.deleteOne).mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      } as any)
      vi.mocked(CacheService.invalidate).mockResolvedValue(undefined)

      const result = await TaskService.delete(taskId, userId)

      expect(TaskModel.deleteOne).toHaveBeenCalledWith({
        _id: taskId,
        user_id: userId,
      })
      expect(CacheService.invalidate).toHaveBeenCalledWith(userId)
      expect(result).toBe(true)
    })

    it('should return false when task not found', async () => {
      vi.mocked(TaskModel.deleteOne).mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      } as any)

      const result = await TaskService.delete(taskId, userId)

      expect(result).toBe(false)
      expect(CacheService.invalidate).not.toHaveBeenCalled()
    })

    it('should not invalidate cache when task not found', async () => {
      vi.mocked(TaskModel.deleteOne).mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      } as any)

      await TaskService.delete(taskId, userId)

      expect(CacheService.invalidate).not.toHaveBeenCalled()
    })

    it('should delete task for correct user only', async () => {
      const differentUserId = 'user-999'

      vi.mocked(TaskModel.deleteOne).mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      } as any)

      const result = await TaskService.delete(taskId, differentUserId)

      expect(TaskModel.deleteOne).toHaveBeenCalledWith({
        _id: taskId,
        user_id: differentUserId,
      })
      expect(result).toBe(false)
    })

    it('should invalidate cache only after successful deletion', async () => {
      vi.mocked(TaskModel.deleteOne).mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      } as any)
      vi.mocked(CacheService.invalidate).mockResolvedValue(undefined)

      await TaskService.delete(taskId, userId)

      expect(CacheService.invalidate).toHaveBeenCalledTimes(1)
    })
  })
})
