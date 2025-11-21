import { NextFunction, Response } from 'express'
import { ApiKeyModel } from '@/models/api-key.model'

export const authenticate = async (
  req: any,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string

    if (!apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is required. Please provide the x-api-key header.',
      })
      return
    }

    const apiKeyDoc = await ApiKeyModel.findOne({ key: apiKey })

    if (!apiKeyDoc) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key.',
      })
      return
    }

    req.userId = apiKeyDoc.user_id
    req.apiKey = apiKey

    next()
  } catch (_error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error validating authentication.',
    })
  }
}
