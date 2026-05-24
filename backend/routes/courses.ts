import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    let courses
    if (req.user!.role === 'admin') {
      courses = await knex('courses').orderBy('created_at', 'desc')
    } else {
      courses = await knex('courses')
        .where({ teacher_id: req.user!.userId })
        .orderBy('created_at', 'desc')
    }
    res.json({ courses })
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const id = uuidv4()
    await knex('courses').insert({
      id,
      name: req.body.name,
      description: req.body.description || '',
      teacher_id: req.user!.userId,
      unlock_threshold:
        req.body.unlock_threshold !== undefined ? Number(req.body.unlock_threshold) : 60,
      deadline: req.body.deadline || null,
      badge_name: req.body.badge_name || null,
    })
    const course = await knex('courses').where({ id }).first()
    res.status(201).json({ course })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const course = await knex('courses').where({ id: req.params.id }).first()
    if (!course) {
      res.status(404).json({ error: 'Course not found' })
      return
    }
    const worksheets = await knex('course_worksheets')
      .join('worksheets', 'course_worksheets.worksheet_id', 'worksheets.id')
      .where('course_worksheets.course_id', req.params.id)
      .select(
        'worksheets.*',
        'course_worksheets.order_index',
        'course_worksheets.unlock_threshold as ws_unlock_threshold',
        'course_worksheets.deadline as ws_deadline',
      )
      .orderBy('course_worksheets.order_index', 'asc')

    const students = await knex('course_students')
      .join('users', 'course_students.student_id', 'users.id')
      .where('course_students.course_id', req.params.id)
      .select('users.id', 'users.name', 'users.username', 'users.character_emoji')

    res.json({ course, worksheets, students })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const updateData: Record<string, unknown> = {
      name: req.body.name,
      description: req.body.description,
    }
    if (req.body.unlock_threshold !== undefined) {
      updateData.unlock_threshold = Number(req.body.unlock_threshold)
    }
    if (req.body.deadline !== undefined) {
      updateData.deadline = req.body.deadline || null
    }
    if (req.body.badge_name !== undefined) {
      updateData.badge_name = req.body.badge_name || null
    }

    await knex('courses').where({ id: req.params.id }).update(updateData)
    const course = await knex('courses').where({ id: req.params.id }).first()
    res.json({ course })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    await knex('course_worksheets').where({ course_id: req.params.id }).del()
    await knex('course_students').where({ course_id: req.params.id }).del()
    await knex('courses').where({ id: req.params.id }).del()
    res.json({ message: 'Course deleted' })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/:id/worksheets',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const id = uuidv4()
      const maxOrder = await knex('course_worksheets')
        .where({ course_id: req.params.id })
        .max('order_index as max')
        .first()
      const orderIndex = ((maxOrder as { max: number })?.max || 0) + 1

      await knex('course_worksheets').insert({
        id,
        course_id: req.params.id,
        worksheet_id: req.body.worksheet_id,
        order_index: orderIndex,
      })
      res.status(201).json({ message: 'Worksheet added to course' })
    } catch (err) {
      next(err)
    }
  },
)

router.delete(
  '/:id/worksheets/:worksheetId',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      await knex('course_worksheets')
        .where({ course_id: req.params.id, worksheet_id: req.params.worksheetId })
        .del()
      res.json({ message: 'Worksheet removed from course' })
    } catch (err) {
      next(err)
    }
  },
)

router.put(
  '/:id/worksheets/:worksheetId',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const { unlock_threshold, deadline } = req.body
      const updateData: Record<string, unknown> = {}
      if (unlock_threshold !== undefined) {
        updateData.unlock_threshold = unlock_threshold !== null ? Number(unlock_threshold) : null
      }
      if (deadline !== undefined) {
        updateData.deadline = deadline || null
      }

      await knex('course_worksheets')
        .where({ course_id: req.params.id, worksheet_id: req.params.worksheetId })
        .update(updateData)

      res.json({ message: 'Course worksheet settings updated' })
    } catch (err) {
      next(err)
    }
  },
)

