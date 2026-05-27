import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../services/api'

export const useWorksheetsStore = defineStore('worksheets', () => {
  const worksheets = ref([])
  const templates = ref([])
  const current = ref(null)
  const loading = ref(false)

  async function fetchMyWorksheets() {
    const data = await api.get('/worksheets')
    worksheets.value = data.worksheets || []
  }

  async function fetchWorksheet(id) {
    const data = await api.get(`/worksheets/${id}`)
    current.value = data.worksheet || null
  }

  async function createWorksheet(payload) {
    const data = await api.post('/worksheets', payload)
    return data.worksheet
  }

  async function updateWorksheet(id, payload) {
    const data = await api.put(`/worksheets/${id}`, payload)
    return data.worksheet
  }

  async function deleteWorksheet(id) {
    await api.del(`/worksheets/${id}`)
  }

  async function duplicateWorksheet(id) {
    const data = await api.post(`/worksheets/${id}/duplicate`)
    return data.worksheet
  }

  async function fetchTemplates() {
    const data = await api.get('/worksheets/templates')
    templates.value = data.templates || []
  }

  async function cloneTemplate(id) {
    const data = await api.post(`/worksheets/templates/${id}/clone`)
    return data.worksheet
  }

  async function createAssignment(wsId, payload) {
    const data = await api.post(`/worksheets/${wsId}/assignments`, payload)
    return data.assignment
  }

  async function fetchAssignments(wsId) {
    const data = await api.get(`/worksheets/${wsId}/assignments`)
    return data.assignments
  }

  async function deleteAssignment(wsId, assignmentId) {
    await api.del(`/worksheets/${wsId}/assignments/${assignmentId}`)
  }

  async function updateAssignment(wsId, assignmentId, payload) {
    const data = await api.put(`/worksheets/${wsId}/assignments/${assignmentId}`, payload)
    return data.assignment
  }

  async function fetchWorksheetVersions(id) {
    const data = await api.get(`/worksheets/${id}/versions`)
    return data.versions || []
  }

  async function restoreWorksheetVersion(id, versionId) {
    const data = await api.post(`/worksheets/${id}/versions/${versionId}/restore`)
    return data.worksheet
  }

  async function fetchAssignmentResults(assignmentId) {
    const data = await api.get(`/worksheets/assignments/${assignmentId}/results`)
    return data.submissions
  }

  async function fetchAssignmentStats(assignmentId) {
    return api.get(`/worksheets/assignments/${assignmentId}/stats`)
  }

  async function fetchAssignmentRemediation(assignmentId) {
    return api.get(`/worksheets/assignments/${assignmentId}/remediation`)
  }

  async function aiGenerate(prompt, provider = 'gemini', options = {}) {
    return api.post('/ai/generate', { prompt, provider, ...options })
  }

  async function aiRegenerateBlock(payload) {
    return api.post('/ai/regenerate-block', payload)
  }

  async function aiCheckAnswer(payload) {
    return api.post('/ai/check-answer', payload)
  }

  async function aiDifferentiateConcept(payload) {
    return api.post('/ai/differentiate', payload)
  }

  return {
    worksheets,
    templates,
    current,
    loading,
    fetchMyWorksheets,
    fetchWorksheet,
    createWorksheet,
    updateWorksheet,
    deleteWorksheet,
    duplicateWorksheet,
    fetchTemplates,
    cloneTemplate,
    createAssignment,
    fetchAssignments,
    deleteAssignment,
    updateAssignment,
    fetchWorksheetVersions,
    restoreWorksheetVersion,
    fetchAssignmentResults,
    fetchAssignmentStats,
    fetchAssignmentRemediation,
    aiGenerate,
    aiRegenerateBlock,
    aiCheckAnswer,
    aiDifferentiateConcept,
  }
})
