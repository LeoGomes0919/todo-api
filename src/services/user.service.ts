import crypto from 'crypto'
import { ICreateUserDTO, IUser } from '@/interfaces/user.interface'
import { ApiKeyModel } from '@/models/api-key.model'
import { UserModel } from '@/models/user.model'

export class UserService {
  static async create(
    data: ICreateUserDTO,
  ): Promise<(IUser & { api_key: string }) | null> {
    const userId = crypto.randomUUID()

    try {
      const user = await UserModel.create({ user_id: userId, name: data.name })

      if (!user) {
        throw new Error('Error creating user')
      }

      const apiKey = crypto.randomBytes(16).toString('hex')
      const apiKeyEntry = await ApiKeyModel.create({
        user_id: userId,
        key: apiKey,
      })

      if (!apiKeyEntry) {
        throw new Error('Error creating API key')
      }

      return {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        api_key: apiKey,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    } catch (error) {
      await UserModel.deleteOne({ user_id: userId })

      throw error
    }
  }
}
