<template>
  <div class="page">
    <h2 v-if="worksheet">{{ worksheet.title }}</h2>
    <p v-if="worksheet" style="color: var(--text-muted); margin-bottom: 1rem">
      {{ worksheet.description }}
    </p>

    <div
      v-if="submitted"
      class="card"
      style="background: var(--success); color: #fff; margin-bottom: 1rem"
    >
      <h3>Submitted!</h3>
      <p>Score: {{ submitResult.score }} / {{ submitResult.maxScore }}</p>
      <div
        v-if="submitResult.gritBonusAwarded"
        style="
          background: rgba(253, 224, 71, 0.2);
          border: 1px solid #fde047;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          color: #fef08a;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0;
          width: 100%;
          box-sizing: border-box;
        "
      >
        🔥 Grit Boost! +150 XP for Retake Improvement!
      </div>
      <p v-if="submitResult.xpEarned">XP: +{{ submitResult.xpEarned }}</p>
      <p v-if="submitResult.xpLost" style="color: var(--danger-light)">
        XP Lost: -{{ submitResult.xpLost }}
      </p>
      <div v-if="submitResult.wageringResults?.length">
        <p style="margin-top: 0.5rem; font-size: 0.9rem">Wagering Results:</p>
        <div
          v-for="wr in submitResult.wageringResults"
          :key="wr.blockId"
          style="font-size: 0.85rem; opacity: 0.9"
        >
          {{ wr.correct ? 'Correct' : 'Missed' }} — wagered {{ wr.wagered }} XP →
          {{ wr.earned > 0 ? '+' + wr.earned : wr.earned }} XP
        </div>
      </div>
      <p>{{ submitResult.feedback }}</p>
    </div>

    <div
      v-if="!submitted && blocks.length > 0"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      "
    >
      <div v-if="gamXp != null" style="display: flex; align-items: center; gap: 0.5rem">
        <span style="font-weight: 600">Your XP:</span>
        <span class="badge" style="background: var(--warning); color: #000">{{ gamXp }} XP</span>
      </div>
      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer">
        <input type="checkbox" v-model="progressiveMode" />
        <span title="Reduces cognitive load by showing one question at a time">🧘 Focus Mode</span>
      </label>
    </div>

    <div
      v-for="(block, idx) in blocks"
      :key="block.id"
      class="card block-item"
      :style="getProgressiveStyle(idx)"
      style="margin-bottom: 0.5rem; transition: all 0.4s ease"
    >
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem">
        <strong>{{ block.type.replace(/_/g, ' ') }}</strong>
        <span class="badge">{{ block.points }} pts</span>
      </div>

      <MermaidDiagram v-if="block.mermaid" :code="block.mermaid" :alt-text="block.alt_text" />

      <template v-if="block.type === 'gap_fill'">
        <div v-html="renderGaps(block.template, block.id)"></div>
      </template>

      <template v-if="block.type === 'multiple_choice'">
        <div v-for="(opt, oi) in block.options || []" :key="oi">
          <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0">
            <input v-model="answers[block.id]" type="checkbox" :value="oi" />
            {{ opt }}
          </label>
        </div>
      </template>

      <template v-if="block.type === 'single_choice'">
        <div v-for="(opt, oi) in block.options || []" :key="oi">
          <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0">
            <input v-model="answers[block.id]" type="radio" :value="oi" :name="block.id" />
            {{ opt }}
          </label>
        </div>
      </template>

      <template v-if="block.type === 'matching'">
        <div
          v-for="(pair, pi) in block.pairs || []"
          :key="pi"
          style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem"
        >
          <span>{{ pair[0] }}</span>
          <input v-model="answers[block.id][pi]" :placeholder="'Match for ' + pair[0]" />
        </div>
      </template>

      <template v-if="block.type === 'short_answer'">
        <textarea v-model="answers[block.id]" rows="3" placeholder="Your answer..."></textarea>
      </template>

      <template v-if="block.type === 'text' || block.type === 'read_aloud'">
        <div style="white-space: pre-wrap">{{ block.text }}</div>
      </template>

      <template v-if="block.type === 'word_scramble'">
        <div
          v-for="(w, wi) in block.words || []"
          :key="wi"
          style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem"
        >
          <span style="font-family: monospace; letter-spacing: 3px">{{ getScrambled(block.id, wi) }}</span>
          <input v-model="answers[block.id][wi]" placeholder="Unscramble" />
        </div>
      </template>

      <template v-if="block.type === 'number_line'">
        <NumberLine v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'equation_entry'">
        <EquationInput v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'fraction_input'">
        <FractionInput v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'arithmetic_grid'">
        <ArithmeticGrid v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'graph_plot'">
        <GraphPlot v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'geometry_shape'">
        <GeometryShape v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <template v-if="block.type === 'word_problem'">
        <WordProblem v-if="!readonly" :block="block" v-model="answers[block.id]" />
      </template>

      <div
        v-if="!submitted"
        style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color)"
      >
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem">
          <label style="font-size: 0.8rem; white-space: nowrap">Wager XP:</label>
          <input
            type="range"
            v-model.number="wagers[block.id]"
            :min="0"
            :max="gamXp || 100"
            step="10"
            style="flex: 1"
          />
          <span style="font-size: 0.8rem; min-width: 40px; text-align: right"
            >{{ wagers[block.id] || 0 }} XP</span
          >
        </div>
        <div style="display: flex; gap: 0.75rem; font-size: 0.75rem; color: var(--text-muted)">
          <label
            ><input type="radio" v-model="blockConfidence[block.id]" value="1" /> Guessing</label
          >
          <label><input type="radio" v-model="blockConfidence[block.id]" value="3" /> Unsure</label>
          <label
            ><input type="radio" v-model="blockConfidence[block.id]" value="5" /> Confident</label
          >
        </div>
      </div>

      <div
        v-if="progressiveMode && idx === currentBlockIndex && idx < blocks.length - 1"
        style="margin-top: 1rem; text-align: right"
      >
        <button class="btn-primary" @click="currentBlockIndex++">Next Question ↓</button>
      </div>
    </div>

    <div
      v-if="!submitted && (!progressiveMode || currentBlockIndex === blocks.length - 1)"
      style="display: flex; gap: 0.5rem; margin-top: 1rem; justify-content: flex-end"
    >
      <button
        class="btn-primary"
        @click="openTutor"
        style="background: #0ea5e9; border-color: #0ea5e9"
      >
        🤖 Ask Socratic Tutor
      </button>
      <button :disabled="saving" @click="saveProgress">Save</button>
      <button class="btn-primary" :disabled="submitting" @click="submit">Submit Assignment</button>
    </div>

    <!-- Socratic Tutor Modal -->
    <div
      v-if="tutorOpen"
      class="modal"
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      "
    >
      <div
        class="card"
        style="
          width: 500px;
          max-width: 90%;
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          max-height: 80vh;
        "
      >
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem">
          <h3>🤖 Socratic Tutor</h3>
          <button
            @click="tutorOpen = false"
            style="background: none; border: none; font-size: 1.5rem; cursor: pointer"
          >
            &times;
          </button>
        </div>
        <div
          style="
            flex: 1;
            overflow-y: auto;
            border: 1px solid var(--border-color);
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 4px;
            background: var(--bg-main);
          "
        >
          <div
            v-for="(msg, i) in tutorMessages"
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
              }"
              >{{ msg.text }}</span
            >
          </div>
          <div v-if="tutorLoading" style="color: var(--text-muted); font-size: 0.9rem">
            Tutor is typing...
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem">
          <input
            v-model="tutorInput"
            @keyup.enter="sendToTutor"
            placeholder="I'm stuck on..."
            style="flex: 1"
          />
          <button class="btn-primary" @click="sendToTutor" :disabled="tutorLoading">Ask</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSubmissionsStore } from '../stores/submissions'
