import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { apiReference } from '@scalar/express-api-reference'
import { Express } from 'express'
import swaggerUi from 'swagger-ui-express'
import { apiKeyHeaderSchema } from '@/presentation/http/schemas/api-key.schema'
import {
  completeTaskSchema,
  createTaskSchema,
  deleteTaskSchema,
  listTasksParamsSchema,
  taskBaseSchema,
  updateTaskSchema,
} from '@/presentation/http/schemas/task.schema'
import { createUserSchema } from '@/presentation/http/schemas/user.schema'
import { env } from './env'
import { z } from './zod-openapi'

const registry = new OpenAPIRegistry()

registry.registerPath({
  method: 'post',
  path: '/api/tasks',
  description: 'Cria uma nova tarefa para o usuário.',
  tags: ['Tasks'],
  request: {
    headers: apiKeyHeaderSchema,
    body: {
      content: {
        'application/json': {
          schema: createTaskSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Tarefa criada com sucesso.',
      content: {
        'application/json': {
          schema: taskBaseSchema,
        },
      },
    },
    400: {
      description: 'Erro de validação.',
    },
    401: {
      description: 'API key ausente ou inválida.',
    },
  },
})
registry.registerPath({
  method: 'get',
  path: '/api/tasks',
  description: 'Lista todas as tarefas do usuário.',
  tags: ['Tasks'],
  request: {
    headers: apiKeyHeaderSchema,
    query: listTasksParamsSchema.shape.query,
  },
  responses: {
    200: {
      description: 'Lista de tarefas retornada com sucesso.',
      content: {
        'application/json': {
          schema: z.object({
            count: z.number(),
            tasks: z.array(taskBaseSchema),
          }),
        },
      },
    },
    401: {
      description: 'API key ausente ou inválida.',
    },
  },
})
registry.registerPath({
  method: 'put',
  path: '/api/tasks/{id}',
  description: 'Atualiza uma tarefa existente.',
  tags: ['Tasks'],
  request: {
    headers: apiKeyHeaderSchema,
    params: updateTaskSchema.shape.params,
    body: {
      content: {
        'application/json': {
          schema: updateTaskSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Tarefa atualizada com sucesso.',
      content: {
        'application/json': {
          schema: taskBaseSchema,
        },
      },
    },
    400: {
      description: 'Erro de validação.',
    },
    401: {
      description: 'API key ausente ou inválida.',
    },
    404: {
      description: 'Tarefa não encontrada.',
    },
  },
})
registry.registerPath({
  method: 'delete',
  path: '/api/tasks/{id}',
  description: 'Deleta uma tarefa existente.',
  tags: ['Tasks'],
  request: {
    headers: apiKeyHeaderSchema,
    params: deleteTaskSchema.shape.params,
  },
  responses: {
    204: {
      description: 'Tarefa deletada com sucesso.',
    },
    401: {
      description: 'API key ausente ou inválida.',
    },
    404: {
      description: 'Tarefa não encontrada.',
    },
  },
})
registry.registerPath({
  method: 'patch',
  path: '/api/tasks/{id}/complete',
  description: 'Marca uma tarefa como completa.',
  tags: ['Tasks'],
  request: {
    headers: apiKeyHeaderSchema,
    params: completeTaskSchema.shape.params,
  },
  responses: {
    200: {
      description: 'Tarefa marcada como completa com sucesso.',
      content: {
        'application/json': {
          schema: taskBaseSchema,
        },
      },
    },
    401: {
      description: 'API key ausente ou inválida.',
    },
    404: {
      description: 'Tarefa não encontrada.',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/users',
  description: 'Cria um novo usuário.',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Usuário criado com sucesso.',
    },
    400: {
      description: 'Erro de validação.',
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/health',
  description: 'Verifica o status da API e suas dependências.',
  tags: ['System'],
  responses: {
    200: {
      description: 'Status da API retornado com sucesso.',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
            uptime: z.number(),
            timestamp: z.string(),
            dependencies: z.object({
              mongo: z.enum(['up', 'down']),
              redis: z.enum(['up', 'down']),
            }),
          }),
        },
      },
    },
  },
})

const generator = new OpenApiGeneratorV3(registry.definitions)

export const openApiDoc = generator.generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'Todo API - Desafio Backend',
    version: '1.0.0',
    description:
      'API de tarefas com autenticação por API key, cache em Redis e rate limiting. Documentação gerada a partir de schemas Zod.',
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: 'Servidor local',
    },
  ],
})

export const setupSwagger = (app: Express) => {
  app.get('/openapi.json', (_, res) => {
    res.json(openApiDoc)
  })

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc))

  app.use(
    '/api/reference',
    apiReference({
      theme: 'default',
      content: openApiDoc,
      layout: 'modern',
    }),
  )
}
