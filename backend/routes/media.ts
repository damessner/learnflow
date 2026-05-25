import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { getKnex } from '../db/knex'
import { requireAuth } from '../middleware/requireAuth'

const uploadsDir = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm',
  'application/pdf',
])

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`))
    }
  },
})

const router = Router()

router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const knex = getKnex()
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const id = uuidv4()
    const url = `/uploads/${req.file.filename}`

    await knex('media_files').insert({
      id,
      filename: req.file.filename,
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      uploaded_by: req.user!.userId,
      url,
    })

    const media = await knex('media_files').where({ id }).first()
    res.status(201).json({ media })
  } catch (err) {
    next(err)
  }
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const files = await knex('media_files').orderBy('created_at', 'desc')
    res.json({ files })
  } catch (err) {
    next(err)
  }
})

export default router
