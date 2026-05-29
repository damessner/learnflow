<template>
  <div class="page">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
      "
    >
      <div>
        <h2 class="page-title">Student Dashboard</h2>
        <p class="page-subtitle">
          Welcome back, <strong>{{ authStore.user?.name || 'Student' }}</strong
          >!
        </p>
      </div>

      <!-- Glowing Emoji Bubble & Sound Toggle -->
      <div
        style="
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-card);
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        "
      >
        <div
          @click="openEmojiModal"
          style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer"
        >
          <span
            class="streak-aura"
            :class="streakLevel > 0 ? `streak-level-${streakLevel}` : ''"
            style="
              font-size: 2rem;
              width: 44px;
              height: 44px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
            "
          >
            {{ authStore.user?.character_emoji || '👤' }}
          </span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted)"
            >Choose Avatar</span
          >
        </div>
        <div
          style="width: 1px; height: 24px; background: var(--border-color); margin: 0 0.25rem"
        ></div>
        <button
          @click="toggleMute"
          style="
            background: transparent;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
          "
          :title="soundMuted ? 'Unmute victory music' : 'Mute victory music'"
        >
          {{ soundMuted ? '🔇' : '🔊' }}
        </button>
      </div>
    </div>
       <!-- Tab Pills -->
    <div class="tab-pills" style="margin-bottom: 1.5rem; display: flex; gap: 0.25rem;">
      <button
        v-for="t in tabs"
        :key="t.key"
        :class="['tab-pill', { active: tab === t.key }]"
        @click="tab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Tab 1: Classes 🏫 (new default) -->
    <div v-if="tab === 'classes'" class="fade-in">
      <!-- Join Class -->
      <div class="card mb-4" style="margin-bottom: 1rem;">
        <div class="flex items-center gap-3">
          <input v-model="classCode" placeholder="Klassencode eingeben..." class="flex-1" />
          <button class="btn-primary" :disabled="joining" @click="joinClass">Beitreten</button>
        </div>
      </div>

      <!-- Class Cards Grid -->
      <div v-if="myClasses.length === 0" class="text-center py-6 text-secondary">
        <p class="text-lg">🏫 Du bist noch in keiner Klasse.</p>
        <p class="text-sm">Tritt einer Klasse bei oder frage deine Lehrkraft nach dem Code.</p>
      </div>

      <div v-else class="classes-grid">
        <div v-for="c in myClasses" :key="c.id" class="class-card card card-lift">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold">{{ c.name }}</h3>
              <p class="text-sm text-secondary">{{ c.teacher_name || '—' }}</p>
            </div>
            <span v-if="c.newCount > 0" class="badge badge-danger">+{{ c.newCount }} neu</span>
          </div>

          <!-- Pending Assignments -->
          <div v-if="c.assignments?.length" class="mt-3">
            <p class="text-xs font-bold text-secondary mb-2">📋 Ausstehende Aufgaben:</p>
            <div v-for="a in c.assignments.slice(0, 5)" :key="a.id" class="assignment-row flex items-center justify-between py-1">
              <router-link :to="`/student/assignment/${a.id}`" class="text-sm font-semibold">{{ a.title }}</router-link>
              <span class="text-xs" :class="a.due_date && new Date(a.due_date) < new Date() ? 'text-danger' : 'text-muted'">
                {{ a.due_date ? new Date(a.due_date).toLocaleDateString() : '' }}
              </span>
            </div>
          </div>
          <div v-else class="mt-3 text-xs text-muted">Keine ausstehenden Aufgaben 🎉</div>

          <button class="btn-secondary btn-sm w-full justify-center mt-3" @click="router.push(`/student/course/${c.id}`)">
            Klasse öffnen ➔
          </button>
        </div>
      </div>

      <!-- Submissions overview moved below -->
      <div class="card mt-4">
        <h3 class="font-bold mb-2">📝 Meine Abgaben</h3>
        <div v-if="submissions.length === 0" class="text-sm text-muted">Noch keine Abgaben</div>
        <div v-for="s in submissions.slice(0, 10)" :key="s.id" class="flex items-center justify-between py-1 border-bottom">
          <router-link :to="`/student/assignment/${s.assignment_id}`" class="text-sm font-semibold">{{ s.worksheet_title }}</router-link>
          <span v-if="s.score != null" class="badge">{{ s.score }}/{{ s.max_score }}</span>
          <span v-else class="text-xs text-warning">Nicht abgegeben</span>
        </div>
      </div>
    </div>

    <!-- Tab 2: English 🇬🇧 (grade-linked) -->
    <div v-if="tab === 'english'" class="fade-in">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-2xl">🇬🇧</span>
        <div>
          <h2 class="text-lg font-bold">English — {{ textbook === 'more1' ? 'MORE! 1' : textbook }}</h2>
          <p class="text-sm text-secondary" v-if="studentGrade">Klasse {{ studentGrade }} entdeckt</p>
        </div>
      </div>

      <div v-if="!isAvailable" class="card text-center py-6">
        <span class="text-4xl">🚧</span>
        <h3 class="mt-2">Coming Soon</h3>
        <p class="text-sm text-secondary">MORE! Inhalte für Klasse {{ studentGrade }} sind in Entwicklung.</p>
      </div>

      <div v-else class="flex flex-col gap-4">
        <!-- Grammar Section -->
        <div class="english-section">
          <button class="section-header" @click="englishSections.grammar = !englishSections.grammar">
            <span>🏆 Grammar</span>
            <span>{{ englishSections.grammar ? '▼' : '▶' }}</span>
          </button>
          <div v-if="englishSections.grammar" class="section-body fade-in">
            <p class="text-sm text-secondary mb-3">15 Units mit Explorer, Pioneer, Master & AI Quiz</p>
            <button class="btn-primary w-full justify-center" @click="router.push('/grammar-academy')">
              🧭 Grammar Academy öffnen
            </button>
          </div>
        </div>

        <!-- Vocabulary Section -->
        <div class="english-section">
          <button class="section-header" @click="englishSections.vocab = !englishSections.vocab">
            <span>📚 Vocabulary</span>
            <span>{{ englishSections.vocab ? '▼' : '▶' }}</span>
          </button>
          <div v-if="englishSections.vocab" class="section-body fade-in">
            <p class="text-sm text-secondary mb-3">15 Units mit Starter/Practice/Challenge + Final Quiz</p>
            <div class="unit-chips">
              <button
                v-for="u in 15"
                :key="u"
                class="unit-chip"
                @click="router.push(`/vocabulary/more1/${u}`)"
              >Unit {{ u }}</button>
            </div>
          </div>
        </div>

        <!-- Writing Coach Section -->
        <div class="english-section">
          <button class="section-header" @click="englishSections.writing = !englishSections.writing">
            <span>✍️ Writing Coach</span>
            <span>{{ englishSections.writing ? '▼' : '▶' }}</span>
          </button>
          <div v-if="englishSections.writing" class="section-body fade-in">
            <p class="text-sm text-secondary mb-3">AI-unterstütztes Schreibtraining</p>
            <button class="btn-primary w-full justify-center" @click="router.push('/writing-coach')">
              ✍️ Writing Coach öffnen
            </button>
          </div>
        </div>

        <!-- Listening / Reading -- Coming Soon -->
        <div class="english-section disabled">
          <div class="section-header">
            <span>🎧 Listening</span>
            <span class="text-muted">⏳ Coming Soon</span>
          </div>
        </div>
        <div class="english-section disabled">
          <div class="section-header">
            <span>📖 Reading</span>
            <span class="text-muted">⏳ Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
          </div>
          <button class="btn-primary" style="width: 100%; padding: 0.75rem;" @click="router.push('/grammar-academy')">
            Akademie betreten ➔
          </button>
        </div>

        <!-- Writing Coach Banner -->
        <div
          class="card"
          style="
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.10) 0%, rgba(6, 182, 212, 0.10) 100%), var(--bg-card);
            border: 2px solid rgba(16, 185, 129, 0.35);
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1.5rem;
          "
        >
          <div style="flex: 1; text-align: left;">
            <h3 style="margin-top: 0; background: linear-gradient(135deg, #10b981, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 1.35rem; display: inline-block;">
              ✍️ Writing Coach
            </h3>
            <p style="margin: 0.5rem 0 0; font-size: 0.9rem; color: var(--text-secondary);">
              Guided curriculum writing tasks with pre-writing exercises, gamified word banks, real-time scoring and letter grades A–F.
            </p>
            <div style="display: flex; gap: 0.4rem; margin-top: 0.75rem; flex-wrap: wrap;">
              <span style="font-size: 0.78rem; background: rgba(16,185,129,0.12); color: #059669; padding: 0.2rem 0.5rem; border-radius: 9999px; font-weight: 600;">✅ Pre-writing</span>
              <span style="font-size: 0.78rem; background: rgba(6,182,212,0.12); color: #0891b2; padding: 0.2rem 0.5rem; border-radius: 9999px; font-weight: 600;">🎯 Word banks</span>
              <span style="font-size: 0.78rem; background: rgba(99,102,241,0.12); color: var(--primary); padding: 0.2rem 0.5rem; border-radius: 9999px; font-weight: 600;">📊 A–F grades</span>
            </div>
          </div>
          <button
            class="btn-primary"
            style="width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #10b981, #06b6d4); border: none;"
            @click="router.push('/writing-coach')"
          >
            Start Writing ✍️
          </button>
        </div>
      </div>

      <!-- Assigned Courses Grid -->
      <div class="card" style="text-align: left;">
        <h3 style="margin-bottom: 1rem;">My Assigned Courses</h3>
        <div v-if="courses.length === 0" style="color: var(--text-muted); padding: 1rem 0;">No courses assigned</div>
        <div v-else class="grid grid-2" style="margin-top: 0.5rem;">
          <div
            v-for="c in courses"
            :key="c.id"
            class="card card-lift"
            style="border-left: 4px solid var(--primary); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;"
          >
            <div>
              <strong style="font-size: 1.1rem; display: block; margin-bottom: 0.25rem;">{{ c.name }}</strong>
              <span class="text-xs text-muted">Course ID: {{ c.id }}</span>
            </div>
            <router-link :to="`/student/course/${c.id}`" class="btn btn-secondary btn-sm">Open Course ➔</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 3: Statistics & Achievements (Statistiken & Abzeichen) -->
    <div v-if="tab === 'stats'" class="fade-in grid grid-2" style="text-align: left;">
      <!-- Gamification Progress -->
      <div v-if="gamification" class="card">
        <h3>🏆 My Achievements</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; margin-top: 1rem;">
          <span>Level: <strong>{{ gamification.level }}</strong></span>
          <span>XP: <strong>{{ gamification.xp }}</strong></span>
        </div>

        <div
          style="width: 100%; height: 10px; background: var(--border-color); border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;"
        >
          <div
            :style="{
              width: levelProgress + '%',
              background: 'var(--primary)',
              height: '100%',
              transition: 'width 0.5s ease',
            }"
          ></div>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">
          {{ gamification.xp }} / {{ xpForNext }} XP to Level {{ gamification.level + 1 }}
        </div>

        <p style="font-size: 1.05rem;">
          🔥 Daily Streak: <strong>{{ gamification.streak_days }}</strong> days
        </p>

        <div class="divider"></div>
        <h4 style="margin-bottom: 0.5rem;">🎖️ Earned Badges:</h4>
        <div v-if="gamification.badges && gamification.badges.length" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.25rem;">
          <span
            v-for="b in gamification.badges"
            :key="b"
            class="badge"
            style="padding: 0.25rem 0.65rem;"
          >{{ b }}</span>
        </div>
        <div v-else style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">
          No badges earned yet. Keep solving worksheets and quizzes to unlock badges!
        </div>
      </div>

      <!-- Mastery Map -->
      <div class="card">
        <h3>Mastery Map</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Track your real-time mastery of learning concepts. Teach them to a virtual AI student to review them!
        </p>
        <div
          v-for="m in masteryList"
          :key="m.id"
          style="display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0; border-bottom: 1px dashed var(--border-color);"
        >
          <span style="flex: 1; font-weight: 500;">{{ m.topic }}</span>
          <div
            style="width: 100px; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;"
          >
            <div
              :style="{
                width: m.mastery_level + '%',
                background: 'var(--primary)',
                height: '100%',
              }"
            ></div>
          </div>
          <span style="font-size: 0.8rem; width: 40px; text-align: right;">{{ m.mastery_level }}%</span>
          <button
            v-if="m.mastery_level >= 40 && m.mastery_level <= 80"
            class="btn-sm"
            style="background: var(--warning); color: #000; border: none; white-space: nowrap; padding: 0.15rem 0.45rem;"
            @click="startTeaching(m)"
          >
            Teach It!
          </button>
        </div>
      </div>

      <!-- Remediation History -->
      <div class="card" style="grid-column: 1 / -1;">
        <h3>Remediation History</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          Review your mistakes and Socratic revision loops from past worksheets.
        </p>
        <div v-if="remediationHistory.length === 0" style="color: var(--text-muted); padding: 1rem 0;">
          No remediation rounds yet. Complete worksheets with errors to trigger remediation.
        </div>
        <div
          v-for="entry in remediationHistory"
          :key="entry.assignment_id"
          style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <router-link
              :to="`/student/assignment/${entry.assignment_id}`"
              style="font-weight: 600"
            >
              {{ entry.worksheet_title }}
            </router-link>
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; justify-content: flex-end">
              <span class="badge">Rounds: {{ entry.round_count || 0 }}</span>
              <span class="badge">Correct: {{ entry.correct || 0 }}/{{ entry.attempted || 0 }}</span>
            </div>
          </div>
          <div
            v-if="entry.rounds?.length"
            style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem"
          >
            Last Feedback: {{ entry.rounds[entry.rounds.length - 1]?.summary || 'No summary' }}
          </div>
        </div>
      </div></div>

    <div v-if="teaching" class="modal-overlay" @click.self="teaching = null">
      <div class="modal" style="max-width: 550px">
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem">
          <h3>Teach: {{ teaching?.topic }}</h3>
          <button
            @click="teaching = null"
            style="background: none; border: none; font-size: 1.5rem; cursor: pointer"
          >
            &times;
          </button>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem">
          A confused AI student needs your help! Explain this concept and correct their
          misconceptions.
        </p>
        <div
          style="
            border: 1px solid var(--border-color);
            padding: 1rem;
            border-radius: 4px;
            max-height: 300px;
            overflow-y: auto;
            margin-bottom: 1rem;
          "
        >
          <div
            v-for="(msg, i) in protegeMessages"
            :key="i"
            :style="{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '0.5rem' }"
          >
            <span
              :style="{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--border-color)',
                color: msg.role === 'user' ? '#fff' : 'inherit',
                maxWidth: '85%',
              }"
              >{{ msg.text }}</span
            >
          </div>
          <div v-if="protegeLoading" style="color: var(--text-muted); font-size: 0.85rem">
            AI student is thinking...
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem">
          <input
            v-model="protegeInput"
            @keyup.enter="sendToProtege"
            placeholder="Explain the concept..."
            style="flex: 1"
          />
          <button class="btn-primary" @click="sendToProtege" :disabled="protegeLoading">
            Teach
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Emoji Selector Modal -->
  <div v-if="emojiModalOpen" class="modal-overlay" @click.self="emojiModalOpen = false">
    <div class="modal" style="max-width: 450px; text-align: center">
      <h3 style="margin-bottom: 0.5rem">Choose Your Character Emoji</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem">
        Select an emoji avatar to represent yourself in your classes!
      </p>
      <div
        style="
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        "
      >
        <button
          v-for="em in emojiList"
          :key="em"
          style="
            font-size: 2rem;
            padding: 0.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            transition: all 0.2s;
          "
          @click="selectEmoji(em)"
        >
          {{ em }}
        </button>
      </div>
      <button class="btn-primary" style="width: 100%" @click="emojiModalOpen = false">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useClassesStore } from '../stores/classes'
