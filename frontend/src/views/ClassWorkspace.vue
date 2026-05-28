<template>
  <div class="page workspace-page">
    <div class="workspace-header card">
      <div>
        <button class="btn-sm" @click="router.push('/teacher')">← Back</button>
        <h2 style="margin: 0.75rem 0 0.25rem">Class Subject Workspace</h2>
        <p style="margin: 0; color: var(--text-muted)">
          Choose one class and manage one personal subject group.
        </p>
      </div>
      <div class="workspace-controls">
        <select v-model="selectedClassId" @change="onClassChange">
          <option value="">Select class...</option>
          <option v-for="cls in classesStore.classes" :key="cls.id" :value="cls.id">
            {{ cls.name }}
          </option>
        </select>
        <button class="btn-primary" :disabled="!selectedClassId" @click="createWorkspacePrompt">
          New Subject Group
        </button>
      </div>
    </div>

    <div v-if="selectedClass" class="workspace-header card workspace-class-bar">
      <div>
        <h3 style="margin: 0">{{ selectedClass.name }}</h3>
        <div style="color: var(--text-muted); font-size: 0.9rem">
          Only your subject groups for this class are shown.
        </div>
      </div>
      <span class="badge">Code: {{ selectedClass.class_code }}</span>
    </div>

    <div v-if="selectedClassId && workspaceStore.workspaces.length === 0" class="card empty-state">
      <div class="empty-state-icon">📚</div>
      <div class="empty-state-title">No subject group yet</div>
      <div class="empty-state-text">
        Create one subject group for this class, then drag courses and worksheets into it.
      </div>
    </div>

    <div
      v-for="workspace in workspaceStore.workspaces"
      :key="workspace.id"
      class="card workspace-card"
    >
      <div class="workspace-card-head">
        <div>
          <h3 style="margin: 0">{{ workspace.name }}</h3>
          <div style="color: var(--text-muted); font-size: 0.9rem">
            {{ workspace.subject }} · {{ workspace.class_name }}
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
          <button class="btn-sm" @click="openWorkspace(workspace.id)">Open</button>
          <button class="btn-sm btn-danger" @click="deleteWorkspace(workspace.id)">Delete</button>
        </div>
      </div>
    </div>

    <div v-if="workspaceData" class="workspace-detail grid grid-2">
      <div class="card">
        <div class="section-head">
          <h3>Subject Group</h3>
          <div style="display: flex; gap: 0.5rem">
            <input v-model="workspaceForm.name" placeholder="Group name" />
            <input v-model="workspaceForm.subject" placeholder="Subject" />
            <button class="btn-sm" @click="saveWorkspaceMeta">Save</button>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem">
          <select v-model="newCourseId">
            <option value="">Add course...</option>
            <option v-for="course in availableCourses" :key="course.id" :value="course.id">
              {{ course.name }}
            </option>
          </select>
          <button class="btn-sm" :disabled="!newCourseId" @click="addItem('course')">
            Add Course
          </button>
          <button class="btn-sm" @click="router.push('/teacher')">
            Create Course in Dashboard
          </button>
        </div>
        <div class="drag-list">
          <div
            v-for="(item, index) in courseItems"
            :key="item.id"
            class="drag-item"
            draggable="true"
            @dragstart="startDrag(item.id)"
            @dragover.prevent
            @drop="dropOn(item.id)"
          >
            <div>
              <strong>📚 {{ item.course_name }}</strong>
              <div style="color: var(--text-muted); font-size: 0.82rem">
                {{ item.course_description || 'No description' }}
              </div>
            </div>
            <div style="display: flex; gap: 0.25rem">
              <button class="btn-sm" :disabled="index === 0" @click="moveItem(item.id, -1)">
                ↑
              </button>
              <button
                class="btn-sm"
                :disabled="index === courseItems.length - 1"
                @click="moveItem(item.id, 1)"
              >
                ↓
              </button>
              <button class="btn-sm btn-danger" @click="removeItem(item.id)">×</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-head">
          <h3>Standalone Worksheets</h3>
          <div style="display: flex; gap: 0.5rem">
            <select v-model="newWorksheetId">
              <option value="">Add worksheet...</option>
              <option
                v-for="worksheet in availableWorksheets"
                :key="worksheet.id"
                :value="worksheet.id"
              >
                {{ worksheet.title }}
              </option>
            </select>
            <button class="btn-sm" :disabled="!newWorksheetId" @click="addItem('worksheet')">
              Add Worksheet
            </button>
            <button class="btn-sm" @click="router.push('/teacher/builder')">
              Create Worksheet
            </button>
          </div>
        </div>
        <div class="drag-list">
          <div
            v-for="(item, index) in worksheetItems"
            :key="item.id"
            class="drag-item"
            draggable="true"
            @dragstart="startDrag(item.id)"
            @dragover.prevent
            @drop="dropOn(item.id)"
          >
            <div>
              <strong>📝 {{ item.worksheet_title }}</strong>
              <div style="color: var(--text-muted); font-size: 0.82rem">
                {{ item.worksheet_subject || 'General' }} ·
                {{ item.worksheet_total_points || 0 }} pts
              </div>
            </div>
            <div style="display: flex; gap: 0.25rem">
              <button class="btn-sm" :disabled="index === 0" @click="moveItem(item.id, -1)">
                ↑
              </button>
              <button
                class="btn-sm"
                :disabled="index === worksheetItems.length - 1"
                @click="moveItem(item.id, 1)"
              >
                ↓
              </button>
              <button class="btn-sm" @click="router.push(`/teacher/builder/${item.worksheet_id}`)">
                Edit
              </button>
              <button class="btn-sm btn-danger" @click="removeItem(item.id)">×</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="grid-column: 1 / -1">
        <div class="section-head">
          <h3>Students in This Class</h3>
          <span class="badge">{{ workspaceData.students.length }} students</span>
        </div>
        <div class="student-grid">
          <div
            v-for="student in workspaceData.students"
            :key="student.id"
            class="student-progress-card"
          >
            <div style="display: flex; align-items: center; gap: 0.75rem">
              <span class="student-emoji">{{ student.character_emoji || '👤' }}</span>
              <div>
                <div style="font-weight: 700">{{ student.name }}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted)">
                  @{{ student.username }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClassesStore } from '../stores/classes'
