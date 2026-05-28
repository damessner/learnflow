<template>
  <div class="page">
    <!-- Header -->
    <div class="bank-header">
      <div class="bank-title-wrapper">
        <h1 class="bank-title">🏛️ LearnFlowBank</h1>
        <p class="bank-subtitle">Discover, preview, and clone premium interactive worksheets created by teachers worldwide.</p>
      </div>
      <router-link to="/teacher" class="btn btn-secondary">
        ← Dashboard
      </router-link>
    </div>

    <!-- Search & Filter Controls -->
    <div class="filter-card">
      <div class="search-row">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search worksheets by title, keywords, topic..."
            class="search-input"
            @input="debouncedFetch"
          />
          <button v-if="filters.search" class="clear-search-btn" @click="clearSearch">✕</button>
        </div>

        <div class="sort-wrapper">
          <label class="filter-label">Sort by:</label>
          <select v-model="filters.sort" class="sort-select" @change="fetchWorksheets">
            <option value="newest">Newest First</option>
            <option value="popular">Highest Points</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      <!-- Subject Horizontal Scroll Tags -->
      <div class="filter-section">
        <div class="flex items-center justify-between">
          <label class="filter-label">Subject:</label>
          <button v-if="filters.subject" class="clear-link" @click="selectSubject('')">Clear subject</button>
        </div>
        <div class="tags-container">
          <button
            :class="['tag-pill', { active: !filters.subject }]"
            @click="selectSubject('')"
          >
            All Subjects
          </button>
          <button
            v-for="sub in SUBJECTS"
            :key="sub"
            :class="['tag-pill', { active: filters.subject === sub }]"
            @click="selectSubject(sub)"
          >
            {{ getSubjectEmoji(sub) }} {{ sub }}
          </button>
        </div>
      </div>

      <!-- Grade Filter Button Group -->
      <div class="filter-section" style="margin-top: 1rem;">
        <div class="flex items-center justify-between">
          <label class="filter-label">Grade / Class Level:</label>
          <button v-if="filters.grade_level" class="clear-link" @click="selectGrade('')">Clear grade</button>
        </div>
        <div class="grade-group">
          <button
            :class="['grade-btn', { active: !filters.grade_level }]"
            @click="selectGrade('')"
          >
            All Grades
          </button>
          <button
            v-for="g in GRADE_LEVELS"
            :key="g"
            :class="['grade-btn', { active: filters.grade_level === g }]"
            @click="selectGrade(g)"
          >
            {{ GRADE_LABELS[g] || `Klasse ${g}` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading premium worksheets...</p>
    </div>

    <template v-else>
      <!-- Empty State -->
      <div v-if="worksheets.length === 0" class="empty-state">
        <div class="empty-state-icon">🏛️</div>
        <div class="empty-state-title">No worksheets found</div>
        <div class="empty-state-text">We couldn't find any public worksheets matching your search query or filters. Try adjusting them!</div>
        <button class="btn btn-primary" style="margin-top: 1rem;" @click="resetFilters">Reset Filters</button>
      </div>

      <!-- Worksheets Grid -->
      <div v-else class="worksheets-grid">
        <div
          v-for="ws in worksheets"
          :key="ws.id"
          class="ws-card"
        >
          <!-- Card Header & Badge -->
          <div class="ws-card-header">
            <span :class="['subject-badge', getSubjectClass(ws.subject)]">
              {{ getSubjectEmoji(ws.subject) }} {{ ws.subject }}
            </span>
            <span class="grade-badge">{{ GRADE_LABELS[ws.grade_level] || `Klasse ${ws.grade_level}` }}</span>
          </div>

          <!-- Card Content -->
          <div class="ws-card-body">
            <h3 class="ws-title">{{ ws.title }}</h3>
            <p class="ws-desc">{{ ws.description || 'Interactive learning resource covering concepts and exercises.' }}</p>
          </div>

          <!-- Stats Row -->
          <div class="ws-stats">
            <div class="stat-item" title="Interactive tasks count">
              <span class="stat-icon">📝</span>
              <span class="stat-value">{{ getWorksheetStats(ws).taskCount }} Tasks</span>
            </div>
            <div class="stat-item" title="Estimated pupil work time">
              <span class="stat-icon">⏱️</span>
              <span class="stat-value">{{ getWorksheetStats(ws).timeFormatted }}</span>
            </div>
            <div class="stat-item" title="Total score value">
              <span class="stat-icon">🏆</span>
              <span class="stat-value">{{ ws.total_points }} pts</span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="ws-actions">
            <button
              class="btn btn-secondary flex-1"
              @click="previewWorksheet(ws.id)"
            >
              👁️ Preview
            </button>
            <button
              class="btn btn-primary flex-1"
              :disabled="cloningId === ws.id"
              @click="cloneWorksheet(ws)"
            >
              {{ cloningId === ws.id ? 'Cloning...' : '📥 Clone' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorksheetsStore } from '../stores/worksheets'
import { useUiStore } from '../stores/ui'

const SUBJECTS = [
  'Mathematics',
  'German',
  'English',
  'Science',
  'History',
  'Geography',
  'Art',
  'Music',
  'Physical Education',
]

const GRADE_LABELS: Record<string, string> = {
  '1': '1. Klasse (5. Schulstufe)',
  '2': '2. Klasse (6. Schulstufe)',
  '3': '3. Klasse (7. Schulstufe)',
  '4': '4. Klasse (8. Schulstufe)',
  '5': '1. Klasse (5. Schulstufe)',
  '6': '2. Klasse (6. Schulstufe)',
  '7': '3. Klasse (7. Schulstufe)',
  '8': '4. Klasse (8. Schulstufe)',
}

const GRADE_LEVELS = ['1', '2', '3', '4']

const router = useRouter()
const store = useWorksheetsStore()
const uiStore = useUiStore()

const worksheets = ref([])
const loading = ref(false)
const cloningId = ref<string | null>(null)

const filters = reactive({
  search: '',
  subject: '',
  grade_level: '',
  sort: 'newest',
})

// Debounce timer
let debounceTimer: number | null = null

function debouncedFetch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    fetchWorksheets()
  }, 300)
}

