import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { importStudentsFromPdf, setImportTeacherId } from '../services/studentImporter'
import crypto from 'crypto'

const router = Router()

function generateSecureClassCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let raw = ''
  for (let i = 0; i < 8; i++) {
    raw += chars[crypto.randomInt(0, chars.length)]
  }
  return `${raw.slice(0, 4)}-${raw.slice(4)}`
}

function escapeCsvField(field: string): string {
  const str = String(field ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  if (/^[=+\-@]/.test(str)) {
    return "'" + str
  }
  return str
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    let classes

    if (req.user!.role === 'admin') {
      classes = await knex('classes').orderBy('created_at', 'desc')
    } else if (req.user!.role === 'teacher') {
      classes = await knex('classes')
        .where({ teacher_id: req.user!.userId })
        .orderBy('created_at', 'desc')
    } else {
      classes = await knex('classes')
        .join('class_students', 'classes.id', 'class_students.class_id')
        .where('class_students.student_id', req.user!.userId)
        .select('classes.*')
        .orderBy('classes.created_at', 'desc')
    }

    res.json({ classes })
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const id = uuidv4()
    let classCode = ''
    for (let attempt = 0; attempt < 20; attempt++) {
      const candidate = generateSecureClassCode()
      const exists = await knex('classes').where({ class_code: candidate }).first()
      if (!exists) {
        classCode = candidate
        break
      }
    }
    if (!classCode) {
      res.status(503).json({ error: 'Unable to allocate unique class code. Please retry.' })
      return
    }

    await knex('classes').insert({
      id,
      name: req.body.name || 'Untitled Class',
      description: req.body.description || '',
      teacher_id: req.user!.userId,
      class_code: classCode,
    })

    const cls = await knex('classes').where({ id }).first()
    res.status(201).json({ class: cls })
  } catch (err) {
    next(err)
  }
})

router.get('/student-status', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const enrolledClasses = await knex('class_students')
      .join('classes', 'class_students.class_id', 'classes.id')
      .where('class_students.student_id', req.user!.userId)
      .select('classes.*', 'class_students.joined_at')

    res.json({ classes: enrolledClasses })
  } catch (err) {
    next(err)
  }
})

// Get assignments for a class student is in with submission status
router.get('/student/class/:classId/assignments', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const classId = req.params.classId
    const userId = req.user!.userId

    // 1. Verify student is in class
    const isEnrolled = await knex('class_students')
      .where({ class_id: classId, student_id: userId })
      .first()
    if (!isEnrolled) {
      res.status(403).json({ error: 'Not enrolled in this class' })
      return
    }

    // 2. Fetch assignments for this class along with worksheet details
    const classAssignments = await knex('assignments')
      .join('worksheets', 'assignments.worksheet_id', 'worksheets.id')
      .where('assignments.class_id', classId)
      .select(
        'assignments.id as assignment_id',
        'assignments.due_date',
        'worksheets.id as worksheet_id',
        'worksheets.title as worksheet_title',
        'worksheets.description as worksheet_description',
        'worksheets.subject as worksheet_subject',
        'worksheets.total_points as max_score'
      )
      .orderBy('assignments.created_at', 'desc')

    // 3. Join with submission for this user
    const assignmentsWithSubmissions = await Promise.all(
      classAssignments.map(async (a) => {
        const submission = await knex('submissions')
          .where({ assignment_id: a.assignment_id, user_id: userId })
          .first()
        return {
          ...a,
          submitted: !!submission,
          submitted_at: submission ? submission.submitted_at : null,
          score: submission ? submission.score : null,
          max_score: submission ? submission.max_score : a.max_score
        }
      })
    )

    res.json({ assignments: assignmentsWithSubmissions })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const cls = await knex('classes').where({ id: req.params.id }).first()
    if (!cls) {
      res.status(404).json({ error: 'Class not found' })
      return
    }
    res.json({ class: cls })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const cls = await knex('classes').where({ id: req.params.id }).first()
    if (!cls) {
      res.status(404).json({ error: 'Class not found' })
      return
    }
    if (req.user!.role !== 'admin' && cls.teacher_id !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const assignments = await knex('assignments').where({ class_id: req.params.id })
    for (const a of assignments) {
      await knex('submissions').where({ assignment_id: a.id }).del()
    }
    await knex('assignments').where({ class_id: req.params.id }).del()
    await knex('class_announcements').where({ class_id: req.params.id }).del()
    await knex('class_students').where({ class_id: req.params.id }).del()
    await knex('classes').where({ id: req.params.id }).del()

    res.json({ message: 'Class deleted' })
  } catch (err) {
    next(err)
  }
})

router.get('/:id/progress', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const students = await knex('class_students')
      .join('users', 'class_students.student_id', 'users.id')
      .leftJoin('learning_gamification', 'users.id', 'learning_gamification.user_id')
      .where('class_students.class_id', req.params.id)
      .select(
        'users.id',
        'users.name',
        'users.username',
        'users.character_emoji',
        'learning_gamification.streak_days as streak_days',
      )

    const assignments = await knex('assignments').where({ class_id: req.params.id })

    const progress = await Promise.all(
      students.map(async (student: { id: string; name: string; username: string }) => {
        const submissions = await knex('submissions')
          .whereIn(
            'assignment_id',
            assignments.map((a: { id: string }) => a.id),
          )
          .where('user_id', student.id)

        const completed = submissions.filter(
          (s: { submitted_at: unknown }) => s.submitted_at,
        ).length
        return { student, completed, total: assignments.length }
      }),
    )

    res.json({ progress })
  } catch (err) {
    next(err)
  }
})

