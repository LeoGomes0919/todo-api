import { z } from '@/config/zod-openapi'
import {
  createUserSchema,
  userBaseSchema,
} from '@/presentation/http/schemas/user.schema'

export interface IUser extends z.infer<typeof userBaseSchema> {}
export interface ICreateUserDTO
  extends z.infer<typeof createUserSchema.shape.body> {}