router.put(
  '/:id/worksheets/reorder',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const { worksheetIds } = req.body
      for (let i = 0; i < worksheetIds.length; i++) {
        await knex('course_worksheets')
          .where({ course_id: req.params.id, worksheet_id: worksheetIds[i] })
          .update({ order_index: i })
      }
      res.json({ message: 'Worksheets reordered' })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/:id/students',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      await knex('course_students')
        .insert({
          course_id: req.params.id,
          student_id: req.body.student_id,
        })
        .onConflict(['course_id', 'student_id'])
        .ignore()
      res.status(201).json({ message: 'Student enrolled' })
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
      await knex('course_students')
        .where({ course_id: req.params.id, student_id: req.params.studentId })
        .del()
      res.json({ message: 'Student unenrolled' })
    } catch (err) {
      next(err)
    }
  },
)

router.get('/student/assigned', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const courses = await knex('course_students')
      .join('courses', 'course_students.course_id', 'courses.id')
      .where('course_students.student_id', req.user!.userId)
      .select('courses.*')
      .orderBy('courses.created_at', 'desc')

    res.json({ courses })
  } catch (err) {
    next(err)
  }
})

router.get('/student/course/:id', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const course = await knex('courses').where({ id: req.params.id }).first()
    if (!course) {
      res.status(404).json({ error: 'Course not found' })
      return
    }

    const studentClasses = await knex('class_students')
      .where('student_id', req.user!.userId)
      .pluck('class_id')

    const courseWs = await knex('course_worksheets')
      .where('course_worksheets.course_id', req.params.id)
      .join('worksheets', 'course_worksheets.worksheet_id', 'worksheets.id')
      .select(
        'worksheets.*',
        'course_worksheets.order_index',
        'course_worksheets.unlock_threshold as ws_unlock_threshold',
        'course_worksheets.deadline as ws_deadline',
      )
      .orderBy('course_worksheets.order_index', 'asc')

    const worksheetsProgress = []
    let previousWorksheetCompleted = true

    for (let i = 0; i < courseWs.length; i++) {
      const w = courseWs[i]

      const assignment = await knex('assignments')
        .where({ worksheet_id: w.id })
        .where(function () {
          this.whereIn('class_id', studentClasses).orWhereNull('class_id')
        })
        .first()

      let submissions: Array<{
        submitted_at: string | Date | null
        score: number | null
        max_score: number
      }> = []
      if (assignment) {
        submissions = await knex('submissions').where({
          assignment_id: assignment.id,
          user_id: req.user!.userId,
        })
      }

      let bestScore = 0
      let maxScore = w.total_points || 0
      let bestRatio = 0
      let isSubmitted = false

      if (submissions.length > 0) {
        submissions.forEach(
          (sub: {
            submitted_at: string | Date | null
            score: number | null
            max_score: number
          }) => {
            if (sub.submitted_at && sub.score != null) {
              isSubmitted = true
              const ratio = sub.max_score > 0 ? sub.score / sub.max_score : 0
              if (ratio >= bestRatio) {
                bestRatio = ratio
                bestScore = sub.score
                maxScore = sub.max_score
              }
            }
          },
        )
      }

      const threshold =
        w.ws_unlock_threshold !== null && w.ws_unlock_threshold !== undefined
          ? w.ws_unlock_threshold
          : course.unlock_threshold || 60

      const isCompleted = isSubmitted && bestRatio * 100 >= threshold
      const isLocked = !previousWorksheetCompleted

      worksheetsProgress.push({
        id: w.id,
        title: w.title,
        description: w.description,
        subject: w.subject,
        grade_level: w.grade_level,
        order_index: w.order_index,
        unlock_threshold: threshold,
        deadline: w.ws_deadline || course.deadline || null,
        is_locked: isLocked,
        is_completed: isCompleted,
        best_score: bestScore,
        max_score: maxScore,
        assignment_id: assignment?.id || null,
        content: isLocked ? JSON.stringify({ blocks: [] }) : w.content,
      })

      previousWorksheetCompleted = isCompleted
    }

    const totalWorksheets = worksheetsProgress.length
    const completedCount = worksheetsProgress.filter((w) => w.is_completed).length
    const courseCompleted = totalWorksheets > 0 && completedCount === totalWorksheets

    let badgeAwarded = false
    let xpGained = 0

    if (courseCompleted && course.badge_name) {
      const { awardCourseBadge, addXp } = require('../services/gamification')
      const newlyAwarded = await awardCourseBadge(req.user!.userId, course.badge_name)
      if (newlyAwarded) {
        badgeAwarded = true
        await addXp(req.user!.userId, 100)
        xpGained = 100
      }
    }

    res.json({
      course,
      worksheets: worksheetsProgress,
      progress: { completed: completedCount, total: totalWorksheets },
      course_completed: courseCompleted,
      badge_awarded: badgeAwarded,
      xp_gained: xpGained,
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/courses/:id/reports ──────────────────────────────────────────
// Returns per-student course completion data for teacher report printing
router.get('/:id/reports', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()

    const course = await knex('courses').where({ id: req.params.id }).first()
    if (!course) {
      res.status(404).json({ error: 'Course not found' })
      return
    }

    // All worksheets in this course (ordered)
    const courseWorksheets = await knex('course_worksheets')
      .join('worksheets', 'course_worksheets.worksheet_id', 'worksheets.id')
      .where('course_worksheets.course_id', req.params.id)
      .select(
        'worksheets.id',
        'worksheets.title',
        'worksheets.total_points',
        'course_worksheets.order_index',
        'course_worksheets.unlock_threshold as ws_unlock_threshold',
        'course_worksheets.deadline as ws_deadline',
      )
      .orderBy('course_worksheets.order_index', 'asc')

    // All enrolled students
    const students = await knex('course_students')
      .join('users', 'course_students.student_id', 'users.id')
      .leftJoin('learning_gamification', 'users.id', 'learning_gamification.user_id')
      .where('course_students.course_id', req.params.id)
      .select(
        'users.id',
        'users.name',
        'users.username',
        'users.character_emoji',
        'learning_gamification.xp',
        'learning_gamification.level',
        'learning_gamification.badges',
        'learning_gamification.streak_days',
      )
      .orderBy('users.name', 'asc')

    // Build per-student progress across all course worksheets
    const studentReports = await Promise.all(
      students.map(async (student) => {
        let completedCount = 0
        let totalScore = 0
        let totalMax = 0

        const worksheetDetails = await Promise.all(
          courseWorksheets.map(async (cw) => {
            // Find any assignment for this worksheet
            const assignment = await knex('assignments').where({ worksheet_id: cw.id }).first()

            let submitted = false
            let score: number | null = null
            let maxScore: number | null = cw.total_points ?? null
            let scorePct: number | null = null
            let submittedAt: string | null = null

            if (assignment) {
              const sub = await knex('submissions')
                .where({ assignment_id: assignment.id, user_id: student.id })
                .whereNotNull('submitted_at')
                .orderBy('score', 'desc')
                .first()

              if (sub) {
                submitted = true
                submittedAt = sub.submitted_at
                score = sub.score ?? null
                maxScore = sub.max_score ?? maxScore
                if (maxScore && maxScore > 0 && score !== null) {
                  scorePct = Math.round((score / maxScore) * 100)
                }

                const threshold = cw.ws_unlock_threshold ?? course.unlock_threshold ?? 60
                if (scorePct !== null && scorePct >= threshold) {
                  completedCount++
                }

                if (score !== null) totalScore += score
                if (maxScore !== null) totalMax += maxScore
              }
            }

            return {
              worksheet_id: cw.id,
              title: cw.title,
              order_index: cw.order_index,
              submitted,
              submitted_at: submittedAt,
              score,
              max_score: maxScore,
              score_pct: scorePct,
            }
          }),
        )

        const badges: string[] = (() => {
          try {
            return JSON.parse(student.badges || '[]')
          } catch {
            return []
          }
        })()

        const hasBadge = course.badge_name ? badges.includes(course.badge_name) : false

        return {
          student_id: student.id,
          student_name: student.name,
          student_username: student.username,
          character_emoji: student.character_emoji || '👤',
          xp: student.xp ?? 0,
          level: student.level ?? 1,
          streak_days: student.streak_days ?? 0,
          course_badge_earned: hasBadge,
          completed_worksheets: completedCount,
          total_worksheets: courseWorksheets.length,
          completion_pct:
            courseWorksheets.length > 0
              ? Math.round((completedCount / courseWorksheets.length) * 100)
              : 0,
          average_score_pct: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null,
          worksheets: worksheetDetails,
        }
      }),
    )

    res.json({
      course: {
        id: course.id,
        name: course.name,
        description: course.description,
        deadline: course.deadline,
        badge_name: course.badge_name,
        unlock_threshold: course.unlock_threshold,
      },
      worksheets: courseWorksheets.map((w) => ({
        id: w.id,
        title: w.title,
        order_index: w.order_index,
      })),
      students: studentReports,
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

export default router
