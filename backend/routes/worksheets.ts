import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'
import { scoreAnswers } from './scoring'
import logger from '../lib/logger'

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    let query = knex('worksheets')

    if (req.user!.role === 'student') {
      const assignedIds = await knex('assignments')
        .join('class_students', 'assignments.class_id', 'class_students.class_id')
        .where('class_students.student_id', req.user!.userId)
        .pluck('assignments.worksheet_id')

      query = query.where(function () {
        this.where('is_published', 1).orWhereIn('id', assignedIds)
      })
    } else if (req.user!.role === 'teacher') {
      query = query.where({ created_by: req.user!.userId })
    }

    const worksheets = await query.orderBy('updated_at', 'desc')
    res.json({ worksheets })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const worksheet = await knex('worksheets').where({ id: req.params.id }).first()
    if (!worksheet) {
      res.status(404).json({ error: 'Worksheet not found' })
      return
    }

    const result = { ...worksheet }

    if (req.user!.role === 'student') {
      try {
        const content = JSON.parse(result.content)
        if (content.blocks) {
          content.blocks = content.blocks.map((b: Record<string, unknown>) => {
            const stripped = { ...b }
            delete stripped.correct
            delete stripped.answers
            if (b.type === 'multiple_choice' && b.options) {
              stripped.options = [...(b.options as unknown[])].sort(() => Math.random() - 0.5)
            }
            return stripped
          })
        }
        result.content = JSON.stringify(content)
      } catch {
        /* keep original */
      }
    }

    res.json({ worksheet: result })
  } catch (err) {
    next(err)
  }
})

const createWorksheetSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subject: z.string().optional(),
  grade_level: z.string().optional(),
  content: z.string().optional(),
  total_points: z.number().optional(),
  is_published: z.number().optional(),
  tags: z.string().optional(),
  rubric_json: z.string().optional(),
})

router.post(
  '/',
  requireAuth,
  requireRole('teacher', 'admin'),
  validate(createWorksheetSchema),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const id = uuidv4()
      const content = req.body.content || JSON.stringify({ blocks: [] })

      await knex('worksheets').insert({
        id,
        title: req.body.title,
        description: req.body.description || '',
        subject: req.body.subject || '',
        grade_level: req.body.grade_level || '',
        content,
        total_points: req.body.total_points || 0,
        is_published: req.body.is_published || 0,
        created_by: req.user!.userId,
        tags: req.body.tags || '',
        rubric_json: req.body.rubric_json || '',
      })

      const worksheet = await knex('worksheets').where({ id }).first()
      res.status(201).json({ worksheet })
    } catch (err) {
      next(err)
    }
  },
)

router.put('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const worksheet = await knex('worksheets').where({ id: req.params.id }).first()
    if (!worksheet) {
      res.status(404).json({ error: 'Worksheet not found' })
      return
    }
    if (req.user!.role !== 'admin' && worksheet.created_by !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const updateData: Record<string, unknown> = { updated_at: knex.fn.now() }
    const fields = [
      'title',
      'description',
      'subject',
      'grade_level',
      'content',
      'total_points',
      'is_published',
      'tags',
      'rubric_json',
      'in_library',
    ]
    for (const f of fields) {
      if (req.body[f] !== undefined) updateData[f] = req.body[f]
    }

    await knex('worksheets').where({ id: req.params.id }).update(updateData)
    const updated = await knex('worksheets').where({ id: req.params.id }).first()
    res.json({ worksheet: updated })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const worksheet = await knex('worksheets').where({ id: req.params.id }).first()
    if (!worksheet) {
      res.status(404).json({ error: 'Worksheet not found' })
      return
    }
    if (req.user!.role !== 'admin' && worksheet.created_by !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const assignments = await knex('assignments').where({ worksheet_id: req.params.id })
    for (const a of assignments) {
      await knex('submissions').where({ assignment_id: a.id }).del()
      await knex('teams').where({ assignment_id: a.id }).del()
    }
    await knex('assignments').where({ worksheet_id: req.params.id }).del()
    await knex('course_worksheets').where({ worksheet_id: req.params.id }).del()
    await knex('worksheets').where({ id: req.params.id }).del()

    res.json({ message: 'Worksheet deleted' })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/:id/duplicate',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const original = await knex('worksheets').where({ id: req.params.id }).first()
      if (!original) {
        res.status(404).json({ error: 'Worksheet not found' })
        return
      }

      const id = uuidv4()
      await knex('worksheets').insert({
        id,
        title: `Copy of ${original.title}`,
        description: original.description,
        subject: original.subject,
        grade_level: original.grade_level,
        content: original.content,
        total_points: original.total_points,
        created_by: req.user!.userId,
        tags: original.tags,
        rubric_json: original.rubric_json,
        cloned_from: original.id,
      })

      const duplicate = await knex('worksheets').where({ id }).first()
      res.status(201).json({ worksheet: duplicate })
    } catch (err) {
      next(err)
    }
  },
)

