import { getKnex } from './knex'
import logger from '../lib/logger'
import { up } from './migrations/20260522_001_initial'
import { up as upSrs } from './migrations/20260523_002_srs'

export async function initDB(): Promise<void> {
  const knex = getKnex()
  logger.info('Initializing database...')

  try {
    const hasUsers = await knex.schema.hasTable('users')
    if (!hasUsers) {
      await up(knex)
      logger.info('Database migration (initial) completed')
    } else {
      logger.info('Database already initialized (initial)')
    }

    const hasSrs = await knex.schema.hasTable('knowledge_components')
    if (!hasSrs) {
      await upSrs(knex)
      logger.info('Database migration (srs) completed')
    } else {
      logger.info('Database already initialized (srs)')
    }
  } catch (err) {
    logger.error({ err }, 'Database migration failed')
    throw err
  }
}
