import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isGuest = computed(() => user.value?.isGuest || false)
  const role = computed(() => user.value?.role || 'student')

  function loadFromStorage() {
    const stored = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (stored) token.value = stored
    if (storedUser) {
      try { user.value = JSON.parse(storedUser) } catch { user.value = null }
    }
  }

  function saveSession(t, u) {
    token.value = t
    user.value = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
  }

  async function login(username, password) {
    const data = await api.post('/auth/login', { username, password })
    saveSession(data.token, data.user)
    return data
  }

  async function loginWithMicrosoft(payload) {
    const data = await api.post('/auth/microsoft', payload)
    saveSession(data.token, data.user)
    return data
  }

  async function loginAsGuest({ name, classCode }) {
    const data = await api.post('/auth/guest', { name, classCode })
    saveSession(data.token, { ...data.user, isGuest: true })
    return data
  }

  async function registerTeacher(payload) {
    return api.post('/auth/register-teacher', payload)
  }

  async function getAuthConfig() {
    return api.get('/auth/config')
  }

  async function changePassword(current, newPassword) {
    return api.post('/auth/change-password', { current, newPassword })
  }

  async function verifyToken() {
    const data = await api.get('/auth/verify')
    user.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  loadFromStorage()
  return { user, token, isAuthenticated, isGuest, role, login, loginWithMicrosoft, loginAsGuest, registerTeacher, getAuthConfig, changePassword, verifyToken, logout, loadFromStorage }
})
