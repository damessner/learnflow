<template>
  <div class="page">
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h2>Teacher Dashboard</h2>
      <router-link to="/teacher/builder" class="btn-primary">Create Worksheet</router-link>
    </div>

    <div style="display: flex; gap: 0.5rem; margin: 1rem 0">
      <button :class="{ 'btn-primary': tab === 'worksheets' }" @click="tab = 'worksheets'">
        Worksheets
      </button>
      <button :class="{ 'btn-primary': tab === 'classes' }" @click="tab = 'classes'">
        Classes
      </button>
      <button :class="{ 'btn-primary': tab === 'results' }" @click="tab = 'results'">
        Results
      </button>
      <button :class="{ 'btn-primary': tab === 'analytics' }" @click="tab = 'analytics'">
        Analytics
      </button>
    </div>

    <template v-if="tab === 'worksheets'">
      <div v-if="wsStore.worksheets.length === 0" style="color: var(--text-muted)">
        No worksheets yet
      </div>
      <div v-for="ws in wsStore.worksheets" :key="ws.id" class="card" style="margin-bottom: 0.5rem">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div>
            <strong>{{ ws.title }}</strong>
            <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 0.5rem">{{
              ws.subject
            }}</span>
          </div>
          <div style="display: flex; gap: 0.25rem">
            <button class="btn-sm" @click="editWs(ws.id)">Edit</button>
            <button class="btn-sm" @click="previewWs(ws.id)">Preview</button>
            <button class="btn-sm" @click="duplicateWs(ws.id)">Copy</button>
            <button class="btn-sm" @click="assignWs(ws)">Assign</button>
            <button class="btn-sm btn-danger" @click="deleteWs(ws.id)">Delete</button>
          </div>
        </div>
        <div
          v-if="assignTarget && assignTarget.id === ws.id"
          style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color)"
        >
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap">
            <input v-model="assignForm.class_name" placeholder="Class name" style="width: 200px" />
            <input v-model="assignForm.due_date" type="date" style="width: 150px" />
            <select v-model="assignForm.retry_policy" style="width: 120px">
              <option value="single">Single</option>
              <option value="best">Best</option>
              <option value="latest">Latest</option>
            </select>
            <button class="btn-primary btn-sm" @click="doAssign(ws.id)">Assign</button>
            <button class="btn-sm" @click="assignTarget = null">Cancel</button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 1rem">
        <h3>New Class</h3>
        <div style="display: flex; gap: 0.5rem">
          <input v-model="newClassName" placeholder="Class name" />
          <button class="btn-primary" @click="createClass">Create</button>
        </div>
      </div>
    </template>

    <template v-if="tab === 'classes'">
      <div v-if="classesList.length === 0" style="color: var(--text-muted)">No classes yet</div>
      <div v-for="c in classesList" :key="c.id" class="card" style="margin-bottom: 0.5rem">
        <strong>{{ c.name }}</strong>
        <span class="badge" style="margin-left: 0.5rem">{{ c.class_code }}</span>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.25rem">
          <button class="btn-sm" @click="viewClassProgress(c.id)">Progress</button>
          <button class="btn-sm" @click="exportCsv(c.id)">Export CSV</button>
          <button class="btn-sm btn-danger" @click="deleteClass(c.id)">Delete</button>
        </div>
        <div v-if="selectedClass === c.id" style="margin-top: 0.5rem">
          <div v-if="classProgress.length">
            <div
              v-for="p in classProgress"
              :key="p.student.id"
              style="display: flex; justify-content: space-between; padding: 0.25rem 0"
            >
              <span>{{ p.student.name }}</span>
              <span>{{ p.completed }}/{{ p.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-if="tab === 'results'">
      <div v-if="!selectedAssignment" style="color: var(--text-muted)">
        Select a worksheet and assignment first
      </div>
      <div v-else>
        <h3>Results for {{ selectedAssignment.worksheet_title }}</h3>
        <table v-if="results.length">
          <thead>
            <tr>
              <th>Student</th>
              <th>Score</th>
              <th>Submitted</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in results" :key="r.id">
              <td>{{ r.student_name }}</td>
              <td>{{ r.score }}/{{ r.max_score }}</td>
              <td>{{ r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '-' }}</td>
              <td>
                <button class="btn-sm" @click="giveFeedback(r)">Feedback</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="feedbackTarget" style="margin-top: 0.5rem">
          <textarea v-model="feedbackText" placeholder="Enter feedback" rows="3"></textarea>
          <button class="btn-primary btn-sm" @click="submitFeedback">Submit Feedback</button>
        </div>
      </div>
    </template>

    <template v-if="tab === 'analytics'">
      <div class="grid grid-3">
        <div v-if="learningStore.analytics" class="card">
          <h4>Classes</h4>
          <p style="font-size: 2rem; font-weight: 700">
            {{ learningStore.analytics.totalClasses }}
          </p>
        </div>
        <div v-if="learningStore.analytics" class="card">
          <h4>Assignments</h4>
          <p style="font-size: 2rem; font-weight: 700">
            {{ learningStore.analytics.totalAssignments }}
          </p>
        </div>
        <div v-if="learningStore.analytics" class="card">
          <h4>Avg Score</h4>
          <p style="font-size: 2rem; font-weight: 700">
            {{ learningStore.analytics.averageScore }}%
          </p>
        </div>
      </div>

      <div class="card" style="margin-top: 1rem">
        <h4>At-Risk Students</h4>
        <div v-if="learningStore.atRisk.length === 0" style="color: var(--text-muted)">
          No at-risk students
        </div>
        <div
          v-for="s in learningStore.atRisk"
          :key="s.id"
          style="display: flex; justify-content: space-between; padding: 0.25rem 0"
        >
          <span>{{ s.name }}</span>
          <span style="color: var(--danger)"
            >{{ s.completed }}/{{ s.total }} completed ({{ s.avgScore }}%)</span
          >
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import { useClassesStore } from '../stores/classes'
import { useSubmissionsStore } from '../stores/submissions'
import { useLearningStore } from '../stores/learning'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const wsStore = useWorksheetsStore()
const classesStore = useClassesStore()
const submissionsStore = useSubmissionsStore()
const learningStore = useLearningStore()
const uiStore = useUiStore()

const tab = ref('worksheets')
const classesList = ref([])
const newClassName = ref('')
const assignTarget = ref(null)
const assignForm = ref({ class_name: '', due_date: '', retry_policy: 'single' })
const selectedClass = ref(null)
const classProgress = ref([])
const selectedAssignment = ref(null)
const results = ref([])
const feedbackTarget = ref(null)
const feedbackText = ref('')

onMounted(async () => {
  await wsStore.fetchMyWorksheets()
  await classesStore.fetchClasses()
  classesList.value = classesStore.classes
  await learningStore.fetchTeacherDashboard()
})

function editWs(id) {
  router.push(`/teacher/builder/${id}`)
}
function previewWs(id) {
  router.push(`/teacher/preview/${id}`)
}

async function duplicateWs(id) {
  try {
    await wsStore.duplicateWorksheet(id)
    await wsStore.fetchMyWorksheets()
    uiStore.showToast('Duplicated', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function deleteWs(id) {
  try {
    await wsStore.deleteWorksheet(id)
    await wsStore.fetchMyWorksheets()
    uiStore.showToast('Deleted', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

function assignWs(ws) {
  assignTarget.value = ws
}

async function doAssign(wsId) {
  try {
    await wsStore.createAssignment(wsId, assignForm.value)
    uiStore.showToast('Assignment created', 'success')
    assignTarget.value = null
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function createClass() {
  if (!newClassName.value.trim()) return
  try {
    await classesStore.createClass({ name: newClassName.value })
    uiStore.showToast('Class created', 'success')
    newClassName.value = ''
    await classesStore.fetchClasses()
    classesList.value = classesStore.classes
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function deleteClass(id) {
  try {
    await classesStore.deleteClass(id)
    await classesStore.fetchClasses()
    classesList.value = classesStore.classes
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

async function viewClassProgress(id) {
  selectedClass.value = id
  try {
    const data = await classesStore.fetchClassProgress(id)
    classProgress.value = data.progress
  } catch {
    /* */
  }
}

async function exportCsv(id) {
  try {
    await classesStore.exportCsv(id)
    uiStore.showToast('CSV downloaded', 'success')
  } catch {
    /* */
  }
}

function giveFeedback(r) {
  feedbackTarget.value = r
  feedbackText.value = r.feedback || ''
}

async function submitFeedback() {
  if (!feedbackTarget.value) return
  try {
    await submissionsStore.submitFeedback(feedbackTarget.value.id, feedbackText.value)
    uiStore.showToast('Feedback saved', 'success')
    feedbackTarget.value = null
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}
</script>
