import type { Knex } from 'knex'

export async function rawQuery<T = unknown>(
  knex: Knex,
  sql: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[],
): Promise<T[]> {
  const result = params ? await knex.raw(sql, params) : await knex.raw(sql)
  return result.rows ?? result
}

export async function rawOne<T = unknown>(
  knex: Knex,
  sql: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[],
): Promise<T | null> {
  const rows = await rawQuery<T>(knex, sql, params)
  return rows.length > 0 ? rows[0] : null
}