import { useUiStore } from '../stores/ui'
import { useLearningStore } from '../stores/learning'
import { buildApiHeaders } from '../services/api'
import { audioSynth } from '../utils/audioSynth'
import MermaidDiagram from '../components/exercises/MermaidDiagram.vue'
import NumberLine from '../components/exercises/NumberLine.vue'
import EquationInput from '../components/exercises/EquationInput.vue'
import FractionInput from '../components/exercises/FractionInput.vue'
import ArithmeticGrid from '../components/exercises/ArithmeticGrid.vue'
import GraphPlot from '../components/exercises/GraphPlot.vue'
import GeometryShape from '../components/exercises/GeometryShape.vue'
import WordProblem from '../components/exercises/WordProblem.vue'

const route = useRoute()
const store = useSubmissionsStore()
const uiStore = useUiStore()
const learningStore = useLearningStore()

const worksheet = ref(null)
const blocks = ref([])
const answers = reactive({})
const submitted = ref(false)
const readonly = ref(false)
const submitResult = ref({ score: 0, maxScore: 0, feedback: '' })
const saving = ref(false)
const submitting = ref(false)

const wagers = reactive({})
const blockConfidence = reactive({})
const gamXp = ref(null)

const progressiveMode = ref(false)
const currentBlockIndex = ref(0)

