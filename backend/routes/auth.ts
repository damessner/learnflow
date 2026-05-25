import { Router, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'

const router = Router()

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
}

function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex')
}

/** Returns { hash, salt } for a new password. */
function hashNewPassword(password: string): { hash: string; salt: string } {
  const salt = generateSalt()
  return { hash: hashPassword(password, salt), salt }
}

/** Verifies a password against a stored hash.
 *  Falls back to the legacy static salt for accounts that pre-date per-user salts. */
function verifyPassword(password: string, storedHash: string, storedSalt: string | null): boolean {
  const LEGACY_SALT = 'learnflow-salt'
  if (storedSalt) {
    return hashPassword(password, storedSalt) === storedHash
  }
  return hashPassword(password, LEGACY_SALT) === storedHash
}

function makeToken(payload: object): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is required')
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

function sanitizeUser(user: Record<string, unknown>) {
  const { password_hash: _password_hash, password_salt: _password_salt, ...rest } = user
  return rest
}

function setTokenCookie(res: Response, token: string) {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
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

    if (!verifyPassword(password, user.password_hash, user.password_salt)) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const token = makeToken({ userId: user.id, role: user.role, isGuest: false })
    setTokenCookie(res, token)
    res.json({ user: sanitizeUser(user) })
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
    let user
    if (oid) {
      user = await knex('users').where({ email }).orWhere({ ms_oid: oid }).first()
    } else {
      user = await knex('users').where({ email }).first()
    }

    if (!user) {
      const id = uuidv4()
      const username = email.split('@')[0]
      await knex('users').insert({
        id,
        username,
        email,
        name,
        role: 'student',
        ms_oid: oid || null,
        ms_tenant: tenant || null,
      })
      user = await knex('users').where({ id }).first()
    }

    const token = makeToken({ userId: user.id, role: user.role, isGuest: false })
    setTokenCookie(res, token)
    res.json({ user: sanitizeUser(user) })
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
    })

    setTokenCookie(res, token)
    res.json({ user: { id, username, name, role: 'student' } })
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
      const { hash: password_hash, salt: password_salt } = hashNewPassword(password)
      await knex('users').insert({
        id,
        username,
        email,
        name,
        password_hash,
        password_salt,
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
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    if (!verifyPassword(current, user.password_hash, user.password_salt)) {
      res.status(401).json({ error: 'Current password is incorrect' })
      return
    }

    const { hash: password_hash, salt: password_salt } = hashNewPassword(newPassword)
    await knex('users')
      .where({ id: req.user!.userId })
      .update({
        password_hash,
        password_salt,
        updated_at: knex.fn.now(),
      })

    res.json({ message: 'Password changed' })
  } catch (err) {
    next(err)
  }
})

router.put('/emoji', requireAuth, async (req, res, next) => {
  try {
    const { emoji } = req.body
    const knex = getKnex()
    await knex('users')
      .where({ id: req.user!.userId })
      .update({
        character_emoji: emoji || null,
        updated_at: knex.fn.now(),
      })
    const user = await knex('users').where({ id: req.user!.userId }).first()
    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
})

router.get('/config', (_req, res) => {
  res.json({ mode: process.env.MS_CLIENT_ID ? 'microsoft' : 'local' })
})

router.post('/logout', (_req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  res.json({ message: 'Logged out' })
})

router.get('/verify', async (req, res, _next) => {
  try {
    const authHeader = req.headers.authorization
    const token =
      req.cookies.auth_token ||
      (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null)

    if (!token) {
      res.status(401).json({ error: 'No token' })
      return
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      res.status(500).json({ error: 'Server misconfiguration' })
      return
    }
    const decoded = jwt.verify(token, secret) as Record<string, unknown>

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
    if (role) {
      const validRoles = ['student', 'teacher', 'admin']
      if (!validRoles.includes(role)) {
        res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` })
        return
      }
      updateData.role = role
    }
    if (password) {
      const { hash, salt } = hashNewPassword(password)
      updateData.password_hash = hash
      updateData.password_salt = salt
    }

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
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    )

    setTokenCookie(res, token)
    res.json({ teacherId: teacher.id })
  } catch (err) {
    next(err)
  }
})

export default router
