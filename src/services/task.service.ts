import {
  ICreateTaskDTO,
  IPaginatedResponse,
  ITask,
  ITaskQuery,
  IUpdateTaskDTO,
} from '@/interfaces/task.interface'
import { TaskModel } from '@/models/task.model'
import { CacheService } from './cache.service'

export class TaskService {
  static async create(data: ICreateTaskDTO): Promise<ITask> {
    const task = await TaskModel.create({
      user_id: data.user_id,
      title: data.title,
      description: data.description,
    })

    await CacheService.invalidate(data.user_id)

    return task.toJSON() as ITask
  }

  static async listTasks(
    userId: string,
    filters?: ITaskQuery,
  ): Promise<IPaginatedResponse<ITask>> {
    const done =
      filters?.done === undefined ? undefined : filters.done === 'true'
    const page = Math.max(1, filters?.page || 1)
    const limit = Math.min(100, Math.max(1, filters?.limit || 10))

    const cacheKey = { done, page, limit }
    const cached = await CacheService.get(userId, cacheKey)
    if (cached) {
      return cached
    }

    const query: any = { user_id: userId }
    if (done !== undefined) {
      query.done = done
    }

    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      TaskModel.find(query).sort({ created_at: -1 }).skip(skip).limit(limit),
      TaskModel.countDocuments(query),
    ])

    const tasksJson = tasks.map((task) => task.toJSON() as ITask)

    const totalPages = Math.ceil(total / limit)
    const response: IPaginatedResponse<ITask> = {
      data: tasksJson,
      meta: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },
    }

    await CacheService.set(userId, response, cacheKey)

    return response
  }

  static async complete(taskId: string, userId: string): Promise<ITask | null> {
    const task = await TaskModel.findOneAndUpdate(
      { _id: taskId, user_id: userId },
      { $set: { done: true } },
      { new: true, runValidators: true },
    )

    if (task) {
      await CacheService.invalidate(userId)
    }

    return task ? (task.toJSON() as ITask) : null
  }

  static async update(
    taskId: string,
    userId: string,
    data: IUpdateTaskDTO,
  ): Promise<ITask | null> {
    const task = await TaskModel.findOneAndUpdate(
      { _id: taskId, user_id: userId },
      { $set: data },
      { new: true, runValidators: true },
    )

    if (task) {
      await CacheService.invalidate(userId)
    }

    return task ? (task.toJSON() as ITask) : null
  }

  static async delete(taskId: string, userId: string): Promise<boolean> {
    const result = await TaskModel.deleteOne({ _id: taskId, user_id: userId })

    if (result.deletedCount > 0) {
      await CacheService.invalidate(userId)
      return true
    }

    return false
  }
}