import { useSubmissionsStore } from '../stores/submissions'
import { useCoursesStore } from '../stores/courses'
import { useLearningStore } from '../stores/learning'
import { useUiStore } from '../stores/ui'
import { useAuthStore } from '../stores/auth'
import { buildApiHeaders } from '../services/api'
import { audioSynth } from '../utils/audioSynth'

const router = useRouter()
const classesStore = useClassesStore()
const submissionsStore = useSubmissionsStore()
const coursesStore = useCoursesStore()
const learningStore = useLearningStore()
const uiStore = useUiStore()
const authStore = useAuthStore()

const tab = ref('classes')
const tabs = [
  { key: 'classes', label: '🏫 Meine Klassen' },
  { key: 'english', label: '🇬🇧 English' },
  { key: 'stats', label: 'Statistiken & Abzeichen 🏆' }
]

const soundMuted = ref(localStorage.getItem('learnflow_sound_muted') === 'true')
function toggleMute() {
  soundMuted.value = !soundMuted.value
  localStorage.setItem('learnflow_sound_muted', String(soundMuted.value))
  uiStore.showToast(soundMuted.value ? 'Victory sound muted' : 'Victory sound unmuted', 'success')
}

const streakLevel = computed(() => {
  const streak = gamification.value?.streak_days || 0
  if (streak >= 7) return 3
  if (streak >= 3) return 2
  if (streak >= 1) return 1
  return 0
})

