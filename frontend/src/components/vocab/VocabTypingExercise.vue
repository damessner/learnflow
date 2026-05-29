<template>
  <div class="typing-exercise card p-4">
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-bold">📝 Schreibübung</span>
      <span class="text-xs text-secondary">Wort {{ currentIdx + 1 }} von {{ items.length }}</span>
    </div>

    <div class="progress-bar mb-3">
      <div class="progress-fill" :style="{ width: ((currentIdx + 1) / items.length * 100) + '%' }"></div>
    </div>

    <div v-if="currentItem" class="typing-question">
      <div class="word-display flex items-center gap-3 mb-3">
        <span class="text-lg font-bold">{{ currentItem.en }}</span>
        <button class="btn-icon text-lg" @click="speakWord" title="Anhören">🔊</button>
        <span v-if="currentItem.phrase" class="badge badge-phrase">🔤 Phrase</span>
      </div>

      <p class="text-sm text-secondary mb-2">Schreibe die deutsche Übersetzung:</p>

      <div class="flex items-center gap-3">
        <input
          v-model="userInput"
          placeholder="Deutsche Übersetzung..."
          class="input-field"
          :disabled="feedback !== null"
          @keyup.enter="checkAnswer"
        />
        <button class="btn-primary btn-sm" @click="checkAnswer" :disabled="!userInput.trim()">
          Prüfen
        </button>
      </div>

      <div v-if="feedback !== null" class="feedback mt-3" :class="feedback ? 'text-success' : 'text-danger'">
        <span v-if="feedback">✅ Richtig! 🎉</span>
        <span v-else>❌ Falsch. Richtige Antwort: <strong>{{ currentItem.de }}</strong></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  words: { en: string; de: string; phrase?: boolean }[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  answer: [payload: { word_en: string; word_de: string; attempted: string; correct: boolean }]
}>()

const currentIdx = ref(0)
const userInput = ref('')
const feedback = ref<boolean | null>(null)

const items = computed(() => props.words)
const currentItem = computed(() => items.value[currentIdx.value])

function checkAnswer() {
  if (!userInput.value.trim()) return
  const correctAnswers = currentItem.value.de.split('/').map((s: string) => s.trim().toLowerCase())
  const correct = correctAnswers.includes(userInput.value.trim().toLowerCase())
  feedback.value = correct
  emit('answer', {
    word_en: currentItem.value.en,
    word_de: currentItem.value.de,
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

function speakWord() {
  if ('speechSynthesis' in window && currentItem.value) {
    const utter = new SpeechSynthesisUtterance(currentItem.value.en)
    utter.lang = 'en-US'
    window.speechSynthesis.speak(utter)
  }
}

onMounted(() => { currentIdx.value = 0 })
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
.word-display {
  padding: 1rem;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  justify-content: center;
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
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}
.badge-phrase {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--warning-light);
  color: #92400e;
}
</style>
