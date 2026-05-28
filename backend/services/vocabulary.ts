import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'

export interface VocabularyItem {
  id: string
  user_id: string
  source_lang: string
  target_lang: string
  word: string
  translation: string
  base_form?: string
  part_of_speech?: string
  context_sentence?: string
  mastery_level: number
  last_reviewed_at?: string
  review_count: number
  mistake_count: number
  kc_id?: string
}

export async function addVocabularyItem(
  userId: string,
  item: {
    source_lang: string
    target_lang: string
    word: string
    translation: string
    base_form?: string
    part_of_speech?: string
    context_sentence?: string
    kc_id?: string
  },
): Promise<VocabularyItem> {
  const knex = getKnex()
  const id = uuidv4()

  await knex('vocabulary_items').insert({
    id,
    user_id: userId,
    source_lang: item.source_lang,
    target_lang: item.target_lang,
    word: item.word,
    translation: item.translation,
    base_form: item.base_form || null,
    part_of_speech: item.part_of_speech || null,
    context_sentence: item.context_sentence || null,
    kc_id: item.kc_id || null,
  })

  const created = await knex('vocabulary_items').where({ id }).first()
  return created as VocabularyItem
}

export async function getVocabularyItems(
  userId: string,
  filters?: {
    source_lang?: string
    target_lang?: string
    min_mastery?: number
    max_mastery?: number
    part_of_speech?: string
  },
): Promise<VocabularyItem[]> {
  const knex = getKnex()
  let query = knex('vocabulary_items').where({ user_id: userId })

  if (filters?.source_lang) query = query.andWhere({ source_lang: filters.source_lang })
  if (filters?.target_lang) query = query.andWhere({ target_lang: filters.target_lang })
  if (filters?.min_mastery !== undefined)
    query = query.andWhere('mastery_level', '>=', filters.min_mastery)
  if (filters?.max_mastery !== undefined)
    query = query.andWhere('mastery_level', '<=', filters.max_mastery)
  if (filters?.part_of_speech) query = query.andWhere({ part_of_speech: filters.part_of_speech })

  return query
    .orderBy('mastery_level', 'asc')
    .orderBy('last_reviewed_at', 'asc') as unknown as VocabularyItem[]
}

export async function updateVocabularyMastery(
  userId: string,
  wordId: string,
  correct: boolean,
): Promise<void> {
  const knex = getKnex()
  const item = await knex('vocabulary_items').where({ id: wordId, user_id: userId }).first()
  if (!item) throw new Error('Vocabulary item not found')

  const delta = correct ? 5 : -3
  const newMastery = Math.max(0, Math.min(100, (item.mastery_level || 0) + delta))

  await knex('vocabulary_items')
    .where({ id: wordId })
    .update({
      mastery_level: newMastery,
      last_reviewed_at: knex.fn.now(),
      review_count: knex.raw('review_count + 1'),
      mistake_count: correct ? knex.raw('mistake_count') : knex.raw('mistake_count + 1'),
    })
}

export async function deleteVocabularyItem(userId: string, wordId: string): Promise<void> {
  const knex = getKnex()
  await knex('vocabulary_items').where({ id: wordId, user_id: userId }).del()
}

export async function getVocabularyStats(userId: string): Promise<{
  total: number
  mastered: number
  learning: number
  by_language: Record<string, { total: number; avg_mastery: number }>
  streak_words: string[]
}> {
  const knex = getKnex()
  const items = await knex('vocabulary_items').where({ user_id: userId })

  const total = items.length
  const mastered = items.filter((i: { mastery_level: number }) => i.mastery_level >= 80).length
  const learning = items.filter(
    (i: { mastery_level: number }) => i.mastery_level > 0 && i.mastery_level < 80,
  ).length

  const byLang: Record<string, { total: number; sum: number }> = {}
  for (const i of items as VocabularyItem[]) {
    const key = `${i.source_lang}→${i.target_lang}`
    if (!byLang[key]) byLang[key] = { total: 0, sum: 0 }
    byLang[key].total++
    byLang[key].sum += i.mastery_level
  }

  const by_language: Record<string, { total: number; avg_mastery: number }> = {}
  for (const [k, v] of Object.entries(byLang)) {
    by_language[k] = { total: v.total, avg_mastery: Math.round(v.sum / v.total) }
  }

  const streak_words = (items as VocabularyItem[])
    .sort((a, b) => (b.mistake_count || 0) - (a.mistake_count || 0))
    .slice(0, 10)
    .map((i) => i.word)

  return { total, mastered, learning, by_language, streak_words }
}