async function fetchWorksheets() {
  loading.value = true
  try {
    worksheets.value = await store.fetchLibraryWorksheets({
      search: filters.search,
      subject: filters.subject,
      grade_level: filters.grade_level,
      sort: filters.sort,
    })
  } catch (err: any) {
    uiStore.showToast(err.message || 'Failed to load worksheets from the library', 'error')
  } finally {
    loading.value = false
  }
}

function selectSubject(sub: string) {
  filters.subject = sub
  fetchWorksheets()
}

function selectGrade(grade: string) {
  filters.grade_level = grade
  fetchWorksheets()
}

function clearSearch() {
  filters.search = ''
  fetchWorksheets()
}

function resetFilters() {
  filters.search = ''
  filters.subject = ''
  filters.grade_level = ''
  filters.sort = 'newest'
  fetchWorksheets()
}

function previewWorksheet(id: string) {
  router.push(`/teacher/preview/${id}?from=bank`)
}

async function cloneWorksheet(ws: any) {
  cloningId.value = ws.id
  try {
    const cloned = await store.cloneLibraryWorksheet(ws.id)
    uiStore.showToast(`"${ws.title}" cloned to your worksheets!`, 'success')
    router.push(`/teacher/builder/${cloned.id}`)
  } catch (err: any) {
    uiStore.showToast(err.message || 'Failed to clone worksheet', 'error')
  } finally {
    cloningId.value = null
  }
}

// Helpers for subject styling/metadata
function getSubjectEmoji(subject: string): string {
  switch (subject) {
    case 'Mathematics': return '🧮'
    case 'German': return '🇩🇪'
    case 'English': return '🇬🇧'
    case 'Science': return '🧪'
    case 'History': return '⏳'
    case 'Geography': return '🗺️'
    case 'Art': return '🎨'
    case 'Music': return '🎵'
    case 'Physical Education': return '🏃'
    default: return '📝'
  }
}

function getSubjectClass(subject: string): string {
  switch (subject) {
    case 'Mathematics': return 'sub-math'
    case 'German': return 'sub-german'
    case 'English': return 'sub-english'
    case 'Science': return 'sub-science'
    case 'History': return 'sub-history'
    case 'Geography': return 'sub-geography'
    default: return 'sub-default'
  }
}

