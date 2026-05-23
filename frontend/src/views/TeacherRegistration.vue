<template>
  <div class="page">
    <div style="max-width: 400px; margin: 3rem auto">
      <div class="card">
        <h2 style="margin-bottom: 1rem">Register as Teacher</h2>
        <div class="form-group">
          <label>Name</label>
          <input v-model="form.name" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" />
        </div>
        <div class="form-group">
          <label>Username</label>
          <input v-model="form.username" />
        </div>
        <div class="form-group">
          <label>Password (min 6 characters)</label>
          <input v-model="form.password" type="password" />
        </div>
        <div v-if="errorMsg" style="color: var(--danger); margin-bottom: 0.5rem">
          {{ errorMsg }}
        </div>
        <button class="btn-primary" style="width: 100%" :disabled="loading" @click="register">
          Register
        </button>
        <p style="text-align: center; margin-top: 0.75rem">
          <router-link to="/login">Back to Login</router-link>
        </p>
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
    router.push('/login')
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
