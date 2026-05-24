import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { scoreAnswers } from './scoring'
import { reviewKnowledgeComponent } from '../services/srs'
import { addXp, updateStreak, awardActivityBadges } from '../services/gamification'
import { Rating } from 'ts-fsrs'

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
      } catch {
        /* keep original */
      }
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

    const prevScore = submission.score
    const prevMaxScore = submission.max_score
    const prevRatio = prevScore !== null && prevMaxScore > 0 ? prevScore / prevMaxScore : 0

    const assignment = await knex('assignments').where({ id: req.params.id }).first()
    const worksheet = await knex('worksheets').where({ id: assignment.worksheet_id }).first()

    let blocks: unknown[] = []
    try {
      const content = JSON.parse(worksheet.content)
      blocks = content.blocks || []
    } catch {
      /* */
    }

    const result = scoreAnswers(
      blocks as Array<{ id: string; type: string; points: number }>,
      answers,
    )

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
    if (!gam) {
      await knex('learning_gamification').insert({
        id: uuidv4(),
        user_id: req.user!.userId,
        xp: 0,
        level: 1,
        badges: '[]',
        streak_days: 0,
      })
    }

    const wagers = (req.body.wagers || {}) as Record<string, number>
    const perBlockConfidence = (req.body.per_block_confidence || {}) as Record<string, number>
    let totalXpEarned = 0
    let totalXpLost = 0
    const wageringResults: Record<string, unknown>[] = []

    for (const blockScore of result.blockScores) {
      const wagerAmount = wagers[blockScore.blockId]
      if (!wagerAmount || wagerAmount <= 0) continue

      const confidenceLevel = perBlockConfidence[blockScore.blockId] || 3
      const confidenceNorm = Math.max(0.2, Math.min(1.0, confidenceLevel / 5))
      const ratio = blockScore.maxScore > 0 ? blockScore.score / blockScore.maxScore : 0
      const isCorrect = ratio >= 0.6

      let xpDelta = 0
      if (isCorrect) {
        const multiplier = 1.0 + confidenceNorm * 2.0
        xpDelta = Math.round(wagerAmount * multiplier)
        totalXpEarned += xpDelta
      } else {
        xpDelta = -Math.round(wagerAmount * confidenceNorm * 0.8)
        totalXpLost += Math.abs(xpDelta)
      }

      wageringResults.push({
        blockId: blockScore.blockId,
        wagered: wagerAmount,
        confidence: confidenceLevel,
        correct: isCorrect,
        earned: xpDelta,
      })
    }

    if (wageringResults.length === 0) {
      const flatXp = Math.round(result.score * 10)
      totalXpEarned = flatXp
    }

    const newRatio = result.maxScore > 0 ? result.score / result.maxScore : 0
    let gritBonusAwarded = false
    if (prevScore !== null && newRatio - prevRatio >= 0.3) {
      gritBonusAwarded = true
    }

    let netXp = totalXpEarned - totalXpLost
    if (gritBonusAwarded) {
      netXp += 150
    }

    const { newXp, newLevel, leveledUp, newBadges } = await addXp(req.user!.userId, netXp)
    await updateStreak(req.user!.userId)
    if (wageringResults.length > 0) {
      await awardActivityBadges(req.user!.userId, 'wagers_won')
    }
    await awardActivityBadges(req.user!.userId, 'submissions_completed')
    await awardActivityBadges(req.user!.userId, 'perfect_score')

    // Update SRS and Mastery if confidence was provided
    const confidence = parseInt(req.body.confidence || '3')
    const pass = result.score / (result.maxScore || 1) >= 0.6

    // Attempt to extract a generic topic if the worksheet has one, otherwise use the worksheet subject or title
    const topic = worksheet.subject || worksheet.title || 'General'

    // Update Mastery
    const existingMastery = await knex('learning_mastery')
      .where({ user_id: req.user!.userId, topic })
      .first()
    let newMasteryLevel = 50
    if (existingMastery) {
      newMasteryLevel = pass
        ? Math.min(100, existingMastery.mastery_level + 10)
        : Math.max(0, existingMastery.mastery_level - 15)
      await knex('learning_mastery')
        .where({ id: existingMastery.id })
        .update({ mastery_level: newMasteryLevel, last_practiced_at: knex.fn.now() })
    } else {
      newMasteryLevel = pass ? 60 : 40
      await knex('learning_mastery').insert({
        id: uuidv4(),
        user_id: req.user!.userId,
        topic,
        mastery_level: newMasteryLevel,
        last_practiced_at: knex.fn.now(),
      })
    }

    // Update Spaced Repetition Queue based on confidence
    const daysToAdd = pass ? confidence * 2 : 1
    const nextDue = new Date()
    nextDue.setDate(nextDue.getDate() + daysToAdd)

    const existingQueue = await knex('learning_queue')
      .where({ user_id: req.user!.userId, topic })
      .first()
    if (existingQueue) {
      await knex('learning_queue')
        .where({ id: existingQueue.id })
        .update({ due_at: nextDue.toISOString() })
    } else {
      await knex('learning_queue').insert({
        id: uuidv4(),
        user_id: req.user!.userId,
        worksheet_id: worksheet.id,
        topic,
        due_at: nextDue.toISOString(),
      })
    }

    // Process Spaced Repetition (FSRS) for all blocks with kc_ids
    for (const blockScore of result.blockScores) {
      const block = blocks.find(
        (b: unknown) => (b as Record<string, unknown>).id === blockScore.blockId,
      ) as Record<string, unknown> | undefined
      if (block && block.kc_ids && Array.isArray(block.kc_ids)) {
        // Map the score ratio to FSRS Rating (1=Again, 2=Hard, 3=Good, 4=Easy)
        const ratio = blockScore.maxScore > 0 ? blockScore.score / blockScore.maxScore : 0
        let rating = Rating.Again
        if (ratio >= 1.0) rating = Rating.Easy
        else if (ratio >= 0.8) rating = Rating.Good
        else if (ratio >= 0.5) rating = Rating.Hard
        else rating = Rating.Again

        for (const kc_id of block.kc_ids) {
          await reviewKnowledgeComponent(req.user!.userId, kc_id, rating)
        }
      }
    }

    res.json({
      score: result.score,
      maxScore: result.maxScore,
      feedback: result.feedback,
      submitted_at: new Date().toISOString(),
      xpEarned: totalXpEarned + (gritBonusAwarded ? 150 : 0),
      xpLost: totalXpLost,
      newXp,
      newLevel,
      leveledUp,
      newBadges,
      wageringResults,
      gritBonusAwarded,
    })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/:id/feedback',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
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
  },
)

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
