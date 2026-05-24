<template>
  <div class="page">
    <h2>Admin Dashboard</h2>

    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem">
      <button :class="{ 'btn-primary': tab === 'users' }" @click="tab = 'users'">Users</button>
      <button :class="{ 'btn-primary': tab === 'classes' }" @click="tab = 'classes'">
        Classes
      </button>
      <button :class="{ 'btn-primary': tab === 'overview' }" @click="tab = 'overview'">
        Overview
      </button>
      <button :class="{ 'btn-primary': tab === 'backups' }" @click="tab = 'backups'">
        🗄️ Backups
      </button>
    </div>

    <template v-if="tab === 'users'">
      <div class="card" style="margin-bottom: 1rem">
        <h4>Add User</h4>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
          <input v-model="newUser.name" placeholder="Name" style="flex: 1; min-width: 150px" />
          <input v-model="newUser.email" placeholder="Email" style="flex: 1; min-width: 150px" />
          <input
            v-model="newUser.username"
            placeholder="Username"
            style="flex: 1; min-width: 150px"
          />
          <input
            v-model="newUser.password"
            placeholder="Password"
            type="password"
            style="flex: 1; min-width: 150px"
          />
          <select v-model="newUser.role" style="width: 120px">
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <button class="btn-primary" @click="createUser">Add</button>
        </div>
      </div>

      <table v-if="users.length">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.name }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>
              <span class="badge">{{ u.role }}</span>
            </td>
            <td>
              <button class="btn-sm btn-danger" @click="deleteUser(u.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-if="tab === 'classes'">
      <div v-if="allClasses.length === 0" style="color: var(--text-muted)">No classes</div>
      <div v-for="c in allClasses" :key="c.id" class="card" style="margin-bottom: 0.5rem">
        <strong>{{ c.name }}</strong>
        <span class="badge" style="margin-left: 0.5rem">{{ c.class_code }}</span>
        <span style="margin-left: 0.5rem; font-size: 0.85rem; color: var(--text-muted)"
          >Teacher: {{ c.teacher_id }}</span
        >
      </div>
    </template>

    <template v-if="tab === 'overview'">
      <div class="grid grid-3">
        <div class="card">
          <h4>Total Users</h4>
          <p style="font-size: 2rem; font-weight: 700">{{ users.length }}</p>
        </div>
        <div class="card">
          <h4>Total Classes</h4>
          <p style="font-size: 2rem; font-weight: 700">{{ allClasses.length }}</p>
        </div>
        <div class="card">
          <h4>Total Worksheets</h4>
          <p style="font-size: 2rem; font-weight: 700">{{ worksheetCount }}</p>
        </div>
      </div>
    </template>

    <!-- ─── BACKUPS TAB ──────────────────────────────────────────────────── -->
    <template v-if="tab === 'backups'">
      <div class="backup-grid">
        <!-- Backup Section -->
        <div class="card backup-card">
          <div class="backup-card-header">
            <span class="backup-icon">📦</span>
            <div>
              <h3 style="margin: 0 0 0.25rem">Database Backup</h3>
              <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem">
                Download a JSON snapshot of your LearnFlow data. You can restore from this file at
                any time.
              </p>
            </div>
          </div>

          <div class="backup-buttons">
            <button
              class="backup-btn backup-all"
              :disabled="backupLoading"
              @click="downloadBackup('all')"
            >
              <span class="backup-btn-icon">🗄️</span>
              <div>
                <div class="backup-btn-title">Backup ALL Data</div>
                <div class="backup-btn-sub">All users, classes, worksheets, submissions & more</div>
              </div>
              <span v-if="backupLoading === 'all'" class="spinner" />
            </button>

            <button
              class="backup-btn backup-worksheets"
              :disabled="backupLoading"
              @click="downloadBackup('worksheets-courses')"
            >
              <span class="backup-btn-icon">📝</span>
              <div>
                <div class="backup-btn-title">Backup Worksheets & Courses</div>
                <div class="backup-btn-sub">All worksheet content and course sequences</div>
              </div>
              <span v-if="backupLoading === 'worksheets-courses'" class="spinner" />
            </button>

            <button
              class="backup-btn backup-users"
              :disabled="backupLoading"
              @click="downloadBackup('users')"
            >
              <span class="backup-btn-icon">👥</span>
              <div>
                <div class="backup-btn-title">Backup Users</div>
                <div class="backup-btn-sub">Accounts, password hashes, XP & streak data</div>
              </div>
              <span v-if="backupLoading === 'users'" class="spinner" />
            </button>
          </div>
        </div>

        <!-- Restore Section -->
        <div class="card restore-card">
          <div class="backup-card-header">
            <span class="backup-icon">♻️</span>
            <div>
              <h3 style="margin: 0 0 0.25rem">Restore from Backup</h3>
              <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem">
                Upload a previously downloaded backup JSON to restore your data.
              </p>
            </div>
          </div>

          <div class="restore-warning">
            ⚠️ <strong>Warning:</strong> Restoring will overwrite existing data in the restored
            tables. This cannot be undone. Create a fresh backup first!
          </div>

          <div v-if="!restoreFile" class="restore-drop-zone" @click="triggerFileInput">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem">📂</div>
            <div style="font-weight: 600">Click to select a backup .json file</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem">
              learnflow-backup-*.json
            </div>
            <input
              ref="fileInputRef"
              type="file"
              accept=".json"
              style="display: none"
              @change="handleFileChange"
            />
          </div>

          <div v-else class="restore-file-ready">
            <div style="display: flex; align-items: center; gap: 0.75rem">
              <span style="font-size: 1.5rem">📋</span>
              <div style="flex: 1; min-width: 0">
                <div style="font-weight: 700; font-size: 0.9rem; word-break: break-all">
                  {{ restoreFile.name }}
                </div>
                <div
                  v-if="restoreMeta"
                  style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem"
                >
                  Type: <strong>{{ restoreMeta.type }}</strong> · Exported:
                  <strong>{{ new Date(restoreMeta.exported_at).toLocaleString() }}</strong> ·
                  Tables: <strong>{{ restoreMeta.tables?.length }}</strong>
                </div>
              </div>
              <button class="btn-sm" @click="clearRestoreFile" style="flex-shrink: 0">
                ✕ Clear
              </button>
            </div>

            <div
              v-if="restoreMeta?.row_counts"
              style="margin-top: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.4rem"
            >
              <span
                v-for="(count, table) in restoreMeta.row_counts"
                :key="table"
                class="restore-table-badge"
              >
                {{ table }}: {{ count }}
              </span>
            </div>

            <button
              class="btn-primary restore-confirm-btn"
              :disabled="restoreLoading"
              @click="runRestore"
            >
              <span v-if="restoreLoading" class="spinner" />
              <span v-else>♻️ Restore Database</span>
            </button>
          </div>

          <div
            v-if="restoreResult"
            :class="['restore-result', restoreResult.ok ? 'result-ok' : 'result-error']"
          >
            <div style="font-weight: 700; margin-bottom: 0.5rem">
              {{
                restoreResult.ok
                  ? '✅ Restore completed successfully!'
                  : '❌ Restore encountered errors'
              }}
            </div>
            <div v-if="restoreResult.errors?.length">
              <div
                v-for="e in restoreResult.errors"
                :key="e"
                style="font-size: 0.8rem; opacity: 0.85"
              >
                • {{ e }}
              </div>
            </div>
            <div
              v-if="restoreResult.ok"
              style="font-size: 0.85rem; opacity: 0.85; margin-top: 0.25rem"
            >
              {{ Object.keys(restoreResult.restored || {}).length }} tables restored. Please reload
              the application for changes to take effect.
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
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

