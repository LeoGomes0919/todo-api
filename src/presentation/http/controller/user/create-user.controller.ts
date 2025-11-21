import { Request, Response } from 'express'
import { ICreateUserDTO } from '@/interfaces/user.interface'
import { UserService } from '@/services/user.service'

export class CreateUserController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as ICreateUserDTO

      const user = await UserService.create(data)

      res.status(201).json(user)
    } catch (error: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }
}
