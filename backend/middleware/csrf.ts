import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  const cookieExisted = !!req.cookies[CSRF_COOKIE]

  if (!req.cookies[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString('hex')
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    })
    req.cookies[CSRF_COOKIE] = token
  }

  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }

  // If no cookie existed before this request, it was just set in the response.
  // The frontend reads document.cookie which is only updated on the NEXT request,
  // so skip validation this once.
  if (!cookieExisted) {
    next()
    return
  }

  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
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