router.get('/templates', requireAuth, async (_req, res, next) => {
  try {
    res.json({ templates: [] })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/templates/:id/clone',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const id = uuidv4()
      const templateData = {
        title: `Cloned Template ${req.params.id}`,
        content: JSON.stringify({ blocks: [] }),
      }

      await knex('worksheets').insert({
        id,
        title: templateData.title,
        description: '',
        subject: '',
        grade_level: '',
        content: templateData.content,
        total_points: 0,
        created_by: req.user!.userId,
        library_source: req.params.id,
      })

      const worksheet = await knex('worksheets').where({ id }).first()
      res.status(201).json({ worksheet })
    } catch (err) {
      next(err)
    }
  },
)

router.get('/:id/assignments', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const assignments = await knex('assignments')
      .where({ worksheet_id: req.params.id })
      .orderBy('created_at', 'desc')

    res.json({ assignments })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/:id/assignments',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const id = uuidv4()
      await knex('assignments').insert({
        id,
        worksheet_id: req.params.id,
        class_name: req.body.class_name,
        class_id: req.body.class_id || null,
        due_date: req.body.due_date,
        created_by: req.user!.userId,
        retry_policy: req.body.retry_policy || 'single',
        max_attempts: req.body.max_attempts || 3,
        peer_review_enabled: req.body.peer_review_enabled ? 1 : 0,
        adaptive_difficulty: req.body.adaptive_difficulty || null,
      })

      const assignment = await knex('assignments').where({ id }).first()
      res.status(201).json({ assignment })
    } catch (err) {
      next(err)
    }
  },
)

router.delete(
  '/:id/assignments/:assignmentId',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      await knex('submissions').where({ assignment_id: req.params.assignmentId }).del()
      await knex('teams').where({ assignment_id: req.params.assignmentId }).del()
      await knex('assignments').where({ id: req.params.assignmentId }).del()
      res.json({ message: 'Assignment deleted' })
    } catch (err) {
      next(err)
    }
  },
)

router.get(
  '/assignments/:assignmentId/results',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const submissions = await knex('submissions')
        .join('users', 'submissions.user_id', 'users.id')
        .where('submissions.assignment_id', req.params.assignmentId)
        .select('submissions.*', 'users.name as student_name', 'users.username')
        .orderBy('submissions.submitted_at', 'desc')

      res.json({ submissions })
    } catch (err) {
      next(err)
    }
  },
)

