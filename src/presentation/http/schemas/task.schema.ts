import { z } from '@/config/zod-openapi'

export const taskBaseSchema = z
  .object({
    id: z.uuidv4().openapi({ description: 'Identificador único da tarefa' }),
    user_id: z
      .string()
      .openapi({ description: 'Identificador do usuário dono da tarefa' }),
    title: z
      .string()
      .min(1)
      .max(200)
      .openapi({ description: 'Título da tarefa' }),
    description: z
      .string()
      .max(1000)
      .optional()
      .openapi({ description: 'Descrição opcional' }),
    done: z
      .boolean()
      .default(false)
      .openapi({ description: 'Status da tarefa' }),
    created_at: z.string().openapi({ description: 'Data de criação (ISO)' }),
    updated_at: z
      .string()
      .openapi({ description: 'Data de atualização (ISO)' }),
  })
  .openapi('TaskBaseSchema', {
    title: 'Schema base da tarefa',
    description: 'Schema que representa a estrutura básica de uma tarefa',
  })

export const createTaskSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(1, { error: 'Título deve ter pelo menos 1 caractere' })
        .max(200, { error: 'Título deve ter no máximo 200 caracteres' }),
      description: z.string().max(1000).optional(),
    })
    .openapi('CreateTaskSchema', {
      title: 'Schema para criação de tarefa',
      description: 'Schema utilizado para criar uma nova tarefa',
    }),
})

export const updateTaskSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, { error: 'ID da tarefa é obrigatório' })
      .openapi({ description: 'ID da tarefa a ser atualizada' }),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(1, { error: 'Título deve ter pelo menos 1 caractere' })
        .max(200, { error: 'Título deve ter no máximo 200 caracteres' })
        .optional(),
      description: z
        .string()
        .max(1000, { error: 'Descrição deve ter no máximo 1000 caracteres' })
        .optional(),
      done: z.boolean().optional(),
    })
    .openapi('UpdateTaskSchema', {
      title: 'Schema para atualização de tarefa',
      description: 'Schema utilizado para atualizar uma tarefa existente',
    }),
})

export const listTasksParamsSchema = z.object({
  query: z
    .object({
      page: z
        .string()
        .transform((val) => parseInt(val, 10))
        .optional()
        .default(1),
      limit: z
        .string()
        .transform((val) => parseInt(val, 10))
        .optional()
        .default(10),
      done: z
        .enum(['true', 'false'])
        .openapi({ description: 'Filtrar por status da tarefa' })
        .optional(),
    })
    .openapi('ListTasksParamsSchema', {
      title: 'Schema para listagem de tarefas',
      description:
        'Schema utilizado para listar tarefas com filtros e paginação',
    }),
})

export const deleteTaskSchema = z.object({
  params: z
    .object({
      id: z
        .string()
        .min(1, { error: 'ID da tarefa é obrigatório' })
        .openapi({ description: 'ID da tarefa a ser deletada' }),
    })
    .openapi('DeleteTaskSchema', {
      title: 'Schema para deleção de tarefa',
      description: 'Schema utilizado para deletar uma tarefa existente',
    }),
})

export const completeTaskSchema = z.object({
  params: z
    .object({
      id: z
        .string()
        .min(1, { error: 'ID da tarefa é obrigatório' })
        .openapi({ description: 'ID da tarefa a ser marcada como completa' }),
    })
    .openapi('CompleteTaskSchema', {
      title: 'Schema para completar tarefa',
      description: 'Schema utilizado para marcar uma tarefa como completa',
    }),
})
