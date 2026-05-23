import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'
import { requireAuth, requireRole } from '../middleware/requireAuth'

const router = Router()

router.post('/assignment/:id/create-teams', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const { teamCount } = req.body

    const submissions = await knex('submissions')
      .join('users', 'submissions.user_id', 'users.id')
      .where('submissions.assignment_id', req.params.id)
      .select('users.id', 'submissions.score')

    const sorted = [...submissions].sort((a, b) => ((a.score || 0) / (a.max_score || 1)) - ((b.score || 0) / (b.max_score || 1)))
    const count = teamCount || Math.max(2, Math.ceil(sorted.length / 4))

    const teams: { id: string; name: string; members: string[] }[] = Array.from({ length: count }, (_, i) => ({
      id: uuidv4(),
      name: `Team ${i + 1}`,
      members: [],
    }))

    for (let i = 0; i < sorted.length; i++) {
      const teamIndex = i % count
      teams[teamIndex].members.push(sorted[i].id)
    }

    for (const team of teams) {
      await knex('teams').insert({
        id: team.id,
        assignment_id: req.params.id,
        name: team.name,
      })

      for (const studentId of team.members) {
        await knex('team_members').insert({
          team_id: team.id,
          student_id: studentId,
        })
      }
    }

    res.status(201).json({ teams })
  } catch (err) {
    next(err)
  }
})

router.post('/assignment/:id/push-grades', requireAuth, requireRole('teacher', 'admin'), async (req, res, next) => {
  try {
    const knex = getKnex()
    const teams = await knex('teams').where({ assignment_id: req.params.id })

    for (const team of teams) {
      const members = await knex('team_members').where({ team_id: team.id })
      const memberScores = await knex('submissions')
        .whereIn('user_id', members.map((m: { student_id: string }) => m.student_id))
        .where({ assignment_id: req.params.id })

      const highScore = memberScores.reduce(
        (max: number, s: { score: number; max_score: number }) => {
          const pct = s.max_score > 0 ? s.score / s.max_score : 0
          return Math.max(max, pct)
        },
        0,
      )

      const maxScore = memberScores[0]?.max_score || 100
      const targetScore = Math.round(highScore * maxScore)

      for (const member of members) {
        await knex('submissions')
          .where({ user_id: member.student_id, assignment_id: req.params.id })
          .update({ score: targetScore })
      }
    }

    res.json({ message: 'Grades pushed' })
  } catch (err) {
    next(err)
  }
})

export default router
