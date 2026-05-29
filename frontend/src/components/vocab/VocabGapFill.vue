<template>
  <div class="gapfill-exercise card p-4">
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-bold">🔤 Lückentext</span>
      <span class="text-xs text-secondary">Frage {{ currentIdx + 1 }} von {{ items.length }}</span>
    </div>

    <div class="progress-bar mb-3">
      <div class="progress-fill" :style="{ width: ((currentIdx + 1) / items.length * 100) + '%' }"></div>
    </div>

    <div v-if="currentItem" class="gapfill-question">
      <p class="text-base font-semibold mb-3">{{ currentItem.prompt }}</p>

      <div v-if="wordBank" class="word-bank flex flex-wrap gap-2 mb-3">
        <button
          v-for="(chip, ci) in wordBank"
          :key="ci"
          class="chip-btn"
          :disabled="usedChips.has(ci) || disabled"
          @click="selectChip(ci)"
        >{{ chip }}</button>
      </div>

      <div class="flex items-center gap-3">
        <input
          v-model="userInput"
          :placeholder="wordBank ? 'Klicke ein Wort...' : 'Tippe die Antwort...'"
          class="input-field"
          :disabled="disabled || feedback !== null"
          @keyup.enter="checkAnswer"
        />
        <button class="btn-primary btn-sm" @click="checkAnswer" :disabled="!userInput.trim() || disabled">
          Prüfen
        </button>
      </div>

      <div v-if="feedback !== null" class="feedback mt-3" :class="feedback ? 'text-success' : 'text-danger'">
        <span v-if="feedback">✅ Richtig!</span>
        <span v-else>❌ Falsch. Richtige Antwort: <strong>{{ currentItem.answer }}</strong></span>
        <p class="text-xs text-secondary mt-1">{{ currentItem.hint }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  words: { en: string; de: string; phrase?: boolean }[]
  wordBank?: string[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  answer: [payload: { word_en: string; word_de: string; attempted: string; correct: boolean }]
}>()

interface GapItem {
  prompt: string
  answer: string
  word_en: string
  word_de: string
  hint: string
}

const currentIdx = ref(0)
const userInput = ref('')
const feedback = ref<boolean | null>(null)
const usedChips = ref(new Set<number>())

const items = computed<GapItem[]>(() => {
  return props.words.map(w => ({
    prompt: `Das englische Wort für "${w.de}" ist: ___`,
    answer: w.en,
    word_en: w.en,
    word_de: w.de,
    hint: w.phrase ? '🔤 Das ist eine Phrase!' : 'Ein einzelnes Wort.'
  }))
})

const currentItem = computed(() => items.value[currentIdx.value])

function selectChip(ci: number) {
  if (props.wordBank) {
    userInput.value = props.wordBank[ci]
    usedChips.value.add(ci)
  }
}

function checkAnswer() {
  if (!userInput.value.trim()) return
  const correct = userInput.value.trim().toLowerCase() === currentItem.value.answer.toLowerCase()
  feedback.value = correct
  emit('answer', {
    word_en: currentItem.value.word_en,
    word_de: currentItem.value.word_de,
    attempted: userInput.value.trim(),
    correct
  })
  if (currentIdx.value < items.value.length - 1) {
    setTimeout(() => {
      currentIdx.value++
      userInput.value = ''
      feedback.value = null
    }, 1500)
  }
}

onMounted(() => {
  currentIdx.value = 0
})
</script>

<style scoped>
.progress-bar {
  height: 6px;
  background: var(--border-color);
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 999px;
  transition: width 0.3s;
}
.word-bank {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.chip-btn {
  padding: 0.3rem 0.7rem;
  border: 1.5px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}
.chip-btn:hover:not(:disabled) {
  border-color: var(--primary);
  background: var(--primary-light);
}
.input-field {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-sm);
  outline: none;
}
.input-field:focus {
  border-color: var(--primary);
}
.feedback {
  padding: 0.5rem;
  border-radius: var(--radius-xs);
  font-size: var(--font-size-sm);
  font-weight: 600;
}
</style>
