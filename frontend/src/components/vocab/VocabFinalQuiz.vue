<template>
  <div class="final-quiz card p-4">
    <template v-if="phase === 'playing'">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-bold">🧠 Final Quiz</span>
        <span class="text-xs text-secondary">Frage {{ currentIdx + 1 }} von {{ total }}</span>
      </div>
      <div class="progress-bar mb-3">
        <div class="progress-fill" :style="{ width: ((currentIdx + 1) / total * 100) + '%' }"></div>
      </div>

      <div v-if="currentQuestion" class="quiz-question">
        <p class="text-base font-semibold mb-3">{{ currentQuestion.prompt }}</p>

        <div v-if="currentQuestion.type === 'pick'" class="flex flex-col gap-2">
          <button
            v-for="(opt, oi) in currentQuestion.options"
            :key="oi"
            class="option-btn"
            :class="{ selected: selectedOption === oi, correct: feedback && oi === currentQuestion.correctIdx, wrong: feedback && selectedOption === oi && oi !== currentQuestion.correctIdx }"
            :disabled="feedback !== null"
            @click="selectOption(oi)"
          >{{ opt }}</button>
        </div>

        <div v-else class="flex items-center gap-3">
          <input v-model="userInput" placeholder="Deine Antwort..." class="input-field" :disabled="feedback !== null" @keyup.enter="submitTextAnswer" />
          <button class="btn-primary btn-sm" @click="submitTextAnswer" :disabled="!userInput.trim()">Prüfen</button>
        </div>

        <div v-if="feedback !== null" class="feedback mt-3" :class="feedback ? 'text-success' : 'text-danger'">
          <span v-if="feedback">✅ Richtig!</span>
          <span v-else>❌ Falsch. Richtige Antwort: <strong>{{ currentQuestion.answer }}</strong></span>
          <button class="btn-sm btn-secondary ml-3" @click="nextQuestion">Weiter ➔</button>
        </div>
      </div>
    </template>

    <template v-if="phase === 'result'">
      <div class="text-center py-6 flex flex-col items-center gap-4">
        <span class="text-5xl">🏆</span>
        <h3>Quiz abgeschlossen!</h3>
        <div class="grade-symbol large" :class="gradeClass">{{ gradeLetter }}</div>
        <p class="text-sm">Punkte: <strong>{{ score }}</strong> / {{ total }} richtig ({{ Math.round(score / total * 100) }}%)</p>
        <button class="btn-success" @click="$emit('complete', { score, maxScore: total, grade: gradeLetter, results })">
          Fertig 🎉
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  words: { en: string; de: string; phrase?: boolean }[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  complete: [payload: { score: number; maxScore: number; grade: string; results: { word_en: string; word_de: string; correct: boolean }[] }]
}>()

type QuizQ = { prompt: string; type: 'pick' | 'type'; answer: string; options?: string[]; correctIdx?: number; word_en: string; word_de: string }

function shuffle<T>(a: T[]): T[] {
  const arr = [...a]; for (let i = arr.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] } return arr
}

const phase = ref<'playing' | 'result'>('playing')
const currentIdx = ref(0)
const userInput = ref('')
const selectedOption = ref<number | null>(null)
const feedback = ref<boolean | null>(null)
const results = ref<{ word_en: string; word_de: string; correct: boolean }[]>([])
const score = ref(0)

const questions = computed<QuizQ[]>(() => {
  const qs: QuizQ[] = []
  const w = shuffle(props.words)
  for (let i = 0; i < w.length; i++) {
    if (i % 3 === 0) {
      const distractors = shuffle(props.words.filter(x => x.en !== w[i].en)).slice(0, 3).map(x => x.de)
      const options = shuffle([w[i].de, ...distractors])
      qs.push({ prompt: `Was bedeutet "${w[i].en}" auf Deutsch?`, type: 'pick', answer: w[i].de, options, correctIdx: options.indexOf(w[i].de), word_en: w[i].en, word_de: w[i].de })
    } else if (i % 3 === 1) {
      qs.push({ prompt: `Schreibe das deutsche Wort für: "${w[i].en}"`, type: 'type', answer: w[i].de, word_en: w[i].en, word_de: w[i].de })
    } else {
      qs.push({ prompt: `Was bedeutet "${w[i].de}" auf Englisch?`, type: 'type', answer: w[i].en, word_en: w[i].en, word_de: w[i].de })
    }
  }
  return qs
})

const currentQuestion = computed(() => questions.value[currentIdx.value])
const total = computed(() => questions.value.length)
const gradeLetter = computed(() => {
  const pct = score.value / total.value * 100
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
})
const gradeClass = computed(() => `grade-${gradeLetter.value.toLowerCase()}`)

function selectOption(idx: number) {
  if (feedback.value !== null) return
  selectedOption.value = idx
  const correct = idx === currentQuestion.value.correctIdx
  if (correct) score.value++
  feedback.value = correct
  results.value.push({ word_en: currentQuestion.value.word_en, word_de: currentQuestion.value.word_de, correct })
}

function submitTextAnswer() {
  if (!userInput.value.trim()) return
  const correctAns = currentQuestion.value.answer.split('/').map(s => s.trim().toLowerCase())
  const correct = correctAns.includes(userInput.value.trim().toLowerCase())
  if (correct) score.value++
  feedback.value = correct
  results.value.push({ word_en: currentQuestion.value.word_en, word_de: currentQuestion.value.word_de, correct })
  userInput.value = ''
}

function nextQuestion() {
  if (currentIdx.value < total.value - 1) {
    currentIdx.value++
    feedback.value = null
    selectedOption.value = null
    userInput.value = ''
  } else {
    phase.value = 'result'
  }
}
</script>

<style scoped>
.progress-bar { height: 6px; background: var(--border-color); border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--primary); border-radius: 999px; transition: width 0.3s; }
.option-btn { padding: 0.6rem 0.8rem; border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-card); text-align: left; cursor: pointer; font-size: var(--font-size-sm); transition: all 0.2s; }
.option-btn:hover:not(:disabled) { background: var(--bg-hover); border-color: var(--primary); }
.option-btn.selected { border-color: var(--primary); background: var(--primary-light); }
.option-btn.correct { border-color: var(--success); background: var(--success-light); }
.option-btn.wrong { border-color: var(--danger); background: var(--danger-light); }
.option-btn:disabled { cursor: default; }
.input-field { flex: 1; padding: 0.5rem 0.75rem; border: 2px solid var(--border-color); border-radius: var(--radius-xs); font-size: var(--font-size-sm); outline: none; }
.input-field:focus { border-color: var(--primary); }
.feedback { padding: 0.5rem; border-radius: var(--radius-xs); font-size: var(--font-size-sm); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
.grade-symbol.large { width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 2.5rem; border: 4px solid currentColor; }
.grade-a { color: var(--success); }
.grade-b { color: var(--info); }
.grade-c { color: var(--warning); }
.grade-d { color: #f97316; }
.grade-f { color: var(--danger); }
</style>
