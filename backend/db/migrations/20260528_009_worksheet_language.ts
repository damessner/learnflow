import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasSourceLang = await knex.schema.hasColumn('worksheets', 'source_lang')
  if (!hasSourceLang) {
    await knex.schema.alterTable('worksheets', (t) => {
      t.text('source_lang')
      t.text('target_lang')
      t.text('cefr_level')
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasColumn('worksheets', 'source_lang')) {
    await knex.schema.alterTable('worksheets', (t) => {
      t.dropColumn('source_lang')
      t.dropColumn('target_lang')
      t.dropColumn('cefr_level')
    })
  }
}
