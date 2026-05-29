<template>
  <div class="page student-dashboard">
    <!-- Top Welcome Header -->
    <div class="dashboard-header flex justify-between items-center mb-4">
      <div>
        <h2 class="text-2xl font-bold">Student Hub</h2>
        <p class="text-secondary text-sm">
          Welcome back, <strong>{{ authStore.user?.name || 'Student' }}</strong>!
        </p>
      </div>

      <!-- Glowing Emoji Bubble & Sound Toggle -->
      <div class="header-widgets flex items-center gap-3">
        <div @click="openEmojiModal" class="avatar-widget flex items-center gap-2 cursor-pointer">
          <span class="streak-aura" :class="streakLevel > 0 ? `streak-level-${streakLevel}` : ''">
            {{ authStore.user?.character_emoji || '👤' }}
          </span>
          <span class="avatar-label">Avatar</span>
        </div>
        <div class="divider-y"></div>
        <button @click="toggleMute" class="btn-mute" :title="soundMuted ? 'Sound einschalten' : 'Sound stummschalten'">
          {{ soundMuted ? '🔇' : '🔊' }}
        </button>
      </div>
    </div>

    <!-- MAIN VIEW: CLASS LIST -->
    <div v-if="!selectedClass" class="fade-in">
      <!-- Join Class Form -->
      <div class="card join-card mb-4 flex items-center gap-3">
        <span class="text-lg">🏫</span>
        <input v-model="classCode" placeholder="Enter Class Code (e.g. abcd-efgh)..." class="flex-1 input-field" />
        <button class="btn-primary" :disabled="joining" @click="joinClass">
          {{ joining ? 'Joining...' : 'Join Class' }}
        </button>
      </div>

      <!-- Section Title -->
      <h3 class="text-lg font-bold mb-3">My Classes</h3>

      <!-- Empty State -->
      <div v-if="myClasses.length === 0" class="card text-center py-6 text-secondary">
        <span class="text-4xl">🏫</span>
        <p class="text-lg font-bold mt-2">You aren't in any classes yet.</p>
        <p class="text-sm">Ask your teacher for the class code to get started!</p>
      </div>

      <!-- Class Cards Grid -->
      <div v-else class="classes-grid">
        <div
          v-for="c in myClasses"
          :key="c.id"
          class="class-block card card-lift"
          @click="selectClass(c)"
        >
          <div class="class-block-icon">🏫</div>
          <div class="class-block-content">
            <h4 class="text-lg font-bold">{{ c.name }}</h4>
            <p class="text-sm text-secondary">{{ c.description || 'No description' }}</p>
          </div>
          <span class="btn-arrow">➔</span>
        </div>
      </div>
    </div>

    <!-- DETAIL VIEW: INSIDE A CLASS -->
    <div v-else class="fade-in">
      <!-- Back Button -->
      <button v-if="!isStandalone()" @click="backToClassList" class="btn-back mb-3">
        ← Back to Classes
      </button>

      <div class="class-header-card card mb-4 flex justify-between items-start">
        <div>
          <span class="badge badge-primary mb-1">Classroom</span>
          <h2 class="text-xl font-bold">{{ selectedClass.name }}</h2>
          <p class="text-sm text-secondary">{{ selectedClass.description || 'Subject learning space' }}</p>
        </div>
        <span class="class-avatar-large">🏫</span>
      </div>

      <!-- TEXTBOOK BLOCK (MORE! English Hub) -->
      <div v-if="textbookGrade" class="textbook-card card mb-4">
        <div class="textbook-card-header flex justify-between items-center cursor-pointer" @click="toggleTextbook">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🇬🇧</span>
            <div>
              <h3 class="text-lg font-bold text-primary-dark">MORE! {{ textbookGrade }} English Hub</h3>
              <p class="text-sm text-secondary">Syllabus Grammar, Vocabulary & Writing Exercises</p>
            </div>
          </div>
          <button class="btn-textbook-toggle">
            {{ textbookOpen ? 'Collapse ▲' : 'Open English Hub ▼' }}
          </button>
        </div>

        <!-- Expanded Textbook Academy Exercises -->
        <div v-if="textbookOpen" class="textbook-exercises-panel fade-in mt-3 pt-3 border-top">
          <!-- Exercise Menu -->
          <div class="detail-tabs flex gap-2 mb-3">
            <button class="tab-btn" :class="{ active: textbookTab === 'grammar' }" @click="textbookTab = 'grammar'">🏆 Grammar</button>
            <button class="tab-btn" :class="{ active: textbookTab === 'vocab' }" @click="textbookTab = 'vocab'">📚 Vocabulary</button>
            <button class="tab-btn" :class="{ active: textbookTab === 'writing' }" @click="textbookTab = 'writing'">✍️ Writing Coach</button>
            <button class="tab-btn" :class="{ active: textbookTab === 'reading' }" @click="textbookTab = 'reading'">📖 Reading</button>
            <button class="tab-btn" :class="{ active: textbookTab === 'listening' }" @click="textbookTab = 'listening'">🎧 Listening</button>
          </div>

          <!-- Grammar Section -->
          <div v-if="textbookTab === 'grammar'" class="fade-in">
            <div class="card flex justify-between items-center bg-hover">
              <div>
                <h4 class="font-bold">Grammar Academy</h4>
                <p class="text-sm text-secondary">Practice 15 curriculum units with Explorer, Pioneer, and Master levels!</p>
              </div>
              <button class="btn-primary" @click="router.push('/grammar-academy')">
                Enter Grammar Academy 🏆
              </button>
            </div>
          </div>

          <!-- Vocabulary Section -->
          <div v-if="textbookTab === 'vocab'" class="fade-in">
            <p class="text-sm text-secondary mb-3">Select a unit to practice vocabulary matching, gaps, spelling, and take the final quiz:</p>
            <div class="vocab-units-grid">
              <button
                v-for="u in 15"
                :key="u"
                class="vocab-unit-btn"
                @click="router.push(`/vocabulary/more${textbookGrade}/${u}`)"
              >
                <span class="vocab-unit-num">Unit {{ u }}</span>
                <span class="vocab-unit-icon">🔤</span>
              </button>
            </div>
          </div>

          <!-- Writing Section -->
          <div v-if="textbookTab === 'writing'" class="fade-in">
            <p class="text-sm text-secondary mb-3">Select a writing topic below to train with our AI Writing Coach:</p>
            <div class="writing-tasks-grid">
              <div
                v-for="task in enWritingTasks"
                :key="task.id"
                class="writing-task-card card card-lift"
              >
                <h4 class="font-bold text-sm">{{ task.title }}</h4>
                <p class="text-xs text-secondary mt-1 line-clamp-2">{{ task.description }}</p>
                <button class="btn-primary btn-sm w-full mt-3 justify-center" @click="router.push(`/writing-coach?taskId=${task.id}`)">
                   Start Writing ✍️
                </button>
              </div>
            </div>
          </div>

          <!-- Reading Section (with Options A/B/C per tier) -->
          <div v-if="textbookTab === 'reading'" class="fade-in">
            <p class="text-sm text-secondary mb-3">📖 Wähle eine Schwierigkeitsstufe und ein Abenteuer — jedes Level hat 3 verschiedene Geschichten (A, B, C):</p>
            <div class="reading-units-list flex flex-col gap-3">
              <div v-for="u in mergedReadingData" :key="u.unit" class="card bg-hover p-3">
                <div class="flex justify-between items-center cursor-pointer" @click="toggleReadingUnit(u.unit)">
                  <div>
                    <h4 class="font-bold text-sm">Unit {{ u.unit }}: {{ u.title }}</h4>
                    <p class="text-xs text-secondary">{{ u.theme }}</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary">
                      {{ getCompletedStoriesCountForUnit(u.unit) }} / {{ u.stories.length }} Completed
                    </span>
                    <span class="text-sm font-bold text-secondary">{{ activeReadingUnit === u.unit ? '▲' : '▼' }}</span>
                  </div>
                </div>
                
                <!-- Expanded: grouped by tier with A/B/C options -->
                <div v-if="activeReadingUnit === u.unit" class="mt-3 pt-3 border-top fade-in flex flex-col gap-4">
                  <div v-for="tierName in ['Starter', 'Practice', 'Challenge', 'Master']" :key="tierName" class="tier-group">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="badge badge-sm font-bold" :class="getTierBadgeClass(tierName)">{{ tierName }}</span>
                      <span class="text-xs text-secondary">{{ getTierDescription(tierName) }}</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <div v-for="(story, si) in getStoriesForTier(u, tierName)" :key="story.id" class="story-option-card card p-2 flex-1 min-w-[140px]" :class="{ 'border-primary': si === 0 }">
                        <div class="flex flex-col items-center text-center gap-1">
                          <span class="option-label">{{ ['A', 'B', 'C'][si] || '?' }}</span>
                          <h6 class="font-bold text-xs leading-tight">{{ story.title }}</h6>
                          <span class="text-[10px] text-success font-bold" v-if="getStoryProgress(story.id)">
                            ✅ {{ getStoryProgress(story.id).score }}/{{ story.questions.length }}
                          </span>
                          <span class="text-[10px] text-secondary" v-else>⏳ Neu</span>
                          <button class="btn-primary btn-xs w-full mt-1" @click.stop="router.push(`/student/reading/more1/${u.unit}/${story.id}`)">
                            {{ getStoryProgress(story.id) ? 'Review 🔄' : 'Lesen 📖' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Listening Section -->
          <div v-if="textbookTab === 'listening'" class="fade-in">
            <p class="text-sm text-secondary mb-3">Improve your listening skills by practicing with these tracks and quizzes:</p>
            <div class="listening-units-list flex flex-col gap-3">
              <div v-for="u in MORE1_LISTENING_DATA" :key="u.unit" class="card bg-hover p-3">
                <div class="flex justify-between items-center cursor-pointer" @click="toggleListeningUnit(u.unit)">
                  <div>
                    <h4 class="font-bold text-sm">Unit {{ u.unit }}: {{ u.title }}</h4>
                    <p class="text-xs text-secondary">{{ u.theme }}</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary">
                      {{ getCompletedListeningCountForUnit(u.unit) }} / 4 Completed
                    </span>
                    <span class="text-sm font-bold text-secondary">{{ activeListeningUnit === u.unit ? '▲' : '▼' }}</span>
                  </div>
                </div>
                
                <!-- Expanded tracks list -->
                <div v-if="activeListeningUnit === u.unit" class="grid grid-cols-2 gap-3 mt-3 pt-3 border-top fade-in">
                  <div v-for="task in u.tasks" :key="task.id" class="card bg-card p-3 flex justify-between items-center">
                    <div>
                      <span class="badge badge-sm mb-1" :class="getTierBadgeClass(task.tier)">{{ task.tier }}</span>
                      <h5 class="font-bold text-xs">{{ task.title }}</h5>
                      <span class="text-[10px] text-success font-bold block mt-1" v-if="getListeningProgress(task.id)">
                        Grade: {{ getListeningProgress(task.id).score }} / {{ task.questions.length }}
                      </span>
                      <span class="text-[10px] text-secondary block mt-1" v-else>Not started</span>
                    </div>
                    <button class="btn-primary btn-sm" @click="router.push(`/student/listening/more1/${u.unit}/${task.id}`)">
                      {{ getListeningProgress(task.id) ? 'Review 🔄' : 'Listen 🎧' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WORKSHEETS SECTION -->
      <div v-if="!isStandalone()">
        <h3 class="text-lg font-bold mb-3">Homework & Worksheets</h3>
        <div v-if="loadingAssignments" class="text-center py-4 text-secondary">
          Loading worksheets...
        </div>
        <div v-else-if="classAssignments.length === 0" class="card text-center py-4 text-secondary">
          🎉 No worksheets assigned for this class yet.
        </div>
        <div v-else class="worksheets-grid">
          <div
            v-for="a in classAssignments"
            :key="a.assignment_id"
            class="worksheet-card card"
            :class="{ 'completed-gray': a.submitted }"
          >
            <div class="flex justify-between items-start">
              <div>
                <span class="badge" :class="a.submitted ? 'badge-success' : 'badge-primary'">
                  {{ a.submitted ? '✓ Completed' : 'Unfinished' }}
                </span>
                <h4 class="text-base font-bold mt-2">{{ a.worksheet_title }}</h4>
                <p class="text-xs text-secondary mt-1">{{ a.worksheet_description || 'No description' }}</p>
              </div>
              <span class="text-2xl">{{ a.submitted ? '📁' : '📄' }}</span>
            </div>

            <div class="worksheet-footer flex justify-between items-center mt-3 pt-2 border-top">
              <span class="text-xs text-secondary">
                {{ a.due_date ? 'Due: ' + new Date(a.due_date).toLocaleDateString() : 'No due date' }}
              </span>
              <div class="flex items-center gap-2">
                <span v-if="a.submitted" class="score-badge">
                  Score: {{ a.score }}/{{ a.max_score }}
                </span>
                <router-link
                  :to="`/student/assignment/${a.assignment_id}`"
                  class="btn-sm btn-primary"
                >
                  {{ a.submitted ? 'Review' : 'Start ➔' }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- EMOJI SELECTION MODAL -->
    <div v-if="emojiModalOpen" class="modal-overlay" @click.self="emojiModalOpen = false">
      <div class="modal avatar-modal">
        <h3 class="font-bold mb-2">Choose Avatar Emoji</h3>
        <p class="text-secondary text-sm mb-3">Select an emoji to represent you in class!</p>
        <div class="emoji-grid">
          <button
            v-for="em in emojiList"
            :key="em"
            @click="selectEmoji(em)"
            class="emoji-btn"
          >
            {{ em }}
          </button>
        </div>
        <button @click="emojiModalOpen = false" class="btn-secondary w-full mt-3">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import { useClassesStore } from '../stores/classes'
import { useLearningStore } from '../stores/learning'
import { api } from '../services/api'
import { CURRICULUM_TASKS } from '../data/writingTasks'
import { MORE1_READING_DATA, normalizeStory, type ReadingUnit, type ReadingStory } from '../data/readingData'
import { MORE1_LISTENING_DATA } from '../data/listeningData'
import { MORE1_READING_OPTIONS_BC } from '../data/readingDataSupplement'
import { isStandalone } from '../utils/standalone'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()
const classesStore = useClassesStore()
const learningStore = useLearningStore()

// State
const myClasses = ref<any[]>([])
const classCode = ref('')
const joining = ref(false)
const selectedClass = ref<any>(null)
const classAssignments = ref<any[]>([])
const loadingAssignments = ref(false)

const textbookOpen = ref(false)
const textbookTab = ref('grammar')

const activeReadingUnit = ref<number | null>(null)
const readingProgressList = ref<any[]>([])

// Merge original stories (Option A) with supplement stories (Options B & C)
const mergedReadingData = computed(() => {
  return MORE1_READING_DATA.map((unit: ReadingUnit) => {
    const supplement = MORE1_READING_OPTIONS_BC.find((u: ReadingUnit) => u.unit === unit.unit)
    const allStories = [...unit.stories.map((s, i) => normalizeStory(s as ReadingStory, unit.unit, i))]
    if (supplement) allStories.push(...supplement.stories)
    return { ...unit, stories: allStories }
  })
})

function toggleReadingUnit(unit: number) {
  activeReadingUnit.value = activeReadingUnit.value === unit ? null : unit
}

function getStoriesForTier(unit: ReadingUnit, tierName: string) {
  return unit.stories.filter((s) => s.tier === tierName)
}

function getTierDescription(tier: string) {
  const desc: Record<string, string> = {
    Starter: 'Einfache Sätze, Grundwortschatz',
    Practice: 'Mittelschwere Texte, neuer Wortschatz',
    Challenge: 'Längere Texte, komplexere Sätze',
    Master: 'Anspruchsvolle Texte, volle Kompetenz'
  }
  return desc[tier] || ''
}

function getStoryProgress(storyId: string) {
  return readingProgressList.value.find(p => p.story_id === storyId && p.completed)
}

function getCompletedStoriesCountForUnit(unit: number) {
  const merged = mergedReadingData.value.find((u: ReadingUnit) => u.unit === unit)
  return readingProgressList.value.filter((p: any) => p.unit === unit && p.completed).length
}

function getTierBadgeClass(tier: string) {
  if (tier === 'Starter') return 'badge-success'
  if (tier === 'Practice') return 'badge-info'
  if (tier === 'Challenge') return 'badge-warning'
  return 'badge-danger'
}

const activeListeningUnit = ref<number | null>(null)
const listeningProgressList = ref<any[]>([])

function toggleListeningUnit(unit: number) {
  activeListeningUnit.value = activeListeningUnit.value === unit ? null : unit
}

function getListeningProgress(listeningId: string) {
  return listeningProgressList.value.find(p => p.listening_id === listeningId && p.completed)
}

function getCompletedListeningCountForUnit(unit: number) {
  return listeningProgressList.value.filter(p => p.unit === unit && p.completed).length
}

// Avatar selector states
const emojiModalOpen = ref(false)
const gamification = ref<any>(null)
const soundMuted = ref(localStorage.getItem('learnflow_sound_muted') === 'true')

const emojiList = [
  '🚀', '🤖', '🦁', '🦄', '⚡', '🍕', '🎯', '🐱', '🐶', '🦊',
  '🐼', '🐨', '🦖', '🐉', '👾', '👑', '🌈', '🧙', '🥷', '👽',
  '🧠', '🧪', '🎨', '🎸'
]

// Textbook Grade detection
const textbookGrade = computed(() => {
  if (!selectedClass.value) return null
  const match = (selectedClass.value.name || '').match(/^(\d)/)
  return match ? parseInt(match[1]) : 1
})

const enWritingTasks = computed(() => {
  if (!textbookGrade.value) return []
  return CURRICULUM_TASKS.filter(
    t => t.grade === textbookGrade.value && t.subject === 'en'
  )
})

// Gamification calculations
const streakLevel = computed(() => {
  const streak = gamification.value?.streak_days || 0
  if (streak >= 7) return 3
  if (streak >= 3) return 2
  if (streak >= 1) return 1
  return 0
})

onMounted(async () => {
  if (isStandalone()) {
    selectedClass.value = { id: 'standalone-class', name: '1B MORE! 1 English Academy', description: 'Standalone English Hub' }
    textbookOpen.value = true
    textbookTab.value = 'grammar'
    try {
      const readRes = await api.get('/english/reading/my-progress')
      readingProgressList.value = readRes.progress || []
      const listenRes = await api.get('/english/listening/my-progress')
      listeningProgressList.value = listenRes.progress || []
    } catch (_e) {}
  } else {
    await loadClasses()
  }
  try {
    const gam = await learningStore.fetchGamification()
    gamification.value = gam
  } catch (_e) {}
})

async function loadClasses() {
  try {
    const status = await classesStore.fetchStudentStatus()
    myClasses.value = status.classes || []
  } catch (_e) {}
}

async function joinClass() {
  if (!classCode.value.trim()) return
  joining.value = true
  try {
    await classesStore.joinClass(classCode.value.trim())
    uiStore.showToast('Class joined successfully! 🏫', 'success')
    classCode.value = ''
    await loadClasses()
  } catch (e: any) {
    uiStore.showToast(e.message || 'Failed to join class', 'error')
  } finally {
    joining.value = false
  }
}

async function selectClass(cls: any) {
  selectedClass.value = cls
  textbookOpen.value = false
  textbookTab.value = 'grammar'
  
  loadingAssignments.value = true
  try {
    const res = await api.get(`/classes/student/class/${cls.id}/assignments`)
    classAssignments.value = res.assignments || []
    
    // Fetch student reading progress
    const readRes = await api.get('/english/reading/my-progress')
    readingProgressList.value = readRes.progress || []

    // Fetch student listening progress
    const listenRes = await api.get('/english/listening/my-progress')
    listeningProgressList.value = listenRes.progress || []
  } catch (e: any) {
    uiStore.showToast('Failed to load class details', 'error')
    classAssignments.value = []
  } finally {
    loadingAssignments.value = false
  }
}

function backToClassList() {
  selectedClass.value = null
  classAssignments.value = []
}

function toggleTextbook() {
  textbookOpen.value = !textbookOpen.value
}

function openEmojiModal() {
  emojiModalOpen.value = true
}

async function selectEmoji(em: string) {
  try {
    await authStore.updateEmoji(em)
    uiStore.showToast('Avatar updated! 🎉', 'success')
    emojiModalOpen.value = false
  } catch (e: any) {
    uiStore.showToast(e.message, 'error')
  }
}

function toggleMute() {
  soundMuted.value = !soundMuted.value
  localStorage.setItem('learnflow_sound_muted', String(soundMuted.value))
  uiStore.showToast(soundMuted.value ? 'Sound disabled' : 'Sound enabled', 'success')
}
</script>

<style scoped>
.student-dashboard {
  padding: 1.5rem 1rem;
  max-width: 1000px;
  margin: 0 auto;
}
.dashboard-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}
.divider-y {
  width: 1px;
  height: 24px;
  background: var(--border-color);
}
.btn-mute {
  background: none;
  border: none;
  font-size: 1.15rem;
  cursor: pointer;
  padding: 0.25rem;
}
.avatar-widget {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
}
.avatar-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 600;
}
.streak-aura {
  font-size: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.streak-level-1 { text-shadow: 0 0 5px #f59e0b; }
.streak-level-2 { text-shadow: 0 0 10px #f97316; }
.streak-level-3 { text-shadow: 0 0 15px #ef4444; }

.join-card {
  padding: 0.75rem 1rem;
  border-left: 4px solid var(--primary);
}
.input-field {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  outline: none;
  background: var(--bg-hover);
  color: var(--text-main);
}
.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.class-block {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  cursor: pointer;
}
.class-block-icon {
  font-size: 2.25rem;
  background: var(--primary-light);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}
.class-block-content {
  flex: 1;
}
.btn-arrow {
  font-size: 1.15rem;
  color: var(--primary);
}

/* Inside class Detail View */
.btn-back {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
}
.btn-back:hover {
  color: var(--primary);
}
.class-header-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-hover) 100%);
  border-left: 5px solid var(--primary);
}
.class-avatar-large {
  font-size: 3rem;
}

/* Textbook English Hub Card */
.textbook-card {
  border: 2px solid rgba(79, 70, 229, 0.25);
  background: linear-gradient(to bottom right, rgba(79, 70, 229, 0.05), rgba(79, 70, 229, 0.02));
  padding: 1.5rem;
}
.btn-textbook-toggle {
  background: var(--primary);
  color: white;
  border: none;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
}
.textbook-exercises-panel {
  border-top: 1px solid var(--border-color);
}
.vocab-units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.5rem;
}
.vocab-unit-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s;
}
.vocab-unit-btn:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}
.vocab-unit-num {
  font-size: var(--font-size-xs);
  font-weight: bold;
}
.vocab-unit-icon {
  font-size: 1.25rem;
  margin-top: 0.25rem;
}
.writing-tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.writing-task-card {
  padding: 1rem;
}

/* Worksheets grid styling */
.worksheets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}
.worksheet-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.worksheet-card.completed-gray {
  opacity: 0.65;
  border-color: var(--border-color);
  background: var(--bg-hover);
}
.score-badge {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--success);
  background: rgba(34, 197, 94, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
}

/* Tab button classes */
.detail-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.tab-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  background: var(--bg-card);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
}
.tab-btn.active {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary-dark);
}
.tab-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Avatar modal styling */
.avatar-modal {
  max-width: 400px;
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}
.emoji-btn {
  font-size: 1.75rem;
  padding: 0.35rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: transform 0.2s;
}
.emoji-btn:hover {
  transform: scale(1.15);
}
.tier-group {
  padding: 0.5rem;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
}
.story-option-card {
  transition: all 0.2s;
  border: 2px solid var(--border-color);
}
.story-option-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}
.option-label {
  font-size: 0.7rem;
  font-weight: 900;
  color: white;
  background: var(--primary);
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>
