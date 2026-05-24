import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Alter users table to add character_emoji
  const hasEmoji = await knex.schema.hasColumn('users', 'character_emoji')
  if (!hasEmoji) {
    await knex.schema.alterTable('users', (t) => {
      t.text('character_emoji').nullable()
    })
  }

  // Alter courses table to add unlock_threshold, deadline, badge_name
  const hasUnlock = await knex.schema.hasColumn('courses', 'unlock_threshold')
  if (!hasUnlock) {
    await knex.schema.alterTable('courses', (t) => {
      t.integer('unlock_threshold').defaultTo(60)
      t.text('deadline').nullable()
      t.text('badge_name').nullable()
    })
  }

  // Alter course_worksheets table to add unlock_threshold, deadline
  const hasWsUnlock = await knex.schema.hasColumn('course_worksheets', 'unlock_threshold')
  if (!hasWsUnlock) {
    await knex.schema.alterTable('course_worksheets', (t) => {
      t.integer('unlock_threshold').nullable()
      t.text('deadline').nullable()
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('character_emoji')
  })
  await knex.schema.alterTable('courses', (t) => {
    t.dropColumn('unlock_threshold')
    t.dropColumn('deadline')
    t.dropColumn('badge_name')
  })
  await knex.schema.alterTable('course_worksheets', (t) => {
    t.dropColumn('unlock_threshold')
    t.dropColumn('deadline')
  })
}
