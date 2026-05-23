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
    worksheets.value = data.worksheets
  }

  async function fetchWorksheet(id) {
    const data = await api.get(`/worksheets/${id}`)
    current.value = data.worksheet
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
    templates.value = data.templates
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

  async function fetchAssignmentResults(assignmentId) {
    const data = await api.get(`/worksheets/assignments/${assignmentId}/results`)
    return data.submissions
  }

  async function fetchAssignmentStats(assignmentId) {
    return api.get(`/worksheets/assignments/${assignmentId}/stats`)
  }

  async function aiGenerate(prompt, provider = 'ollama') {
    return api.post('/worksheets/ai/generate', { prompt, provider })
  }

  return { worksheets, templates, current, loading, fetchMyWorksheets, fetchWorksheet, createWorksheet, updateWorksheet, deleteWorksheet, duplicateWorksheet, fetchTemplates, cloneTemplate, createAssignment, fetchAssignments, deleteAssignment, fetchAssignmentResults, fetchAssignmentStats, aiGenerate }
})
