import { fsrs, createEmptyCard, Rating, Card, State } from 'ts-fsrs'
import type { Grade } from 'ts-fsrs'
import { getKnex } from '../db/knex'

const f = fsrs()

export type StudentKnowledgeState = {
  user_id: string
  kc_id: string
  state: State
  due: Date
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  learning_steps: number
  reps: number
  lapses: number
  last_review?: Date
}

/**
 * Retrieves the current FSRS card state for a specific user and knowledge component.
 * If the user has never studied this KC before, a new default card is created.
 */
export async function getKnowledgeState(user_id: string, kc_id: string): Promise<Card> {
  const knex = getKnex()
  const record = await knex<StudentKnowledgeState>('student_knowledge_state')
    .where({ user_id, kc_id })
    .first()

  if (record) {
    return {
      state: record.state as State,
      due: new Date(record.due),
      stability: record.stability,
      difficulty: record.difficulty,
      elapsed_days: record.elapsed_days,
      scheduled_days: record.scheduled_days,
      reps: record.reps,
      lapses: record.lapses,
      learning_steps: 0,
      last_review: record.last_review ? new Date(record.last_review) : undefined,
    }
  }

  return createEmptyCard()
}

/**
 * Updates the knowledge state for a user on a given knowledge component.
 * Rating: 1 = Again (Failed), 2 = Hard, 3 = Good (Pass), 4 = Easy
 */
export async function reviewKnowledgeComponent(
  user_id: string,
  kc_id: string,
  rating: Rating,
  reviewTime: Date = new Date(),
): Promise<void> {
  const knex = getKnex()
  const currentCard = await getKnowledgeState(user_id, kc_id)

  // Calculate the next card state using FSRS
  const schedulingCards = f.repeat(currentCard, reviewTime)
  const nextRecord = schedulingCards[rating as unknown as Grade].card

  const dbState: StudentKnowledgeState = {
    user_id,
    kc_id,
    state: nextRecord.state,
    due: nextRecord.due,
    stability: nextRecord.stability,
    difficulty: nextRecord.difficulty,
    elapsed_days: nextRecord.elapsed_days,
    scheduled_days: nextRecord.scheduled_days,
    learning_steps: nextRecord.learning_steps,
    reps: nextRecord.reps,
    lapses: nextRecord.lapses,
    last_review: nextRecord.last_review,
  }

  // Upsert the state into the database
  await knex('student_knowledge_state').insert(dbState).onConflict(['user_id', 'kc_id']).merge()
}
