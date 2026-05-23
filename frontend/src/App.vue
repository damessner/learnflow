<template>
  <div :data-theme="uiStore.isDark ? 'dark' : ''">
    <header class="header">
      <router-link to="/login" class="header-logo">LearnFlow</router-link>
      <nav class="header-nav">
        <template v-if="authStore.isAuthenticated">
          <router-link v-if="authStore.role === 'student'" :to="authStore.isGuest ? '' : '/student'"
            >Dashboard</router-link
          >
          <router-link
            v-if="authStore.role === 'teacher' || authStore.role === 'admin'"
            to="/teacher"
            >Dashboard</router-link
          >
          <router-link v-if="authStore.role === 'admin'" to="/admin">Admin</router-link>
          <button class="btn-sm" @click="uiStore.toggleTheme()">
            {{ uiStore.isDark ? 'Light' : 'Dark' }}
          </button>
          <button class="btn-sm" @click="showChangePassword = true">Password</button>
          <button class="btn-sm btn-danger" @click="authStore.logout()">Logout</button>
        </template>
      </nav>
    </header>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <div class="toast-container">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        @click="uiStore.removeToast(toast.id)"
      >
        {{ toast.message }}
      </div>
    </div>

    <div v-if="showChangePassword" class="modal-overlay" @click.self="showChangePassword = false">
      <div class="modal">
        <h3>Change Password</h3>
        <div class="form-group">
          <label>Current Password</label>
          <input v-model="passwordForm.current" type="password" />
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input v-model="passwordForm.newPassword" type="password" />
        </div>
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end">
          <button @click="showChangePassword = false">Cancel</button>
          <button class="btn-primary" @click="changePassword">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from './stores/auth'
import { useUiStore } from './stores/ui'

const authStore = useAuthStore()
const uiStore = useUiStore()
const showChangePassword = ref(false)
const passwordForm = ref({ current: '', newPassword: '' })

async function changePassword() {
  try {
    await authStore.changePassword(passwordForm.value.current, passwordForm.value.newPassword)
    uiStore.showToast('Password changed', 'success')
    showChangePassword.value = false
    passwordForm.value = { current: '', newPassword: '' }
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}
</script>
