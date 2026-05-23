<template>
  <div class="page">
    <h2>Student Dashboard</h2>

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
        <h3 style="margin-top: 0">🧠 Your Daily Mix</h3>
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

      <div v-if="!showAnswer" style="text-align: center">
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem">
          Try to actively recall everything you know about this topic before revealing.
        </p>
        <button class="btn-primary" @click="showAnswer = true">I've got it / Show Details</button>
      </div>

      <div v-else style="text-align: center">
        <h4>Metacognition Check</h4>
        <p>How well did you remember this concept?</p>
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
          style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color)"
        >
          <strong>{{ s.worksheet_title }}</strong>
          <span v-if="s.score != null" class="badge">{{ s.score }}/{{ s.max_score }}</span>
          <span v-else style="color: var(--warning); font-size: 0.8rem">Not submitted</span>
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
            >XP: <strong>{{ gamification.xp }}</strong></span
          >
          <span
            >Level: <strong>{{ gamification.level }}</strong></span
          >
        </div>

        <div
          style="
            width: 100%;
            height: 8px;
            background: var(--border-color);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 1rem;
          "
        >
          <div
            :style="{
              width: (gamification.xp % 100) + '%',
              background: 'var(--primary)',
              height: '100%',
              transition: 'width 0.3s',
            }"
          ></div>
        </div>

        <p>
          🔥 Streak: <strong>{{ gamification.streak_days }}</strong> days
        </p>
        <div v-if="gamification.badges.length" style="margin-top: 0.5rem">
          <span
            v-for="b in gamification.badges"
            :key="b"
            class="badge"
            style="margin-right: 0.25rem"
            >{{ b }}</span
          >
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useClassesStore } from '../stores/classes'
import { useSubmissionsStore } from '../stores/submissions'
import { useCoursesStore } from '../stores/courses'
import { useLearningStore } from '../stores/learning'
import { useUiStore } from '../stores/ui'

const classesStore = useClassesStore()
const submissionsStore = useSubmissionsStore()
const coursesStore = useCoursesStore()
const learningStore = useLearningStore()
const uiStore = useUiStore()

const myClasses = ref([])
const announcements = ref([])
const submissions = ref([])
const courses = ref([])
const gamification = ref(null)
const masteryList = ref([])
const classCode = ref('')
const joining = ref(false)

const dailyMix = ref([])
const mixing = ref(false)
const mixIndex = ref(0)
const showAnswer = ref(false)
const mixResults = ref([])

const teaching = ref(null)
const protegeMessages = ref([])
const protegeInput = ref('')
const protegeLoading = ref(false)

import { computed } from 'vue'
const currentMixItem = computed(() => dailyMix.value[mixIndex.value])

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
  } else {
    // Finished mix
    mixing.value = false
    try {
      const res = await learningStore.completeDailyMix(mixResults.value)
      uiStore.showToast(`Daily Mix Complete! +${res.xpGained} XP`, 'success')
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
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
      },
      body: JSON.stringify({
        kcName: teaching.value.topic,
        kcDescription: teaching.value.description || teaching.value.topic,
        message: msg,
      }),
    })

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader')

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\\n').filter((l) => l.startsWith('data: '))
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
