import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'
import logger from '../lib/logger'

let teacherIdOverride: string | null = null
export function setImportTeacherId(id: string | null): void { teacherIdOverride = id }

export interface StudentCredentials {
  username: string
  password: string
  name: string
  email: string
  className: string
}

export interface ImportSummary {
  classesCreated: number
  classesSkipped: number
  studentsCreated: number
  studentsSkipped: number
  classNames: string[]
  errors: string[]
  credentials: StudentCredentials[]
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
}

function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex')
}

function generatePassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let pwd = ''
  for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
  return pwd
}

function generateClassCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code.slice(0, 4) + '-' + code.slice(4)
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'x'
}

function parseStudentName(fullName: string): { surname: string; givenName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { surname: parts[0], givenName: 'Schueler' }
  const surname = parts[0]
  const givenName = parts.slice(1).join(' ')
  return { surname, givenName }
}

export async function importStudentsFromPdf(pdfBuffer: Buffer): Promise<ImportSummary> {
  const summary: ImportSummary = {
    classesCreated: 0,
    classesSkipped: 0,
    studentsCreated: 0,
    studentsSkipped: 0,
    classNames: [],
    errors: [],
    credentials: [],
  }

  // Parse PDF text
  let { PDFParse } = require('pdf-parse')
  let text: string
  try {
    const parser = new PDFParse({ data: pdfBuffer, verbosity: 0 })
    const result = await parser.getText()
    text = result.text
    await parser.destroy()
  } catch (err) {
    summary.errors.push(`PDF parsing failed: ${err}`)
    return summary
  }

  if (!text.trim()) {
    summary.errors.push('PDF is empty')
    return summary
  }

  // Split pages — each page is separated by "-- N of M --" lines
  const pages = text.split(/\n--\s*\d+\s+of\s+\d+\s*--\n/).filter(p => p.trim())

  // Parse each page
  const parsedClasses: { className: string; students: { name: string }[] }[] = []

  for (const pageData of pages) {
    const lines = pageData.split('\n').map(l => l.trim()).filter(l => l)
    if (lines.length < 3) continue

    // First line: "Namensliste der <className>"
    const classMatch = lines[0].match(/Namensliste der\s+(.+)/i)
    if (!classMatch) continue
    const className = classMatch[1].trim()

    // Find the "NrName" marker line
    let dataStart = -1
    for (let i = 0; i < lines.length; i++) {
      if (/^Nr\s*Name/i.test(lines[i])) {
        dataStart = i + 1
        break
      }
    }
    if (dataStart < 0) continue

    // Parse data rows until date line
    const students: { name: string }[] = []
    for (let i = dataStart; i < lines.length; i++) {
      const line = lines[i]
      if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(line)) break
      const rowMatch = line.match(/^(\d+)\s+(.+)/)
      if (!rowMatch) continue
      const name = rowMatch[2].trim()
      if (name) students.push({ name })
    }

    if (students.length > 0) {
      parsedClasses.push({ className, students })
    }
  }

  if (parsedClasses.length === 0) {
    summary.errors.push('No student data found in PDF. Expected "Namensliste der ..." format.')
    return summary
  }

  const knex = getKnex()
  const existingUsernames = new Set<string>()
  try {
    const rows = await knex('users').select('username')
    for (const r of rows) existingUsernames.add(r.username)
  } catch { /* */ }

  // Get default teacher if no override
  let defaultTeacherId: string | null = null

  for (const cls of parsedClasses) {
    try {
      let classRow = await knex('classes').where({ name: cls.className }).first()

      if (!classRow) {
        const teacherId = teacherIdOverride || (await getDefaultTeacherId())

        const classId = uuidv4()
        await knex('classes').insert({
          id: classId,
          name: cls.className,
          teacher_id: teacherId,
          class_code: generateClassCode(),
        })
        classRow = await knex('classes').where({ id: classId }).first()!
        summary.classesCreated++
        summary.classNames.push(cls.className)
      } else {
        summary.classesSkipped++
        summary.classNames.push(cls.className + ' (already exists)')
      }

      for (const student of cls.students) {
        try {
          const { surname, givenName } = parseStudentName(student.name)
          const base = slugify(surname).slice(0, 8) + slugify(givenName).slice(0, 8)
          let username = base || `s${Date.now()}`
          let counter = 1
          while (existingUsernames.has(username)) {
            const suffix = String(counter)
            username = (base.slice(0, 20 - suffix.length) + suffix) || `s${suffix}`
            counter++
          }
          existingUsernames.add(username)

          const password = generatePassword()
          const { hash, salt } = hashNewPassword(password)
          const email = `${username}@schueler.learnflow`

          // Check if student exists
          const existingUser = await knex('users').where({ email }).orWhere(function () {
            this.where({ name: student.name }).andWhere({ role: 'student' })
          }).first()

          if (existingUser) {
            const enrolled = await knex('class_students')
              .where({ class_id: classRow.id, student_id: existingUser.id }).first()
            if (!enrolled) {
              await knex('class_students').insert({ class_id: classRow.id, student_id: existingUser.id })
            }
            summary.studentsSkipped++
            continue
          }

          const userId = uuidv4()
          await knex('users').insert({
            id: userId,
            username,
            email,
            name: student.name,
            password_hash: hash,
            password_salt: salt,
            role: 'student',
          })
          await knex('class_students').insert({ class_id: classRow.id, student_id: userId })

          summary.studentsCreated++
          summary.credentials.push({ username, password, name: student.name, email, className: cls.className })
        } catch (err) {
          summary.errors.push(`Student "${student.name}": ${err}`)
        }
      }
    } catch (err) {
      summary.errors.push(`Class "${cls.className}": ${err}`)
    }
  }

  return summary
}

function hashNewPassword(password: string): { hash: string; salt: string } {
  const salt = generateSalt()
  return { hash: hashPassword(password, salt), salt }
}

async function getDefaultTeacherId(): Promise<string> {
  const knex = getKnex()
  if (teacherIdOverride) return teacherIdOverride
  const teacher = await knex('users').where({ role: 'teacher' }).first()
  if (teacher) return teacher.id
  const id = uuidv4()
  await knex('users').insert({ id, username: 'admin-teacher', email: 'admin-teacher@learnflow.local', name: 'Admin Teacher', role: 'teacher' })
  return id
}
