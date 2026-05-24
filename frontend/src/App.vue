<template>
  <div :data-theme="uiStore.isDark ? 'dark' : ''">
    <header class="header">
      <router-link to="/login" class="header-logo">
        <span class="logo-icon">⚡</span>LearnFlow
      </router-link>
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
          <div class="nav-divider"></div>
          <button class="btn-icon" :title="uiStore.isDark ? 'Light mode' : 'Dark mode'" @click="uiStore.toggleTheme()">
            {{ uiStore.isDark ? '☀️' : '🌙' }}
          </button>
          <button class="btn-sm" @click="showChangePassword = true">Password</button>
          <button class="btn-sm btn-danger" @click="authStore.logout()">Sign Out</button>
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem">
          <h3 style="font-size: 1.1rem; font-weight: 700">Change Password</h3>
          <button
            @click="showChangePassword = false"
            style="background: none; border: none; font-size: 1.4rem; color: var(--text-muted); padding: 0"
          >
            &times;
          </button>
        </div>
        <div class="form-group">
          <label>Current Password</label>
          <input v-model="passwordForm.current" type="password" placeholder="••••••••" />
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input v-model="passwordForm.newPassword" type="password" placeholder="••••••••" />
        </div>
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem">
          <button @click="showChangePassword = false">Cancel</button>
          <button class="btn-primary" @click="changePassword">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

<style scoped>
.logo-icon {
  margin-right: 0.2rem;
  font-size: 1rem;
  -webkit-text-fill-color: initial;
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 0.125rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.3rem 0.5rem;
  font-size: 1.05rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transform: none;
  box-shadow: none;
}

.btn-icon:hover {
  background: var(--bg-main);
  color: var(--text-main);
  transform: none;
  box-shadow: none;
  border-color: transparent;
}
</style>
