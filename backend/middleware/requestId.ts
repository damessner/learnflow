import { v4 as uuidv4 } from 'uuid'
import type { Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface Request {
      id: string
    }
  }
}

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  req.id = uuidv4()
  next()
}
