import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import { corsOptions } from './config/cors'
import { setupSwagger } from './config/swagger'
import { authenticate } from './middleware/auth'
import { errorHandler } from './middleware/error-handler'
import { rateLimit } from './middleware/rate-limit'
import { systemRoutes } from './presentation/http/routes/system.routes'
import { taskRouter } from './presentation/http/routes/tasks.routes'
import { userRouter } from './presentation/http/routes/users.routes'

const app = express()

app.use(cors(corsOptions))
app.use(express.json())

setupSwagger(app)

app.use('/api', rateLimit, systemRoutes)
app.use('/api/users', rateLimit, userRouter)
app.use('/api/tasks', authenticate, rateLimit, taskRouter)
app.use(errorHandler)

app.use((_, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested route was not found on the server.',
  })
})

export { app }
