<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="login-container">
      <div class="login-brand">
        <div class="login-logo">LearnFlow</div>
        <p class="login-tagline">Register a new teacher account</p>
      </div>

      <div class="login-card">
        <h2 class="reg-title">Create Teacher Account</h2>
        <p class="reg-subtitle">Admins only — you must be signed in as an admin.</p>

        <div class="form-group">
          <label>Full Name</label>
          <input v-model="form.name" placeholder="Teacher's full name" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="teacher@school.edu" />
        </div>
        <div class="form-group">
          <label>Username</label>
          <input v-model="form.username" placeholder="unique username" />
        </div>
        <div class="form-group">
          <label>Password <span class="label-hint">(min 6 characters)</span></label>
          <input v-model="form.password" type="password" placeholder="••••••••" />
        </div>
        <div v-if="errorMsg" class="login-error">{{ errorMsg }}</div>
        <button class="btn-primary login-submit" :disabled="loading" @click="register">
          <span v-if="!loading">Create Account →</span>
          <span v-else>Creating…</span>
        </button>
        <div class="back-link">
          <router-link to="/login">← Back to Sign In</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const form = ref({ name: '', email: '', username: '', password: '' })
const errorMsg = ref('')
const loading = ref(false)

async function register() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authStore.registerTeacher(form.value)
    router.push('/admin')
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
  background: var(--bg-main);
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #818cf8, #4f46e5);
  top: -150px;
  left: -150px;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #06b6d4, #0ea5e9);
  bottom: -100px;
  right: -100px;
}

[data-theme='dark'] .blob {
  opacity: 0.12;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-brand {
  text-align: center;
}

.login-logo {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.4rem;
}

.login-tagline {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.login-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-lg);
}

.reg-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-main);
}

.reg-subtitle {
  font-size: 0.83rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(245, 158, 11, 0.08);
  border-left: 3px solid var(--warning);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.label-hint {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.login-error {
  color: var(--danger);
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--danger-light);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--danger);
}

.login-submit {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.back-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
}
</style>
