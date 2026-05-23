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
      courses = await knex('courses').where({ teacher_id: req.user!.userId }).orderBy('created_at', 'desc')
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
      .select('worksheets.*', 'course_worksheets.order_index')
      .orderBy('course_worksheets.order_index', 'asc')

    res.json({ course, worksheets })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    await knex('courses').where({ id: req.params.id }).update({
      name: req.body.name,
      description: req.body.description,
    })
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

router.post('/:id/worksheets', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const id = uuidv4()
    const maxOrder = await knex('course_worksheets').where({ course_id: req.params.id }).max('order_index as max').first()
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
})

router.delete('/:id/worksheets/:worksheetId', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    await knex('course_worksheets')
      .where({ course_id: req.params.id, worksheet_id: req.params.worksheetId })
      .del()
    res.json({ message: 'Worksheet removed from course' })
  } catch (err) {
    next(err)
  }
})

router.put('/:id/worksheets/reorder', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
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
})

router.post('/:id/students', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    await knex('course_students').insert({
      course_id: req.params.id,
      student_id: req.body.student_id,
    }).onConflict(['course_id', 'student_id']).ignore()
    res.status(201).json({ message: 'Student enrolled' })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id/students/:studentId', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    await knex('course_students')
      .where({ course_id: req.params.id, student_id: req.params.studentId })
      .del()
    res.json({ message: 'Student unenrolled' })
  } catch (err) {
    next(err)
  }
})

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

    const courseWs = await knex('course_worksheets')
      .where('course_worksheets.course_id', req.params.id)
      .join('worksheets', 'course_worksheets.worksheet_id', 'worksheets.id')
      .select('worksheets.*', 'course_worksheets.order_index')
      .orderBy('course_worksheets.order_index', 'asc')

    const worksheetIds = courseWs.map((w: { id: string }) => w.id)
    const assignments = await knex('assignments').whereIn('worksheet_id', worksheetIds)
    const assignmentIds = assignments.map((a: { id: string }) => a.id)

    const submissions = await knex('submissions')
      .where('user_id', req.user!.userId)
      .whereIn('assignment_id', assignmentIds)

    const completedCount = submissions.filter((s: { submitted_at: unknown }) => s.submitted_at).length

    res.json({
      course,
      worksheets: courseWs,
      progress: { completed: completedCount, total: courseWs.length },
      submissions,
    })
  } catch (err) {
    next(err)
  }
})

export default router
