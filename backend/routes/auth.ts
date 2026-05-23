import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'
import logger from '../lib/logger'

const router = Router()

function hashPassword(password: string): string {
  const salt = 'learnflow-salt'
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
}

function makeToken(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
}

function sanitizeUser(user: Record<string, unknown>) {
  const { password_hash, ...rest } = user
  return rest
}

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' })
      return
    }

    const knex = getKnex()
    const user = await knex('users').where({ username }).first()
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const hashed = hashPassword(password)
    if (user.password_hash !== hashed) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const token = makeToken({ userId: user.id, role: user.role, isGuest: false })
    res.json({ token, user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
})

router.post('/microsoft', async (req, res, next) => {
  try {
    const { name, email, oid, tenant } = req.body
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email required' })
      return
    }

    const knex = getKnex()
    let user = await knex('users').where({ email }).orWhere({ ms_oid: oid }).first()

    if (!user) {
      const id = uuidv4()
      const username = email.split('@')[0]
      await knex('users').insert({
        id,
        username,
        email,
        name,
        role: 'teacher',
        ms_oid: oid || null,
        ms_tenant: tenant || null,
      })
      user = await knex('users').where({ id }).first()
    }

    const token = makeToken({ userId: user.id, role: user.role, isGuest: false })
    res.json({ token, user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
})

router.post('/guest', async (req, res, next) => {
  try {
    const { name, classCode } = req.body
    if (!name || !classCode) {
      res.status(400).json({ error: 'Name and class code required' })
      return
    }

    const knex = getKnex()
    const classRow = await knex('classes').where({ class_code: classCode }).first()
    if (!classRow) {
      res.status(404).json({ error: 'Class not found' })
      return
    }

    const assignments = await knex('assignments').where({ class_id: classRow.id }).first()
    if (!assignments) {
      res.status(404).json({ error: 'No assignment found for this class' })
      return
    }

    const id = uuidv4()
    const username = `guest_${Date.now()}`
    await knex('users').insert({
      id,
      username,
      email: `${username}@guest.local`,
      name,
      role: 'student',
    })

    await knex('class_students')
      .insert({
        class_id: classRow.id,
        student_id: id,
      })
      .onConflict(['class_id', 'student_id'])
      .ignore()

    const token = makeToken({
      userId: id,
      role: 'student',
      isGuest: true,
      assignmentId: assignments.id,
    })

    res.json({ token, user: { id, username, name, role: 'student' }, assignmentId: assignments.id })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/register-teacher',
  requireAuth,
  requireRole('admin'),
  validate(
    z.object({
      username: z.string(),
      email: z.string().email(),
      name: z.string(),
      password: z.string().min(6),
    }),
  ),
  async (req, res, next) => {
    try {
      const knex = getKnex()
      const { username, email, name, password } = req.body

      const existing = await knex('users').where({ username }).orWhere({ email }).first()
      if (existing) {
        res.status(409).json({ error: 'User already exists' })
        return
      }

      const id = uuidv4()
      await knex('users').insert({
        id,
        username,
        email,
        name,
        password_hash: hashPassword(password),
        role: 'teacher',
      })

      const user = await knex('users').where({ id }).first()
      res.status(201).json({ user: sanitizeUser(user) })
    } catch (err) {
      next(err)
    }
  },
)

router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { current, newPassword } = req.body
    if (!current || !newPassword) {
      res.status(400).json({ error: 'Current and new password required' })
      return
    }

    const knex = getKnex()
    const user = await knex('users').where({ id: req.user!.userId }).first()

    if (user.password_hash !== hashPassword(current)) {
      res.status(401).json({ error: 'Current password is incorrect' })
      return
    }

    await knex('users')
      .where({ id: req.user!.userId })
      .update({
        password_hash: hashPassword(newPassword),
        updated_at: knex.fn.now(),
      })

    res.json({ message: 'Password changed' })
  } catch (err) {
    next(err)
  }
})

router.get('/config', (_req, res) => {
  res.json({ mode: process.env.MS_CLIENT_ID ? 'microsoft' : 'local' })
})

router.get('/verify', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token' })
      return
    }

    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as Record<
      string,
      unknown
    >

    const knex = getKnex()
    const user = await knex('users').where({ id: decoded.userId }).first()
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    res.json({ user: sanitizeUser(user) })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

router.get('/users', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const knex = getKnex()
    const users = await knex('users').select()
    res.json({ users: users.map(sanitizeUser) })
  } catch (err) {
    next(err)
  }
})

router.get('/users/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const user = await knex('users').where({ id: req.params.id }).first()
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
})

router.put('/users/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const { username, email, name, role, password } = req.body
    const updateData: Record<string, unknown> = { updated_at: knex.fn.now() }
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (name) updateData.name = name
    if (role) updateData.role = role
    if (password) updateData.password_hash = hashPassword(password)

    await knex('users').where({ id: req.params.id }).update(updateData)
    const user = await knex('users').where({ id: req.params.id }).first()
    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
})

router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    await knex('users').where({ id: req.params.id }).del()
    res.json({ message: 'User deleted' })
  } catch (err) {
    next(err)
  }
})

router.post('/teacher-token', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const teacher = await knex('users').where({ id: req.body.teacherId, role: 'teacher' }).first()
    if (!teacher) {
      res.status(404).json({ error: 'Teacher not found' })
      return
    }

    const token = jwt.sign(
      { userId: teacher.id, role: 'teacher', isGuest: false },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '30d' },
    )

    res.json({ token, teacherId: teacher.id })
  } catch (err) {
    next(err)
  }
})

export default router
