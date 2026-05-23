import { getKnex } from './knex'
import logger from '../lib/logger'
import { up } from './migrations/20260522_001_initial'

export async function initDB(): Promise<void> {
  const knex = getKnex()
  logger.info('Initializing database...')

  try {
    await up(knex)
    logger.info('Database migration completed')
  } catch (err) {
    logger.error({ err }, 'Database migration failed')
    throw err
  }
}