// ── Backup state ─────────────────────────────────────────────────────────────
const backupLoading = ref<string | false>(false)

// ── Restore state ─────────────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null)
const restoreFile = ref<File | null>(null)
const restoreMeta = ref(null)
const restorePayload = ref(null)
const restoreLoading = ref(false)
const restoreResult = ref(null)

onMounted(async () => {
  try {
    const userData = await api.get('/auth/users')
    users.value = userData.users || []
  } catch {
    /* */
  }
  try {
    await classesStore.fetchClasses()
    allClasses.value = classesStore.classes || []
  } catch {
    /* */
  }
  try {
    const wsData = await api.get('/worksheets')
    worksheetCount.value = (wsData.worksheets || []).length
  } catch {
    /* */
  }
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

// ── Backup logic ──────────────────────────────────────────────────────────────
async function downloadBackup(type: string) {
  backupLoading.value = type
  try {
    // credentials: 'include' automatically sends the session cookie — no manual token extraction needed
    const res = await fetch(`/api/admin/backup?type=${type}`, { credentials: 'include' })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody.error || `Server returned ${res.status}`)
    }

    const blob = await res.blob()
    const disposition = res.headers.get('Content-Disposition') || ''
    const match = disposition.match(/filename="(.+?)"/)
    const filename = match ? match[1] : `learnflow-backup-${type}.json`

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    uiStore.showToast(`✅ Backup downloaded: ${filename}`, 'success')
  } catch (e) {
    uiStore.showToast(`Backup failed: ${e.message}`, 'error')
  } finally {
    backupLoading.value = false
  }
}

