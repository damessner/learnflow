import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasUuid = knex.client.config.client === 'pg'

  await knex.schema.createTable('users', (t) => {
    t.text('id').primary()
    t.text('username').notNullable().unique()
    t.text('email').notNullable().unique()
    t.text('name').notNullable()
    t.text('password_hash')
    t.text('role').notNullable().defaultTo('student')
    t.text('ms_oid')
    t.text('ms_tenant')
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.timestamp('updated_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('classes', (t) => {
    t.text('id').primary()
    t.text('name').notNullable()
    t.text('description')
    t.text('teacher_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('class_code').notNullable().unique()
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('class_students', (t) => {
    t.text('class_id').notNullable().references('id').inTable('classes').onDelete('CASCADE')
    t.text('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.timestamp('joined_at').defaultTo(knex.fn.now())
    t.primary(['class_id', 'student_id'])
  })

  await knex.schema.createTable('class_announcements', (t) => {
    t.text('id').primary()
    t.text('class_id').notNullable().references('id').inTable('classes').onDelete('CASCADE')
    t.text('title').notNullable()
    t.text('content')
    t.text('created_by').notNullable().references('id').inTable('users')
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('worksheets', (t) => {
    t.text('id').primary()
    t.text('title').notNullable()
    t.text('description')
    t.text('subject')
    t.text('grade_level')
    t.text('content').notNullable().defaultTo('{"blocks":[]}')
    t.integer('total_points').defaultTo(0)
    t.integer('is_published').defaultTo(0)
    t.text('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('tags')
    t.text('rubric_json')
    t.integer('in_library').defaultTo(0)
    t.text('library_source')
    t.text('cloned_from')
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.timestamp('updated_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('assignments', (t) => {
    t.text('id').primary()
    t.text('worksheet_id').notNullable().references('id').inTable('worksheets').onDelete('CASCADE')
    t.text('class_name')
    t.text('class_id').references('id').inTable('classes').onDelete('SET NULL')
    t.text('due_date')
    t.text('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('retry_policy').defaultTo('single')
    t.integer('max_attempts').defaultTo(3)
    t.integer('peer_review_enabled').defaultTo(0)
    t.text('adaptive_difficulty')
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('submissions', (t) => {
    t.text('id').primary()
    t.text('assignment_id')
      .notNullable()
      .references('id')
      .inTable('assignments')
      .onDelete('CASCADE')
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('answers')
    t.decimal('score')
    t.decimal('max_score')
    t.timestamp('submitted_at')
    t.text('graded_by').references('id').inTable('users')
    t.text('feedback')
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.timestamp('updated_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('submission_attempts', (t) => {
    t.text('id').primary()
    t.text('submission_id').references('id').inTable('submissions').onDelete('CASCADE')
    t.text('assignment_id')
      .notNullable()
      .references('id')
      .inTable('assignments')
      .onDelete('CASCADE')
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.integer('attempt_number').notNullable()
    t.text('answers')
    t.decimal('score')
    t.decimal('max_score')
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('courses', (t) => {
    t.text('id').primary()
    t.text('name').notNullable()
    t.text('description')
    t.text('teacher_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('course_worksheets', (t) => {
    t.text('id').primary()
    t.text('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE')
    t.text('worksheet_id').notNullable().references('id').inTable('worksheets').onDelete('CASCADE')
    t.integer('order_index').defaultTo(0)
  })

  await knex.schema.createTable('course_students', (t) => {
    t.text('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE')
    t.text('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.primary(['course_id', 'student_id'])
  })

  await knex.schema.createTable('media_files', (t) => {
    t.text('id').primary()
    t.text('filename').notNullable()
    t.text('original_name').notNullable()
    t.text('mime_type')
    t.integer('size_bytes')
    t.text('uploaded_by').references('id').inTable('users')
    t.text('url').notNullable()
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('teams', (t) => {
    t.text('id').primary()
    t.text('assignment_id')
      .notNullable()
      .references('id')
      .inTable('assignments')
      .onDelete('CASCADE')
    t.text('name')
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('team_members', (t) => {
    t.text('team_id').notNullable().references('id').inTable('teams').onDelete('CASCADE')
    t.text('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.timestamp('joined_at').defaultTo(knex.fn.now())
    t.primary(['team_id', 'student_id'])
  })

  await knex.schema.createTable('peer_reviews', (t) => {
    t.text('id').primary()
    t.text('assignment_id')
      .notNullable()
      .references('id')
      .inTable('assignments')
      .onDelete('CASCADE')
    t.text('reviewer_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('reviewee_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.decimal('score')
    t.text('feedback')
    t.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('ratings', (t) => {
    t.text('id').primary()
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('item_type').notNullable()
    t.text('item_id').notNullable()
    t.integer('rating').notNullable()
    t.text('rater_role').notNullable()
    t.timestamp('created_at').defaultTo(knex.fn.now())
    t.timestamp('updated_at').defaultTo(knex.fn.now())
    t.unique(['user_id', 'item_type', 'item_id'])
  })

  await knex.schema.createTable('settings', (t) => {
    t.text('key').primary()
    t.text('value')
  })

  await knex.schema.createTable('learning_mastery', (t) => {
    t.text('id').primary()
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('topic').notNullable()
    t.integer('mastery_level').defaultTo(0)
    t.timestamp('last_practiced_at')
  })

  await knex.schema.createTable('learning_planner', (t) => {
    t.text('id').primary()
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('date').notNullable()
    t.text('worksheet_id').references('id').inTable('worksheets').onDelete('SET NULL')
    t.text('topic')
    t.integer('completed').defaultTo(0)
  })

  await knex.schema.createTable('learning_queue', (t) => {
    t.text('id').primary()
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.text('worksheet_id').references('id').inTable('worksheets').onDelete('SET NULL')
    t.text('topic')
    t.text('due_at')
    t.text('difficulty_level')
  })

  await knex.schema.createTable('learning_gamification', (t) => {
    t.text('id').primary()
    t.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
    t.integer('xp').defaultTo(0)
    t.integer('level').defaultTo(1)
    t.text('badges').defaultTo('[]')
    t.integer('streak_days').defaultTo(0)
  })
}

export async function down(knex: Knex): Promise<void> {
  const tables = [
    'learning_gamification',
    'learning_queue',
    'learning_planner',
    'learning_mastery',
    'settings',
    'ratings',
    'peer_reviews',
    'team_members',
    'teams',
    'media_files',
    'course_students',
    'course_worksheets',
    'courses',
    'submission_attempts',
    'submissions',
    'assignments',
    'class_announcements',
    'class_students',
    'worksheets',
    'classes',
    'users',
  ]
  for (const table of tables) {
    await knex.schema.dropTableIfExists(table)
  }
}
