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

    const hasWorksheetVersions = await knex.schema.hasTable('worksheet_versions')
    if (!hasWorksheetVersions) {
      const { up: upWorksheetVersions } = require('./migrations/20260527_005_worksheet_versions')
      await upWorksheetVersions(knex)
      logger.info('Database migration (worksheet versions) completed')
    } else {
      logger.info('Database already initialized (worksheet versions)')
    }

    const hasWorkspaces = await knex.schema.hasTable('workspaces')
    if (!hasWorkspaces) {
      const { up: upWorkspaces } = require('./migrations/20260527_006_workspaces')
      await upWorkspaces(knex)
      logger.info('Database migration (workspaces) completed')
    } else {
      logger.info('Database already initialized (workspaces)')
    }

    const hasRemediationRounds = await knex.schema.hasTable('submission_remediation_rounds')
    if (!hasRemediationRounds) {
      const { up: upRemediationRounds } = require('./migrations/20260527_007_submission_remediation_rounds')
      await upRemediationRounds(knex)
      logger.info('Database migration (submission remediation rounds) completed')
    } else {
      logger.info('Database already initialized (submission remediation rounds)')
    }

    const hasMasteryBefore = await knex.schema.hasColumn('submission_remediation_rounds', 'mastery_before')
    if (!hasMasteryBefore) {
      await knex.schema.alterTable('submission_remediation_rounds', (t) => {
        t.integer('mastery_before').defaultTo(50)
        t.integer('mastery_after').defaultTo(50)
      })
      logger.info('Database migration (submission remediation rounds mastery columns) completed')
    } else {
      logger.info('Database already has mastery columns on remediation rounds')
    }
  } catch (err) {
    logger.error({ err }, 'Database migration failed')
    throw err
  }
}
