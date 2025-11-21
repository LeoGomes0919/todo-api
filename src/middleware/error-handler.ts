import { NextFunction, Request, Response } from 'express'

export const errorHandler = (
  error: Error,
  _: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error('Error:', error)

  if (res.headersSent) {
    return next(error)
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An internal error occurred.',
  })
}
