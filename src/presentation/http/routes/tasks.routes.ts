import { Router } from 'express'
import { CompleteTaskController } from '../controller/task/complete-task.controller'
import { CreateTaskController } from '../controller/task/create-task.controller'
import { DeleteTaskController } from '../controller/task/delete-task.controller'
import { ListTaskController } from '../controller/task/list-task.controller'
import { UpdateTaskController } from '../controller/task/update-task.controller'

const taskRouter = Router()
const createTaskController = new CreateTaskController()
const listTaskController = new ListTaskController()
const updateTaskController = new UpdateTaskController()
const deleteTaskController = new DeleteTaskController()
const completeTaskController = new CompleteTaskController()

taskRouter.post('/', createTaskController.handle.bind(createTaskController))
taskRouter.get('/', listTaskController.handle.bind(listTaskController))
taskRouter.put('/:id', updateTaskController.handle.bind(updateTaskController))
taskRouter.delete(
  '/:id',
  deleteTaskController.handle.bind(deleteTaskController),
)
taskRouter.patch(
  '/:id/complete',
  completeTaskController.handle.bind(completeTaskController),
)

export { taskRouter }
