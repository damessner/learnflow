<template>
  <div :data-theme="uiStore.isDark ? 'dark' : ''">
    <header class="header glass-strong">
      <div class="header-inner">
        <router-link to="/login" class="header-logo">
          <span class="logo-icon">✦</span>
          <span class="logo-text">LearnFlow</span>
        </router-link>
        <nav class="header-nav">
          <template v-if="authStore.isAuthenticated">
            <router-link
              v-if="authStore.role === 'student' && !authStore.isGuest"
              to="/student"
              class="nav-link"
            >
              Dashboard
            </router-link>
            <router-link
              v-if="authStore.role === 'teacher' || authStore.role === 'admin'"
              to="/teacher"
              class="nav-link"
            >
              Dashboard
            </router-link>
            <router-link
              v-if="authStore.role === 'teacher' || authStore.role === 'admin'"
              to="/teacher/workspace"
              class="nav-link"
            >
              Workspace
            </router-link>
            <router-link v-if="authStore.role === 'admin'" to="/admin" class="nav-link">
              Admin
            </router-link>
          </template>
          <div class="nav-actions">
            <template v-if="authStore.isAuthenticated">
              <button
                @click="uiStore.toggleTheme()"
                class="btn-icon theme-btn"
                :title="uiStore.isDark ? 'Switch to light' : 'Switch to dark'"
              >
                {{ uiStore.isDark ? '☀️' : '🌙' }}
              </button>
              <button @click="showChangePassword = true" class="btn-icon" title="Change password">
                🔑
              </button>
              <button @click="authStore.logout()" class="btn-sm btn-danger logout-btn">Logout</button>
            </template>
          </div>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <!-- Avoid mode="out-in": it can leave the main area blank if leave/enter hooks stall. -->
        <transition name="fade">
          <component v-if="Component" :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

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
        <div class="modal-header">
          <h3 class="modal-title">Change Password</h3>
          <button @click="showChangePassword = false" class="btn-icon modal-close">&times;</button>
        </div>
        <div class="form-group">
          <label>Current Password</label>
          <input v-model="passwordForm.current" type="password" placeholder="Enter current password" />
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input v-model="passwordForm.newPassword" type="password" placeholder="Enter new password" />
        </div>
        <div class="modal-actions">
          <button @click="showChangePassword = false" class="btn-secondary">Cancel</button>
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
    const message = e instanceof Error ? e.message : 'Failed to change password'
    uiStore.showToast(message, 'error')
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 1.5rem;
}
[data-theme='dark'] .header {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-main);
  font-weight: 800;
  font-size: 1.15rem;
}

.logo-icon {
  font-size: 1.3rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-link {
  position: relative;
  padding: 0.4rem 0.8rem;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast), background var(--transition-fast);
}
.nav-link:hover {
  color: var(--primary);
  background: var(--primary-light);
}
.nav-link.router-link-exact-active {
  color: var(--primary);
  font-weight: 600;
}
.nav-link.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--gradient-primary);
  border-radius: 2px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid var(--border-color);
}

.theme-btn {
  font-size: 1rem;
}

.logout-btn {
  font-size: var(--font-size-xs);
  padding: 0.3rem 0.65rem;
}

.main-content {
  padding-top: 56px;
  min-height: 100vh;
}
</style>
