import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('courses', (t) => {
    t.text('subject')
    t.text('grade_level')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('courses', (t) => {
    t.dropColumn('subject')
    t.dropColumn('grade_level')
  })
}
