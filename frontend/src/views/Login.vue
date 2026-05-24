<template>
  <div class="login-page">
    <!-- Background decoration -->
    <div class="login-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="login-container">
      <!-- Brand -->
      <div class="login-brand">
        <div class="login-logo">LearnFlow</div>
        <p class="login-tagline">The adaptive learning platform built for every student</p>
      </div>

      <div class="login-card">
        <div class="tab-switcher">
          <button :class="['tab-btn', { active: mode === 'login' }]" @click="mode = 'login'">
            Sign In
          </button>
          <button :class="['tab-btn', { active: mode === 'guest' }]" @click="mode = 'guest'">
            Join as Guest
          </button>
        </div>

        <template v-if="mode === 'login'">
          <div class="form-group">
            <label>Username</label>
            <input
              v-model="loginForm.username"
              placeholder="your username"
              @keyup.enter="doLogin"
            />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="••••••••"
              @keyup.enter="doLogin"
            />
          </div>
          <div v-if="error" class="login-error">{{ error }}</div>
          <button class="btn-primary login-submit" :disabled="loading" @click="doLogin">
            <span v-if="!loading">Sign In →</span>
            <span v-else>Signing in…</span>
          </button>
        </template>

        <template v-if="mode === 'guest'">
          <div class="form-group">
            <label>Your Name</label>
            <input v-model="guestForm.name" placeholder="Enter your name" />
          </div>
          <div class="form-group">
            <label>Class Code</label>
            <input v-model="guestForm.classCode" placeholder="e.g. 5a1b-c3d4" />
          </div>
          <div v-if="error" class="login-error">{{ error }}</div>
          <button class="btn-primary login-submit" :disabled="loading" @click="doGuestLogin">
            <span v-if="!loading">Join Class →</span>
            <span v-else>Joining…</span>
          </button>
        </template>
      </div>

      <div v-if="msEnabled" class="ms-card">
        <button class="ms-btn" @click="doMicrosoftLogin">
          <svg
            width="18"
            height="18"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style="flex-shrink: 0"
          >
            <rect x="1" y="1" width="9" height="9" fill="#f35325" />
            <rect x="11" y="1" width="9" height="9" fill="#81bc06" />
            <rect x="1" y="11" width="9" height="9" fill="#05a6f0" />
            <rect x="11" y="11" width="9" height="9" fill="#ffba08" />
          </svg>
          Sign in with Microsoft Teams
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const mode = ref('login')
const loading = ref(false)
const error = ref('')
const msEnabled = ref(false)

const loginForm = ref({ username: '', password: '' })
const guestForm = ref({ name: '', classCode: '' })

onMounted(async () => {
  try {
    const config = await authStore.getAuthConfig()
    msEnabled.value = config.mode === 'microsoft'
  } catch {
    /* */
  }
})

async function doLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(loginForm.value.username, loginForm.value.password)
    navigateByRole()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function doGuestLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.loginAsGuest(guestForm.value)
    router.push('/student')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function doMicrosoftLogin() {
  uiStore.showToast('Microsoft login not configured', 'warning')
}

function navigateByRole() {
  const role = authStore.role
  if (role === 'admin') router.push('/admin')
  else if (role === 'teacher') router.push('/teacher')
  else router.push('/student')
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
  max-width: 420px;
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

.tab-switcher {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-main);
  border-radius: var(--radius-sm);
  padding: 0.25rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: calc(var(--radius-sm) - 2px);
  background: transparent;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  transform: none;
  box-shadow: none;
}

.tab-btn:hover {
  background: transparent;
  color: var(--text-main);
  transform: none;
  box-shadow: none;
}

.tab-btn.active {
  background: var(--bg-card);
  color: var(--primary);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
}

.tab-btn.active:hover {
  background: var(--bg-card);
  color: var(--primary);
  transform: none;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
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
  margin-top: 0.25rem;
}

.ms-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem 1.5rem;
  box-shadow: var(--shadow-sm);
}

.ms-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-weight: 600;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-sm);
}

.ms-btn:hover {
  background: var(--bg-main);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
</style>
