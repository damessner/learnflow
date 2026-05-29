import { Router } from 'express'
import { db } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/english/more1/units
// Returns list of MORE!1 units with metadata for the English Hub
// ──────────────────────────────────────────────────────────────────────────────
const MORE1_UNITS = [
  { unit: 1, title: 'Time for School', theme: 'colours, school things, classroom' },
  { unit: 2, title: 'At the Zoo', theme: 'animals' },
  { unit: 3, title: 'Pirates', theme: 'body parts' },
  { unit: 4, title: 'Emotions', theme: 'feelings' },
  { unit: 5, title: 'This is our Band', theme: 'musicians, instruments, movement' },
  { unit: 6, title: "The World's Best Detective", theme: 'action verbs' },
  { unit: 7, title: 'I love Noodles', theme: 'food' },
  { unit: 8, title: 'Clothes', theme: 'clothing' },
  { unit: 9, title: 'Shopping', theme: 'pets' },
  { unit: 10, title: 'In a Shop', theme: 'numbers, demonstratives, shopping' },
  { unit: 11, title: "What's the Time?", theme: 'free time, time expressions' },
  { unit: 12, title: 'The Birthday Cake', theme: 'rooms, months, ordinal numbers' },
  { unit: 13, title: 'Help!', theme: 'emergency services, accidents' },
  { unit: 14, title: "It's my Favourite", theme: 'TV programmes, books' },
  { unit: 15, title: 'What are you Going to Do?', theme: 'future plans' },
]

router.get('/more1/units', requireAuth, async (_req, res) => {
  res.json({ textbook: 'more1', units: MORE1_UNITS })
})

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/english/more1/class-results
// Teacher endpoint: summary of all classes' progress across all units
// Returns: for each class: array of { unit, grammarAvg, vocabAvg, writingCount }
// ──────────────────────────────────────────────────────────────────────────────
router.get('/more1/class-results', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const classes = await db('classes').where({ teacher_id: user.id }).select('id', 'name')

    const result = await Promise.all(
      classes.map(async (cls) => {
        const students = await db('class_students')
          .where({ class_id: cls.id })
          .pluck('student_id')

        if (students.length === 0) {
          return { classId: cls.id, className: cls.name, units: [] }
        }

        // Vocabulary progress per unit
        const vocabByUnit = await db('vocabulary_unit_progress')
          .whereIn('user_id', students)
          .where({ textbook: 'more1' })
          .select('unit')
          .count('final_quiz_completed as quizDone')
          .avg('final_quiz_score as avgScore')
          .groupBy('unit')

        // Grammar attempts per unit (from grammar_attempts if it exists, otherwise just count)
        // We use vocabulary data for now and will expand when grammar tracking is added
        const units = MORE1_UNITS.map((u) => {
          const vocabData = vocabByUnit.find((v) => Number(v.unit) === u.unit)
          return {
            unit: u.unit,
            title: u.title,
            studentsWithVocab: students.length,
            vocabFinalQuizDone: vocabData ? Number(vocabData.quizDone) : 0,
            vocabAvgScore: vocabData ? Math.round(Number(vocabData.avgScore) || 0) : 0,
          }
        })

        return { classId: cls.id, className: cls.name, studentCount: students.length, units }
      })
    )

    res.json(result)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load class results' })
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/english/more1/unit-results/:unit
// Teacher endpoint: per-student results for a given unit across all their classes
// ──────────────────────────────────────────────────────────────────────────────
router.get('/more1/unit-results/:unit', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const unitNum = parseInt(req.params.unit)
    const classIdFilter = req.query.class_id as string | undefined

    let classQuery = db('classes').where({ teacher_id: user.id })
    if (classIdFilter) classQuery = classQuery.where({ id: classIdFilter })
    const classes = await classQuery.select('id', 'name')

    const result = await Promise.all(
      classes.map(async (cls) => {
        const students = await db('class_students')
          .join('users', 'class_students.student_id', 'users.id')
          .where({ class_id: cls.id })
          .select('users.id', 'users.name')

        const studentResults = await Promise.all(
          students.map(async (s) => {
            const vocabProgress = await db('vocabulary_unit_progress')
              .where({ user_id: s.id, textbook: 'more1', unit: unitNum })
              .first()
            const wordsAttempted = await db('vocabulary_progress')
              .where({ user_id: s.id, textbook: 'more1', unit: unitNum })
              .count('id as count')
              .first()

            return {
              studentId: s.id,
              studentName: s.name,
              vocab: {
                starterDone: vocabProgress?.starter_completed || 0,
                practiceDone: vocabProgress?.practice_completed || 0,
                challengeDone: vocabProgress?.challenge_completed || 0,
                finalQuizDone: vocabProgress?.final_quiz_completed || 0,
                finalGrade: vocabProgress?.final_quiz_grade || null,
                finalScore: vocabProgress?.final_quiz_score || 0,
                finalMax: vocabProgress?.final_quiz_max || 0,
                wordsAttempted: (wordsAttempted as any)?.count || 0,
              },
            }
          })
        )

        return { classId: cls.id, className: cls.name, unit: unitNum, students: studentResults }
      })
    )

    res.json(result)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load unit results' })
  }
})

export default router
