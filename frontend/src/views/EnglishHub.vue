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

    <!-- LEVEL 2: CURRICULUM PREVIEW / UNIT DETAIL -->
    <div v-else-if="previewMode" class="fade-in">
      <!-- Back button -->
      <button @click="selectedPreviewUnit ? backToPreview() : (previewMode = false)" class="btn-secondary btn-sm mb-3">
        ← {{ selectedPreviewUnit ? 'Back to Units' : 'Back to Textbooks' }}
      </button>

      <!-- Unit Grid (when no unit is selected) -->
      <div v-if="!selectedPreviewUnit">
        <h3 class="text-lg font-bold mb-3">📘 MORE! 1 — Curriculum Overview</h3>
        <p class="text-xs text-secondary mb-3">Click any unit to see all Grammar, Vocabulary, Reading & Listening exercises</p>
        <div class="preview-grid">
          <div v-for="u in MORE1_UNITS" :key="u.unit" class="preview-card card card-lift" @click="selectUnit(u.unit)">
            <span class="preview-unit-badge">Unit {{ u.unit }}</span>
            <h4 class="text-base font-bold mt-2">{{ u.title }}</h4>
            <p class="text-xs text-secondary mt-1">{{ u.theme }}</p>
            <div class="flex flex-wrap gap-1 mt-3">
              <span class="chip-preview">🔤 Grammar</span>
              <span class="chip-preview">📚 Vocabulary ({{ vocabWordCount(u.unit) }} words)</span>
              <span class="chip-preview">📖 Reading ({{ getReadingForUnit(u.unit).length }} stories)</span>
              <span class="chip-preview">🎧 Listening ({{ getListeningForUnit(u.unit).length }} tracks)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Unit Detail View (when a unit is selected) -->
      <div v-else class="unit-detail fade-in">
        <h3 class="text-lg font-bold mb-1">Unit {{ selectedPreviewUnit }}: {{ getSelectedUnitTitle() }}</h3>
        <p class="text-xs text-secondary mb-4">Click any exercise to try it — you'll see what your students see!</p>

        <!-- Grammar Section -->
        <div class="detail-section card mb-4">
          <h4 class="font-bold text-sm mb-3 flex items-center gap-2"><span>🏆</span> Grammar</h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="level in ['explorer', 'pioneer', 'master']"
              :key="level"
              class="btn-exercise"
              @click="router.push(`/grammar-academy/${UNIT_GRAMMAR_IDS[selectedPreviewUnit]}/${level}`)"
            >🧭 {{ level === 'explorer' ? 'Explorer' : level === 'pioneer' ? 'Pioneer' : 'Master' }}</button>
            <button
              class="btn-exercise btn-exercise-accent"
              @click="router.push(`/grammar-academy/${UNIT_GRAMMAR_IDS[selectedPreviewUnit]}`)"
            >🧠 Quiz Mode</button>
          </div>
        </div>

        <!-- Vocabulary Section -->
        <div class="detail-section card mb-4">
          <h4 class="font-bold text-sm mb-3 flex items-center gap-2"><span>📚</span> Vocabulary</h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tier in [{k:'starter',l:'🌱 Starter'},{k:'practice',l:'🔥 Practice'},{k:'challenge',l:'⚡ Challenge'}]"
              :key="tier.k"
              class="btn-exercise"
              @click="router.push(`/vocabulary/more1/${selectedPreviewUnit}`)"
            >{{ tier.l }}</button>
          </div>
        </div>

        <!-- Reading Section -->
        <div class="detail-section card mb-4">
          <h4 class="font-bold text-sm mb-3 flex items-center gap-2"><span>📖</span> Reading ({{ getReadingForUnit(selectedPreviewUnit).length }} stories)</h4>
          <div class="flex flex-col gap-2">
            <div v-for="tierName in ['Starter', 'Practice', 'Challenge', 'Master']" :key="'r'+tierName">
              <span class="text-xs font-bold text-secondary">{{ tierName }}:</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <button
                  v-for="story in getReadingForUnit(selectedPreviewUnit).filter((s:any) => s.tier === tierName)"
                  :key="story.id || story.title"
                  class="btn-exercise btn-sm text-xs"
                  @click="router.push(`/student/reading/more1/${selectedPreviewUnit}/${story.id}`)"
                >📄 {{ story.title?.slice(0, 22) }}{{ story.title?.length > 22 ? '…' : '' }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Listening Section -->
        <div class="detail-section card mb-4">
          <h4 class="font-bold text-sm mb-3 flex items-center gap-2"><span>🎧</span> Listening ({{ getListeningForUnit(selectedPreviewUnit).length }} tracks)</h4>
          <div class="flex flex-col gap-2">
            <div v-for="tierName in ['Starter', 'Practice', 'Challenge', 'Master']" :key="'l'+tierName">
              <span class="text-xs font-bold text-secondary">{{ tierName }}:</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <button
                  v-for="task in getListeningForUnit(selectedPreviewUnit).filter((t:any) => t.tier === tierName)"
                  :key="task.id"
                  class="btn-exercise btn-sm text-xs"
                  @click="router.push(`/student/listening/more1/${selectedPreviewUnit}/${task.id}`)"
                >🎵 {{ task.title?.slice(0, 22) }}{{ task.title?.length > 22 ? '…' : '' }}</button>
              </div>
            </div>
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
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/ui'
import { api } from '../services/api'
import { MORE1_VOCABULARY } from '../data/vocabularyData'
import { MORE1_READING_DATA } from '../data/readingData'
import { MORE1_READING_OPTIONS_BC } from '../data/readingDataSupplement'
import { MORE1_LISTENING_DATA } from '../data/listeningData'

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
const router = useRouter()

const classes = ref<any[]>([])
const selectedClassId = ref('')
const loadingMatrix = ref(false)
const matrixData = ref<any[]>([])
const previewMode = ref(false)
const selectedPreviewUnit = ref<number | null>(null)
const activeStudent = ref<any>(null)

// Grammar topic ID mapping per unit
const UNIT_GRAMMAR_IDS: Record<number, string> = {
  1: 'grammar-1-plurals', 2: 'grammar-2-tobe', 3: 'grammar-3-havegot',
  4: 'grammar-4-questionsnegativeswithtobe', 5: 'grammar-5-cancantpossessives',
  6: 'grammar-6-presentsimpleaffirmative', 7: 'grammar-7-presentsimplenegativesarticles',
  8: 'grammar-8-presentsimplequestions', 9: 'grammar-9-questionwordsobjectpronouns',
  10: 'grammar-10-demonstrativesprices', 11: 'grammar-11-presentcontinuous',
  12: 'grammar-12-pastsimpleoftobe', 13: 'grammar-13-pastsimpleregularverbs',
  14: 'grammar-14-pastsimplenegativesirregularverbs', 15: 'grammar-15-futureplansbegoingto'
}

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
      // Don't auto-select — let the teacher choose to preview curriculum or pick a class
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
    console.error('Failed to load class matrix:', e.message)
    matrixData.value = []
  } finally {
    loadingMatrix.value = false
  }
}

