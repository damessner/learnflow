import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasGradeLevel = await knex.schema.hasColumn('users', 'grade_level')
  const hasClassId = await knex.schema.hasColumn('users', 'class_id')
  const hasOnboarding = await knex.schema.hasColumn('users', 'onboarding_done')
  const hasCharacterEmoji = await knex.schema.hasColumn('users', 'character_emoji')

  await knex.schema.alterTable('users', (t) => {
    // Grade level (1–4) — inferred from class name for students; manually set for teachers
    if (!hasGradeLevel) t.text('grade_level')
    // Primary class the student/teacher belongs to
    if (!hasClassId) t.text('class_id').references('id').inTable('classes').onDelete('SET NULL')
    // Whether teacher has completed the first-login onboarding modal
    if (!hasOnboarding) t.integer('onboarding_done').defaultTo(0)
    // Emoji avatar (may already exist from a previous migration)
    if (!hasCharacterEmoji) t.text('character_emoji').defaultTo('👤')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('grade_level')
    t.dropColumn('class_id')
    t.dropColumn('onboarding_done')
    t.dropColumn('character_emoji')
  })
}
