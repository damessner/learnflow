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
      <p>{{ submitResult.feedback }}</p>
    </div>

    <div v-for="block in blocks" :key="block.id" class="card" style="margin-bottom: 0.5rem">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem">
        <strong>{{ block.type.replace(/_/g, ' ') }}</strong>
        <span class="badge">{{ block.points }} pts</span>
      </div>

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
          <span style="font-family: monospace; letter-spacing: 3px">{{ scramble(w.word) }}</span>
          <input v-model="answers[block.id][wi]" placeholder="Unscramble" />
        </div>
      </template>
    </div>

    <div
      v-if="!submitted"
      class="card"
      style="margin-top: 1rem; border-color: var(--primary)"
    >
      <h4>🧠 Metacognition Check</h4>
      <p style="font-size: 0.9rem; color: var(--text-muted)">Before submitting, how confident are you in your answers?</p>
      <div style="display: flex; gap: 1rem; margin-top: 0.5rem">
        <label><input type="radio" v-model="confidence" value="1" /> Guessing (1)</label>
        <label><input type="radio" v-model="confidence" value="3" /> Somewhat Sure (3)</label>
        <label><input type="radio" v-model="confidence" value="5" /> Very Confident (5)</label>
      </div>
    </div>

    <div
      v-if="!submitted"
      style="display: flex; gap: 0.5rem; margin-top: 1rem; justify-content: flex-end"
    >
      <button class="btn-primary" @click="openTutor" style="background: var(--info); border-color: var(--info);">🤖 Ask Socratic Tutor</button>
      <button :disabled="saving" @click="saveProgress">Save</button>
      <button class="btn-primary" :disabled="submitting || !confidence" @click="submit">Submit Assignment</button>
    </div>

    <!-- Socratic Tutor Modal -->
    <div v-if="tutorOpen" class="modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000">
      <div class="card" style="width: 500px; max-width: 90%; background: var(--bg); display: flex; flex-direction: column; max-height: 80vh">
        <div style="display:flex; justify-content:space-between; margin-bottom:1rem">
          <h3>🤖 Socratic Tutor</h3>
          <button @click="tutorOpen = false" style="background:none; border:none; font-size:1.5rem; cursor:pointer">&times;</button>
        </div>
        <div style="flex:1; overflow-y:auto; border: 1px solid var(--border-color); padding: 1rem; margin-bottom: 1rem; border-radius: 4px; background: var(--surface)">
           <div v-for="(msg, i) in tutorMessages" :key="i" :style="{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '0.5rem' }">
              <span :style="{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '1rem', background: msg.role === 'user' ? 'var(--primary)' : 'var(--border-color)', color: msg.role === 'user' ? '#fff' : 'inherit' }">{{ msg.text }}</span>
           </div>
           <div v-if="tutorLoading" style="color: var(--text-muted); font-size: 0.9rem">Tutor is typing...</div>
        </div>
        <div style="display:flex; gap: 0.5rem">
           <input v-model="tutorInput" @keyup.enter="sendToTutor" placeholder="I'm stuck on..." style="flex:1" />
           <button class="btn-primary" @click="sendToTutor" :disabled="tutorLoading">Ask</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSubmissionsStore } from '../stores/submissions'
import { useUiStore } from '../stores/ui'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const store = useSubmissionsStore()
const uiStore = useUiStore()
const authStore = useAuthStore()

const worksheet = ref(null)
const blocks = ref([])
const answers = reactive({})
const submitted = ref(false)
const submitResult = ref({ score: 0, maxScore: 0, feedback: '' })
const saving = ref(false)
const submitting = ref(false)
const confidence = ref(null)

const tutorOpen = ref(false)
const tutorInput = ref('')
const tutorMessages = ref<{role: string, text: string}[]>([{role: 'tutor', text: 'Hi! I am your Socratic Tutor. I will not give you the answers directly, but I will help you find them yourself. What are you stuck on?'}])
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
          else if (b.type === 'matching' || b.type === 'word_scramble') answers[b.id] = {}
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

    autoSaveTimer = setInterval(saveProgress, 20000)
  } catch (e) {
    uiStore.showToast('Failed to load assignment', 'error')
  }
})

onUnmounted(() => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
})

function renderGaps(template, blockId) {
  if (!template) return ''

  let html = template
  const gaps = []
  html = html.replace(/\(\((.*?)\)\)/g, (_, answer, idx) => {
    const val = answers[blockId] || {}
    const answerText = val[idx] || ''
    gaps.push(idx)
    return `<input type='text' value='${answerText}' oninput='window.__updateGap("${blockId}", ${idx}, this.value)' style='display:inline;width:auto;min-width:80px;padding:0.2rem 0.5rem;border:1px dashed var(--primary);border-radius:4px' />`
  })

  if (typeof window !== 'undefined') {
    window.__updateGap = (id, idx, value) => {
      if (!answers[id]) answers[id] = {}
      answers[id][idx] = value
    }
  }

  return html
}

function scramble(word) {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

async function saveProgress() {
  const current = JSON.stringify(answers)
  if (current === lastSavedAnswers) return
  saving.value = true
  try {
    localStorage.setItem(`answers_${route.params.id}`, current)
    await store.saveProgress(route.params.id, { ...answers })
    lastSavedAnswers = current
  } catch {
    /* silent */
  }
  saving.value = false
}

async function submit() {
  submitting.value = true
  try {
    const result = await store.submitAssignment(route.params.id, { answers: answers, confidence: confidence.value })
    submitResult.value = result
    submitted.value = true
    if (autoSaveTimer) clearInterval(autoSaveTimer)
    localStorage.removeItem(`answers_${route.params.id}`)
    uiStore.showToast('Submitted!', 'success')
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
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      },
      body: JSON.stringify({ question, context }),
      credentials: 'include' // Since we use cookies now
    })

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader')

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\\n').filter(l => l.startsWith('data: '))
      
      for (const line of lines) {
        if (line === 'data: [DONE]') {
          break
        }
        try {
          const json = JSON.parse(line.replace('data: ', ''))
          tutorMessages.value[tutorReplyIndex].text += json.text
        } catch { /* ignore parse errors for partial chunks */ }
      }
    }
  } catch (err) {
    tutorMessages.value[tutorReplyIndex].text = "I'm having trouble connecting right now."
  } finally {
    tutorLoading.value = false
  }
}
</script>
