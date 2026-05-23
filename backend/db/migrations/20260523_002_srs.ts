import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('knowledge_components', (t) => {
    t.text('id').primary()
    t.text('name').notNullable()
    t.text('subject').notNullable()
    t.text('description')
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('student_knowledge_state', (t) => {
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('kc_id').notNullable().references('id').inTable('knowledge_components').onDelete('CASCADE')
    
    // FSRS State Parameters
    t.integer('state').notNullable().defaultTo(0) // 0=New, 1=Learning, 2=Review, 3=Relearning
    t.timestamp('due').notNullable().defaultTo(knex.fn.now())
    t.decimal('stability').notNullable().defaultTo(0)
    t.decimal('difficulty').notNullable().defaultTo(0)
    t.integer('elapsed_days').notNullable().defaultTo(0)
    t.integer('scheduled_days').notNullable().defaultTo(0)
    t.integer('reps').notNullable().defaultTo(0)
    t.integer('lapses').notNullable().defaultTo(0)
    t.timestamp('last_review')

    t.primary(['user_id', 'kc_id'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('student_knowledge_state')
  await knex.schema.dropTableIfExists('knowledge_components')
}
