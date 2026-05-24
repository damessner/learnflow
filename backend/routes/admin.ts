import { Router } from 'express'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'

const router = Router()

// All tables in dependency order (parents before children for restore)
const ALL_TABLES = [
  'users',
  'classes',
  'worksheets',
  'courses',
  'course_worksheets',
  'class_students',
  'assignments',
  'submissions',
  'submission_attempts',
  'peer_reviews',
  'teams',
  'team_members',
  'class_announcements',
  'course_students',
  'learning_gamification',
  'learning_mastery',
  'learning_planner',
  'learning_queue',
  'ratings',
  'media_files',
  'settings',
]

const WORKSHEETS_COURSES_TABLES = ['worksheets', 'courses', 'course_worksheets']

const USERS_TABLES = ['users', 'learning_gamification']

// ─── GET /api/admin/backup?type=all|worksheets-courses|users ───────────────
router.get('/backup', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const type = (req.query.type as string) || 'all'

    let tables: string[]
    if (type === 'worksheets-courses') {
      tables = WORKSHEETS_COURSES_TABLES
    } else if (type === 'users') {
      tables = USERS_TABLES
    } else {
      tables = ALL_TABLES
    }

    const snapshot: Record<string, unknown[]> = {}

    for (const table of tables) {
      try {
        const exists = await knex.schema.hasTable(table)
        if (exists) {
          snapshot[table] = await knex(table).select('*')
        }
      } catch {
        // Skip tables that don't exist in this schema version
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `learnflow-backup-${type}-${timestamp}.json`

    const payload = {
      _meta: {
        version: '1.0',
        type,
        exported_at: new Date().toISOString(),
        tables: Object.keys(snapshot),
        row_counts: Object.fromEntries(
          Object.entries(snapshot).map(([t, rows]) => [t, rows.length]),
        ),
      },
      data: snapshot,
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.json(payload)
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/admin/restore ───────────────────────────────────────────────
router.post('/restore', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { data, _meta } = req.body

    if (!data || typeof data !== 'object') {
      res.status(400).json({ error: 'Invalid backup file: missing "data" field.' })
      return
    }

    const knex = getKnex()
    const isPostgres = (process.env.DB_DIALECT || 'better-sqlite3') === 'pg'
    const tables = Object.keys(data)
    const restored: Record<string, number> = {}
    const errors: string[] = []

    await knex.transaction(async (trx) => {
      // Disable FK checks for the duration of the restore
      if (isPostgres) {
        await trx.raw('SET CONSTRAINTS ALL DEFERRED')
      } else {
        await trx.raw('PRAGMA foreign_keys = OFF')
      }

      // Restore tables in reverse order (children first) for deletion
      // then insert in forward order (parents first)
      const reversedTables = [...tables].reverse()

      for (const table of reversedTables) {
        try {
          const exists = await trx.schema.hasTable(table)
          if (exists) {
            await trx(table).del()
          }
        } catch {
          // ignore deletion errors on missing tables
        }
      }

      for (const table of tables) {
        const rows: unknown[] = data[table]
        if (!Array.isArray(rows) || rows.length === 0) {
          restored[table] = 0
          continue
        }

        try {
          const exists = await trx.schema.hasTable(table)
          if (!exists) {
            errors.push(`Table "${table}" does not exist — skipped.`)
            continue
          }

          // Insert in chunks of 100 to avoid SQLite variable limits
          const CHUNK = 100
          for (let i = 0; i < rows.length; i += CHUNK) {
            await trx(table).insert(rows.slice(i, i + CHUNK))
          }
          restored[table] = rows.length
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e)
          errors.push(`Error restoring "${table}": ${msg}`)
        }
      }

      // Re-enable FK checks
      if (!isPostgres) {
        await trx.raw('PRAGMA foreign_keys = ON')
      }
    })

    res.json({
      message: 'Restore completed.',
      restored,
      errors: errors.length ? errors : undefined,
      meta: _meta || null,
    })
  } catch (err) {
    next(err)
  }
})

export default router
