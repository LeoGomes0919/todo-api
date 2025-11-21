import { Request, Response } from 'express'
import { ITaskQuery } from '@/interfaces/task.interface'
import { TaskService } from '@/services/task.service'

export class ListTaskController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query as unknown as ITaskQuery

      const data = await TaskService.listTasks(req.userId!, filters)

      res.status(200).json(data)
    } catch (error: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }
}
