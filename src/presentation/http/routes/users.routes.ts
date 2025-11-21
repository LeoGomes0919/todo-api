import { Router } from 'express'
import { CreateUserController } from '../controller/user/create-user.controller'

const userRouter = Router()
const createUserController = new CreateUserController()

userRouter.post('/', createUserController.handle.bind(createUserController))

export { userRouter }
