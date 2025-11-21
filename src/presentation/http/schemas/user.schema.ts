import { z } from '@/config/zod-openapi'

export const userBaseSchema = z.object({
  id: z.uuidv4().openapi({ description: 'Identificador único da tarefa' }),
  user_id: z
    .string()
    .openapi({ description: 'Identificador do usuário dono da tarefa' }),
  name: z
    .string()
    .min(1, { error: 'Nome é obrigatório' })
    .max(200, { error: 'Nome deve ter no máximo 200 caracteres' })
    .openapi({ description: 'Nome do usuário' }),
  created_at: z.string().openapi({ description: 'Data de criação (ISO)' }),
  updated_at: z.string().openapi({ description: 'Data de atualização (ISO)' }),
})

export const createUserSchema = z.object({
  body: userBaseSchema
    .omit({ id: true, user_id: true, created_at: true, updated_at: true })
    .openapi('CreateUserSchema', {
      title: 'Schema para criação de usuário',
      description: 'Schema utilizado para criar um novo usuário',
    }),
})