// ── Restore logic ─────────────────────────────────────────────────────────────
function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  restoreResult.value = null
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  restoreFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string)
      restoreMeta.value = parsed._meta || null
      restorePayload.value = parsed
    } catch {
      uiStore.showToast('Invalid JSON file', 'error')
      clearRestoreFile()
    }
  }
  reader.readAsText(file)
}

function clearRestoreFile() {
  restoreFile.value = null
  restoreMeta.value = null
  restorePayload.value = null
  restoreResult.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function runRestore() {
  if (!restorePayload.value) return
  if (!confirm('Are you sure you want to restore? This will overwrite existing database records.'))
    return

  restoreLoading.value = true
  restoreResult.value = null
  try {
    const data = await api.post('/admin/restore', restorePayload.value)
    restoreResult.value = { ok: true, restored: data.restored, errors: data.errors }
    uiStore.showToast('✅ Database restored successfully!', 'success')
  } catch (e) {
    restoreResult.value = { ok: false, errors: [e.message] }
    uiStore.showToast(`Restore failed: ${e.message}`, 'error')
  } finally {
    restoreLoading.value = false
  }
}
</script>

<style scoped>
.backup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .backup-grid {
    grid-template-columns: 1fr;
  }
}

.backup-card,
.restore-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border-top: 4px solid var(--primary);
}

.backup-card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.backup-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.backup-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.backup-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-color);
  background: var(--bg-main);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  font-family: inherit;
}

.backup-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.backup-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.backup-all:hover:not(:disabled) {
  border-color: var(--primary);
  background: rgba(79, 70, 229, 0.05);
}
.backup-worksheets:hover:not(:disabled) {
  border-color: var(--success);
  background: rgba(34, 197, 94, 0.05);
}
.backup-users:hover:not(:disabled) {
  border-color: var(--warning);
  background: rgba(245, 158, 11, 0.05);
}

.backup-btn-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.backup-btn-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-main);
}

.backup-btn-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

.restore-warning {
  padding: 0.75rem 1rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  color: #92400e;
}

[data-theme='dark'] .restore-warning {
  color: #fde68a;
}

.restore-drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: 2.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-main);
}

.restore-drop-zone:hover {
  border-color: var(--primary);
  background: rgba(79, 70, 229, 0.04);
}

.restore-file-ready {
  padding: 1rem;
  background: var(--bg-main);
  border: 1.5px solid var(--primary);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.restore-table-badge {
  font-size: 0.72rem;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  background: rgba(79, 70, 229, 0.1);
  color: var(--primary);
  font-weight: 600;
}

.restore-confirm-btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.restore-result {
  padding: 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.result-ok {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #166534;
}

.result-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #991b1b;
}

[data-theme='dark'] .result-ok {
  color: #86efac;
}
[data-theme='dark'] .result-error {
  color: #fca5a5;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