router.get(
  '/assignments/:assignmentId/stats',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const submissions = await knex('submissions')
        .where({ assignment_id: req.params.assignmentId })
        .whereNotNull('score')

      if (submissions.length === 0) {
        res.json({ average: 0, passRate: 0, distribution: [], count: 0 })
        return
      }

      const scores = submissions.map((s: { score: number; max_score: number }) => {
        const max = s.max_score || 1
        return (s.score / max) * 100
      })

      const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      const passRate = scores.filter((s: number) => s >= 60).length / scores.length

      const dist = [0, 0, 0, 0, 0]
      for (const s of scores) {
        if (s >= 90) dist[4]++
        else if (s >= 75) dist[3]++
        else if (s >= 60) dist[2]++
        else if (s >= 40) dist[1]++
        else dist[0]++
      }

      res.json({
        average: Math.round(avg * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        distribution: dist,
        count: submissions.length,
      })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/ai/generate',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const { prompt, provider } = req.body
      const blocks = []

      if (provider === 'ollama' && process.env.OLLAMA_URL) {
        const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OLLAMA_MODEL || 'llama3',
            prompt: `Create an educational worksheet with interactive exercise blocks from this prompt: "${prompt}". Return JSON with a blocks array. Each block has id, type, points, and type-specific fields.`,
            stream: false,
          }),
        })
        const data = await response.json()
        try {
          const parsed = JSON.parse(data.response)
          blocks.push(...(parsed.blocks || []))
        } catch {
          blocks.push({
            id: uuidv4(),
            type: 'text',
            points: 0,
            text: 'AI generation responded. Raw output in worksheet builder.',
          })
        }
      } else if (process.env.GEMINI_API_KEY) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Generate a JSON array of interactive worksheet blocks for an educational platform. Prompt: "${prompt}". Each block has id (uuid string), type (one of: gap_fill, multiple_choice, single_choice, matching, drag_drop, short_answer, text), points (number), and type-specific fields. Return only the JSON array.`,
                    },
                  ],
                },
              ],
            }),
          },
        )
        const data = await response.json()
        try {
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          const jsonMatch = text.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            blocks.push(...JSON.parse(jsonMatch[0]))
          }
        } catch {
          /* */
        }
      }

      if (blocks.length === 0) {
        blocks.push({
          id: uuidv4(),
          type: 'gap_fill',
          points: 10,
          template: `${prompt}: The answer is ((example)). Write ((more)).`,
        })
      }

      res.json({ blocks })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/ai/neuro-vocab',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const { rawList } = req.body
      const words = (rawList || '')
        .split(/[\n,]+/)
        .filter(Boolean)
        .map((w: string) => w.trim())

      const blocks = [
        {
          id: uuidv4(),
          type: 'vocabulary' as const,
          points: words.length * 2,
          vocabulary: {
            pairs: words.map((w: string) => ({ l: w, r: `[${w}]` })),
            direction: 'l2r' as const,
          },
          rawText: rawList,
        },
      ]

      res.json({ blocks })
    } catch (err) {
      next(err)
    }
  },
)

router.post('/tts', requireAuth, async (req, res, next) => {
  try {
    const { text, voice, provider } = req.body
    if (!text) {
      res.status(400).json({ error: 'Text required' })
      return
    }

    if (provider === 'local') {
      try {
        const say = require('say')
        const filename = `tts_${Date.now()}.wav`
        const path = require('path')
        const fs = require('fs')
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'audio')
        fs.mkdirSync(uploadsDir, { recursive: true })
        const filepath = path.join(uploadsDir, filename)

        await new Promise<void>((resolve, reject) => {
          say.export(text, voice || undefined, 1.0, filepath, (err: Error | null) => {
            if (err) reject(err)
            else resolve()
          })
        })

        res.json({ url: `/uploads/audio/${filename}` })
      } catch {
        res.status(500).json({ error: 'TTS failed' })
      }
    } else {
      try {
        const { mstts } = require('msedge-tts')
        const path = require('path')
        const fs = require('fs')
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'audio')
        fs.mkdirSync(uploadsDir, { recursive: true })
        const filename = `tts_${Date.now()}.mp3`
        const filepath = path.join(uploadsDir, filename)

        await mstts({
          text,
          voice: voice || 'en-US-AriaNeural',
          output: filepath,
        })

        res.json({ url: `/uploads/audio/${filename}` })
      } catch {
        res.status(500).json({ error: 'TTS failed' })
      }
    }
  } catch (err) {
    next(err)
  }
})

export default router
