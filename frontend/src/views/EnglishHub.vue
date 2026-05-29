<template>
  <div class="english-hub page-wide">
    <!-- Header Card -->
    <div class="hub-header glass-strong flex items-center justify-between p-4 mb-4">
      <div class="flex items-center gap-3">
        <span class="text-3xl">🇬🇧</span>
        <div>
          <h2 class="text-xl font-bold">English Hub</h2>
          <p class="text-sm text-secondary">MORE! Curriculum & Class Progress Overview</p>
        </div>
      </div>
      
      <!-- Class Selector -->
      <div class="flex items-center gap-2">
        <label class="text-xs font-bold text-secondary">Class:</label>
        <select v-model="selectedClassId" @change="onClassChange" class="class-select">
          <option value="">-- Choose Class --</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </div>

    <!-- LEVEL 1: NO CLASS SELECTED (Show Textbook Selection Cards / Preview) -->
    <div v-if="!selectedClassId && !previewMode" class="textbook-grid fade-in">
      <div class="textbook-card card card-lift" @click="showPreview">
        <span class="text-4xl">📘</span>
        <h3>MORE! 1</h3>
        <p class="text-sm text-secondary">Grade 5 (1. Klasse)</p>
        <span class="badge badge-success mt-2">15 Units — Ready</span>
      </div>
      <div class="textbook-card card disabled">
        <span class="text-4xl">📙</span>
        <h3>MORE! 2</h3>
        <p class="text-sm text-secondary">Grade 6 (2. Klasse)</p>
        <span class="badge badge-warning mt-2">Coming Soon</span>
      </div>
      <div class="textbook-card card disabled">
        <span class="text-4xl">📗</span>
        <h3>MORE! 3</h3>
        <p class="text-sm text-secondary">Grade 7 (3. Klasse)</p>
        <span class="badge badge-warning mt-2">Coming Soon</span>
      </div>
      <div class="textbook-card card disabled">
        <span class="text-4xl">📕</span>
        <h3>MORE! 4</h3>
        <p class="text-sm text-secondary">Grade 8 (4. Klasse)</p>
        <span class="badge badge-warning mt-2">Coming Soon</span>
      </div>
    </div>

    <!-- LEVEL 2: CURRICULUM PREVIEW (No class needed) -->
    <div v-else-if="previewMode" class="fade-in">
      <div class="flex items-center gap-3 mb-4">
        <button @click="previewMode = false" class="btn-secondary btn-sm">← Back</button>
        <h3 class="text-lg font-bold">📘 MORE! 1 — Curriculum Overview</h3>
        <span class="text-sm text-secondary">All 15 units with grammar, vocabulary & writing content</span>
      </div>
      <div class="preview-grid">
        <div v-for="u in MORE1_UNITS" :key="u.unit" class="preview-card card">
          <span class="preview-unit-badge">Unit {{ u.unit }}</span>
          <h4 class="text-base font-bold mt-2">{{ u.title }}</h4>
          <p class="text-xs text-secondary mt-1">{{ u.theme }}</p>
          <div class="flex flex-wrap gap-1 mt-3">
            <span class="chip-preview">🔤 Grammar</span>
            <span class="chip-preview">📚 Vocabulary ({{ vocabWordCount(u.unit) }} words)</span>
            <span class="chip-preview">✍️ Writing</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LEVEL 3: CLASS SELECTED (Show Graphical Matrix Grid) -->
    <div v-else-if="selectedClassId" class="fade-in">
      <!-- Loading State -->
      <div v-if="loadingMatrix" class="text-center py-6 card">
        <div class="loader mb-2"></div>
        <p class="text-secondary">Loading student progress matrix...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="matrixData.length === 0" class="text-center py-6 card text-secondary">
        <span class="text-3xl">👥</span>
        <p class="text-lg font-bold mt-2">No students enrolled in this class.</p>
        <p class="text-sm">Give students your class code so they can join and complete exercises!</p>
      </div>

      <!-- Matrix Grid Dashboard -->
      <div v-else class="matrix-dashboard card p-4 fade-in">
        <div class="flex justify-between items-center mb-4 border-bottom pb-2">
          <h3 class="text-lg font-bold">Progress Matrix — MORE! 1</h3>
          
          <div class="legend flex items-center gap-3 text-xs">
            <span class="legend-item"><span class="badge badge-success">A / B</span> Excellent</span>
            <span class="legend-item"><span class="badge badge-warning">C / D</span> Satisfactory</span>
            <span class="legend-item"><span class="badge badge-danger">F / E</span> Action needed</span>
            <span class="legend-item"><span class="badge badge-gray">—</span> Not started</span>
          </div>
        </div>

        <!-- Scrollable Table Wrapper -->
        <div class="table-container">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="sticky-col student-name-th">Student Name</th>
                <th v-for="u in 15" :key="u" class="unit-th">
                  Unit {{ u }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in matrixData" :key="student.studentId" class="student-row">
                <td class="sticky-col student-name-td font-semibold" @click="showStudentDetails(student)">
                  👤 {{ student.studentName }}
                </td>
                <td v-for="uData in student.units" :key="uData.unit" class="unit-cell">
                  <div class="cell-grades">
                    <!-- Grammar Indicator -->
                    <span
                      class="mini-badge"
                      :class="getGradeClass(uData.grammar.quizGrade, hasGrammarProgress(uData.grammar))"
                      :title="'Grammar: ' + getGrammarTitle(uData.grammar)"
                    >
                      G: {{ uData.grammar.quizGrade || (hasGrammarProgress(uData.grammar) ? '✓' : '—') }}
                    </span>

                    <!-- Vocabulary Indicator -->
                    <span
                      class="mini-badge"
                      :class="getGradeClass(uData.vocab.grade, uData.vocab.completed)"
                      :title="'Vocabulary: ' + getVocabTitle(uData.vocab)"
                    >
                      V: {{ uData.vocab.grade || (uData.vocab.completed ? '✓' : '—') }}
                    </span>

                    <!-- Reading Indicator -->
                    <span
                      class="mini-badge"
                      :class="getGradeClass(uData.reading.grade, uData.reading.completed)"
                      :title="'Reading: ' + getReadingTitle(uData.reading)"
                    >
                      R: {{ uData.reading.grade || (uData.reading.completed ? '✓' : '—') }}
                    </span>

                    <!-- Listening Indicator -->
                    <span
                      class="mini-badge"
                      :class="getGradeClass(uData.listening.grade, uData.listening.completed)"
                      :title="'Listening: ' + getListeningTitle(uData.listening)"
                    >
                      L: {{ uData.listening.grade || (uData.listening.completed ? '✓' : '—') }}
                    </span>

                    <!-- Writing Indicator -->
                    <span
                      class="mini-badge"
                      :class="getGradeClass(uData.writing.grade, uData.writing.completed)"
                      :title="'Writing Coach: ' + getWritingTitle(uData.writing)"
                    >
                      W: {{ uData.writing.grade || (uData.writing.completed ? '✓' : '—') }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- STUDENT DETAILED DRILLDOWN MODAL -->
    <div v-if="activeStudent" class="modal-overlay" @click.self="activeStudent = null">
      <div class="modal student-details-modal">
        <div class="modal-header flex justify-between items-center border-bottom pb-2 mb-3">
          <div>
            <span class="badge badge-primary mb-1">MORE! 1 Progress Report</span>
            <h3 class="text-lg font-bold">👤 {{ activeStudent.studentName }}</h3>
          </div>
          <button @click="activeStudent = null" class="btn-close">&times;</button>
        </div>

        <div class="modal-body overflow-y-auto max-h-400">
          <div v-for="uData in activeStudent.units" :key="uData.unit" class="unit-detail-row card mb-3">
            <div class="flex justify-between items-center mb-2 pb-1 border-bottom">
              <span class="font-bold text-primary">Unit {{ uData.unit }}</span>
              <span class="text-xs text-secondary">{{ getUnitTheme(uData.unit) }}</span>
            </div>

            <div class="grid grid-5 gap-2 text-sm">
              <!-- Grammar -->
              <div class="drilldown-col">
                <strong class="block text-xs text-secondary">🏆 Grammar</strong>
                <div class="mt-1">
                  <div class="flex justify-between"><span>Explorer:</span> <span>{{ uData.grammar.explorerDone ? '✅' : '❌' }}</span></div>
                  <div class="flex justify-between"><span>Pioneer:</span> <span>{{ uData.grammar.pioneerDone ? '✅' : '❌' }}</span></div>
                  <div class="flex justify-between"><span>Master:</span> <span>{{ uData.grammar.masterDone ? '✅' : '❌' }}</span></div>
                  <div class="flex justify-between font-semibold mt-1">
                    <span>Quiz Grade:</span> 
                    <span :class="getGradeTextColor(uData.grammar.quizGrade)">{{ uData.grammar.quizGrade || '—' }}</span>
                  </div>
                </div>
              </div>

              <!-- Vocab -->
              <div class="drilldown-col">
                <strong class="block text-xs text-secondary">📚 Vocabulary</strong>
                <div class="mt-1">
                  <div class="flex justify-between"><span>Starter:</span> <span>{{ uData.vocab.completed ? '✅' : '❌' }}</span></div>
                  <div class="flex justify-between font-semibold mt-2">
                    <span>Quiz Grade:</span> 
                    <span :class="getGradeTextColor(uData.vocab.grade)">{{ uData.vocab.grade || '—' }}</span>
                  </div>
                  <div class="text-xs text-secondary mt-1" v-if="uData.vocab.completed">
                    Score: {{ uData.vocab.score }}/{{ uData.vocab.max }}
                  </div>
                </div>
              </div>

              <!-- Reading -->
              <div class="drilldown-col">
                <strong class="block text-xs text-secondary">📖 Reading</strong>
                <div class="mt-1">
                  <div class="flex justify-between"><span>Stories:</span> <span>{{ uData.reading.completedCount }} / 4</span></div>
                  <div class="flex justify-between font-semibold mt-2">
                    <span>Grade:</span> 
                    <span :class="getGradeTextColor(uData.reading.grade)">{{ uData.reading.grade || '—' }}</span>
                  </div>
                  <div class="text-xs text-secondary mt-1" v-if="uData.reading.completed">
                    Score: {{ uData.reading.score }}%
                  </div>
                </div>
              </div>

              <!-- Listening -->
              <div class="drilldown-col">
                <strong class="block text-xs text-secondary">🎧 Listening</strong>
                <div class="mt-1">
                  <div class="flex justify-between"><span>Tracks:</span> <span>{{ uData.listening.completedCount }} / 4</span></div>
                  <div class="flex justify-between font-semibold mt-2">
                    <span>Grade:</span> 
                    <span :class="getGradeTextColor(uData.listening.grade)">{{ uData.listening.grade || '—' }}</span>
                  </div>
                  <div class="text-xs text-secondary mt-1" v-if="uData.listening.completed">
                    Score: {{ uData.listening.score }}%
                  </div>
                </div>
              </div>

              <!-- Writing -->
              <div class="drilldown-col">
                <strong class="block text-xs text-secondary">✍️ Writing Coach</strong>
                <div class="mt-1">
                  <div class="flex justify-between"><span>Completed:</span> <span>{{ uData.writing.completed ? '✅' : '❌' }}</span></div>
                  <div class="flex justify-between font-semibold mt-2">
                    <span>Grade:</span> 
                    <span :class="getGradeTextColor(uData.writing.grade)">{{ uData.writing.grade || '—' }}</span>
                  </div>
                  <div class="text-xs text-secondary mt-1" v-if="uData.writing.completed">
                    Score: {{ uData.writing.score }}/100
                  </div>
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
import { ref, onMounted } from 'vue'
import { useUiStore } from '../stores/ui'
import { api } from '../services/api'

const MORE1_UNITS = [
  { unit: 1, title: 'Time for School', theme: 'colours, school things, classroom' },
  { unit: 2, title: 'At the Zoo', theme: 'animals' },
  { unit: 3, title: 'Pirates', theme: 'body parts' },
  { unit: 4, title: 'Emotions', theme: 'feelings' },
  { unit: 5, title: 'This is our Band', theme: 'musicians, instruments, movement' },
  { unit: 6, title: "The World's Best Detective", theme: 'action verbs' },
  { unit: 7, title: 'I love Noodles', theme: 'food' },
  { unit: 8, title: 'Clothes', theme: 'clothing' },
  { unit: 9, title: 'Shopping', theme: 'pets' },
  { unit: 10, title: 'In a Shop', theme: 'numbers, demonstratives, shopping' },
  { unit: 11, title: "What's the Time?", theme: 'free time, time expressions' },
  { unit: 12, title: 'The Birthday Cake', theme: 'rooms, months, ordinal numbers' },
  { unit: 13, title: 'Help!', theme: 'emergency services, accidents' },
  { unit: 14, title: "It's my Favourite", theme: 'TV programmes, books' },
  { unit: 15, title: 'What are you Going to Do?', theme: 'future plans' },
]

const uiStore = useUiStore()

const classes = ref<any[]>([])
const selectedClassId = ref('')
const loadingMatrix = ref(false)
const matrixData = ref<any[]>([])
const previewMode = ref(false)
const activeStudent = ref<any>(null)

const MORE1_THEMES = [
  'colours, school things, classroom',
  'animals',
  'body parts',
  'feelings',
  'musicians, instruments, movement',
  'action verbs',
  'food',
  'clothing',
  'pets',
  'numbers, demonstratives, shopping',
  'free time, time expressions',
  'rooms, months, ordinal numbers',
  'emergency services, accidents',
  'TV programmes, books',
  'future plans'
]

onMounted(async () => {
  try {
    const res = await fetch('/api/classes')
    if (res.ok) {
      const data = await res.json()
      classes.value = data.classes || []
      
      // Auto-select first class if available
      if (classes.value.length > 0) {
        selectedClassId.value = classes.value[0].id
        await loadClassMatrix(classes.value[0].id)
      }
    }
  } catch (_e) {}
})

async function onClassChange() {
  if (selectedClassId.value) {
    await loadClassMatrix(selectedClassId.value)
  } else {
    matrixData.value = []
  }
}

async function loadClassMatrix(classId: string) {
  loadingMatrix.value = true
  try {
    const res = await api.get(`/english/more1/class-matrix/${classId}`)
    matrixData.value = res.matrix || []
  } catch (e: any) {
    uiStore.showToast(e.message || 'Failed to load progress matrix', 'error')
    matrixData.value = []
  } finally {
    loadingMatrix.value = false
  }
}

function showPreview() {
  previewMode.value = true
}

function vocabWordCount(unit: number) {
  return 0 // placeholder — can import from vocabularyData if needed
}

function promptSelectClass() {
  uiStore.showToast('Please select a class from the dropdown above to view progress!', 'info')
}

// Helpers
function hasGrammarProgress(g: any) {
  return g.explorerDone || g.pioneerDone || g.masterDone || g.quizGrade
}

function getGradeClass(grade: string | null, done: any) {
  if (!done && !grade) return 'badge-gray'
  if (!grade) return 'badge-warning'
  if (['A', 'B'].includes(grade)) return 'badge-success'
  if (['C', 'D'].includes(grade)) return 'badge-warning'
  return 'badge-danger'
}

function getGradeTextColor(grade: string | null) {
  if (!grade) return 'text-muted'
  if (['A', 'B'].includes(grade)) return 'text-success font-bold'
  if (['C', 'D'].includes(grade)) return 'text-warning font-bold'
  return 'text-danger font-bold'
}

function getGrammarTitle(g: any) {
  const levels = []
  if (g.explorerDone) levels.push('Explorer')
  if (g.pioneerDone) levels.push('Pioneer')
  if (g.masterDone) levels.push('Master')
  return `${levels.join('/') || 'No levels'} | Quiz: ${g.quizGrade || '—'}`
}

function getVocabTitle(v: any) {
  return v.completed ? `Quiz Grade: ${v.grade || '—'} (${v.score}/${v.max} pts)` : 'Not completed'
}

function getWritingTitle(w: any) {
  return w.completed ? `Grade: ${w.grade || '—'} (${w.score}/100 pts)` : 'Not completed'
}

function getReadingTitle(r: any) {
  return r.completed ? `Completions: ${r.completedCount}/4 | Avg: ${r.score}% (Grade: ${r.grade || '—'})` : 'Not started'
}

function getListeningTitle(l: any) {
  return l.completed ? `Completions: ${l.completedCount}/4 | Avg: ${l.score}% (Grade: ${l.grade || '—'})` : 'Not started'
}

function getUnitTheme(unit: number) {
  return MORE1_THEMES[unit - 1] || ''
}

function showStudentDetails(student: any) {
  activeStudent.value = student
}
</script>

<style scoped>
.english-hub {
  padding: 1.5rem 1rem;
  min-height: calc(100vh - 56px);
  max-width: 1300px;
  margin: 0 auto;
}
.hub-header {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.class-select {
  padding: 0.4rem 0.7rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-xs);
  background: var(--bg-card);
  font-size: var(--font-size-sm);
  color: var(--text-main);
  outline: none;
}
.class-select:focus {
  border-color: var(--primary);
}

.textbook-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
}
.textbook-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
}
.textbook-card.disabled {
  opacity: 0.5;
  cursor: default;
}

