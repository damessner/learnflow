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
import workspaceRoutes from './routes/workspaces'
import languageRoutes from './routes/language'

function uploadContentType(filePath: string): string | null {
  const ext = path.extname(filePath).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  }

  return mimeMap[ext] || null
}

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

  app.use(
    '/uploads',
    express.static(path.join(__dirname, '..', 'uploads'), {
      setHeaders(res, filePath) {
        const mimeType = uploadContentType(filePath)
        if (mimeType) res.setHeader('Content-Type', mimeType)
      },
    }),
  )

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
  app.use('/api/workspaces', workspaceRoutes)
  app.use('/api/language', languageRoutes)

  app.use(errorHandler)

  return app
}
