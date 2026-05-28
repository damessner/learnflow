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

    <!-- Tab 1: Activities (Aktivitäten) -->
    <div v-if="tab === 'activities'" class="fade-in">
      <!-- Daily Mix active session UI -->
      <div v-if="mixing" class="card" style="margin: 1rem 0; border-color: var(--primary)">
        <h3>Daily Mix ({{ mixIndex + 1 }} / {{ dailyMix.length }})</h3>
        <div v-if="currentMixItem?.subject_switch" class="subject-switch-banner">
          Context Shift: switching to <strong>{{ currentMixItem.subject || 'a new subject' }}</strong>
        </div>
        <div style="padding: 2rem 0; text-align: center; font-size: 1.2rem">
          Review Topic: <strong>{{ currentMixItem?.topic }}</strong>
        </div>

        <div v-if="!showAnswer">
          <div class="form-group" style="margin-top: 1rem">
            <label style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem; display: block;">
              Type out what you remember about this concept (Active Recall):
            </label>
            <textarea
              v-model="recallInput"
              rows="3"
              placeholder="Write your explanation, key points, formulas, etc. here..."
              style="resize: vertical"
            ></textarea>
          </div>
          <div style="text-align: center; margin-top: 1rem">
            <button class="btn-primary" @click="revealAnswer">I've got it / Show Details</button>
          </div>
        </div>

        <div v-else>
          <!-- Active Recall Comparison -->
          <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; text-align: left; flex-wrap: wrap">
            <div style="flex: 1; min-width: 250px; padding: 1rem; background: var(--border-color); border-radius: 6px;">
              <h5 style="margin-top: 0; margin-bottom: 0.5rem; color: var(--text-muted)">Your Recall:</h5>
              <p style="white-space: pre-wrap; font-size: 0.95rem">{{ recallInput || '(Nothing written)' }}</p>
            </div>
            <div style="flex: 1; min-width: 250px; padding: 1rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px;">
              <h5 style="margin-top: 0; margin-bottom: 0.5rem; color: var(--primary)">Correct Explanation:</h5>
              <p style="font-size: 0.95rem">{{ currentMixItem?.description || 'No description available.' }}</p>
            </div>
          </div>

          <div style="text-align: center">
            <h4>Metacognition Check</h4>
            <p style="color: var(--text-muted); font-size: 0.9rem">Compare your recall above and rate your accuracy:</p>
            <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 1rem">
              <button class="btn-sm btn-danger" @click="answerMix(false, 1)">Forgot entirely (1)</button>
              <button class="btn-sm" @click="answerMix(true, 3)">Hard to recall (3)</button>
              <button class="btn-sm" style="background: var(--success); color: white; border: none" @click="answerMix(true, 5)">Easy (5)</button>
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap;">
        <!-- Join Class -->
        <div style="flex: 1; min-width: 280px;" class="card">
          <h3 style="margin-top: 0">Join Class by Code</h3>
          <div class="form-group" style="margin-top: 0.5rem;">
            <div style="display: flex; gap: 0.5rem">
              <input v-model="classCode" placeholder="Enter class code" />
              <button class="btn-primary" :disabled="joining" @click="joinClass">Join</button>
            </div>
          </div>
        </div>

        <!-- Daily Mix Promo -->
        <div v-if="dailyMix.length > 0 && !mixing" style="flex: 1; min-width: 280px;" class="card">
          <h3 style="margin-top: 0">Your Daily Mix</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted)">
            Spaced repetition & interleaving session ready! {{ dailyMix.length }} items to review.
          </p>
          <button class="btn-primary" @click="startDailyMix">Start Active Recall Session</button>
        </div>
      </div>

      <div class="grid grid-2" style="margin-top: 1rem">
        <!-- Announcements -->
        <div class="card">
          <h3>Announcements</h3>
          <div v-if="announcements.length === 0" style="color: var(--text-muted)">No announcements</div>
          <div
            v-for="a in announcements"
            :key="a.id"
            style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color)"
          >
            <strong>{{ a.title }}</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted)">{{ a.content }}</p>
          </div>
        </div>

        <!-- My Submissions / Assignments -->
        <div class="card">
          <h3>My Assignments</h3>
          <div v-if="submissions.length === 0" style="color: var(--text-muted)">No submissions yet</div>
          <div
            v-for="s in submissions"
            :key="s.id"
            style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;"
          >
            <router-link :to="`/student/assignment/${s.assignment_id}`" style="font-weight: 600">
              {{ s.worksheet_title }}
            </router-link>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
              <span
                v-if="s.due_date"
                :class="['badge', new Date(s.due_date) < new Date() && s.score == null ? 'badge-danger' : '']"
              >
                {{ new Date(s.due_date).toLocaleDateString() }}
              </span>
              <span v-if="s.score != null" class="badge">{{ s.score }}/{{ s.max_score }}</span>
              <span v-else style="color: var(--warning); font-size: 0.85rem; font-weight: 500">Not submitted</span>
            </div>
          </div>
        </div>

        <!-- My Classes -->
        <div class="card">
          <h3>My Classes</h3>
          <div v-if="myClasses.length === 0" style="color: var(--text-muted)">No classes yet</div>
          <div
            v-for="c in myClasses"
            :key="c.id"
            style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color)"
          >
            <strong>{{ c.name }}</strong>
            <span class="badge" style="margin-left: 0.5rem">{{ c.class_code }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Courses & Grammar (Kurse & Grammatik) -->
    <div v-if="tab === 'courses'" class="fade-in flex flex-col gap-md" style="display: flex; flex-direction: column; gap: 1rem;">
      <!-- Grammar Academy Banner -->
      <div 
        class="card" 
        style="
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%), var(--bg-card);
          border: 2px solid var(--primary-soft);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
          padding: 1.5rem;
        "
      >
        <div style="flex: 1; min-width: 250px; text-align: left;">
          <h3 style="margin-top: 0; background: var(--gradient-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 1.50rem; display: inline-block;">
            🏆 Grammar Academy (Grammatik-Akademie)
          </h3>
          <p style="margin: 0.5rem 0 0; font-size: 0.95rem; color: var(--text-secondary);">
            Meistere die 15 Kernbereiche der englischen Grammatik (Klasse 1 / Schulstufe 5) mit Explorer, Pioneer und Master Quests! Sammle Abzeichen und schalte dein maßgeschneidertes AI Finisher Quiz frei.
          </p>
        </div>
        <button class="btn-primary btn-lg" @click="router.push('/grammar-academy')">
          Akademie betreten ➔
        </button>
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

const tab = ref('activities')
const tabs = [
  { key: 'activities', label: 'Aktivitäten 📅' },
  { key: 'courses', label: 'Kurse & Grammatik 📚' },
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