router.get('/:id/students', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const students = await knex('class_students')
      .join('users', 'class_students.student_id', 'users.id')
      .where('class_students.class_id', req.params.id)
      .select(
        'users.id',
        'users.name',
        'users.username',
        'users.email',
        'class_students.joined_at',
        'users.character_emoji',
      )

    res.json({ students })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/:id/students',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      await knex('class_students')
        .insert({
          class_id: req.params.id,
          student_id: req.body.studentId,
        })
        .onConflict(['class_id', 'student_id'])
        .ignore()

      res.status(201).json({ message: 'Student added' })
    } catch (err) {
      next(err)
    }
  },
)

router.delete(
  '/:id/students/:studentId',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      await knex('class_students')
        .where({ class_id: req.params.id, student_id: req.params.studentId })
        .del()

      res.json({ message: 'Student removed' })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/students/manual',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const { name, email } = req.body
      const id = uuidv4()
      const username = `student_${Date.now()}`
      const tempPassword = 'learnflow123'

      const salt = crypto.randomBytes(32).toString('hex')
      const hash = crypto.pbkdf2Sync(tempPassword, salt, 10000, 64, 'sha256').toString('hex')

      await knex('users').insert({
        id,
        username,
        email: email || `${username}@local`,
        name,
        role: 'student',
        password_hash: hash,
        password_salt: salt,
      })

      const user = await knex('users').where({ id }).first()
      res.status(201).json({ user, tempPassword })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/:id/announcements',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const id = uuidv4()
      await knex('class_announcements').insert({
        id,
        class_id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        created_by: req.user!.userId,
      })

      const announcement = await knex('class_announcements').where({ id }).first()
      res.status(201).json({ announcement })
    } catch (err) {
      next(err)
    }
  },
)

router.get('/:id/announcements', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const announcements = await knex('class_announcements')
      .join('users', 'class_announcements.created_by', 'users.id')
      .where('class_announcements.class_id', req.params.id)
      .select('class_announcements.*', 'users.name as author_name')
      .orderBy('class_announcements.created_at', 'desc')

    res.json({ announcements })
  } catch (err) {
    next(err)
  }
})

router.get(
  '/:id/export-csv',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const students = await knex('class_students')
        .join('users', 'class_students.student_id', 'users.id')
        .where('class_students.class_id', req.params.id)
        .select('users.id', 'users.name')

      const assignments = await knex('assignments').where({ class_id: req.params.id })

      const rows: string[] = ['Name,' + assignments.map((a: { id: string }) => a.id).join(',')]

      for (const s of students) {
        const subs = await knex('submissions')
          .whereIn(
            'assignment_id',
            assignments.map((a: { id: string }) => a.id),
          )
          .where('user_id', s.id)

        const scores = assignments.map((a: { id: string }) => {
          const sub = subs.find((sb: { assignment_id: string }) => sb.assignment_id === a.id)
          return sub && sub.score != null ? String(sub.score) : ''
        })

        rows.push(`${escapeCsvField(s.name)},${scores.join(',')}`)
      }

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=class-results.csv')
      res.send(rows.join('\n'))
    } catch (err) {
      next(err)
    }
  },
)

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true)
    cb(new Error('Only PDF files are accepted'))
  },
})

router.post(
  '/import-pdf',
  requireAuth,
  requireRole('teacher', 'admin'),
  pdfUpload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No PDF file uploaded' })
        return
      }

      setImportTeacherId(req.user!.userId)
      const summary = await importStudentsFromPdf(req.file.buffer)

      res.json({
        message: `Import complete: ${summary.studentsCreated} students created, ${summary.studentsSkipped} skipped`,
        summary: {
          classesCreated: summary.classesCreated,
          classesSkipped: summary.classesSkipped,
          studentsCreated: summary.studentsCreated,
          studentsSkipped: summary.studentsSkipped,
          classNames: summary.classNames,
          errorCount: summary.errors.length,
        },
        credentials: summary.credentials.map((c) => ({
          name: c.name,
          username: c.username,
          password: c.password,
          class: c.className,
        })),
        errors: summary.errors.slice(0, 20),
      })
    } catch (err) {
      next(err)
    }
  },
)

router.post('/join', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const { classCode } = req.body
    if (!classCode) {
      res.status(400).json({ error: 'Class code required' })
      return
    }

    const cls = await knex('classes').where({ class_code: classCode }).first()
    if (!cls) {
      res.status(404).json({ error: 'Class not found' })
      return
    }

    await knex('class_students')
      .insert({
        class_id: cls.id,
        student_id: req.user!.userId,
      })
      .onConflict(['class_id', 'student_id'])
      .ignore()

    res.json({ message: 'Joined class', class: cls })
  } catch (err) {
    next(err)
  }
})

router.get('/student/announcements', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const classIds = await knex('class_students')
      .where('student_id', req.user!.userId)
      .pluck('class_id')

    const announcements = await knex('class_announcements')
      .join('users', 'class_announcements.created_by', 'users.id')
      .whereIn('class_announcements.class_id', classIds)
      .select('class_announcements.*', 'users.name as author_name')
      .orderBy('class_announcements.created_at', 'desc')
      .limit(50)

    res.json({ announcements })
  } catch (err) {
    next(err)
  }
})

export default router
