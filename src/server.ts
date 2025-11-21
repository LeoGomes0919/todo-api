import { app } from './app'
import { env } from './config/env'
import { connectRedis } from './shared/caching'
import { connectDatabase } from './shared/database'
;(async () => {
  try {
    await connectDatabase()
    await connectRedis()

    app.listen(env.port, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://localhost:${env.port}`)
      console.log(
        `📚 Documentation available at http://localhost:${env.port}/api/docs`,
      )
      console.log(
        `📝 API Reference available at http://localhost:${env.port}/api/reference`,
      )
    })
  } catch (error) {
    console.error('❌ Error starting server:', error)
    process.exit(1)
  }
})()
