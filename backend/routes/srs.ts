import { Router } from 'express'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'

const router = Router()

/**
 * Get all due reviews for the logged-in student.
 * Supports ?interleave=true for round-robin subject shuffling.
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

    const doInterleave = req.query.interleave === 'true'

    if (doInterleave) {
      const bySubject: Record<string, typeof dueReviews> = {}
      for (const item of dueReviews) {
        const subj = (item.subject as string) || 'General'
        if (!bySubject[subj]) bySubject[subj] = []
        bySubject[subj].push(item)
      }

      const interleaved: typeof dueReviews = []
      const keys = Object.keys(bySubject)
      let hasMore = true
      let idx = 0
      while (hasMore && interleaved.length < 10) {
        hasMore = false
        for (const key of keys) {
          const group = bySubject[key]
          if (idx < group.length) {
            const item = { ...group[idx] }
            if (interleaved.length > 0) {
              const prev = interleaved[interleaved.length - 1]
              ;(item as any).subject_switch = (prev as any).subject !== item.subject
            } else {
              ;(item as any).subject_switch = false
            }
            interleaved.push(item)
            hasMore = true
          }
        }
        idx++
      }

      res.json({ dueReviews: interleaved })
    } else {
      res.json({ dueReviews })
    }
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