const myClasses = ref([])
const announcements = ref([])
const submissions = ref([])
const remediationHistory = ref([])
const courses = ref([])
const gamification = ref(null)
const masteryList = ref([])
const classCode = ref('')
const joining = ref(false)

// English tab state
const englishSections = ref({ grammar: true, vocab: false, writing: false })
const studentGrade = computed(() => {
  const match = (authStore.user?.class_name || '').match(/^(\d)/)
  return match ? parseInt(match[1]) : 1
})
const textbook = computed(() => `more${studentGrade.value}`)
const isAvailable = computed(() => studentGrade.value === 1)

const emojiModalOpen = ref(false)
const emojiList = [
  '🚀',
  '🤖',
  '🦁',
  '🦄',
  '⚡',
  '🍕',
  '🎯',
  '🐱',
  '🐶',
  '🦊',
  '🐼',
  '🐨',
  '🦖',
  '🐉',
  '👾',
  '👑',
  '🌈',
  '🧙',
  '🥷',
  '👽',
  '🧠',
  '🧪',
  '🎨',
  '🎸',
]

async function selectEmoji(em) {
  try {
    await authStore.updateEmoji(em)
    uiStore.showToast('Avatar updated!', 'success')
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
}

function openEmojiModal() {
  emojiModalOpen.value = true
}

const dailyMix = ref([])
const mixing = ref(false)
const mixIndex = ref(0)
const showAnswer = ref(false)
const mixResults = ref([])

const teaching = ref(null)
const protegeMessages = ref([])
const protegeInput = ref('')
const protegeLoading = ref(false)
const recallInput = ref('')

const currentMixItem = computed(() => dailyMix.value[mixIndex.value])

const levelProgress = computed(() => {
  if (!gamification.value) return 0
  const lvl = gamification.value.level
  const currentXp = gamification.value.xp
  const baseXp = (lvl - 1) * (lvl - 1) * 200
  const nextXp = lvl * lvl * 200
  const progress = ((currentXp - baseXp) / (nextXp - baseXp)) * 100
  return Math.min(100, Math.max(0, progress))
})

const xpForNext = computed(() => {
  if (!gamification.value) return 200
  const lvl = gamification.value.level
  return lvl * lvl * 200
})

onMounted(async () => {
  try {
    const [status, ann, _summ, _remHistory, _gam, _mast, _dm] = await Promise.all([
      classesStore.fetchStudentStatus().catch(() => ({ classes: [] })),
      classesStore.fetchAnnouncements().catch(() => []),
      submissionsStore.fetchStudentSummary().catch(() => []),
      submissionsStore.fetchStudentRemediationHistory().catch(() => ({ assignments: [] })),
      learningStore.fetchGamification().catch(() => null),
      learningStore.fetchMastery().catch(() => []),
      learningStore.fetchDailyMix().catch(() => []),
    ])

    myClasses.value = status.classes || []
    announcements.value = ann || []
    submissions.value = submissionsStore.summary
    remediationHistory.value = _remHistory?.assignments || []
    gamification.value = learningStore.gamification
    masteryList.value = learningStore.mastery
    dailyMix.value = learningStore.dailyMix || []

    const _courseData = await coursesStore.fetchStudentCourses().catch(() => ({ courses: [] }))
    courses.value = coursesStore.courses
  } catch {
    /* */
  }
})

async function joinClass() {
  if (!classCode.value.trim()) return
  joining.value = true
  try {
    await classesStore.joinClass(classCode.value.trim())
    uiStore.showToast('Joined class!', 'success')
    classCode.value = ''
    const status = await classesStore.fetchStudentStatus()
    myClasses.value = status.classes || []
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    joining.value = false
  }
}

function startDailyMix() {
  mixing.value = true
  mixIndex.value = 0
  showAnswer.value = false
  mixResults.value = []
  recallInput.value = ''
}

function revealAnswer() {
  showAnswer.value = true
}

async function answerMix(correct, confidence) {
  mixResults.value.push({
    kc_id: currentMixItem.value.kc_id,
    topic: currentMixItem.value.topic,
    correct,
    confidence,
  })

  if (mixIndex.value < dailyMix.value.length - 1) {
    mixIndex.value++
    showAnswer.value = false
    recallInput.value = ''
  } else {
    // Finished mix
    mixing.value = false
    try {
      const res = await learningStore.completeDailyMix(mixResults.value)
      if (res.leveledUp || (res.newBadges && res.newBadges.length)) {
        audioSynth.playLevelUp()
      } else {
        audioSynth.playComplete()
      }
      let msg = `Daily Mix Complete! +${res.xpGained} XP`
      if (res.leveledUp) msg += ` | Level Up! Now Level ${res.newLevel}`
      if (res.newBadges && res.newBadges.length) {
        msg += ` | New Badge: ${res.newBadges.join(', ')}`
        res.newBadges.forEach((b) => {
          setTimeout(() => uiStore.showToast(`Badge Earned: ${b}`, 'success'), 500)
        })
      }
      uiStore.showToast(msg, 'success')
      await learningStore.fetchGamification()
      gamification.value = learningStore.gamification
      dailyMix.value = []
    } catch (e) {
      uiStore.showToast(e.message, 'error')
    }
  }
}

function startTeaching(kc) {
  teaching.value = kc
  protegeMessages.value = [
    {
      role: 'tutor',
      text: `Hi! I'm trying to learn about "${kc.topic}". I'm a bit confused about some things. Can you help me understand?`,
    },
  ]
  protegeInput.value = ''
}

async function sendToProtege() {
  if (!protegeInput.value.trim() || protegeLoading.value) return
  const msg = protegeInput.value.trim()
  protegeMessages.value.push({ role: 'user', text: msg })
  protegeInput.value = ''
  protegeLoading.value = true

  const replyIdx = protegeMessages.value.length
  protegeMessages.value.push({ role: 'tutor', text: '' })

  try {
    const response = await fetch('/api/ai/protege', {
      method: 'POST',
      headers: buildApiHeaders('POST'),
      body: JSON.stringify({
        kcName: teaching.value.topic,
        kcDescription: teaching.value.description || teaching.value.topic,
        message: msg,
      }),
      credentials: 'include',
    })

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader')

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
      for (const line of lines) {
        if (line === 'data: [DONE]') break
        try {
          const json = JSON.parse(line.replace('data: ', ''))
          protegeMessages.value[replyIdx].text += json.text
        } catch {}
      }
    }
  } catch {
    protegeMessages.value[replyIdx].text = "I'm having trouble thinking right now..."
  }
  protegeLoading.value = false
}
</script>

<style scoped>
.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
.class-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}
.assignment-row {
  border-bottom: 1px solid var(--border-color);
}
.english-section {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-card);
}
.english-section.disabled {
  opacity: 0.5;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 1.25rem;
  background: var(--bg-hover);
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  text-align: left;
}
.section-body {
  padding: 1rem 1.25rem;
}
.unit-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.unit-chip {
  padding: 0.3rem 0.7rem;
  border: 1.5px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.2s;
}
.unit-chip:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}
</style>
