import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isGuest = computed(() => user.value?.isGuest || false)
  const role = computed(() => user.value?.role || 'student')

  function loadFromStorage() {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        user.value = null
      }
    }
  }

  function saveSession(u, t) {
    user.value = u
    localStorage.setItem('user', JSON.stringify(u))
    if (t) localStorage.setItem('token', t)
  }

  async function login(username, password) {
    const data = await api.post('/auth/login', { username, password })
    saveSession(data.user, data.token)
    return data
  }

  async function loginWithMicrosoft(payload) {
    const data = await api.post('/auth/microsoft', payload)
    saveSession(data.user, data.token)
    return data
  }

  async function loginAsGuest({ name, classCode }) {
    const data = await api.post('/auth/guest', { name, classCode })
    saveSession({ ...data.user, isGuest: true }, data.token)
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

  async function updateEmoji(emoji) {
    const data = await api.put('/auth/emoji', { emoji })
    user.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async function verifyToken() {
    const data = await api.get('/auth/verify')
    user.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  async function logout() {
    await api.post('/auth/logout')
    user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  loadFromStorage()
  return {
    user,
    isAuthenticated,
    isGuest,
    role,
    login,
    loginWithMicrosoft,
    loginAsGuest,
    registerTeacher,
    getAuthConfig,
    changePassword,
    updateEmoji,
    verifyToken,
    logout,
    loadFromStorage,
  }
})
