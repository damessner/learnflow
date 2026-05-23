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
  }

  async function saveProgress(assignmentId, answers) {
    await api.post(`/submissions/assignment/${assignmentId}/save`, { answers })
  }

  async function submitAssignment(assignmentId, answers) {
    const data = await api.post(`/submissions/assignment/${assignmentId}/submit`, { answers })
    return data
  }

  async function fetchStudentSummary() {
    const data = await api.get('/submissions/student/summary')
    summary.value = data.submissions
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
    fetchStudentSummary,
    submitFeedback,
  }
})
