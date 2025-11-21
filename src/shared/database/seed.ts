// import mongoose from 'mongoose';
// import { env } from '@/config/env';

import { ApiKeyModel } from '@/models/api-key.model'

// async function main() {
//   try {
//     console.log('📦 Conectando ao MongoDB...');
//     await mongoose.connect(env.mongodb.uri);
//     console.log('✅ MongoDB conectado\n');

//     await runSeeds();

//     console.log('\n🎉 Processo finalizado!');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Erro ao executar seeds:', error);
//     process.exit(1);
//   }
// }

// main();

export const apiKeySeeds = [
  {
    key: '8b4fae2b91c44b6d9d2e1b0d97e3a4d1',
    user_id: '7c1cc1d7-34c2-4f0e-9c2f-3fdab0e2f241',
    name: 'Aurora Labs',
  },
  {
    key: 'f2d91b686c7341bfa4e081cc9c223bc5',
    user_id: 'b9de2f65-7b74-4238-8a50-212e84a9f13c',
    name: 'Skytech Systems',
  },
  {
    key: 'c41f77e9b6d54427b8b1b6a425d6ac3e',
    user_id: 'd6a720c1-2df0-4863-9a03-b9906abceb12',
    name: 'Nova Connect',
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

export async function seedApiKeys() {
  console.log('🌱 Seeding API Keys...')

  await ApiKeyModel.deleteMany({})

  const inserted = await ApiKeyModel.insertMany(apiKeySeeds)
  console.log(`✅ Inseridas ${inserted.length} API Keys`)
}
