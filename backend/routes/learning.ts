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

router.get('/student/daily-mix', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    // Find due items in learning_queue (Spaced Repetition)
    const dueItems = await knex('learning_queue')
      .where({ user_id: req.user!.userId })
      .where('due_at', '<=', new Date().toISOString())
      .orderBy('due_at', 'asc')
      .limit(5)

    // Interleaving: If fewer than 5 items due, mix in low-mastery concepts
    const mix = [...dueItems]
    if (mix.length < 5) {
      const lowMastery = await knex('learning_mastery')
        .where({ user_id: req.user!.userId })
        .orderBy('mastery_level', 'asc')
        .limit(5 - mix.length)

      for (const lm of lowMastery) {
        // Only add if not already in mix
        if (!mix.find((m) => m.topic === lm.topic)) {
          mix.push({
            id: lm.id,
            topic: lm.topic,
            is_interleaved: true,
            mastery_level: lm.mastery_level,
          })
        }
      }
    }

    res.json({ dailyMix: mix })
  } catch (err) {
    next(err)
  }
})

router.post('/student/daily-mix/complete', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const { itemsCompleted } = req.body // array of { topic, confidence (1-5), correct (boolean) }

    // SRS Logic (SuperMemo-2 inspired simplified logic)
    for (const item of itemsCompleted || []) {
      // 1. Update Mastery
      const existingMastery = await knex('learning_mastery')
        .where({ user_id: req.user!.userId, topic: item.topic })
        .first()
      let newLevel = 50
      if (existingMastery) {
        newLevel = item.correct
          ? Math.min(100, existingMastery.mastery_level + 10)
          : Math.max(0, existingMastery.mastery_level - 15)
        await knex('learning_mastery')
          .where({ id: existingMastery.id })
          .update({ mastery_level: newLevel, last_practiced_at: knex.fn.now() })
      } else {
        newLevel = item.correct ? 60 : 40
        await knex('learning_mastery').insert({
          id: uuidv4(),
          user_id: req.user!.userId,
          topic: item.topic,
          mastery_level: newLevel,
          last_practiced_at: knex.fn.now(),
        })
      }

      // 2. Update Spaced Repetition Queue based on confidence
      // Higher confidence -> longer interval
      const daysToAdd = item.correct ? (item.confidence || 3) * 2 : 1
      const nextDue = new Date()
      nextDue.setDate(nextDue.getDate() + daysToAdd)

      const existingQueue = await knex('learning_queue')
        .where({ user_id: req.user!.userId, topic: item.topic })
        .first()
      if (existingQueue) {
        await knex('learning_queue')
          .where({ id: existingQueue.id })
          .update({ due_at: nextDue.toISOString() })
      } else {
        await knex('learning_queue').insert({
          id: uuidv4(),
          user_id: req.user!.userId,
          topic: item.topic,
          due_at: nextDue.toISOString(),
        })
      }
    }

    // 3. Dopamine Gamification (Award XP)
    const gam = await knex('learning_gamification').where({ user_id: req.user!.userId }).first()
    const xpGained = (itemsCompleted?.length || 0) * 10
    if (gam) {
      await knex('learning_gamification')
        .where({ id: gam.id })
        .update({ xp: gam.xp + xpGained })
    }

    res.json({ message: 'Daily mix completed', xpGained })
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

router.get('/student/wager-history', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const attempts = await knex('submission_attempts')
      .where({ user_id: req.user!.userId })
      .orderBy('created_at', 'desc')
      .limit(50)
      .select('answers', 'score', 'max_score', 'created_at')

    let totalWagers = 0
    let correctWagers = 0
    let totalWageredXp = 0
    let totalEarnedXp = 0

    const byConfidence: Record<number, { total: number; correct: number }> = { 1: { total: 0, correct: 0 }, 3: { total: 0, correct: 0 }, 5: { total: 0, correct: 0 } }

    for (const a of attempts) {
      try {
        const answers = JSON.parse(a.answers || '{}')
        if (answers._wagers && answers._confidence) {
          const wagers = answers._wagers
          const confidence = answers._confidence
          const ratio = a.max_score > 0 ? a.score / a.max_score : 0
          for (const blockId of Object.keys(wagers)) {
            const conf = confidence[blockId] || 3
            const key = conf >= 4 ? 5 : conf >= 2 ? 3 : 1
            byConfidence[key].total++
            if (ratio >= 0.6) byConfidence[key].correct++
            totalWagers++
            if (ratio >= 0.6) correctWagers++
            totalWageredXp += wagers[blockId] || 0
          }
        }
      } catch { /* skip malformed */ }
    }

    const calibrationScore = totalWagers > 0 ? Math.round((correctWagers / totalWagers) * 100) : 0

    res.json({
      calibrationScore,
      totalWagers,
      correctWagers,
      byConfidence,
      accuracy: totalWagers > 0 ? Math.round((correctWagers / totalWagers) * 100) : 0,
    })
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
      const knex = getKnex()
      const classes = await knex('classes').where({ teacher_id: req.user!.userId })
      const classIds = classes.map((c: { id: string }) => c.id)

      const students = await knex('class_students')
        .join('users', 'class_students.student_id', 'users.id')
        .whereIn('class_students.class_id', classIds.length ? classIds : ['none'])
        .select('users.id', 'users.name')

      const interventions = []

      for (const s of students) {
        // Check recent failing submissions (At-Risk metric)
        const recentFails = await knex('submissions')
          .where({ user_id: s.id })
          .whereNotNull('score')
          .orderBy('submitted_at', 'desc')
          .limit(3)

        let failCount = 0
        for (const sub of recentFails) {
          if (sub.score / (sub.max_score || 1) < 0.6) failCount++
        }

        if (failCount >= 2) {
          interventions.push({
            type: 'Academic',
            description: `${s.name} has failed ${failCount} recent assignments. Consider a 1-on-1 review or interleaving remedial practice.`,
          })
        }

        // Check low mastery / knowledge gaps (Cognitive Load metric)
        const lowMastery = await knex('learning_mastery')
          .where({ user_id: s.id })
          .where('mastery_level', '<', 40)
          .limit(2)
        if (lowMastery.length > 0) {
          const topics = lowMastery.map((m: { topic: string }) => m.topic).join(', ')
          interventions.push({
            type: 'Knowledge Gap',
            description: `${s.name} is struggling with: ${topics}. Assign targeted Active Recall exercises.`,
          })
        }
      }

      // If no one is struggling, suggest advanced cognitive strategies
      if (interventions.length === 0) {
        interventions.push({
          type: 'General',
          description:
            'Your class is doing well! Consider advanced interleaving exercises to challenge them.',
        })
      }

      res.json({ interventions })
    } catch (err) {
      next(err)
    }
  },
)

router.get(
  '/teacher/mastery-map',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const classes = await knex('classes').where({ teacher_id: req.user!.userId })
      const classIds = classes.map((c: { id: string }) => c.id)

      const students = await knex('class_students')
        .whereIn('class_id', classIds.length ? classIds : ['none'])
        .pluck('student_id')

      if (students.length === 0) {
        res.json({ masteryMap: [] })
        return
      }

      const masteries = await knex('learning_mastery').whereIn('user_id', students)

      // Aggregate mastery by topic across the entire class to find class-wide weak points
      const topicAgg: Record<string, { total: number; count: number }> = {}
      for (const m of masteries) {
        if (!topicAgg[m.topic]) topicAgg[m.topic] = { total: 0, count: 0 }
        topicAgg[m.topic].total += m.mastery_level
        topicAgg[m.topic].count += 1
      }

      const masteryMap = Object.entries(topicAgg)
        .map(([topic, data]) => ({
          topic,
          averageMastery: Math.round(data.total / data.count),
        }))
        .sort((a, b) => a.averageMastery - b.averageMastery) // weakest topics first

      res.json({ masteryMap })
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
