import { Router } from 'express'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'

const router = Router()

/**
 * Get all due reviews for the logged-in student.
 */
router.get('/due', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const now = new Date()

    const dueReviews = await knex('student_knowledge_state')
      .join('knowledge_components', 'student_knowledge_state.kc_id', 'knowledge_components.id')
      .where('student_knowledge_state.user_id', req.user!.userId)
      .andWhere('student_knowledge_state.due', '<=', now.toISOString())
      .select(
        'student_knowledge_state.*',
        'knowledge_components.name',
        'knowledge_components.subject',
        'knowledge_components.description'
      )
      .orderBy('student_knowledge_state.due', 'asc')

    res.json({ dueReviews })
  } catch (err) {
    next(err)
  }
})

/**
 * Submit direct FSRS reviews (e.g. from Daily Mix).
 */
router.post('/review', requireAuth, requireRole('student'), async (req, res, next) => {
  try {
    const { reviews } = req.body // array of { kc_id: string, rating: number }
    const { reviewKnowledgeComponent } = await import('../services/srs')

    for (const r of reviews) {
      await reviewKnowledgeComponent(req.user!.userId, r.kc_id, r.rating)
    }

    res.json({ message: 'Reviews processed successfully' })
  } catch (err) {
    next(err)
  }
})

/**
 * Admin/Teacher route to create knowledge components manually
 */
router.post('/kcs', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const { id, name, subject, description } = req.body
    const knex = getKnex()

    await knex('knowledge_components').insert({
      id,
      name,
      subject,
      description
    })

    res.json({ message: 'Knowledge Component created successfully' })
  } catch (err) {
    next(err)
  }
})

export default router
