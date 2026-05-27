import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('worksheet_versions')
  if (hasTable) return

  await knex.schema.createTable('worksheet_versions', (t) => {
    t.text('id').primary()
    t.text('worksheet_id').notNullable().references('id').inTable('worksheets').onDelete('CASCADE')
    t.integer('version_number').notNullable()
    t.text('change_summary')
    t.text('created_by').references('id').inTable('users').onDelete('SET NULL')
    t.text('title').notNullable()
    t.text('description')
    t.text('subject')
    t.text('grade_level')
    t.text('content').notNullable()
    t.integer('total_points').defaultTo(0)
    t.text('tags')
    t.text('rubric_json')
    t.integer('in_library').defaultTo(0)
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.unique(['worksheet_id', 'version_number'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('worksheet_versions')
}
