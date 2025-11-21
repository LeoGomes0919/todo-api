import { afterAll, beforeAll, vi } from 'vitest'

process.env.NODE_ENV = 'test'
process.env.PORT = '3001'
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db'
process.env.REDIS_URI = 'redis://localhost:6379'

vi.mock('@/shared/caching', () => ({
  redisClient: {
    get: vi.fn(),
    set: vi.fn(),
    setEx: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    multi: vi.fn(() => ({
      zRemRangeByScore: vi.fn().mockReturnThis(),
      zAdd: vi.fn().mockReturnThis(),
      zCard: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([null, null, 0, 1]),
    })),
  },
}))

beforeAll(() => {
  console.log('🧪 Iniciando testes...')
})

afterAll(() => {
  console.log('✅ Testes finalizados')
})
