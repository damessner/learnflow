import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('vocabulary_progress', (t) => {
    t.text('id').primary()
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('textbook').notNullable()   // e.g. 'more1', 'more2'
    t.integer('unit').notNullable()    // 1–15
    t.text('word_en').notNullable()    // English word/phrase
    t.text('word_de').notNullable()    // German translation
    t.integer('attempts').defaultTo(0)
    t.integer('correct').defaultTo(0)
    t.timestamp('last_seen_at')
    t.unique(['user_id', 'textbook', 'unit', 'word_en'])
  })

  // Summary table: stores tier completion and final quiz grade per student per unit
  await knex.schema.createTable('vocabulary_unit_progress', (t) => {
    t.text('id').primary()
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('textbook').notNullable()
    t.integer('unit').notNullable()
    t.integer('starter_completed').defaultTo(0)
    t.integer('practice_completed').defaultTo(0)
    t.integer('challenge_completed').defaultTo(0)
    t.integer('final_quiz_completed').defaultTo(0)
    t.text('final_quiz_grade')   // 'A', 'B', 'C', 'D', 'E', 'F'
    t.integer('final_quiz_score').defaultTo(0)
    t.integer('final_quiz_max').defaultTo(0)
    t.timestamp('updated_at').defaultTo(knex.fn.now())
    t.unique(['user_id', 'textbook', 'unit'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('vocabulary_unit_progress')
  await knex.schema.dropTableIfExists('vocabulary_progress')
}
