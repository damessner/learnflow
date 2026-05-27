import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import * as vocabularyService from '../services/vocabulary'
import { getGrammarTemplates, generateGrammarExercise } from '../services/grammar'

const router = Router()

// GET /api/language/vocabulary — list user's vocabulary items
router.get('/vocabulary', requireAuth, async (req, res, next) => {
  try {
    const items = await vocabularyService.getVocabularyItems(req.user!.userId, {
      source_lang: String(req.query.source_lang || ''),
      target_lang: String(req.query.target_lang || ''),
      min_mastery: req.query.min_mastery ? Number(String(req.query.min_mastery)) : undefined,
      max_mastery: req.query.max_mastery ? Number(String(req.query.max_mastery)) : undefined,
    })
    res.json({ items })
  } catch (err) { next(err) }
})

// POST /api/language/vocabulary — add a vocabulary item
router.post('/vocabulary', requireAuth, async (req, res, next) => {
  try {
    const { source_lang, target_lang, word, translation, base_form, part_of_speech, context_sentence } = req.body
    if (!source_lang || !target_lang || !word || !translation) {
      res.status(400).json({ error: 'source_lang, target_lang, word, translation required' })
      return
    }
    const item = await vocabularyService.addVocabularyItem(req.user!.userId, { source_lang, target_lang, word, translation, base_form, part_of_speech, context_sentence })
    res.status(201).json({ item })
  } catch (err) { next(err) }
})

// POST /api/language/vocabulary/:id/review — update mastery after review
router.post('/vocabulary/:id/review', requireAuth, async (req, res, next) => {
  try {
    const { correct } = req.body
    await vocabularyService.updateVocabularyMastery(req.user!.userId, req.params.id as string, !!correct)
    res.json({ message: 'Review recorded' })
  } catch (err) { next(err) }
})

// DELETE /api/language/vocabulary/:id — delete a vocabulary item
router.delete('/vocabulary/:id', requireAuth, async (req, res, next) => {
  try {
    await vocabularyService.deleteVocabularyItem(req.user!.userId, req.params.id as string)
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})

// GET /api/language/vocabulary/stats — vocabulary statistics
router.get('/vocabulary/stats', requireAuth, async (req, res, next) => {
  try {
    const stats = await vocabularyService.getVocabularyStats(req.user!.userId)
    res.json(stats)
  } catch (err) { next(err) }
})

// GET /api/language/grammar/templates — list available grammar templates
router.get('/grammar/templates', requireAuth, async (req, res, next) => {
  try {
    const lang = req.query.language as string | undefined
    const templates = getGrammarTemplates(lang)
    res.json({ templates: templates.map(t => ({ name: t.name, description: t.description, type: t.type, languages: t.languages })) })
  } catch (err) { next(err) }
})

// POST /api/language/grammar/generate — generate blocks from a grammar template
router.post('/grammar/generate', requireAuth, async (req, res, next) => {
  try {
    const { template, ...inputs } = req.body
    if (!template) {
      res.status(400).json({ error: 'template required' })
      return
    }
    const blocks = generateGrammarExercise(template, inputs)
    res.json({ blocks })
  } catch (err) { next(err) }
})

export default router
