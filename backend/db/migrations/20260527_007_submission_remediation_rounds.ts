import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('submission_remediation_rounds')
  if (hasTable) return

  await knex.schema.createTable('submission_remediation_rounds', (t) => {
    t.text('id').primary()
    t.text('submission_id')
      .notNullable()
      .references('id')
      .inTable('submissions')
      .onDelete('CASCADE')
    t.text('assignment_id')
      .notNullable()
      .references('id')
      .inTable('assignments')
      .onDelete('CASCADE')
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.integer('round_number').notNullable()
    t.text('remediation_prompt_variant')
    t.text('mistakes_json').notNullable()
    t.text('self_assessment')
    t.text('analysis_json').notNullable()
    t.text('exercises_json').notNullable()
    t.text('exercise_responses_json')
    t.integer('time_spent_seconds').defaultTo(0)
    t.integer('exercises_attempted').defaultTo(0)
    t.integer('exercises_correct').defaultTo(0)
    t.integer('mastery_before').defaultTo(50)
    t.integer('mastery_after').defaultTo(50)
    t.timestamp('created_at').defaultTo(knex.fn.now())

    t.unique(['submission_id', 'round_number'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('submission_remediation_rounds')
}
