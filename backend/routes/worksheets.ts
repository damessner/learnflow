import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'

const router = Router()

function normalizeDueDateInput(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function trackedWorksheetSnapshot(worksheet: Record<string, unknown>) {
  return JSON.stringify({
    title: worksheet.title || '',
    description: worksheet.description || '',
    subject: worksheet.subject || '',
    grade_level: worksheet.grade_level || '',
    content: worksheet.content || '',
    total_points: worksheet.total_points || 0,
    is_published: worksheet.is_published || 0,
    tags: worksheet.tags || '',
    rubric_json: worksheet.rubric_json || '',
    in_library: worksheet.in_library || 0,
  })
}

async function createWorksheetVersion(
  knex: ReturnType<typeof getKnex>,
  worksheet: Record<string, unknown>,
  createdBy: string,
  changeSummary: string,
) {
  const versionRow = await knex('worksheet_versions')
    .where({ worksheet_id: worksheet.id })
    .max<{ maxVersion: number | null }>('version_number as maxVersion')
    .first()

  await knex('worksheet_versions').insert({
    id: uuidv4(),
    worksheet_id: worksheet.id,
    version_number: Number(versionRow?.maxVersion || 0) + 1,
    change_summary: changeSummary,
    created_by: createdBy,
    title: worksheet.title,
    description: worksheet.description || '',
    subject: worksheet.subject || '',
    grade_level: worksheet.grade_level || '',
    content: worksheet.content || JSON.stringify({ blocks: [] }),
    total_points: worksheet.total_points || 0,
    tags: worksheet.tags || '',
    rubric_json: worksheet.rubric_json || '',
    in_library: worksheet.in_library || 0,
  })
}

router.get('/subjects', requireAuth, (_req, res) => {
  const { SUBJECTS } = require('./ai')
  res.json({ subjects: SUBJECTS })
})

router.get('/grade-levels', requireAuth, (_req, res) => {
  const { GRADE_LEVELS } = require('./ai')
  res.json({ gradeLevels: GRADE_LEVELS })
})

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
      const isPublished = worksheet.is_published === 1

      let enrolled = false
      if (!isPublished) {
        const assignment = await knex('assignments')
          .join('class_students', 'assignments.class_id', 'class_students.class_id')
          .where('assignments.worksheet_id', req.params.id)
          .where('class_students.student_id', req.user!.userId)
          .first()
        enrolled = !!assignment
      }

      if (!isPublished && !enrolled) {
        res.status(403).json({ error: 'You do not have access to this worksheet' })
        return
      }

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

const createAssignmentSchema = z.object({
  class_name: z.string().min(1),
  class_id: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  retry_policy: z.enum(['single', 'best', 'latest']).optional(),
  max_attempts: z.number().int().min(1).max(20).optional(),
  peer_review_enabled: z.boolean().optional(),
  adaptive_difficulty: z.string().optional().nullable(),
})

const updateAssignmentSchema = z.object({
  due_date: z.string().optional().nullable(),
  retry_policy: z.enum(['single', 'best', 'latest']).optional(),
  max_attempts: z.number().int().min(1).max(20).optional(),
  peer_review_enabled: z.boolean().optional(),
  adaptive_difficulty: z.string().optional().nullable(),
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
      await createWorksheetVersion(knex, worksheet, req.user!.userId, 'Initial version')
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

    const previousSnapshot = trackedWorksheetSnapshot(worksheet)
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
    if (trackedWorksheetSnapshot(updated) !== previousSnapshot) {
      await createWorksheetVersion(
        knex,
        updated,
        req.user!.userId,
        typeof req.body.change_summary === 'string' && req.body.change_summary.trim()
          ? req.body.change_summary.trim()
          : 'Updated worksheet',
      )
    }
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

router.get('/:id/versions', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
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

    const versions = await knex('worksheet_versions')
      .where({ worksheet_id: req.params.id })
      .orderBy('version_number', 'desc')

    res.json({ versions })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/:id/versions/:versionId/restore',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
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

      const version = await knex('worksheet_versions')
        .where({ id: req.params.versionId, worksheet_id: req.params.id })
        .first()
      if (!version) {
        res.status(404).json({ error: 'Version not found' })
        return
      }

      await knex('worksheets').where({ id: req.params.id }).update({
        title: version.title,
        description: version.description,
        subject: version.subject,
        grade_level: version.grade_level,
        content: version.content,
        total_points: version.total_points,
        tags: version.tags,
        rubric_json: version.rubric_json,
        in_library: version.in_library,
        updated_at: knex.fn.now(),
      })

      const restored = await knex('worksheets').where({ id: req.params.id }).first()
      await createWorksheetVersion(knex, restored, req.user!.userId, `Restored version ${version.version_number}`)

      res.json({ worksheet: restored })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/:id/assignments',
  requireAuth,
  requireRole('teacher', 'admin'),
  validate(createAssignmentSchema),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const { class_name } = req.body
      if (!class_name) {
        res.status(400).json({ error: 'class_name is required' })
        return
      }
      const id = uuidv4()
      await knex('assignments').insert({
        id,
        worksheet_id: req.params.id,
        class_name: req.body.class_name,
        class_id: req.body.class_id || null,
        due_date: normalizeDueDateInput(req.body.due_date),
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

router.put(
  '/:id/assignments/:assignmentId',
  requireAuth,
  requireRole('teacher', 'admin'),
  validate(updateAssignmentSchema),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const assignment = await knex('assignments')
        .where({ id: req.params.assignmentId, worksheet_id: req.params.id })
        .first()
      if (!assignment) {
        res.status(404).json({ error: 'Assignment not found' })
        return
      }

      const updateData: Record<string, unknown> = {}
      if (req.body.due_date !== undefined) updateData.due_date = normalizeDueDateInput(req.body.due_date)
      if (req.body.retry_policy !== undefined) updateData.retry_policy = req.body.retry_policy
      if (req.body.max_attempts !== undefined) updateData.max_attempts = req.body.max_attempts
      if (req.body.peer_review_enabled !== undefined) updateData.peer_review_enabled = req.body.peer_review_enabled ? 1 : 0
      if (req.body.adaptive_difficulty !== undefined) updateData.adaptive_difficulty = req.body.adaptive_difficulty || null

      await knex('assignments').where({ id: req.params.assignmentId }).update(updateData)
      const updated = await knex('assignments').where({ id: req.params.assignmentId }).first()
      res.json({ assignment: updated })
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

// AI generate moved to routes/ai.ts

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
        const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts')
        const path = require('path')
        const fs = require('fs')
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'audio')
        fs.mkdirSync(uploadsDir, { recursive: true })
        const filename = `tts_${Date.now()}.mp3`
        const filepath = path.join(uploadsDir, filename)

        const tts = new MsEdgeTTS()
        await tts.setMetadata(
          voice || 'en-US-AriaNeural',
          OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
        )
        await tts.toFile(filepath, text)

        res.json({ url: `/uploads/audio/${filename}` })
      } catch {
        res.status(500).json({ error: 'TTS failed' })
      }
    }
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/worksheets/assignments/:assignmentId/reports ──────────────────
// Returns full student×submission matrix for teacher report printing
router.get(
  '/assignments/:assignmentId/reports',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const { assignmentId } = req.params

      const assignment = await knex('assignments')
        .join('worksheets', 'assignments.worksheet_id', 'worksheets.id')
        .where('assignments.id', assignmentId)
        .select(
          'assignments.*',
          'worksheets.title as worksheet_title',
          'worksheets.subject',
          'worksheets.total_points',
        )
        .first()

      if (!assignment) {
        res.status(404).json({ error: 'Assignment not found' })
        return
      }

      // All students enrolled in the class
      const students = await knex('class_students')
        .join('users', 'class_students.student_id', 'users.id')
        .leftJoin('learning_gamification', 'users.id', 'learning_gamification.user_id')
        .where('class_students.class_id', assignment.class_id)
        .select(
          'users.id',
          'users.name',
          'users.username',
          'users.character_emoji',
          'learning_gamification.xp',
          'learning_gamification.level',
          'learning_gamification.streak_days',
        )
        .orderBy('users.name', 'asc')

      // All submissions for this assignment
      const submissions = await knex('submissions')
        .where({ assignment_id: assignmentId })
        .select('*')

      const submissionMap = new Map(submissions.map((s) => [s.user_id, s]))

      const rows = students.map((student) => {
        const sub = submissionMap.get(student.id)
        return {
          student_id: student.id,
          student_name: student.name,
          student_username: student.username,
          character_emoji: student.character_emoji || '👤',
          xp: student.xp ?? 0,
          level: student.level ?? 1,
          streak_days: student.streak_days ?? 0,
          submitted: !!sub?.submitted_at,
          submitted_at: sub?.submitted_at ?? null,
          score: sub?.score ?? null,
          max_score: sub?.max_score ?? assignment.total_points ?? null,
          score_pct:
            sub?.score != null && sub?.max_score && sub.max_score > 0
              ? Math.round((sub.score / sub.max_score) * 100)
              : null,
          feedback: sub?.feedback ?? null,
        }
      })

      res.json({
        assignment: {
          id: assignment.id,
          worksheet_title: assignment.worksheet_title,
          subject: assignment.subject,
          due_date: assignment.due_date,
          class_id: assignment.class_id,
          class_name: assignment.class_name,
          total_points: assignment.total_points,
        },
        students: rows,
        generated_at: new Date().toISOString(),
      })
    } catch (err) {
      next(err)
    }
  },
)

export default router
