import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../services/api'

export const useLearningStore = defineStore('learning', () => {
  const mastery = ref([])
  const spacedQueue = ref([])
  const planner = ref([])
  const gamification = ref(null)
  const atRisk = ref([])
  const interventions = ref([])
  const analytics = ref(null)
  const dailyMix = ref([])
  const masteryMap = ref([])

  async function fetchMastery() {
    const data = await api.get('/learning/student/mastery')
    mastery.value = data.mastery
  }

  async function fetchSpacedQueue() {
    const data = await api.get('/learning/student/spaced-queue')
    spacedQueue.value = data.queue
  }

  async function fetchPlanner(start, end) {
    const data = await api.get(`/learning/student/planner?start=${start || ''}&end=${end || ''}`)
    planner.value = data.planner
  }

  async function updatePlanner(payload) {
    return api.post('/learning/student/planner', payload)
  }

  async function fetchGamification() {
    const data = await api.get('/learning/student/gamification')
    gamification.value = data.gamification
  }

  async function fetchAtRisk() {
    const data = await api.get('/learning/teacher/at-risk')
    atRisk.value = data.atRisk
  }

  async function fetchInterventions() {
    const data = await api.get('/learning/teacher/interventions')
    interventions.value = data.interventions
  }

  async function fetchAnalytics() {
    const data = await api.get('/learning/teacher/analytics')
    analytics.value = data.analytics
  }

  async function fetchMasteryMap() {
    const data = await api.get('/learning/teacher/mastery-map')
    masteryMap.value = data.masteryMap
  }

  async function fetchDailyMix() {
    try {
      const data = await api.get('/srs/due?interleave=true')
      dailyMix.value = data.dueReviews.map((r) => ({
        ...r,
        topic: r.name,
      }))
    } catch {
      dailyMix.value = []
    }
  }

  async function completeDailyMix(itemsCompleted) {
    // itemsCompleted is array of { kc_id, confidence } where confidence is 1 (Again), 3 (Hard), 5 (Easy)
    // Map confidence to FSRS Rating: 1=Again, 3=Hard, 5=Easy, 4=Good (Wait, FSRS: 1=Again, 2=Hard, 3=Good, 4=Easy)
    // We map 1 -> 1 (Again), 3 -> 2 (Hard), 5 -> 4 (Easy)
    const reviews = itemsCompleted.map((i) => {
      let rating = 1
      if (i.confidence === 3) rating = 2
      if (i.confidence === 5) rating = 4
      return { kc_id: i.kc_id, rating }
    })

    await api.post('/srs/review', { reviews })
    // give them some XP just for finishing
    return { xpGained: reviews.length * 10 }
  }

  async function fetchTeacherDashboard() {
    await Promise.all([fetchAtRisk(), fetchInterventions(), fetchAnalytics(), fetchMasteryMap()])
  }

  async function fetchWagerHistory() {
    const data = await api.get('/learning/student/wager-history')
    return data
  }

  return {
    mastery,
    spacedQueue,
    planner,
    gamification,
    atRisk,
    interventions,
    analytics,
    dailyMix,
    masteryMap,
    fetchMastery,
    fetchSpacedQueue,
    fetchPlanner,
    updatePlanner,
    fetchGamification,
    fetchAtRisk,
    fetchInterventions,
    fetchAnalytics,
    fetchMasteryMap,
    fetchDailyMix,
    completeDailyMix,
    fetchTeacherDashboard,
    fetchWagerHistory,
  }
})
