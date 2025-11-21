// import mongoose from 'mongoose';
// import { env } from '@/config/env';

import mongoose from 'mongoose'
import { env } from '@/config/env'
import { ApiKeyModel } from '@/models/api-key.model'
import { TaskModel } from '@/models/task.model'
import { UserModel } from '@/models/user.model'

export const apiKeySeeds = [
  {
    key: '8b4fae2b91c44b6d9d2e1b0d97e3a4d1',
    user_id: '7c1cc1d7-34c2-4f0e-9c2f-3fdab0e2f241',
    name: 'Aurora Labs',
  },
  {
    key: 'e8c15e9917c64df3afeafbb56b32c987',
    user_id: '4a97fb23-36c4-4642-84fa-cb11020b7ee8',
    name: 'Vertex Cloud',
  },
  {
    key: 'ab77efac9320467bb84c64af0e0e7951',
    user_id: 'f5e95e71-d683-48ea-a3c8-296cdcb22cc1',
    name: 'Quantum API',
  },
]

async function seedApiKeys() {
  console.log('🌱 Seeding API Keys...')

  await ApiKeyModel.deleteMany({})
  apiKeySeeds.forEach((apiKey) => {
    delete (apiKey as any).name
  })

  const inserted = await ApiKeyModel.insertMany(apiKeySeeds)
  console.log(`✅ Inseridas ${inserted.length} API Keys`)
}

async function seedUsers() {
  console.log('🌱 Seeding Users...')

  await UserModel.deleteMany({})

  const users = apiKeySeeds.map((apiKey) => ({
    user_id: apiKey.user_id,
    name: apiKey.name,
  }))

  const inserted = await UserModel.insertMany(users)
  console.log(`✅ Inseridos ${inserted.length} Users`)
}

async function seedTasks() {
  console.log('🌱 Seeding Tasks...')

  await TaskModel.deleteMany({})

  const tasks = apiKeySeeds.map((apiKey, index) => ({
    user_id: apiKey.user_id,
    title: `Task ${index + 1} for ${apiKey.name}`,
    description: `This is a sample task for ${apiKey.name}.`,
  }))

  const inserted = await TaskModel.insertMany(tasks)
  console.log(`✅ Inseridas ${inserted.length} Tasks`)
}

async function runSeeds() {
  await seedUsers()
  await seedApiKeys()
  await seedTasks()
}

;(async () => {
  try {
    await mongoose.connect(env.mongodb.uri)

    await runSeeds()

    console.log('\n🎉 Seeds finalizado!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error)
    process.exit(1)
  }
})()
