import { Router } from 'express'
import { getKnex } from '../db/knex'
import { requireAuth } from '../middleware/requireAuth'
import { nanoid } from 'nanoid'
import fs from 'fs'
import path from 'path'

const router = Router()

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

const GRAMMAR_PROGRESS_FILE = path.join(__dirname, '..', 'data', 'grammar_progress.json')

function readGrammarProgress() {
  try {
    if (fs.existsSync(GRAMMAR_PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(GRAMMAR_PROGRESS_FILE, 'utf-8'))
    }
  } catch (err) {
    console.error('Error reading grammar progress file', err)
  }
  return {}
}

router.get('/more1/units', requireAuth, async (_req, res) => {
  res.json({ textbook: 'more1', units: MORE1_UNITS })
})

// ─── POST /api/english/writing/complete ──────────────────────────────────────
router.post('/writing/complete', requireAuth, async (req, res) => {
  try {
    const knex = getKnex()
    const userId = (req as any).user.id
    const { textbook, unit, score, grade } = req.body

    if (!textbook || !unit || grade === undefined || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const existing = await knex('vocabulary_unit_progress')
      .where({ user_id: userId, textbook, unit })
      .first()

    if (existing) {
      await knex('vocabulary_unit_progress')
        .where({ user_id: userId, textbook, unit })
        .update({
          writing_completed: 1,
          writing_grade: grade,
          writing_score: score,
          updated_at: new Date().toISOString(),
        })
    } else {
      await knex('vocabulary_unit_progress').insert({
        id: nanoid(),
        user_id: userId,
        textbook,
        unit,
        writing_completed: 1,
        writing_grade: grade,
        writing_score: score,
        updated_at: new Date().toISOString(),
      })
    }

    res.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save writing progress' })
  }
})

// ─── GET /api/english/reading/my-progress ────────────────────────────────────
router.get('/reading/my-progress', requireAuth, async (req, res) => {
  try {
    const knex = getKnex()
    const userId = (req as any).user.id
    const progress = await knex('reading_progress')
      .where({ user_id: userId })
      .select('textbook', 'unit', 'story_id', 'completed', 'score', 'max_score')
    res.json({ progress })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load reading progress' })
  }
})

// ─── POST /api/english/reading/complete ──────────────────────────────────────
router.post('/reading/complete', requireAuth, async (req, res) => {
  try {
    const knex = getKnex()
    const userId = (req as any).user.id
    const { textbook, unit, storyId, score, maxScore } = req.body

    if (!textbook || !unit || !storyId || score === undefined || maxScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const existing = await knex('reading_progress')
      .where({ user_id: userId, textbook, unit, story_id: storyId })
      .first()

    if (existing) {
      await knex('reading_progress')
        .where({ user_id: userId, textbook, unit, story_id: storyId })
        .update({
          completed: 1,
          score,
          max_score: maxScore,
          updated_at: new Date().toISOString(),
        })
    } else {
      await knex('reading_progress').insert({
        id: nanoid(),
        user_id: userId,
        textbook,
        unit,
        story_id: storyId,
        completed: 1,
        score,
        max_score: maxScore,
        updated_at: new Date().toISOString(),
      })
    }

    res.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save reading progress' })
  }
})

// ─── GET /api/english/listening/my-progress ──────────────────────────────────
router.get('/listening/my-progress', requireAuth, async (req, res) => {
  try {
    const knex = getKnex()
    const userId = (req as any).user.id
    const progress = await knex('listening_progress')
      .where({ user_id: userId })
      .select('textbook', 'unit', 'listening_id', 'completed', 'score', 'max_score')
    res.json({ progress })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load listening progress' })
  }
})

// ─── POST /api/english/listening/complete ────────────────────────────────────
router.post('/listening/complete', requireAuth, async (req, res) => {
  try {
    const knex = getKnex()
    const userId = (req as any).user.id
    const { textbook, unit, listeningId, score, maxScore } = req.body

    if (!textbook || !unit || !listeningId || score === undefined || maxScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const existing = await knex('listening_progress')
      .where({ user_id: userId, textbook, unit, listening_id: listeningId })
      .first()

    if (existing) {
      await knex('listening_progress')
        .where({ user_id: userId, textbook, unit, listening_id: listeningId })
        .update({
          completed: 1,
          score,
          max_score: maxScore,
          updated_at: new Date().toISOString(),
        })
    } else {
      await knex('listening_progress').insert({
        id: nanoid(),
        user_id: userId,
        textbook,
        unit,
        listening_id: listeningId,
        completed: 1,
        score,
        max_score: maxScore,
        updated_at: new Date().toISOString(),
      })
    }

    res.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save listening progress' })
  }
})

// ─── GET /api/english/more1/class-results ────────────────────────────────────
router.get('/more1/class-results', requireAuth, async (req, res) => {
  try {
    const knex = getKnex()
    const user = (req as any).user
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const classes = await knex('classes').where({ teacher_id: user.id }).select('id', 'name')
    const grammarProgress = readGrammarProgress()

    const result = await Promise.all(
      classes.map(async (cls: any) => {
        const students = await knex('class_students')
          .where({ class_id: cls.id })
          .pluck('student_id')

        if (students.length === 0) {
          return { classId: cls.id, className: cls.name, studentCount: 0, units: [] }
        }

        const vocabByUnit = await knex('vocabulary_unit_progress')
          .whereIn('user_id', students)
          .where({ textbook: 'more1' })
          .select('unit')
          .count('final_quiz_completed as quizDone')
          .avg('final_quiz_score as avgScore')
          .count('writing_completed as writingDone')
          .groupBy('unit')

        const readingByUnit = await knex('reading_progress')
          .whereIn('user_id', students)
          .where({ textbook: 'more1' })
          .select('unit')
          .count('completed as done')
          .groupBy('unit')

        const listeningByUnit = await knex('listening_progress')
          .whereIn('user_id', students)
          .where({ textbook: 'more1' })
          .select('unit')
          .count('completed as done')
          .groupBy('unit')

        const units = MORE1_UNITS.map((u) => {
          const vocabData = vocabByUnit.find((v: any) => Number(v.unit) === u.unit)
          const readingData = readingByUnit.find((r: any) => Number(r.unit) === u.unit)
          const listeningData = listeningByUnit.find((l: any) => Number(l.unit) === u.unit)

          let grammarDone = 0
          students.forEach((studentId: string) => {
            const userProg = grammarProgress[studentId]
            if (userProg && userProg.completions) {
              const topicKey = Object.keys(userProg.completions).find((k: string) =>
                k.startsWith(`grammar-${u.unit}-`)
              )
              if (topicKey) {
                const comp = userProg.completions[topicKey]
                if (comp.Explorer || comp.Pioneer || comp.Master) {
                  grammarDone++
                }
              }
            }
          })

          return {
            unit: u.unit,
            title: u.title,
            studentsCount: students.length,
            vocabFinalQuizDone: vocabData ? Number((vocabData as any).quizDone || 0) : 0,
            vocabAvgScore: vocabData ? Math.round(Number((vocabData as any).avgScore) || 0) : 0,
            grammarDone,
            writingDone: vocabData ? Number((vocabData as any).writingDone || 0) : 0,
            readingDone: readingData ? Number((readingData as any).done || 0) : 0,
            listeningDone: listeningData ? Number((listeningData as any).done || 0) : 0,
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

// ─── GET /api/english/more1/unit-results/:unit ───────────────────────────────
router.get('/more1/unit-results/:unit', requireAuth, async (req, res) => {
  try {
    const knex = getKnex()
    const user = (req as any).user
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const unitNum = parseInt(req.params.unit as string)
    const classIdFilter = req.query.class_id as string | undefined

    let classQuery = knex('classes').where({ teacher_id: user.id })
    if (classIdFilter) classQuery = classQuery.where({ id: classIdFilter })
    const classes = await classQuery.select('id', 'name')

    const grammarProgress = readGrammarProgress()

    const result = await Promise.all(
      classes.map(async (cls: any) => {
        const students = await knex('class_students')
          .join('users', 'class_students.student_id', 'users.id')
          .where({ class_id: cls.id })
          .select('users.id', 'users.name')

        const studentResults = await Promise.all(
          students.map(async (s: any) => {
            const vocabProgress = await knex('vocabulary_unit_progress')
              .where({ user_id: s.id, textbook: 'more1', unit: unitNum })
              .first()
            const wordsAttempted = await knex('vocabulary_progress')
              .where({ user_id: s.id, textbook: 'more1', unit: unitNum })
              .count('id as count')
              .first()

            const readingProgress = await knex('reading_progress')
              .where({ user_id: s.id, textbook: 'more1', unit: unitNum })

            const listeningProgress = await knex('listening_progress')
              .where({ user_id: s.id, textbook: 'more1', unit: unitNum })

            const userProg = grammarProgress[s.id] || { completions: {}, quizzes: {} }
            const topicKey = Object.keys(userProg.completions || {}).find((k: string) =>
              k.startsWith(`grammar-${unitNum}-`)
            )
            const topicCompletions = topicKey ? userProg.completions[topicKey] : null
            const topicQuiz = topicKey ? userProg.quizzes?.[topicKey] : null

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
              grammar: {
                explorerDone: topicCompletions?.Explorer ? 1 : 0,
                pioneerDone: topicCompletions?.Pioneer ? 1 : 0,
                masterDone: topicCompletions?.Master ? 1 : 0,
                quizGrade: topicQuiz?.grade || null,
              },
              writing: {
                completed: vocabProgress?.writing_completed || 0,
                grade: vocabProgress?.writing_grade || null,
                score: vocabProgress?.writing_score || 0,
              },
              reading: {
                completedCount: readingProgress.filter((p: any) => p.completed).length,
                stories: readingProgress.map((p: any) => ({
                  storyId: p.story_id,
                  completed: p.completed,
                  score: p.score,
                  max: p.max_score,
                })),
              },
              listening: {
                completedCount: listeningProgress.filter((p: any) => p.completed).length,
                tasks: listeningProgress.map((p: any) => ({
                  listeningId: p.listening_id,
                  completed: p.completed,
                  score: p.score,
                  max: p.max_score,
                })),
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

// ─── GET /api/english/more1/class-matrix/:classId ────────────────────────────
router.get('/more1/class-matrix/:classId', requireAuth, async (req, res) => {
  try {
    const knex = getKnex()
    const user = (req as any).user
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const classId = req.params.classId
    const students = await knex('class_students')
      .join('users', 'class_students.student_id', 'users.id')
      .where({ class_id: classId })
      .select('users.id', 'users.name')

    const grammarProgress = readGrammarProgress()

    const matrix = await Promise.all(
      students.map(async (s: any) => {
        const vocabProgList = await knex('vocabulary_unit_progress')
          .where({ user_id: s.id, textbook: 'more1' })

        const readingProgList = await knex('reading_progress')
          .where({ user_id: s.id, textbook: 'more1' })

        const listeningProgList = await knex('listening_progress')
          .where({ user_id: s.id, textbook: 'more1' })

        const userProg = grammarProgress[s.id] || { completions: {}, quizzes: {} }

        const unitsData = Array.from({ length: 15 }, (_, idx) => {
          const unitNum = idx + 1
          const vocabProgress = vocabProgList.find((p: any) => p.unit === unitNum)

          const topicKey = Object.keys(userProg.completions || {}).find((k: string) =>
            k.startsWith(`grammar-${unitNum}-`)
          )
          const topicCompletions = topicKey ? userProg.completions[topicKey] : null
          const topicQuiz = topicKey ? userProg.quizzes?.[topicKey] : null

          const unitReading = readingProgList.filter((p: any) => p.unit === unitNum)
          const readingCompletedCount = unitReading.filter((p: any) => p.completed).length
          const readingAvgScore = unitReading.length > 0
            ? Math.round(unitReading.reduce((sum: number, p: any) => sum + (p.score / p.max_score), 0) / unitReading.length * 100)
            : null
          const readingGrade = readingAvgScore !== null
            ? (readingAvgScore >= 90 ? 'A' : readingAvgScore >= 80 ? 'B' : readingAvgScore >= 60 ? 'C' : readingAvgScore >= 50 ? 'D' : 'F')
            : null

          const unitListening = listeningProgList.filter((p: any) => p.unit === unitNum)
          const listeningCompletedCount = unitListening.filter((p: any) => p.completed).length
          const listeningAvgScore = unitListening.length > 0
            ? Math.round(unitListening.reduce((sum: number, p: any) => sum + (p.score / p.max_score), 0) / unitListening.length * 100)
            : null
          const listeningGrade = listeningAvgScore !== null
            ? (listeningAvgScore >= 90 ? 'A' : listeningAvgScore >= 80 ? 'B' : listeningAvgScore >= 60 ? 'C' : listeningAvgScore >= 50 ? 'D' : 'F')
            : null

          return {
            unit: unitNum,
            vocab: {
              completed: vocabProgress?.final_quiz_completed || 0,
              grade: vocabProgress?.final_quiz_grade || null,
              score: vocabProgress?.final_quiz_score || 0,
              max: vocabProgress?.final_quiz_max || 0,
            },
            grammar: {
              explorerDone: topicCompletions?.Explorer ? 1 : 0,
              pioneerDone: topicCompletions?.Pioneer ? 1 : 0,
              masterDone: topicCompletions?.Master ? 1 : 0,
              quizGrade: topicQuiz?.grade || null,
            },
            writing: {
              completed: vocabProgress?.writing_completed || 0,
              grade: vocabProgress?.writing_grade || null,
              score: vocabProgress?.writing_score || 0,
            },
            reading: {
              completed: readingCompletedCount > 0 ? 1 : 0,
              grade: readingGrade,
              score: readingAvgScore || 0,
              completedCount: readingCompletedCount
            },
            listening: {
              completed: listeningCompletedCount > 0 ? 1 : 0,
              grade: listeningGrade,
              score: listeningAvgScore || 0,
              completedCount: listeningCompletedCount
            }
          }
        })

        return {
          studentId: s.id,
          studentName: s.name,
          units: unitsData
        }
      })
    )

    res.json({ matrix })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load class matrix' })
  }
})

export default router
