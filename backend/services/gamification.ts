import { v4 as uuidv4 } from 'uuid'
import { getKnex } from '../db/knex'
import badgesCatalog from '../data/badges.json'

interface BadgeCondition {
  type: string
  threshold: number
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  condition: BadgeCondition
}

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 200)) + 1
}

export function xpForNextLevel(level: number): number {
  return level * level * 200
}

export async function addXp(
  userId: string,
  amount: number,
): Promise<{
  newXp: number
  newLevel: number
  leveledUp: boolean
  newBadges: string[]
}> {
  const knex = getKnex()
  const gam = await knex('learning_gamification').where({ user_id: userId }).first()

  if (!gam) {
    const id = uuidv4()
    await knex('learning_gamification').insert({
      id,
      user_id: userId,
      xp: 0,
      level: 1,
      badges: '[]',
      streak_days: 0,
    })
  }

  const currentGam = await knex('learning_gamification').where({ user_id: userId }).first()
  const oldXp = currentGam?.xp || 0
  const oldLevel = currentGam?.level || 1
  const newXp = Math.max(0, oldXp + amount)
  const newLevel = calculateLevel(newXp)
  const leveledUp = newLevel > oldLevel

  let badges: string[] = []
  try {
    badges = JSON.parse(currentGam?.badges || '[]')
  } catch {
    badges = []
  }

  const newBadges = checkBadges(newXp, newLevel, currentGam?.streak_days || 0, badges)
  const allBadges = [...new Set([...badges, ...newBadges])]

  await knex('learning_gamification')
    .where({ user_id: userId })
    .update({
      xp: newXp,
      level: newLevel,
      badges: JSON.stringify(allBadges),
    })

  return { newXp, newLevel, leveledUp, newBadges }
}

export async function updateStreak(userId: string): Promise<number> {
  const knex = getKnex()
  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  let gam = await knex('learning_gamification').where({ user_id: userId }).first()
  if (!gam) {
    const id = uuidv4()
    await knex('learning_gamification').insert({
      id,
      user_id: userId,
      xp: 0,
      level: 1,
      badges: '[]',
      streak_days: 0,
    })
    gam = await knex('learning_gamification').where({ user_id: userId }).first()
  }

  const streak = gam?.streak_days || 0
  const lastActivity = gam?.last_activity_date || null

  let newStreak = streak

  if (!lastActivity || lastActivity < today) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    if (lastActivity === yesterdayStr) {
      newStreak = streak + 1
    } else {
      newStreak = 1
    }
  }

  await knex('learning_gamification')
    .where({ user_id: userId })
    .update({ streak_days: newStreak, last_activity_date: today })

  return newStreak
}

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const knex = getKnex()
  const gam = await knex('learning_gamification').where({ user_id: userId }).first()

  let badges: string[] = []
  try {
    badges = JSON.parse(gam?.badges || '[]')
  } catch {
    badges = []
  }

  const newBadges = checkBadges(gam?.xp || 0, gam?.level || 1, gam?.streak_days || 0, badges)

  if (newBadges.length > 0) {
    const allBadges = [...new Set([...badges, ...newBadges])]
    await knex('learning_gamification')
      .where({ user_id: userId })
      .update({ badges: JSON.stringify(allBadges) })
  }

  return newBadges
}

function checkBadges(
  xp: number,
  level: number,
  streakDays: number,
  existingBadges: string[],
): string[] {
  const earned: string[] = []

  for (const badge of badgesCatalog.badges as Badge[]) {
    if (existingBadges.includes(badge.id)) continue

    let conditionMet = false

    switch (badge.condition.type) {
      case 'total_xp':
        conditionMet = xp >= badge.condition.threshold
        break
      case 'level':
        conditionMet = level >= badge.condition.threshold
        break
      case 'streak':
        conditionMet = streakDays >= badge.condition.threshold
        break
      default:
        break
    }

    if (conditionMet) {
      earned.push(badge.id)
    }
  }

  return earned
}

export async function awardActivityBadges(userId: string, badgeType: string): Promise<string[]> {
  const knex = getKnex()
  const gam = await knex('learning_gamification').where({ user_id: userId }).first()

  let badges: string[] = []
  try {
    badges = JSON.parse(gam?.badges || '[]')
  } catch {
    badges = []
  }

  const earned: string[] = []

  for (const badge of badgesCatalog.badges as Badge[]) {
    if (badges.includes(badge.id)) continue
    if (badge.condition.type === badgeType) {
      const count = await getActivityCount(userId, badgeType)
      if (count >= badge.condition.threshold) {
        earned.push(badge.id)
      }
    }
  }

  if (earned.length > 0) {
    const allBadges = [...new Set([...badges, ...earned])]
    await knex('learning_gamification')
      .where({ user_id: userId })
      .update({ badges: JSON.stringify(allBadges) })
  }

  return earned
}

async function getActivityCount(userId: string, type: string): Promise<number> {
  const knex = getKnex()

  switch (type) {
    case 'submissions_completed':
      const subCount = await knex('submissions')
        .where({ user_id: userId })
        .whereNotNull('submitted_at')
        .count({ count: '*' })
        .first()
      return (subCount as { count: number })?.count || 0

    case 'perfect_score': {
      const perfects = await knex('submissions')
        .where({ user_id: userId })
        .whereNotNull('score')
        .whereNotNull('max_score')
        .whereRaw('score = max_score')
        .count({ count: '*' })
        .first()
      return (perfects as { count: number })?.count || 0
    }

    case 'wagers_won': {
      const wagered = await knex('submission_attempts')
        .where({ user_id: userId })
        .whereNotNull('score')
        .count({ count: '*' })
        .first()
      return (wagered as { count: number })?.count || 0
    }

    case 'daily_mix_completions': {
      const reviews = await knex('student_knowledge_state')
        .where({ user_id: userId })
        .where('reps', '>', 0)
        .count({ count: '*' })
        .first()
      return (reviews as { count: number })?.count || 0
    }

    case 'unique_kcs_reviewed': {
      const uniqueKcs = await knex('student_knowledge_state')
        .where({ user_id: userId })
        .where('reps', '>', 0)
        .distinct('kc_id')
        .count({ count: '*' })
        .first()
      return (uniqueKcs as { count: number })?.count || 0
    }

    default:
      return 0
  }
}

export async function awardCourseBadge(userId: string, badgeName: string): Promise<boolean> {
  const knex = getKnex()
  let gam = await knex('learning_gamification').where({ user_id: userId }).first()
  if (!gam) {
    const id = uuidv4()
    await knex('learning_gamification').insert({
      id,
      user_id: userId,
      xp: 0,
      level: 1,
      badges: '[]',
      streak_days: 0,
    })
    gam = await knex('learning_gamification').where({ user_id: userId }).first()
  }

  let badges: string[] = []
  try {
    badges = JSON.parse(gam.badges || '[]')
  } catch {
    badges = []
  }

  if (badges.includes(badgeName)) {
    return false
  }

  badges.push(badgeName)
  await knex('learning_gamification')
    .where({ user_id: userId })
    .update({ badges: JSON.stringify(badges) })

  return true
}
