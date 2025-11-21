import { Request, Response } from 'express'
import { IUpdateTaskDTO } from '@/interfaces/task.interface'
import { TaskService } from '@/services/task.service'

export class UpdateTaskController {
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { title, description, done } = req.body as IUpdateTaskDTO

      const updateData: IUpdateTaskDTO = {}

      if (title !== undefined) {
        updateData.title = title
      }
      if (description !== undefined) {
        updateData.description = description
      }
      if (done !== undefined) {
        updateData.done = done
      }

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Nenhum dado fornecido para atualização.',
        })
        return
      }

      const task = await TaskService.update(id, req.userId!, updateData)

      if (!task) {
        res.status(404).json({
          error: 'Not Found',
          message:
            'Tarefa não encontrada ou você não tem permissão para atualizá-la.',
        })
        return
      }

      res.json(task)
    } catch (error: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  }
}
