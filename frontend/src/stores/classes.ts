import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../services/api'

export const useClassesStore = defineStore('classes', () => {
  const classes = ref([])
  const currentClass = ref(null)
  const loading = ref(false)

  async function fetchClasses() {
    const data = await api.get('/classes')
    classes.value = data.classes || []
  }

  async function fetchClass(id) {
    const data = await api.get(`/classes/${id}`)
    currentClass.value = data.class
  }

  async function createClass(payload) {
    const data = await api.post('/classes', payload)
    return data.class
  }

  async function deleteClass(id) {
    await api.del(`/classes/${id}`)
  }

  async function fetchClassProgress(id) {
    return api.get(`/classes/${id}/progress`)
  }

  async function fetchAllStudents() {
    return []
  }

  async function addStudent(classId, studentId) {
    await api.post(`/classes/${classId}/students`, { studentId })
  }

  async function removeStudent(classId, studentId) {
    await api.del(`/classes/${classId}/students/${studentId}`)
  }

  async function addManualStudent(payload) {
    return api.post('/classes/students/manual', payload)
  }

  async function fetchStudentStatus() {
    return api.get('/classes/student-status')
  }

  async function fetchAnnouncements() {
    const data = await api.get('/classes/student/announcements')
    return data.announcements
  }

  async function getAnnouncements(classId) {
    return api.get(`/classes/${classId}/announcements`)
  }

  async function createAnnouncement(classId, payload) {
    return api.post(`/classes/${classId}/announcements`, payload)
  }

  async function joinClass(code) {
    return api.post('/classes/join', { classCode: code })
  }

  async function importPdf(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/classes/import-pdf', formData)
  }

  async function exportCsv(classId) {
    return api.get(`/classes/${classId}/export-csv`)
  }

  return {
    classes,
    currentClass,
    loading,
    fetchClasses,
    fetchClass,
    createClass,
    deleteClass,
    fetchClassProgress,
    fetchAllStudents,
    addStudent,
    removeStudent,
    addManualStudent,
    fetchStudentStatus,
    fetchAnnouncements,
    getAnnouncements,
    createAnnouncement,
    joinClass,
    importPdf,
    exportCsv,
  }
})