// Extract stats dynamically from content JSON
function getWorksheetStats(ws: any) {
  try {
    const content = JSON.parse(ws.content)
    const blocks = content.blocks || []
    
    // Count scored tasks
    const exerciseTypes = new Set([
      'gap_fill', 'multiple_choice', 'single_choice', 'matching', 'word_scramble',
      'short_answer', 'true_false', 'ordering', 'vocabulary', 'semantic_sorter',
      'flashcards', 'drag_words', 'correct_words', 'question_table', 'crossword',
      'audio_match', 'dictation', 'word_search', 'sentence_builder', 'odd_one_out',
      'number_line', 'equation_entry', 'fraction_input', 'arithmetic_grid',
      'graph_plot', 'geometry_shape', 'word_problem', 'percentage', 'unit_conversion', 'angle'
    ])
    const taskCount = blocks.filter((b: any) => exerciseTypes.has(b.type)).length
    
    // Estimate work time
    const profile = content.pupil_profile || 'default'
    const grade = Number(ws.grade_level) || 4
    let totalSeconds = 0
    blocks.forEach((block: any) => {
      if (block.type === 'text' || block.type === 'read_aloud') {
        const words = (block.text || '').split(/\s+/).length
        totalSeconds += words * 1.2
      } else if (block.type === 'info_box') {
        const words = (block.text || '').split(/\s+/).length
        totalSeconds += words * 1.2
        if (block.mermaid) totalSeconds += 45
      } else if (block.type === 'video' || block.type === 'youtube') {
        totalSeconds += 180
      } else if (block.type === 'audio') {
        totalSeconds += 120
      } else if (block.type === 'drawing') {
        totalSeconds += 120
      } else if (block.type === 'gap_fill' || block.type === 'drag_words' || block.type === 'correct_words') {
        const gaps = ((block.template || '').match(/\(\(.*?\)\)/g) || []).length
        totalSeconds += gaps * 15 + 10
      } else if (block.type === 'question_table') {
        totalSeconds += (block.rows || []).length * 15 + 10
      } else if (block.type === 'crossword' || block.type === 'word_search') {
        totalSeconds += (block.words || []).length * 40
      } else {
        totalSeconds += 45
      }
    })
    const speedMultiplier = ({ default: 1.0, slow: 1.5, fast: 0.7 } as any)[profile] || 1.0
    const gradeMultiplier = grade <= 3 ? 1.3 : grade <= 6 ? 1.0 : 0.85
    const finalSeconds = Math.round(totalSeconds * speedMultiplier * gradeMultiplier)
    const minutes = Math.floor(finalSeconds / 60)
    const seconds = finalSeconds % 60
    const timeFormatted = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
    
    return { taskCount, timeFormatted }
  } catch {
    return { taskCount: 0, timeFormatted: '5m' }
  }
}

onMounted(() => {
  fetchWorksheets()
})
</script>

<style scoped>
.bank-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.bank-title-wrapper {
  flex: 1;
}

.bank-title {
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, var(--primary) 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bank-subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
  margin: 0;
}

.filter-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.1);
}

.search-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 1.1rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
}

.sort-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  padding: 0.75rem 1.5rem 0.75rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: white;
  font-size: 0.95rem;
  outline: none;
  cursor: pointer;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-main);
  margin: 0;
}

.clear-link {
  border: none;
  background: none;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.clear-link:hover {
  text-decoration: underline;
}

.tags-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.tag-pill {
  white-space: nowrap;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-pill:hover {
  border-color: var(--primary-soft);
  color: var(--primary);
}

.tag-pill.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.grade-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.grade-btn {
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.grade-btn:hover {
  border-color: var(--primary-soft);
  color: var(--primary);
}

.grade-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(79, 70, 229, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.worksheets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.ws-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.ws-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(148, 163, 184, 0.12);
  border-color: var(--primary-soft);
}

.ws-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.subject-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  color: white;
}

.grade-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  background: rgba(107, 114, 128, 0.08);
  color: var(--text-muted);
}

/* Custom subject gradient background */
.sub-math { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
.sub-german { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
.sub-english { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
.sub-science { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); }
.sub-history { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.sub-geography { background: linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%); }
.sub-default { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); }

.ws-card-body {
  flex: 1;
  margin-bottom: 1.25rem;
}

.ws-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.ws-desc {
  color: var(--text-muted);
  font-size: 0.88rem;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.ws-stats {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem 0;
  margin-bottom: 1.25rem;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-icon {
  font-size: 0.95rem;
}

.stat-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.ws-actions {
  display: flex;
  gap: 0.5rem;
}

.flex-1 {
  flex: 1;
}
</style>
