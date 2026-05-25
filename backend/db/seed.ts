import { getKnex } from './knex'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import logger from '../lib/logger'

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
}

function hashNewPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex')
  return { hash: hashPassword(password, salt), salt }
}

async function userExists(knex: ReturnType<typeof getKnex>, username: string): Promise<boolean> {
  const u = await knex('users').where({ username }).first()
  return !!u
}

export async function seedDB(): Promise<void> {
  const knex = getKnex()

  logger.info('Seeding database...')

  if (!(await userExists(knex, 'admin'))) {
    const { hash, salt } = hashNewPassword('admin123')
    await knex('users').insert({
      id: uuidv4(),
      username: 'admin',
      email: 'admin@learnflow.local',
      name: 'Admin',
      password_hash: hash,
      password_salt: salt,
      role: 'admin',
    })
  }

  if (!(await userExists(knex, 'teacher'))) {
    const { hash, salt } = hashNewPassword('teacher123')
    await knex('users').insert({
      id: uuidv4(),
      username: 'teacher',
      email: 'teacher@learnflow.local',
      name: 'Teacher',
      password_hash: hash,
      password_salt: salt,
      role: 'teacher',
    })
  }

  if (!(await userExists(knex, 'student'))) {
    const { hash, salt } = hashNewPassword('student123')
    await knex('users').insert({
      id: uuidv4(),
      username: 'student',
      email: 'student@learnflow.local',
      name: 'Student',
      password_hash: hash,
      password_salt: salt,
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
