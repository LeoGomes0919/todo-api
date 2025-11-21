import { Request, Response } from 'express'
import { ICreateTaskDTO } from '@/interfaces/task.interface'
import { TaskService } from '@/services/task.service'

export class CreateTaskController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { title, description } = req.body as ICreateTaskDTO

      const task = await TaskService.create({
        user_id: req.userId!,
        title,
        description,
      })

      res.status(201).json(task)
    } catch (error: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }
}
