import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'

const router = Router()

router.get('/worksheets', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    let query = knex('worksheets').where('in_library', 1)

    const { search, subject, grade_level, sort } = req.query
    if (search) {
      const escaped = String(search).replace(/[%_]/g, '\\$&')
      query = query.where('title', 'like', `%${escaped}%`)
    }
    if (subject) query = query.where('subject', subject as string)
    if (grade_level) query = query.where('grade_level', grade_level as string)

    switch (sort) {
      case 'rating':
        query = query.orderBy('total_points', 'desc')
        break
      case 'newest':
        query = query.orderBy('created_at', 'desc')
        break
      case 'popular':
        query = query.orderBy('total_points', 'desc')
        break
      default:
        query = query.orderBy('updated_at', 'desc')
    }

    const worksheets = await query
    res.json({ worksheets })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/worksheets/:id/clone',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const original = await knex('worksheets').where({ id: req.params.id, in_library: 1 }).first()
      if (!original) {
        res.status(404).json({ error: 'Library worksheet not found' })
        return
      }

      const id = uuidv4()
      await knex('worksheets').insert({
        id,
        title: original.title,
        description: original.description,
        subject: original.subject,
        grade_level: original.grade_level,
        content: original.content,
        total_points: original.total_points,
        created_by: req.user!.userId,
        tags: original.tags,
        rubric_json: original.rubric_json,
        library_source: original.id,
      })

      const worksheet = await knex('worksheets').where({ id }).first()
      res.status(201).json({ worksheet })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/worksheets/:id/publish',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      await knex('worksheets')
        .where({ id: req.params.id })
        .update({ in_library: 1, updated_at: knex.fn.now() })
      res.json({ message: 'Published to library' })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/worksheets/:id/unpublish',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      await knex('worksheets')
        .where({ id: req.params.id })
        .update({ in_library: 0, updated_at: knex.fn.now() })
      res.json({ message: 'Removed from library' })
    } catch (err) {
      next(err)
    }
  },
)

router.get('/ratings/:type/:id', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const ratings = await knex('ratings').where({
      item_type: req.params.type,
      item_id: req.params.id,
    })
    const userRating = await knex('ratings')
      .where({ item_type: req.params.type, item_id: req.params.id, user_id: req.user!.userId })
      .first()

    const avg =
      ratings.length > 0
        ? ratings.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / ratings.length
        : 0

    res.json({
      averageRating: Math.round(avg * 10) / 10,
      count: ratings.length,
      userRating: userRating?.rating || null,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/ratings/:type/:id', requireAuth, async (req, res, next) => {
  try {
    const knex = getKnex()
    const { rating } = req.body
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' })
      return
    }

    const existing = await knex('ratings')
      .where({ user_id: req.user!.userId, item_type: req.params.type, item_id: req.params.id })
      .first()

    if (existing) {
      await knex('ratings').where({ id: existing.id }).update({ rating, updated_at: knex.fn.now() })
    } else {
      await knex('ratings').insert({
        id: uuidv4(),
        user_id: req.user!.userId,
        item_type: req.params.type,
        item_id: req.params.id,
        rating,
        rater_role: req.user!.role,
      })
    }

    res.json({ message: 'Rating saved' })
  } catch (err) {
    next(err)
  }
})

export default router