const tutorOpen = ref(false)
const tutorInput = ref('')
const tutorMessages = ref([
  {
    role: 'tutor',
    text: 'Hi! I am your Socratic Tutor. I will not give you the answers directly, but I will help you find them yourself. What are you stuck on?',
  },
])
const tutorLoading = ref(false)

let autoSaveTimer = null
let lastSavedAnswers = ''

onMounted(async () => {
  try {
    const data = await store.fetchAssignmentSubmission(route.params.id)
    worksheet.value = data.worksheet
    try {
      const content = JSON.parse(data.worksheet.content)
      blocks.value = content.blocks || []
    } catch {
      blocks.value = []
    }

    if (data.submission.answers) {
      try {
        const saved = JSON.parse(data.submission.answers)
        Object.assign(answers, saved)
        lastSavedAnswers = JSON.stringify(saved)
      } catch {
        /* */
      }
    }

    if (blocks.value.length) {
      for (const b of blocks.value) {
        if (answers[b.id] === undefined) {
          if (b.type === 'multiple_choice') answers[b.id] = []
          else if (b.type === 'matching') answers[b.id] = {}
          else if (b.type === 'word_scramble') answers[b.id] = []
          else if (b.type === 'single_choice') answers[b.id] = null
          else answers[b.id] = ''
        }
      }
    }

    const local = localStorage.getItem(`answers_${route.params.id}`)
    if (local && !data.submission.submitted_at) {
      try {
        Object.assign(answers, JSON.parse(local))
      } catch {
        /* */
      }
    }

    try {
      autoSaveTimer = setInterval(() => {
        saveProgress().catch(() => {})
      }, 20000)
      await learningStore.fetchGamification()
      gamXp.value = learningStore.gamification?.xp || 0
    } catch {
      gamXp.value = 0
    }
  } catch (_e) {
    uiStore.showToast('Failed to load assignment', 'error')
  }
})

onUnmounted(() => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
  if (typeof window !== 'undefined') {
    delete (window as Record<string, unknown>).__updateGap
  }
})

function escapeHtmlAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderGaps(template, blockId) {
  if (!template) return ''

  if (typeof window !== 'undefined') {
    window.__updateGap = (id, idx, value) => {
      if (!answers[id]) answers[id] = {}
      answers[id][idx] = value
    }
  }

  let html = template
  let gapIdx = 0
  html = html.replace(/\(\((.*?)\)\)/g, (_match, _answer) => {
    const idx = gapIdx++
    const val = answers[blockId] || {}
    const answerText = escapeHtmlAttr(val[idx] || '')
    const safeBlockId = escapeHtmlAttr(blockId)
    return `<input type="text" value="${answerText}" oninput="window.__updateGap(&quot;${safeBlockId}&quot;,${idx},this.value)" style="display:inline;width:auto;min-width:80px;padding:0.2rem 0.5rem;border:1px dashed var(--primary);border-radius:4px" />`
  })

  return html
}

function scrambleWord(word) {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

const scrambledCache = computed(() => {
  const cache = {}
  for (const block of blocks.value) {
    if (block.type === 'word_scramble' && block.words) {
      cache[block.id] = block.words.map((w) => scrambleWord(w.word))
    }
  }
  return cache
})

function getScrambled(blockId, wordIndex) {
  return scrambledCache.value[blockId]?.[wordIndex] || ''
}

function getProgressiveStyle(idx) {
  if (!progressiveMode.value) return ''
  if (idx === currentBlockIndex.value) return 'opacity: 1; filter: none; transform: scale(1);'
  if (idx < currentBlockIndex.value)
    return 'opacity: 0.4; filter: blur(2px); pointer-events: none; transform: scale(0.98);'
  return 'display: none;'
}

async function saveProgress() {
  const current = JSON.stringify(answers)
  if (current === lastSavedAnswers) return
  saving.value = true
  try {
    localStorage.setItem(`answers_${route.params.id}`, current)
    await store.saveProgress(route.params.id, {
      ...answers,
      _wagers: { ...wagers },
      _confidence: { ...blockConfidence },
    })
    lastSavedAnswers = current
  } catch {
    /* silent */
  }
  saving.value = false
}

async function submit() {
  submitting.value = true
  try {
    const result = await store.submitAssignment(route.params.id, {
      answers: { ...answers },
      wagers: { ...wagers },
      per_block_confidence: { ...blockConfidence },
    })
    submitResult.value = result
    submitted.value = true
    readonly.value = true
    if (autoSaveTimer) clearInterval(autoSaveTimer)
    localStorage.removeItem(`answers_${route.params.id}`)
    if (result.gritBonusAwarded) {
      audioSynth.playLevelUp()
      uiStore.showToast('Grit Boost! +150 XP for retake improvement!', 'success')
    } else {
      audioSynth.playComplete()
      uiStore.showToast('Submitted successfully!', 'success')
    }
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  }
  submitting.value = false
}

function openTutor() {
  tutorOpen.value = true
}

async function sendToTutor() {
  if (!tutorInput.value.trim() || tutorLoading.value) return

  const question = tutorInput.value.trim()
  tutorMessages.value.push({ role: 'user', text: question })
  tutorInput.value = ''
  tutorLoading.value = true

  const tutorReplyIndex = tutorMessages.value.length
  tutorMessages.value.push({ role: 'tutor', text: '' })

  try {
    const context = `Worksheet: ${worksheet.value?.title}. Description: ${worksheet.value?.description}. Exercises: ${JSON.stringify(blocks.value)}`

    // Use raw fetch for SSE
    const response = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: buildApiHeaders('POST'),
      body: JSON.stringify({ question, context }),
      credentials: 'include',
    })

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader')

    const decoder = new TextDecoder()
    let done_received = false
    while (!done_received) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

      for (const line of lines) {
        if (line === 'data: [DONE]') {
          done_received = true
          break
        }
        try {
          const json = JSON.parse(line.replace('data: ', ''))
          tutorMessages.value[tutorReplyIndex].text += json.text
        } catch {
          /* ignore parse errors for partial chunks */
        }
      }
    }
  } catch (_err) {
    tutorMessages.value[tutorReplyIndex].text = "I'm having trouble connecting right now."
  } finally {
    tutorLoading.value = false
  }
}
</script>
