import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('vocabulary_items')
  if (hasTable) return

  await knex.schema.createTable('vocabulary_items', (t) => {
    t.text('id').primary()
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('source_lang').notNullable()
    t.text('target_lang').notNullable()
    t.text('word').notNullable()
    t.text('translation').notNullable()
    t.text('base_form')
    t.text('part_of_speech')
    t.text('context_sentence')
    t.integer('mastery_level').defaultTo(0)
    t.timestamp('last_reviewed_at')
    t.integer('review_count').defaultTo(0)
    t.integer('mistake_count').defaultTo(0)
    t.text('kc_id').references('id').inTable('knowledge_components').onDelete('SET NULL')
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.unique(['user_id', 'source_lang', 'target_lang', 'word'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('vocabulary_items')
}
