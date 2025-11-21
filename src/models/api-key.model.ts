import mongoose, { Document, Schema } from 'mongoose'
import { IApiKey } from '@/interfaces/task.interface'

export interface IApiKeyDocument extends Omit<IApiKey, 'id'>, Document {}

const apiKeySchema = new Schema<IApiKeyDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

export const ApiKeyModel = mongoose.model<IApiKeyDocument>(
  'api_key',
  apiKeySchema,
)