function showPreview() {
  previewMode.value = true
  selectedPreviewUnit.value = null
}

function selectUnit(unit: number) {
  selectedPreviewUnit.value = unit
}

function backToPreview() {
  selectedPreviewUnit.value = null
}

// Get reading stories for a unit (Option A + supplement B/C)
function getReadingForUnit(unit: number) {
  const u = MORE1_READING_DATA.find((r: any) => r.unit === unit)
  const sup = MORE1_READING_OPTIONS_BC.find((r: any) => r.unit === unit)
  return [...(u?.stories || []), ...(sup?.stories || [])]
}

// Get listening tasks for a unit
function getListeningForUnit(unit: number) {
  const u = MORE1_LISTENING_DATA.find((l: any) => l.unit === unit)
  return u?.tasks || []
}

function getSelectedUnitTitle() {
  const u = MORE1_UNITS.find((u) => u.unit === selectedPreviewUnit.value)
  return u?.title || ''
}

function vocabWordCount(unit: number) {
  const vu = MORE1_VOCABULARY.find(u => u.unit === unit)
  if (!vu) return 0
  return vu.categories.reduce((sum: number, c) => sum + c.words.length, 0) + (vu.phrases?.length || 0)
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
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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

/* Unit Detail */
.detail-section { padding: 1.25rem; }
.btn-exercise {
  padding: 0.4rem 0.9rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-exercise:hover {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary-dark);
}
.btn-exercise-accent {
  border-color: rgba(245,158,11,0.4);
  background: rgba(245,158,11,0.06);
}
.btn-exercise-accent:hover {
  border-color: #f59e0b;
  background: rgba(245,158,11,0.12);
}
</style>
