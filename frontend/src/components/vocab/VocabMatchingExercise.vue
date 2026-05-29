<template>
  <div class="matching-exercise card p-4">
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm font-bold">🎯 Verbinde: {{ matched }} / {{ total }} passen</span>
      <span class="text-xs text-secondary">Klicke links ein Wort, dann rechts die passende Übersetzung</span>
    </div>
    <div class="matching-columns">
      <div class="column-left">
        <button
          v-for="(w, i) in leftWords"
          :key="'l'+i"
          class="match-btn"
      :class="{ selected: selectedLeft === i, matched: w._matched, wrong: w._wrong }"
      :disabled="w._matched || props.disabled"
          @click="selectLeft(i)"
        >{{ w.en }} <span v-if="w.phrase" class="text-xs">🔤</span></button>
      </div>
      <div class="column-right">
        <button
          v-for="(w, i) in rightWords"
          :key="'r'+i"
          class="match-btn"
          :class="{ selected: selectedRight === i, matched: w._matched, wrong: w._wrong }"
          :disabled="w._matched || disabled"
          @click="selectRight(i)"
        >{{ w.de }} <span v-if="w.phrase" class="text-xs">🔤</span></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps<{
  words: { en: string; de: string; phrase?: boolean }[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  complete: [payload: { word_en: string; word_de: string; correct: boolean }]
}>()

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface MatchWord extends Record<string, unknown> {
  en: string; de: string; phrase?: boolean; _matched?: boolean; _wrong?: boolean; _id: number
}

const rawLeft = ref<MatchWord[]>([])
const rawRight = ref<MatchWord[]>([])
const selectedLeft = ref<number | null>(null)
const selectedRight = ref<number | null>(null)

const leftWords = computed(() => rawLeft.value)
const rightWords = computed(() => rawRight.value)
const matched = computed(() => leftWords.value.filter(w => w._matched).length)
const total = computed(() => props.words.length)

onMounted(() => {
  const left = shuffle(props.words.map((w, i) => ({ ...w, _id: i })))
  const right = shuffle(props.words.map((w, i) => ({ ...w, _id: i })))
  rawLeft.value = left
  rawRight.value = right
})

function selectLeft(idx: number) {
  if (props.disabled) return
  selectedLeft.value = idx
  tryMatch()
}
function selectRight(idx: number) {
  if (props.disabled) return
  selectedRight.value = idx
  tryMatch()
}
function tryMatch() {
  if (selectedLeft.value === null || selectedRight.value === null) return
  const l = leftWords.value[selectedLeft.value]
  const r = rightWords.value[selectedRight.value]
  const correct = l._id === r._id
  if (correct) {
    l._matched = true
    r._matched = true
    emit('complete', { word_en: l.en, word_de: l.de, correct: true })
  } else {
    l._wrong = true
    r._wrong = true
    emit('complete', { word_en: l.en, word_de: r.de, correct: false })
    setTimeout(() => { l._wrong = false; r._wrong = false }, 600)
  }
  selectedLeft.value = null
  selectedRight.value = null
}
</script>

<style scoped>
.matching-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.column-left, .column-right {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.match-btn {
  padding: 0.6rem 0.8rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  text-align: left;
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all 0.2s;
}
.match-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--primary);
}
.match-btn.selected {
  border-color: var(--primary);
  background: var(--primary-light);
}
.match-btn.matched {
  border-color: var(--success);
  background: var(--success-light);
  opacity: 0.7;
}
.match-btn.wrong {
  border-color: var(--danger);
  background: var(--danger-light);
  animation: shake 0.3s;
}
@keyframes shake {
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
