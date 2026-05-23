<template>
  <div class="page">
    <div style="max-width: 400px; margin: 3rem auto">
      <h1 style="text-align: center; color: var(--primary); margin-bottom: 1.5rem">LearnFlow</h1>

      <div class="card" style="margin-bottom: 1rem">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem">
          <button
            :class="{ 'btn-primary': mode === 'login' }"
            style="flex: 1"
            @click="mode = 'login'"
          >
            Login
          </button>
          <button
            :class="{ 'btn-primary': mode === 'guest' }"
            style="flex: 1"
            @click="mode = 'guest'"
          >
            Guest
          </button>
        </div>

        <template v-if="mode === 'login'">
          <div class="form-group">
            <label>Username</label>
            <input v-model="loginForm.username" @keyup.enter="doLogin" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="loginForm.password" type="password" @keyup.enter="doLogin" />
          </div>
          <div v-if="error" style="color: var(--danger); margin-bottom: 0.5rem; font-size: 0.85rem">
            {{ error }}
          </div>
          <button class="btn-primary" style="width: 100%" :disabled="loading" @click="doLogin">
            Login
          </button>
          <div style="text-align: center; margin-top: 0.75rem">
            <router-link to="/register-teacher">Register as Teacher</router-link>
          </div>
        </template>

        <template v-if="mode === 'guest'">
          <div class="form-group">
            <label>Your Name</label>
            <input v-model="guestForm.name" />
          </div>
          <div class="form-group">
            <label>Class Code</label>
            <input v-model="guestForm.classCode" placeholder="e.g. 5a1b-c3d4" />
          </div>
          <div v-if="error" style="color: var(--danger); margin-bottom: 0.5rem; font-size: 0.85rem">
            {{ error }}
          </div>
          <button class="btn-primary" style="width: 100%" :disabled="loading" @click="doGuestLogin">
            Join
          </button>
        </template>
      </div>

      <div v-if="msEnabled" class="card">
        <button style="width: 100%" @click="doMicrosoftLogin">Sign in with Microsoft Teams</button>
      </div>
    </div>
  </div>
</template>

<script setup>
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
