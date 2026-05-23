import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../services/api'

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([])
  const currentCourse = ref(null)
  const loading = ref(false)

  async function fetchCourses() {
    const data = await api.get('/courses')
    courses.value = data.courses
  }

  async function fetchStudentCourses() {
    const data = await api.get('/courses/student/assigned')
    courses.value = data.courses
  }

  async function fetchCourse(id) {
    const data = await api.get(`/courses/${id}`)
    currentCourse.value = data
  }

  async function createCourse(payload) {
    const data = await api.post('/courses', payload)
    return data.course
  }

  async function deleteCourse(id) {
    await api.del(`/courses/${id}`)
  }

  async function addWorksheetToCourse(courseId, worksheetId) {
    return api.post(`/courses/${courseId}/worksheets`, { worksheet_id: worksheetId })
  }

  async function removeWorksheetFromCourse(courseId, worksheetId) {
    return api.del(`/courses/${courseId}/worksheets/${worksheetId}`)
  }

  async function reorderWorksheets(courseId, worksheetIds) {
    return api.put(`/courses/${courseId}/worksheets/reorder`, { worksheetIds })
  }

  async function enrollStudent(courseId, studentId) {
    return api.post(`/courses/${courseId}/students`, { student_id: studentId })
  }

  async function unenrollStudent(courseId, studentId) {
    return api.del(`/courses/${courseId}/students/${studentId}`)
  }

  return {
    courses,
    currentCourse,
    loading,
    fetchCourses,
    fetchStudentCourses,
    fetchCourse,
    createCourse,
    deleteCourse,
    addWorksheetToCourse,
    removeWorksheetFromCourse,
    reorderWorksheets,
    enrollStudent,
    unenrollStudent,
  }
})
