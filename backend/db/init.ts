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

    const hasUnlockColumn = await knex.schema.hasColumn('courses', 'unlock_threshold')
    if (!hasUnlockColumn) {
      const { up: upCourseFeatures } = require('./migrations/20260524_003_course_features')
      await upCourseFeatures(knex)
      logger.info('Database migration (course features) completed')
    } else {
      logger.info('Database already initialized (course features)')
    }

    const hasSubjectColumn = await knex.schema.hasColumn('courses', 'subject')
    if (!hasSubjectColumn) {
      const { up: upCourseCategories } = require('./migrations/20260524_001_course_categories')
      await upCourseCategories(knex)
      logger.info('Database migration (course categories) completed')
    } else {
      logger.info('Database already initialized (course categories)')
    }

    const hasPasswordSalt = await knex.schema.hasColumn('users', 'password_salt')
    if (!hasPasswordSalt) {
      const { up: upPasswordSalt } = require('./migrations/20260525_004_password_salt')
      await upPasswordSalt(knex)
      logger.info('Database migration (password salt) completed')
    } else {
      logger.info('Database already initialized (password salt)')
    }
  } catch (err) {
    logger.error({ err }, 'Database migration failed')
    throw err
  }
}
