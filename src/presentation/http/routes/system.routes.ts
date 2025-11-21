import { Router } from 'express'
import mongoose from 'mongoose'
import { redisClient } from '@/shared/caching'

const systemRoutes = Router()

systemRoutes.get('/health', async (_, res) => {
  let mongoStatus: 'up' | 'down' = 'down'
  let redisStatus: 'up' | 'down' = 'down'

  try {
    if (mongoose.connection.readyState === 1) {
      mongoStatus = 'up'
    }
  } catch {
    mongoStatus = 'down'
  }

  try {
    const ping = await redisClient.ping()
    if (ping === 'PONG') redisStatus = 'up'
  } catch {
    redisStatus = 'down'
  }

  res.json({
    status: 'ok',
    uptime: Number(process.uptime().toFixed(3)),
    timestamp: new Date().toISOString(),
    dependencies: {
      mongo: mongoStatus,
      redis: redisStatus,
    },
  })
})

export { systemRoutes }
