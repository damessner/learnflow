import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { scoreAnswers } from './scoring'
import logger from '../lib/logger'

const router = Router()

router.get('/assignment/:id', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const assignment = await knex('assignments').where({ id: req.params.id }).first()
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' })
      return
    }

    let submission = await knex('submissions')
      .where({ assignment_id: assignment.id, user_id: req.user!.userId })
      .first()

    if (!submission) {
      const id = uuidv4()
      await knex('submissions').insert({
        id,
        assignment_id: assignment.id,
        user_id: req.user!.userId,
        answers: '{}',
        score: null,
        max_score: null,
      })
      submission = await knex('submissions').where({ id }).first()
    }

    const worksheet = await knex('worksheets').where({ id: assignment.worksheet_id }).first()

    if (req.user!.role === 'student' && worksheet) {
      try {
        const content = JSON.parse(worksheet.content)
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
        worksheet.content = JSON.stringify(content)
      } catch { /* keep original */ }
    }

    let peerReviews: unknown[] = []
    if (assignment.peer_review_enabled) {
      peerReviews = await knex('peer_reviews').where({ assignment_id: assignment.id })
    }

    res.json({
      submission,
      assignment,
      worksheet,
      peerReviews,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/assignment/:id/save', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const answers = JSON.stringify(req.body.answers || {})

    await knex('submissions')
      .where({ assignment_id: req.params.id, user_id: req.user!.userId })
      .update({ answers, updated_at: knex.fn.now() })

    res.json({ message: 'Progress saved' })
  } catch (err) {
    next(err)
  }
})

router.post('/assignment/:id/submit', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const answers = req.body.answers || {}

    const submission = await knex('submissions')
      .where({ assignment_id: req.params.id, user_id: req.user!.userId })
      .first()

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' })
      return
    }

    const assignment = await knex('assignments').where({ id: req.params.id }).first()
    const worksheet = await knex('worksheets').where({ id: assignment.worksheet_id }).first()

    let blocks: unknown[] = []
    try {
      const content = JSON.parse(worksheet.content)
      blocks = content.blocks || []
    } catch { /* */ }

    const result = scoreAnswers(blocks as Array<{ id: string; type: string; points: number }>, answers)

    const attemptNumber = (await knex('submission_attempts')
      .where({ assignment_id: req.params.id, user_id: req.user!.userId })
      .count({ count: '*' })
      .first()) as { count: number }

    await knex('submission_attempts').insert({
      id: uuidv4(),
      submission_id: submission.id,
      assignment_id: req.params.id,
      user_id: req.user!.userId,
      attempt_number: (attemptNumber?.count || 0) + 1,
      answers: JSON.stringify(answers),
      score: result.score,
      max_score: result.maxScore,
    })

    await knex('submissions')
      .where({ id: submission.id })
      .update({
        answers: JSON.stringify(answers),
        score: result.score,
        max_score: result.maxScore,
        submitted_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })

    const gam = await knex('learning_gamification').where({ user_id: req.user!.userId }).first()
    if (gam) {
      await knex('learning_gamification').where({ user_id: req.user!.userId }).update({
        xp: gam.xp + Math.round(result.score * 10),
      })
    } else {
      await knex('learning_gamification').insert({
        id: uuidv4(),
        user_id: req.user!.userId,
        xp: Math.round(result.score * 10),
        level: 1,
        badges: '[]',
        streak_days: 0,
      })
    }

    res.json({
      score: result.score,
      maxScore: result.maxScore,
      feedback: result.feedback,
      submitted_at: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/feedback', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    await knex('submissions').where({ id: req.params.id }).update({
      feedback: req.body.feedback,
      graded_by: req.user!.userId,
      updated_at: knex.fn.now(),
    })
    res.json({ message: 'Feedback saved' })
  } catch (err) {
    next(err)
  }
})

router.get('/student/summary', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const submissions = await knex('submissions')
      .join('assignments', 'submissions.assignment_id', 'assignments.id')
      .join('worksheets', 'assignments.worksheet_id', 'worksheets.id')
      .where('submissions.user_id', req.user!.userId)
      .select(
        'submissions.*',
        'worksheets.title as worksheet_title',
        'worksheets.subject',
        'assignments.due_date',
      )
      .orderBy('submissions.updated_at', 'desc')

    res.json({ submissions })
  } catch (err) {
    next(err)
  }
})

export default router
