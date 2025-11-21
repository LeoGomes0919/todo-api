import { Request, Response } from 'express'
import { TaskService } from '@/services/task.service'

export class DeleteTaskController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const deleted = await TaskService.delete(id, req.userId!)

      if (!deleted) {
        res.status(404).json({
          error: 'Not Found',
          message:
            'Tarefa não encontrada ou você não tem permissão para deletá-la.',
        })
        return
      }

      res.status(204).send()
    } catch (error: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }
}
