<template>
  <div class="page">
    <h2>Admin Dashboard</h2>

    <div style="display:flex;gap:0.5rem;margin-bottom:1rem">
      <button :class="{ 'btn-primary': tab === 'users' }" @click="tab = 'users'">Users</button>
      <button :class="{ 'btn-primary': tab === 'classes' }" @click="tab = 'classes'">Classes</button>
      <button :class="{ 'btn-primary': tab === 'overview' }" @click="tab = 'overview'">Overview</button>
    </div>

    <template v-if="tab === 'users'">
      <div class="card" style="margin-bottom:1rem">
        <h4>Add User</h4>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <input v-model="newUser.name" placeholder="Name" style="flex:1;min-width:150px" />
          <input v-model="newUser.email" placeholder="Email" style="flex:1;min-width:150px" />
          <input v-model="newUser.username" placeholder="Username" style="flex:1;min-width:150px" />
          <input v-model="newUser.password" placeholder="Password" type="password" style="flex:1;min-width:150px" />
          <select v-model="newUser.role" style="width:120px">
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <button class="btn-primary" @click="createUser">Add</button>
        </div>
      </div>

      <table v-if="users.length">
        <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th></th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.name }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td><span class="badge">{{ u.role }}</span></td>
            <td>
              <button class="btn-sm btn-danger" @click="deleteUser(u.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-if="tab === 'classes'">
      <div v-if="allClasses.length === 0" style="color:var(--text-muted)">No classes</div>
      <div v-for="c in allClasses" :key="c.id" class="card" style="margin-bottom:0.5rem">
        <strong>{{ c.name }}</strong>
        <span class="badge" style="margin-left:0.5rem">{{ c.class_code }}</span>
        <span style="margin-left:0.5rem;font-size:0.85rem;color:var(--text-muted)">Teacher: {{ c.teacher_id }}</span>
      </div>
    </template>

    <template v-if="tab === 'overview'">
      <div class="grid grid-3">
        <div class="card"><h4>Total Users</h4><p style="font-size:2rem;font-weight:700">{{ users.length }}</p></div>
        <div class="card"><h4>Total Classes</h4><p style="font-size:2rem;font-weight:700">{{ allClasses.length }}</p></div>
        <div class="card"><h4>Total Worksheets</h4><p style="font-size:2rem;font-weight:700">{{ worksheetCount }}</p></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import { useUiStore } from '../stores/ui'
import { useClassesStore } from '../stores/classes'

const uiStore = useUiStore()
const classesStore = useClassesStore()
const tab = ref('users')
const users = ref([])
const allClasses = ref([])
const worksheetCount = ref(0)
const newUser = ref({ name: '', email: '', username: '', password: '', role: 'teacher' })

onMounted(async () => {
  try {
    const userData = await api.get('/auth/users')
    users.value = userData.users || []
  } catch { /* */ }
  try {
    await classesStore.fetchClasses()
    allClasses.value = classesStore.classes || []
  } catch { /* */ }
  try {
    const wsData = await api.get('/worksheets')
    worksheetCount.value = (wsData.worksheets || []).length
  } catch { /* */ }
})

async function createUser() {
  try {
    await api.post('/auth/register-teacher', newUser.value)
    uiStore.showToast('User created', 'success')
    newUser.value = { name: '', email: '', username: '', password: '', role: 'teacher' }
    const data = await api.get('/auth/users')
    users.value = data.users || []
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function deleteUser(id) {
  try {
    await api.del(`/auth/users/${id}`)
    uiStore.showToast('User deleted', 'success')
    users.value = users.value.filter((u) => u.id !== id)
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}
</script>
