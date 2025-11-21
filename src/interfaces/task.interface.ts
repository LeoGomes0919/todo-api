import { z } from '@/config/zod-openapi'
import {
  createTaskSchema,
  listTasksParamsSchema,
  taskBaseSchema,
  updateTaskSchema,
} from '@/presentation/http/schemas/task.schema'

export interface IApiKey {
  key: string
  user_id: string
}

export interface IPaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next_page: boolean
    has_prev_page: boolean
  }
}

export interface ITask extends z.infer<typeof taskBaseSchema> {}
export interface ICreateTaskDTO
  extends z.infer<typeof createTaskSchema.shape.body> {
  user_id: string
}
export interface IUpdateTaskDTO
  extends z.infer<typeof updateTaskSchema.shape.body> {}
export interface ITaskQuery
  extends z.infer<typeof listTasksParamsSchema.shape.query> {}
