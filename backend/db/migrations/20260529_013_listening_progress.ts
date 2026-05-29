import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('listening_progress', (t) => {
    t.text('id').primary()
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('textbook').notNullable()    // e.g. 'more1'
    t.integer('unit').notNullable()     // 1–15
    t.text('listening_id').notNullable() // e.g. 'listen-1-unit1-task1'
    t.integer('completed').defaultTo(0) // 1 = done, 0 = in progress
    t.integer('score').defaultTo(0)
    t.integer('max_score').defaultTo(0)
    t.timestamp('updated_at').defaultTo(knex.fn.now())
    t.unique(['user_id', 'textbook', 'unit', 'listening_id'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('listening_progress')
}
