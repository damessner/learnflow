import type { Request, Response, NextFunction } from 'express'
import logger from '../lib/logger'

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error({ err, requestId: req.id }, 'Unhandled error')

  const status = (err as { status?: number }).status || 500
  const message = status >= 500 ? 'Internal Server Error' : err.message || 'Request failed'
  res.status(status).json({
    error: message,
    requestId: req.id,
  })
}