import { useCoursesStore } from '../stores/courses'
import { useWorksheetsStore } from '../stores/worksheets'
import { useWorkspacesStore } from '../stores/workspaces'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const classesStore = useClassesStore()
const coursesStore = useCoursesStore()
const worksheetsStore = useWorksheetsStore()
const workspaceStore = useWorkspacesStore()
const uiStore = useUiStore()

const selectedClassId = ref('')
const workspaceData = ref<any | null>(null)
const workspaceForm = ref({ name: '', subject: '' })
const newCourseId = ref('')
const newWorksheetId = ref('')
const draggedItemId = ref('')

const selectedClass = computed(
  () => classesStore.classes.find((cls: any) => cls.id === selectedClassId.value) || null,
)
const courseItems = computed(() =>
  (workspaceData.value?.items || []).filter((item: any) => item.item_type === 'course'),
)
const worksheetItems = computed(() =>
  (workspaceData.value?.items || []).filter((item: any) => item.item_type === 'worksheet'),
)

const availableCourses = computed(() => {
  const used = new Set(courseItems.value.map((item: any) => item.course_id))
  return coursesStore.courses.filter((course: any) => !used.has(course.id))
})

const availableWorksheets = computed(() => {
  const used = new Set(worksheetItems.value.map((item: any) => item.worksheet_id))
  return worksheetsStore.worksheets.filter((worksheet: any) => !used.has(worksheet.id))
})

onMounted(async () => {
  await Promise.all([
    classesStore.fetchClasses(),
    coursesStore.fetchCourses(),
    worksheetsStore.fetchMyWorksheets(),
  ])
})

async function onClassChange() {
  workspaceData.value = null
  await workspaceStore.fetchWorkspaces(selectedClassId.value)
}

async function createWorkspacePrompt() {
  if (!selectedClass.value) return
  const subject = prompt('Subject for this group?', 'Mathematics')
  if (!subject) return
  const name = prompt('Name of this subject group?', `${selectedClass.value.name} · ${subject}`)
  if (!name) return

  try {
    await workspaceStore.createWorkspace({ class_id: selectedClassId.value, subject, name })
    await workspaceStore.fetchWorkspaces(selectedClassId.value)
    uiStore.showToast('Subject group created', 'success')
  } catch (e: any) {
    uiStore.showToast(e.message || 'Failed to create subject group', 'error')
  }
}

