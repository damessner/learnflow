<template>
  <div class="flashcard-wrapper" :class="{ flipped: isFlipped }" @click="handleFlip">
    <div class="flashcard-inner">
      <div class="flashcard-front card">
        <span class="flashcard-emoji">📖</span>
        <span class="flashcard-word">{{ word.en }}</span>
        <span v-if="word.phrase" class="badge badge-phrase">🔤 Phrase</span>
      </div>
      <div class="flashcard-back card">
        <span class="flashcard-emoji">🌍</span>
        <span class="flashcard-word">{{ word.de }}</span>
        <span v-if="word.phrase" class="badge badge-phrase">🔤 Phrase</span>
      </div>
    </div>
    <button
      class="known-toggle btn-sm"
      :class="{ known }"
      @click.stop="toggleKnown"
      :disabled="disabled"
    >
      {{ known ? '✅ Bekannt' : '⭕ Unbekannt' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  word: { en: string; de: string; phrase?: boolean }
  known?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  flip: []
  'known-changed': [value: boolean]
}>()

const isFlipped = ref(false)

function handleFlip() {
  if (props.disabled) return
  isFlipped.value = !isFlipped.value
  emit('flip')
}

function toggleKnown() {
  if (props.disabled) return
  emit('known-changed', !props.known)
}
</script>

<style scoped>
.flashcard-wrapper {
  perspective: 800px;
  width: 260px;
  height: 180px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
  transform-style: preserve-3d;
}
.flipped .flashcard-inner {
  transform: rotateY(180deg);
}
.flashcard-front,
.flashcard-back {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  backface-visibility: hidden;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.flashcard-back {
  transform: rotateY(180deg);
  background: var(--primary-light);
}
.flashcard-emoji {
  font-size: 1.8rem;
}
.flashcard-word {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  text-align: center;
  padding: 0 0.5rem;
}
.badge-phrase {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--warning-light);
  color: #92400e;
}
.known-toggle {
  padding: 0.35rem 0.8rem;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border-color);
  background: var(--bg-card);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}
.known-toggle.known {
  border-color: var(--success);
  background: var(--success-light);
  color: var(--success);
}
</style>
