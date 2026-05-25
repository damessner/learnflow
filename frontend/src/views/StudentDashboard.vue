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
        <h2
          style="
            font-size: 2.2rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0;
          "
        >
          Student Dashboard
        </h2>
        <p style="color: var(--text-muted); margin-top: 0.25rem">
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

    <div style="display: flex; gap: 1rem; margin: 1rem 0">
      <div style="flex: 1">
        <div class="form-group">
          <label>Join Class by Code</label>
          <div style="display: flex; gap: 0.5rem">
            <input v-model="classCode" placeholder="Enter class code" />
            <button class="btn-primary" :disabled="joining" @click="joinClass">Join</button>
          </div>
        </div>
      </div>

      <div style="flex: 1" class="card" v-if="dailyMix.length > 0 && !mixing">
        <h3 style="margin-top: 0">Your Daily Mix</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted)">
          Spaced repetition & interleaving session ready! {{ dailyMix.length }} items to review.
        </p>
        <button class="btn-primary" @click="startDailyMix">Start Active Recall Session</button>
      </div>
    </div>

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
          <label
            style="
              font-size: 0.9rem;
              color: var(--text-muted);
              margin-bottom: 0.5rem;
              display: block;
            "
          >
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
        <div
          style="display: flex; gap: 1rem; margin-bottom: 1.5rem; text-align: left; flex-wrap: wrap"
        >
          <div
            style="
              flex: 1;
              min-width: 250px;
              padding: 1rem;
              background: var(--border-color);
              border-radius: 6px;
            "
          >
            <h5 style="margin-top: 0; margin-bottom: 0.5rem; color: var(--text-muted)">
              Your Recall:
            </h5>
            <p style="white-space: pre-wrap; font-size: 0.95rem">
              {{ recallInput || '(Nothing written)' }}
            </p>
          </div>
          <div
            style="
              flex: 1;
              min-width: 250px;
              padding: 1rem;
              background: var(--bg-main);
              border: 1px solid var(--border-color);
              border-radius: 6px;
            "
          >
            <h5 style="margin-top: 0; margin-bottom: 0.5rem; color: var(--primary)">
              Correct Explanation:
            </h5>
            <p style="font-size: 0.95rem">
              {{ currentMixItem?.description || 'No description available.' }}
            </p>
          </div>
        </div>

        <div style="text-align: center">
          <h4>Metacognition Check</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem">
            Compare your recall above and rate your accuracy:
          </p>
          <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 1rem">
            <button class="btn-sm btn-danger" @click="answerMix(false, 1)">
              Forgot entirely (1)
            </button>
            <button class="btn-sm" @click="answerMix(true, 3)">Hard to recall (3)</button>
            <button
              class="btn-sm"
              style="background: var(--success); color: white; border: none"
              @click="answerMix(true, 5)"
            >
              Easy (5)
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top: 1rem">
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

      <div class="card">
        <h3>Announcements</h3>
        <div v-if="announcements.length === 0" style="color: var(--text-muted)">
          No announcements
        </div>
        <div
          v-for="a in announcements"
          :key="a.id"
          style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color)"
        >
          <strong>{{ a.title }}</strong>
          <p style="font-size: 0.85rem; color: var(--text-muted)">{{ a.content }}</p>
        </div>
      </div>

      <div class="card">
        <h3>My Submissions</h3>
        <div v-if="submissions.length === 0" style="color: var(--text-muted)">
          No submissions yet
        </div>
        <div
          v-for="s in submissions"
          :key="s.id"
          style="
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <router-link :to="`/student/assignment/${s.assignment_id}`" style="font-weight: 600">
            {{ s.worksheet_title }}
          </router-link>
          <div>
            <span v-if="s.score != null" class="badge">{{ s.score }}/{{ s.max_score }}</span>
            <span v-else style="color: var(--warning); font-size: 0.85rem; font-weight: 500"
              >Not submitted</span
            >
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Courses</h3>
        <div v-if="courses.length === 0" style="color: var(--text-muted)">No courses assigned</div>
        <div
          v-for="c in courses"
          :key="c.id"
          style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color)"
        >
          <router-link :to="`/student/course/${c.id}`">{{ c.name }}</router-link>
        </div>
      </div>

      <div v-if="gamification" class="card">
        <h3>🏆 Progress</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem">
          <span
            >Level: <strong>{{ gamification.level }}</strong></span
          >
          <span
            >XP: <strong>{{ gamification.xp }}</strong></span
          >
        </div>

        <div
          style="
            width: 100%;
            height: 8px;
            background: var(--border-color);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 0.5rem;
          "
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
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem">
          {{ gamification.xp }} / {{ xpForNext }} XP to Level {{ gamification.level + 1 }}
        </div>

        <p>
          🔥 Streak: <strong>{{ gamification.streak_days }}</strong> days
        </p>
        <div v-if="gamification.badges && gamification.badges.length" style="margin-top: 0.5rem">
          <span
            v-for="b in gamification.badges"
            :key="b"
            class="badge"
            style="margin-right: 0.25rem; margin-bottom: 0.25rem; display: inline-block"
            >{{ b }}</span
          >
        </div>
        <div v-else style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem">
          No badges yet — complete activities to earn them!
        </div>
      </div>

      <div class="card">
        <h3>Mastery Map</h3>
        <div
          v-for="m in masteryList"
          :key="m.id"
          style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0"
        >
          <span style="flex: 1">{{ m.topic }}</span>
          <div
            style="
              width: 100px;
              height: 8px;
              background: var(--border-color);
              border-radius: 4px;
              overflow: hidden;
            "
          >
            <div
              :style="{
                width: m.mastery_level + '%',
                background: 'var(--primary)',
                height: '100%',
              }"
            ></div>
          </div>
          <span style="font-size: 0.8rem">{{ m.mastery_level }}%</span>
          <button
            v-if="m.mastery_level >= 40 && m.mastery_level <= 80"
            class="btn-sm"
            style="background: var(--warning); color: #000; border: none; white-space: nowrap"
            @click="startTeaching(m)"
          >
            Teach It!
          </button>
        </div>
      </div>
    </div>

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
import { useClassesStore } from '../stores/classes'
import { useSubmissionsStore } from '../stores/submissions'
import { useCoursesStore } from '../stores/courses'
import { useLearningStore } from '../stores/learning'
import { useUiStore } from '../stores/ui'
import { useAuthStore } from '../stores/auth'
import { buildApiHeaders } from '../services/api'
import { audioSynth } from '../utils/audioSynth'

const classesStore = useClassesStore()
const submissionsStore = useSubmissionsStore()
const coursesStore = useCoursesStore()
const learningStore = useLearningStore()
const uiStore = useUiStore()
const authStore = useAuthStore()

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
    const [status, ann, _summ, _gam, _mast, _dm] = await Promise.all([
      classesStore.fetchStudentStatus().catch(() => ({ classes: [] })),
      classesStore.fetchAnnouncements().catch(() => []),
      submissionsStore.fetchStudentSummary().catch(() => []),
      learningStore.fetchGamification().catch(() => null),
      learningStore.fetchMastery().catch(() => []),
      learningStore.fetchDailyMix().catch(() => []),
    ])

    myClasses.value = status.classes || []
    announcements.value = ann || []
    submissions.value = submissionsStore.summary
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
