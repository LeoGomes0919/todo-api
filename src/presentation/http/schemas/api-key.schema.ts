import { z } from '@/config/zod-openapi'

export const apiKeyHeaderSchema = z
  .object({
    'x-api-key': z
      .string()
      .min(1, { message: 'Chave de API é obrigatória' })
      .openapi({
        description: 'Chave de API para autenticação',
      }),
  })
  .openapi('ApiKeyHeaderSchema', {
    title: 'Schema do cabeçalho de chave de API',
    description:
      'Schema que representa o cabeçalho necessário para autenticação via chave de API',
  })
