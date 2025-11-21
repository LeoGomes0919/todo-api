import { createClient } from 'redis'
import { env } from '@/config/env'

const redisClient = createClient({ url: env.redis.uri })

redisClient.on('error', (err) => {
  console.error('❌ Erro no Redis:', err)
})

redisClient.on('connect', () => {
  console.log('✅ Redis conectado com sucesso')
})

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect()
  } catch (error) {
    console.error('❌ Erro ao conectar ao Redis:', error)
    process.exit(1)
  }
}

export { redisClient }
