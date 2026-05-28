import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasSalt = await knex.schema.hasColumn('users', 'password_salt')
  if (!hasSalt) {
    await knex.schema.alterTable('users', (t) => {
      t.text('password_salt').nullable()
    })
  }

  const hasLastActivity = await knex.schema.hasColumn('learning_gamification', 'last_activity_date')
  if (!hasLastActivity) {
    await knex.schema.alterTable('learning_gamification', (t) => {
      t.text('last_activity_date').nullable()
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('password_salt')
  })
  await knex.schema.alterTable('learning_gamification', (t) => {
    t.dropColumn('last_activity_date')
  })
}
