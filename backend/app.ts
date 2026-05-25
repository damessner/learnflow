import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import cookieParser from 'cookie-parser'

import { requestId } from './middleware/requestId'
import { corsMiddleware } from './middleware/cors'
import { csrfMiddleware } from './middleware/csrf'
import { errorHandler } from './middleware/errorHandler'
import logger from './lib/logger'

import authRoutes from './routes/auth'
import worksheetRoutes from './routes/worksheets'
import submissionRoutes from './routes/submissions'
import classRoutes from './routes/classes'
import courseRoutes from './routes/courses'
import learningRoutes from './routes/learning'
import teamRoutes from './routes/teams'
import mediaRoutes from './routes/media'
import libraryRoutes from './routes/library'
import aiRoutes from './routes/ai'
import srsRoutes from './routes/srs'
import adminRoutes from './routes/admin'

export function createApp(): express.Application {
  const app = express()

  app.use(requestId)
  app.use((req, _res, next) => {
    logger.info({ method: req.method, url: req.url, requestId: req.id }, 'Request')
    next()
  })

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          mediaSrc: ["'self'", 'https://www.youtube.com'],
          connectSrc: ["'self'", 'https://login.microsoftonline.com', 'https://graph.microsoft.com'],
          fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        },
      },
    }),
  )
  app.use(corsMiddleware)

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  app.use(express.json({ limit: '10mb' }))
  app.use(cookieParser())
  app.use(csrfMiddleware)

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/worksheets', worksheetRoutes)
  app.use('/api/submissions', submissionRoutes)
  app.use('/api/classes', classRoutes)
  app.use('/api/courses', courseRoutes)
  app.use('/api/learning', learningRoutes)
  app.use('/api/media', mediaRoutes)
  app.use('/api/teams', teamRoutes)
  app.use('/api/library', libraryRoutes)
  app.use('/api/ai', aiRoutes)
  app.use('/api/srs', srsRoutes)
  app.use('/api/admin', adminRoutes)

  app.use(errorHandler)

  return app
}
