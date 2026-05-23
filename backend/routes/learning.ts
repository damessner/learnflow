import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'

const router = Router()

router.get('/student/mastery', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const mastery = await knex('learning_mastery').where({ user_id: req.user!.userId })
    res.json({ mastery })
  } catch (err) {
    next(err)
  }
})

router.get('/student/spaced-queue', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const queue = await knex('learning_queue')
      .where({ user_id: req.user!.userId })
      .where('due_at', '<=', new Date().toISOString())
      .orderBy('due_at', 'asc')
    res.json({ queue })
  } catch (err) {
    next(err)
  }
})

router.get('/student/planner', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const { start, end } = req.query
    let query = knex('learning_planner').where({ user_id: req.user!.userId })
    if (start) query = query.where('date', '>=', String(start))
    if (end) query = query.where('date', '<=', String(end))

    const planner = await query.orderBy('date', 'asc')
    res.json({ planner })
  } catch (err) {
    next(err)
  }
})

router.post('/student/planner', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const id = req.body.id || uuidv4()

    await knex('learning_planner')
      .insert({
        id,
        user_id: req.user!.userId,
        date: req.body.date,
        worksheet_id: req.body.worksheet_id || null,
        topic: req.body.topic || '',
        completed: req.body.completed || 0,
      })
      .onConflict('id')
      .merge()

    res.status(201).json({ message: 'Planner updated' })
  } catch (err) {
    next(err)
  }
})

router.get('/student/gamification', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    let gam = await knex('learning_gamification').where({ user_id: req.user!.userId }).first()
    if (!gam) {
      const id = uuidv4()
      await knex('learning_gamification').insert({
        id,
        user_id: req.user!.userId,
        xp: 0,
        level: 1,
        badges: '[]',
        streak_days: 0,
      })
      gam = await knex('learning_gamification').where({ id }).first()
    }
    try {
      gam.badges = JSON.parse(gam.badges)
    } catch {
      gam.badges = []
    }
    res.json({ gamification: gam })
  } catch (err) {
    next(err)
  }
})

router.get(
  '/teacher/at-risk',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const classes = await knex('classes').where({ teacher_id: req.user!.userId })
      const classIds = classes.map((c: { id: string }) => c.id)

      const students = await knex('class_students')
        .join('users', 'class_students.student_id', 'users.id')
        .whereIn('class_students.class_id', classIds.length ? classIds : ['none'])
        .select('users.id', 'users.name', 'users.username')

      const atRisk = []
      for (const s of students) {
        const submissions = await knex('submissions').where({ user_id: s.id })
        const total = submissions.length
        const completed = submissions.filter(
          (sb: { submitted_at: unknown }) => sb.submitted_at,
        ).length
        const avgScore =
          submissions.reduce(
            (sum: number, sb: { score: number; max_score: number }) =>
              sum + (sb.score || 0) / (sb.max_score || 1),
            0,
          ) / Math.max(total, 1)

        if (completed < total * 0.5 || avgScore < 0.5) {
          atRisk.push({ ...s, completed, total, avgScore: Math.round(avgScore * 100) })
        }
      }

      res.json({ atRisk })
    } catch (err) {
      next(err)
    }
  },
)

router.get(
  '/teacher/interventions',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      res.json({
        interventions: [
          { type: 'review', description: 'Schedule a one-on-one review session' },
          { type: 'simplify', description: 'Provide simplified versions of exercises' },
          { type: 'retry', description: 'Enable retry policies on assignments' },
          { type: 'gamification', description: 'Leverage gamification to boost engagement' },
        ],
      })
    } catch (err) {
      next(err)
    }
  },
)

router.get(
  '/teacher/analytics',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const classes = await knex('classes').where({ teacher_id: req.user!.userId })
      const classIds = classes.map((c: { id: string }) => c.id)

      const assignments = await knex('assignments').whereIn(
        'class_id',
        classIds.length ? classIds : ['none'],
      )

      const totalAssignments = assignments.length
      let totalSubmissions = 0
      let totalCompleted = 0
      let scoreSum = 0

      for (const a of assignments) {
        const subs = await knex('submissions').where({ assignment_id: a.id })
        totalSubmissions += subs.length
        totalCompleted += subs.filter((s: { submitted_at: unknown }) => s.submitted_at).length
        scoreSum += subs.reduce(
          (sum: number, s: { score: number; max_score: number }) =>
            sum + (s.score || 0) / (s.max_score || 1),
          0,
        )
      }

      res.json({
        analytics: {
          totalClasses: classes.length,
          totalAssignments,
          totalSubmissions,
          completionRate:
            totalSubmissions > 0 ? Math.round((totalCompleted / totalSubmissions) * 100) : 0,
          averageScore: totalSubmissions > 0 ? Math.round((scoreSum / totalSubmissions) * 100) : 0,
        },
      })
    } catch (err) {
      next(err)
    }
  },
)

export default router
