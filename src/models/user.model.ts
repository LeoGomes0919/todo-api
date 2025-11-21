import mongoose, { Document, Schema } from 'mongoose'
import { IUser } from '@/interfaces/user.interface'

interface IUserDocument extends Omit<IUser, 'id'>, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
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

export const UserModel = mongoose.model<IUserDocument>('users', userSchema)
