import { Request, Response } from 'express'
import { TaskService } from '@/services/task.service'

export class CompleteTaskController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const completed = await TaskService.complete(id, req.userId!)

      if (!completed) {
        res.status(404).json({
          error: 'Not Found',
          message:
            'Tarefa não encontrada ou você não tem permissão para completá-la.',
        })
        return
      }

      res.status(200).json(completed)
    } catch (error: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }
}
