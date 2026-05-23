import { getKnex } from './knex'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import logger from '../lib/logger'

function hashPassword(password: string): string {
  const salt = 'learnflow-salt'
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
}

async function userExists(knex: ReturnType<typeof getKnex>, username: string): Promise<boolean> {
  const u = await knex('users').where({ username }).first()
  return !!u
}

export async function seedDB(): Promise<void> {
  const knex = getKnex()

  logger.info('Seeding database...')

  if (!(await userExists(knex, 'admin'))) {
    await knex('users').insert({
      id: uuidv4(),
      username: 'admin',
      email: 'admin@learnflow.local',
      name: 'Admin',
      password_hash: hashPassword('admin123'),
      role: 'admin',
    })
  }

  if (!(await userExists(knex, 'teacher'))) {
    await knex('users').insert({
      id: uuidv4(),
      username: 'teacher',
      email: 'teacher@learnflow.local',
      name: 'Teacher',
      password_hash: hashPassword('teacher123'),
      role: 'teacher',
    })
  }

  if (!(await userExists(knex, 'student'))) {
    await knex('users').insert({
      id: uuidv4(),
      username: 'student',
      email: 'student@learnflow.local',
      name: 'Student',
      password_hash: hashPassword('student123'),
      role: 'student',
    })
  }

  const guestCode = '5a1b-c3d4'
  const teacherUser = await knex('users').where({ role: 'teacher' }).first()
  if (teacherUser) {
    const existingClass = await knex('classes').where({ class_code: guestCode }).first()
    if (!existingClass) {
      const classId = uuidv4()
      await knex('classes').insert({
        id: classId,
        name: 'Guest Access Class',
        description: 'Default class for guest student access',
        teacher_id: teacherUser.id,
        class_code: guestCode,
      })
    }
  }

  logger.info('Database seeded')
}
