import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasWorkspaces = await knex.schema.hasTable('workspaces')
  if (!hasWorkspaces) {
    await knex.schema.createTable('workspaces', (t) => {
      t.text('id').primary()
      t.text('name').notNullable()
      t.text('subject').notNullable()
      t.text('class_id').notNullable().references('id').inTable('classes').onDelete('CASCADE')
      t.text('teacher_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      t.timestamp('created_at').defaultTo(knex.fn.now())
      t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  }

  const hasItems = await knex.schema.hasTable('workspace_items')
  if (!hasItems) {
    await knex.schema.createTable('workspace_items', (t) => {
      t.text('id').primary()
      t.text('workspace_id')
        .notNullable()
        .references('id')
        .inTable('workspaces')
        .onDelete('CASCADE')
      t.text('item_type').notNullable()
      t.text('course_id').references('id').inTable('courses').onDelete('SET NULL')
      t.text('worksheet_id').references('id').inTable('worksheets').onDelete('SET NULL')
      t.integer('order_index').defaultTo(0)
      t.timestamp('created_at').defaultTo(knex.fn.now())
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('workspace_items')
  await knex.schema.dropTableIfExists('workspaces')
}
