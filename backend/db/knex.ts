import type { Knex } from 'knex'

let knexInstance: Knex | null = null

export function getKnex(): Knex {
  if (knexInstance) return knexInstance!

  const dialect = process.env.DB_DIALECT || 'better-sqlite3'

  if (dialect === 'pg') {
    const pg = require('pg')
    pg.defaults.ssl = false
    knexInstance = require('knex')({
      client: 'pg',
      connection: process.env.DATABASE_URL,
      pool: { min: 2, max: 10 },
    })
  } else {
    const dbPath = process.env.DB_PATH || './data/learnflow.db'
    knexInstance = require('knex')({
      client: 'better-sqlite3',
      connection: { filename: dbPath },
      useNullAsDefault: true,
      pool: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        afterCreate: (db: any, cb: any) => {
          try {
            db.pragma('journal_mode = WAL')
            db.pragma('synchronous = NORMAL')
          } catch (_e) {
            // ignore
          }
          cb(null, db)
        },
      },
    })
  }

  return knexInstance!
}

export function closeKnex(): Promise<void> {
  if (!knexInstance) return Promise.resolve()
  return knexInstance.destroy().then(() => {
    knexInstance = null
  })
}