/* Progress Matrix Table */
.matrix-dashboard {
  border: 1px solid var(--border-color);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.table-container {
  overflow-x: auto;
  margin-top: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}
.matrix-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.matrix-table th,
.matrix-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  font-size: 0.85rem;
  white-space: nowrap;
}
.matrix-table th {
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-weight: 700;
}

/* Sticky Student Name Column */
.sticky-col {
  position: sticky;
  left: 0;
  background: var(--bg-card);
  z-index: 10;
  border-right: 2px solid var(--border-color) !important;
}
th.sticky-col {
  background: var(--bg-hover);
  z-index: 11;
}
.student-name-td {
  cursor: pointer;
}
.student-name-td:hover {
  color: var(--primary);
  background: var(--bg-hover);
}

.unit-cell {
  vertical-align: middle;
}
.cell-grades {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

/* Badges */
.mini-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.35rem;
  border-radius: var(--radius-xs);
  text-align: center;
  display: inline-block;
  min-width: 48px;
}
.badge-success { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.badge-warning { background: rgba(234, 179, 8, 0.12); color: #ca8a04; }
.badge-danger { background: rgba(239, 68, 68, 0.12); color: #dc2626; }
.badge-gray { background: var(--bg-hover); color: var(--text-muted); }

/* Modal details */
.student-details-modal {
  max-width: 600px;
  width: calc(100% - 2rem);
}
.max-h-400 {
  max-height: 420px;
}
.unit-detail-row {
  padding: 0.85rem;
  border: 1px solid var(--border-color);
}
.drilldown-col {
  background: var(--bg-hover);
  padding: 0.6rem;
  border-radius: var(--radius-xs);
}
.block {
  display: block;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
}
.btn-close:hover {
  color: var(--primary);
}

.loader {
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.grid-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

/* Preview mode */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
.preview-card {
  padding: 1.25rem;
}
.preview-unit-badge {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--primary-dark);
  background: var(--primary-light);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
}
.chip-preview {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--bg-hover);
  color: var(--text-muted);
}
</style>
