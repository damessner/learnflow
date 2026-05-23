import type { Request, Response, NextFunction } from 'express'

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000']
  const origin = req.headers.origin

  if (origin && (allowedOrigins.includes(origin) || process.env.ALLOWED_ORIGINS === '*')) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else if (process.env.NODE_ENV === 'production') {
    const host = req.headers.host
    if (host) {
      res.setHeader('Access-Control-Allow-Origin', `https://${host}`)
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  next()
}
