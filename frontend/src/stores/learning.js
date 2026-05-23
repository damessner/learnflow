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

  async function fetchTeacherDashboard() {
    await Promise.all([fetchAtRisk(), fetchInterventions(), fetchAnalytics()])
  }

  return { mastery, spacedQueue, planner, gamification, atRisk, interventions, analytics, fetchMastery, fetchSpacedQueue, fetchPlanner, updatePlanner, fetchGamification, fetchAtRisk, fetchInterventions, fetchAnalytics, fetchTeacherDashboard }
})