async function openWorkspace(id: string) {
  try {
    workspaceData.value = await workspaceStore.fetchWorkspace(id)
    workspaceForm.value = {
      name: workspaceData.value.workspace.name || '',
      subject: workspaceData.value.workspace.subject || '',
    }
  } catch (e: any) {
    uiStore.showToast(e.message || 'Failed to load workspace', 'error')
  }
}

async function saveWorkspaceMeta() {
  if (!workspaceData.value) return
  try {
    await workspaceStore.updateWorkspace(workspaceData.value.workspace.id, workspaceForm.value)
    await openWorkspace(workspaceData.value.workspace.id)
    await workspaceStore.fetchWorkspaces(selectedClassId.value)
    uiStore.showToast('Workspace updated', 'success')
  } catch (e: any) {
    uiStore.showToast(e.message || 'Failed to update workspace', 'error')
  }
}

async function deleteWorkspace(id: string) {
  if (!confirm('Delete this subject group?')) return
  try {
    await workspaceStore.deleteWorkspace(id)
    if (workspaceData.value?.workspace?.id === id) workspaceData.value = null
    await workspaceStore.fetchWorkspaces(selectedClassId.value)
    uiStore.showToast('Workspace deleted', 'success')
  } catch (e: any) {
    uiStore.showToast(e.message || 'Failed to delete workspace', 'error')
  }
}

async function addItem(type: 'course' | 'worksheet') {
  if (!workspaceData.value) return
  try {
    await workspaceStore.addItem(workspaceData.value.workspace.id, {
      item_type: type,
      course_id: type === 'course' ? newCourseId.value : undefined,
      worksheet_id: type === 'worksheet' ? newWorksheetId.value : undefined,
    })
    if (type === 'course') newCourseId.value = ''
    else newWorksheetId.value = ''
    await openWorkspace(workspaceData.value.workspace.id)
    uiStore.showToast(`${type === 'course' ? 'Course' : 'Worksheet'} added`, 'success')
  } catch (e: any) {
    uiStore.showToast(e.message || 'Failed to add item', 'error')
  }
}

async function removeItem(itemId: string) {
  if (!workspaceData.value) return
  try {
    await workspaceStore.removeItem(workspaceData.value.workspace.id, itemId)
    await openWorkspace(workspaceData.value.workspace.id)
  } catch (e: any) {
    uiStore.showToast(e.message || 'Failed to remove item', 'error')
  }
}

function startDrag(itemId: string) {
  draggedItemId.value = itemId
}

async function dropOn(targetItemId: string) {
  if (!workspaceData.value || !draggedItemId.value || draggedItemId.value === targetItemId) return
  const items = [...workspaceData.value.items]
  const from = items.findIndex((item: any) => item.id === draggedItemId.value)
  const to = items.findIndex((item: any) => item.id === targetItemId)
  if (from === -1 || to === -1) return
  const [moved] = items.splice(from, 1)
  items.splice(to, 0, moved)
  await persistOrder(items)
}

async function moveItem(itemId: string, delta: number) {
  if (!workspaceData.value) return
  const items = [...workspaceData.value.items]
  const index = items.findIndex((item: any) => item.id === itemId)
  const nextIndex = index + delta
  if (index === -1 || nextIndex < 0 || nextIndex >= items.length) return
  ;[items[index], items[nextIndex]] = [items[nextIndex], items[index]]
  await persistOrder(items)
}

async function persistOrder(items: any[]) {
  if (!workspaceData.value) return
  try {
    await workspaceStore.reorderItems(
      workspaceData.value.workspace.id,
      items.map((item) => item.id),
    )
    workspaceData.value.items = items
  } catch (e: any) {
    uiStore.showToast(e.message || 'Failed to save order', 'error')
  }
}
</script>

<style scoped>
.workspace-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.workspace-header,
.workspace-class-bar,
.workspace-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.workspace-controls,
.section-head {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.drag-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.drag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  background: var(--bg-main);
}
</style>
