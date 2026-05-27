import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../services/api'

export const useSubmissionsStore = defineStore('submissions', () => {
  const currentSubmission = ref(null)
  const summary = ref([])
  const loading = ref(false)

  async function fetchAssignmentSubmission(assignmentId) {
    const data = await api.get(`/submissions/assignment/${assignmentId}`)
    currentSubmission.value = data
    return data
  }

  async function saveProgress(assignmentId, answers) {
    await api.post(`/submissions/assignment/${assignmentId}/save`, { answers })
  }

  async function submitAssignment(assignmentId, payload) {
    const data = await api.post(`/submissions/assignment/${assignmentId}/submit`, payload)
    return data
  }

  async function fetchRemediation(assignmentId) {
    return api.get(`/submissions/assignment/${assignmentId}/remediation`)
  }

  async function generateRemediationRound(assignmentId) {
    return api.post(`/submissions/assignment/${assignmentId}/remediation/generate`)
  }

  async function submitRemediationResponses(roundId, payload) {
    return api.post(`/submissions/remediation/round/${roundId}/responses`, payload)
  }

  async function submitRemediationSelfAssessment(roundId, self_assessment) {
    return api.post(`/submissions/remediation/round/${roundId}/self-assessment`, { self_assessment })
  }

  async function fetchStudentRemediationHistory() {
    return api.get('/submissions/student/remediation-history')
  }

  async function fetchRemediationAbMetrics() {
    return api.get('/submissions/remediation/ab-metrics')
  }

  async function fetchStudentSummary() {
    const data = await api.get('/submissions/student/summary')
    summary.value = data.submissions || []
  }

  async function submitFeedback(submissionId, feedback) {
    return api.post(`/submissions/${submissionId}/feedback`, { feedback })
  }

  return {
    currentSubmission,
    summary,
    loading,
    fetchAssignmentSubmission,
    saveProgress,
    submitAssignment,
    fetchRemediation,
    generateRemediationRound,
    submitRemediationResponses,
    submitRemediationSelfAssessment,
    fetchStudentRemediationHistory,
    fetchRemediationAbMetrics,
    fetchStudentSummary,
    submitFeedback,
  }
})
