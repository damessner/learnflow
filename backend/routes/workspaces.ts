import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'

const router = Router()

function paramValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value || ''
}

async function getOwnedWorkspace(knex: ReturnType<typeof getKnex>, workspaceId: string, userId: string, role: string) {
  const workspace = await knex('workspaces').where({ id: workspaceId }).first()
  if (!workspace) return null
  if (role !== 'admin' && workspace.teacher_id !== userId) return 'forbidden'
  return workspace
}

router.get('/', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    let query = knex('workspaces')
      .join('classes', 'workspaces.class_id', 'classes.id')
      .select('workspaces.*', 'classes.name as class_name', 'classes.class_code')

    if (req.user!.role !== 'admin') {
      query = query.where('workspaces.teacher_id', req.user!.userId)
    }
    if (typeof req.query.class_id === 'string' && req.query.class_id) {
      query = query.where('workspaces.class_id', req.query.class_id)
    }

    const workspaces = await query.orderBy('workspaces.created_at', 'desc')
    res.json({ workspaces })
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const classRecord = await knex('classes').where({ id: req.body.class_id }).first()
    if (!classRecord) {
      res.status(404).json({ error: 'Class not found' })
      return
    }
    if (req.user!.role !== 'admin' && classRecord.teacher_id !== req.user!.userId) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const id = uuidv4()
    await knex('workspaces').insert({
      id,
      name: req.body.name || `${classRecord.name} Workspace`,
      subject: req.body.subject || 'General',
      class_id: req.body.class_id,
      teacher_id: req.user!.userId,
      updated_at: knex.fn.now(),
    })

    const workspace = await knex('workspaces').where({ id }).first()
    res.status(201).json({ workspace })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const workspaceId = paramValue(req.params.id)
    const owned = await getOwnedWorkspace(knex, workspaceId, req.user!.userId, req.user!.role)
    if (!owned) {
      res.status(404).json({ error: 'Workspace not found' })
      return
    }
    if (owned === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const workspace = await knex('workspaces')
      .join('classes', 'workspaces.class_id', 'classes.id')
      .where('workspaces.id', workspaceId)
      .select('workspaces.*', 'classes.name as class_name', 'classes.class_code')
      .first()

    const items = await knex('workspace_items')
      .leftJoin('courses', 'workspace_items.course_id', 'courses.id')
      .leftJoin('worksheets', 'workspace_items.worksheet_id', 'worksheets.id')
      .where('workspace_items.workspace_id', workspaceId)
      .select(
        'workspace_items.id',
        'workspace_items.item_type',
        'workspace_items.order_index',
        'workspace_items.course_id',
        'workspace_items.worksheet_id',
        'courses.name as course_name',
        'courses.description as course_description',
        'courses.deadline as course_deadline',
        'courses.badge_name as course_badge_name',
        'worksheets.title as worksheet_title',
        'worksheets.description as worksheet_description',
        'worksheets.subject as worksheet_subject',
        'worksheets.grade_level as worksheet_grade_level',
        'worksheets.total_points as worksheet_total_points',
      )
      .orderBy('workspace_items.order_index', 'asc')

    const students = await knex('class_students')
      .join('users', 'class_students.student_id', 'users.id')
      .where('class_students.class_id', workspace.class_id)
      .select('users.id', 'users.name', 'users.username', 'users.character_emoji')
      .orderBy('users.name', 'asc')

    res.json({ workspace, items, students })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const workspaceId = paramValue(req.params.id)
    const owned = await getOwnedWorkspace(knex, workspaceId, req.user!.userId, req.user!.role)
    if (!owned) {
      res.status(404).json({ error: 'Workspace not found' })
      return
    }
    if (owned === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    await knex('workspaces').where({ id: workspaceId }).update({
      name: req.body.name ?? owned.name,
      subject: req.body.subject ?? owned.subject,
      updated_at: knex.fn.now(),
    })

    const workspace = await knex('workspaces').where({ id: workspaceId }).first()
    res.json({ workspace })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const workspaceId = paramValue(req.params.id)
    const owned = await getOwnedWorkspace(knex, workspaceId, req.user!.userId, req.user!.role)
    if (!owned) {
      res.status(404).json({ error: 'Workspace not found' })
      return
    }
    if (owned === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    await knex('workspace_items').where({ workspace_id: workspaceId }).del()
    await knex('workspaces').where({ id: workspaceId }).del()
    res.json({ message: 'Workspace deleted' })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/items', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const workspaceId = paramValue(req.params.id)
    const owned = await getOwnedWorkspace(knex, workspaceId, req.user!.userId, req.user!.role)
    if (!owned) {
      res.status(404).json({ error: 'Workspace not found' })
      return
    }
    if (owned === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const itemType = req.body.item_type
    if (!['course', 'worksheet'].includes(itemType)) {
      res.status(400).json({ error: 'item_type must be course or worksheet' })
      return
    }

    const itemId = itemType === 'course' ? req.body.course_id : req.body.worksheet_id
    if (!itemId) {
      res.status(400).json({ error: 'Item id missing' })
      return
    }

    const maxOrder = await knex('workspace_items')
      .where({ workspace_id: workspaceId })
      .max<{ max: number | null }>('order_index as max')
      .first()

    await knex('workspace_items').insert({
      id: uuidv4(),
      workspace_id: workspaceId,
      item_type: itemType,
      course_id: itemType === 'course' ? itemId : null,
      worksheet_id: itemType === 'worksheet' ? itemId : null,
      order_index: Number(maxOrder?.max || 0) + 1,
    })

    await knex('workspaces').where({ id: workspaceId }).update({ updated_at: knex.fn.now() })
    res.status(201).json({ message: 'Item added' })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id/items/:itemId', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const workspaceId = paramValue(req.params.id)
    const owned = await getOwnedWorkspace(knex, workspaceId, req.user!.userId, req.user!.role)
    if (!owned) {
      res.status(404).json({ error: 'Workspace not found' })
      return
    }
    if (owned === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    await knex('workspace_items').where({ workspace_id: workspaceId, id: paramValue(req.params.itemId) }).del()
    await knex('workspaces').where({ id: workspaceId }).update({ updated_at: knex.fn.now() })
    res.json({ message: 'Item removed' })
  } catch (err) {
    next(err)
  }
})

router.put('/:id/items/reorder', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const workspaceId = paramValue(req.params.id)
    const owned = await getOwnedWorkspace(knex, workspaceId, req.user!.userId, req.user!.role)
    if (!owned) {
      res.status(404).json({ error: 'Workspace not found' })
      return
    }
    if (owned === 'forbidden') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const itemIds = Array.isArray(req.body.itemIds) ? req.body.itemIds.slice(0, 500) : null
    if (!itemIds) {
      res.status(400).json({ error: 'itemIds must be an array' })
      return
    }

    for (let i = 0; i < itemIds.length; i++) {
      await knex('workspace_items').where({ workspace_id: workspaceId, id: itemIds[i] }).update({ order_index: i })
    }

    await knex('workspaces').where({ id: workspaceId }).update({ updated_at: knex.fn.now() })
    res.json({ message: 'Workspace items reordered' })
  } catch (err) {
    next(err)
  }
})

export default router
