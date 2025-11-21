import mongoose, { Document, Schema } from 'mongoose'
import { ITask } from '@/interfaces/task.interface'

interface ITaskDocument extends Omit<ITask, 'id'>, Document {}

const taskSchema = new Schema<ITaskDocument>(
  {
    user_id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id
        delete (ret as any)._id
      },
    },
  },
)

taskSchema.index({ user_id: 1 })
taskSchema.index({ done: 1 })
taskSchema.index({ user_id: 1, done: 1 })
taskSchema.index({ user_id: 1, created_at: -1 })

export const TaskModel = mongoose.model<ITaskDocument>('task', taskSchema)
