import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Issue a new CSRF token cookie if not present
  if (!req.cookies[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString('hex')
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    // Store on req so the same request can validate if needed
    req.cookies[CSRF_COOKIE] = token
  }

  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }

  const cookieToken = req.cookies[CSRF_COOKIE]
  const headerToken = req.headers[CSRF_HEADER]

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: 'CSRF validation failed' })
    return
  }

  next()
}
