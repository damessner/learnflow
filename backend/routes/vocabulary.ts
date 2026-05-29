import { Router } from 'express'
import { getKnex } from '../db/knex'
import { requireAuth } from '../middleware/requireAuth'
import { nanoid } from 'nanoid'

const router = Router()

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/vocabulary/:textbook/:unit
// Returns the word list for a given unit (served from static data — no DB needed
// for the list itself, but we return it so the frontend has a single source of truth)
// ──────────────────────────────────────────────────────────────────────────────
router.get('/:textbook/:unit', requireAuth, async (req, res) => {
  try {
    const { textbook, unit } = req.params
    const unitStr = Array.isArray(unit) ? unit[0] : unit
    const unitNum = parseInt(unitStr)
    if (isNaN(unitNum) || unitNum < 1 || unitNum > 15) {
      return res.status(400).json({ error: 'Invalid unit number' })
    }
    const userId = (req as any).user.id
    const progress = await getKnex()('vocabulary_progress')
      .where({ user_id: userId, textbook, unit: unitNum })
      .select('word_en', 'word_de', 'attempts', 'correct', 'last_seen_at')

    const unitProgress = await getKnex()('vocabulary_unit_progress')
      .where({ user_id: userId, textbook, unit: unitNum })
      .first()

    res.json({
      textbook,
      unit: unitNum,
      wordProgress: progress,
      unitProgress: unitProgress || null,
    })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load vocabulary progress' })
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/vocabulary/progress
// Record the result of answering a vocabulary question
// Body: { textbook, unit, word_en, word_de, correct: boolean }
// ──────────────────────────────────────────────────────────────────────────────
router.post('/progress', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { textbook, unit, word_en, word_de, correct } = req.body

    if (!textbook || !unit || !word_en || !word_de) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const existing = await getKnex()('vocabulary_progress')
      .where({ user_id: userId, textbook, unit, word_en })
      .first()

    if (existing) {
      await getKnex()('vocabulary_progress')
        .where({ user_id: userId, textbook, unit, word_en })
        .update({
          attempts: existing.attempts + 1,
          correct: existing.correct + (correct ? 1 : 0),
          last_seen_at: new Date().toISOString(),
        })
    } else {
      await getKnex()('vocabulary_progress').insert({
        id: nanoid(),
        user_id: userId,
        textbook,
        unit,
        word_en,
        word_de,
        attempts: 1,
        correct: correct ? 1 : 0,
        last_seen_at: new Date().toISOString(),
      })
    }

    res.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save progress' })
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/vocabulary/tier-complete
// Mark a tier (starter/practice/challenge) as completed for a unit
// Body: { textbook, unit, tier: 'starter'|'practice'|'challenge', score, maxScore }
// ──────────────────────────────────────────────────────────────────────────────
router.post('/tier-complete', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { textbook, unit, tier, score, maxScore } = req.body

    if (!['starter', 'practice', 'challenge'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' })
    }

    const existing = await getKnex()('vocabulary_unit_progress')
      .where({ user_id: userId, textbook, unit })
      .first()

    const updateField = `${tier}_completed`
    if (existing) {
      await getKnex()('vocabulary_unit_progress')
        .where({ user_id: userId, textbook, unit })
        .update({ [updateField]: 1, updated_at: new Date().toISOString() })
    } else {
      await getKnex()('vocabulary_unit_progress').insert({
        id: nanoid(),
        user_id: userId,
        textbook,
        unit,
        [updateField]: 1,
        updated_at: new Date().toISOString(),
      })
    }

    res.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save tier completion' })
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/vocabulary/final-quiz/:textbook/:unit
// Returns up to 10 words the student got wrong most often (for adaptive final quiz)
// ──────────────────────────────────────────────────────────────────────────────
router.get('/final-quiz/:textbook/:unit', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { textbook, unit } = req.params
    const unitStr = Array.isArray(unit) ? unit[0] : unit
    const unitNum = parseInt(unitStr)

    // Words with at least 1 attempt, sorted by worst accuracy first
    const words = await getKnex()('vocabulary_progress')
      .where({ user_id: userId, textbook, unit: unitNum })
      .where('attempts', '>', 0)
      .orderByRaw('CAST(correct AS REAL) / CAST(attempts AS REAL) ASC')
      .limit(10)
      .select('word_en', 'word_de', 'attempts', 'correct')

    // If fewer than 10 words attempted, pad with random words from the unit
    // (frontend handles this using the full word list)
    res.json({ words, hasEnoughData: words.length >= 5 })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load final quiz words' })
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/vocabulary/final-quiz-complete
// Save the final quiz result
// Body: { textbook, unit, score, maxScore, grade }
// ──────────────────────────────────────────────────────────────────────────────
router.post('/final-quiz-complete', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { textbook, unit, score, maxScore, grade } = req.body

    const existing = await getKnex()('vocabulary_unit_progress')
      .where({ user_id: userId, textbook, unit })
      .first()

    if (existing) {
      await getKnex()('vocabulary_unit_progress')
        .where({ user_id: userId, textbook, unit })
        .update({
          final_quiz_completed: 1,
          final_quiz_grade: grade,
          final_quiz_score: score,
          final_quiz_max: maxScore,
          updated_at: new Date().toISOString(),
        })
    } else {
      await getKnex()('vocabulary_unit_progress').insert({
        id: nanoid(),
        user_id: userId,
        textbook,
        unit,
        final_quiz_completed: 1,
        final_quiz_grade: grade,
        final_quiz_score: score,
        final_quiz_max: maxScore,
        updated_at: new Date().toISOString(),
      })
    }

    res.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save final quiz result' })
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// DELETE /api/vocabulary/reset/:textbook/:unit
// Reset all progress for a unit so student can start again
// ──────────────────────────────────────────────────────────────────────────────
router.delete('/reset/:textbook/:unit', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { textbook, unit } = req.params

    await getKnex()('vocabulary_progress').where({ user_id: userId, textbook, unit }).delete()
    await getKnex()('vocabulary_unit_progress').where({ user_id: userId, textbook, unit }).delete()

    res.json({ ok: true, message: 'Progress reset successfully' })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to reset progress' })
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/vocabulary/class-progress/:textbook/:unit  (teacher only)
// Returns all students' progress for a given unit, grouped by class
// ──────────────────────────────────────────────────────────────────────────────
router.get('/class-progress/:textbook/:unit', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const { textbook, unit } = req.params

    // Get all classes for this teacher
    const classes = await getKnex()('classes').where({ teacher_id: user.id }).select('id', 'name')

    const result = []
    for (const cls of classes) {
      const students = await getKnex()('class_students')
        .join('users', 'class_students.student_id', 'users.id')
        .where({ class_id: cls.id })
        .select('users.id', 'users.name')

      const studentProgress = await Promise.all(
        students.map(async (s: any) => {
          const unitProgress = await getKnex()('vocabulary_unit_progress')
            .where({ user_id: s.id, textbook, unit })
            .first()
          const wordCount = await getKnex()('vocabulary_progress')
            .where({ user_id: s.id, textbook, unit })
            .count('id as count')
            .first()
          return {
            studentId: s.id,
            studentName: s.name,
            starterDone: unitProgress?.starter_completed || 0,
            practiceDone: unitProgress?.practice_completed || 0,
            challengeDone: unitProgress?.challenge_completed || 0,
            finalQuizDone: unitProgress?.final_quiz_completed || 0,
            finalGrade: unitProgress?.final_quiz_grade || null,
            finalScore: unitProgress?.final_quiz_score || 0,
            wordsAttempted: (wordCount as any)?.count || 0,
          }
        })
      )

      result.push({ classId: cls.id, className: cls.name, students: studentProgress })
    }

    res.json(result)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load class progress' })
  }
})

export default router
