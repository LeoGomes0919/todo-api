import mongoose from 'mongoose'
import { env } from '@/config/env'

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongodb.uri)
    console.log('✅ MongoDB conectado com sucesso')
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB desconectado')
})

mongoose.connection.on('error', (error) => {
  console.error('❌ Erro no MongoDB:', error)
})
