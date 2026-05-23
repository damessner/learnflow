import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'

import { requestId } from './middleware/requestId'
import { corsMiddleware } from './middleware/cors'
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

export function createApp(): express.Application {
  const app = express()

  app.use(helmet())
  app.use(corsMiddleware)

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        mediaSrc: ["'self'", 'https://www.youtube.com'],
        connectSrc: ["'self'", 'https://login.microsoftonline.com', 'https://graph.microsoft.com'],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      },
    }),
  )

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  app.use(express.json({ limit: '10mb' }))
  app.use(requestId)

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
  app.use('/api/teams', teamRoutes)
  app.use('/api/media', mediaRoutes)
  app.use('/api/library', libraryRoutes)

  app.use((req, _res, next) => {
    logger.info({ method: req.method, url: req.url, requestId: req.id }, 'Request')
    next()
  })

  app.use(errorHandler)

  return app
}
