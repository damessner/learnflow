import { ref, onMounted } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([])
  const isDark = ref(false)

  function showToast(message, type = 'info', duration = 4000) {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function initTheme() {
    const saved = localStorage.getItem('theme')
    isDark.value = saved === 'dark'
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : '')
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : '')
  }

  initTheme()
  return { toasts, isDark, showToast, removeToast, initTheme, toggleTheme }
})
