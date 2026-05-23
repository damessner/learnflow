<template>
  <div>
    <p
      style="
        font-size: 1.1rem;
        line-height: 1.8;
        background: var(--bg-main);
        padding: 1rem;
        border-radius: var(--radius-sm);
      "
    >
      {{ block.text }}
    </p>
    <button
      v-if="!readonly"
      class="btn-sm"
      :disabled="speaking"
      style="margin-top: 0.5rem"
      @click="speak"
    >
      {{ speaking ? 'Speaking...' : 'Read Aloud' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ block: Object, readonly: Boolean })
const speaking = ref(false)

function speak() {
  if (!('speechSynthesis' in window)) return
  speaking.value = true
  const utterance = new SpeechSynthesisUtterance(props.block.text)
  utterance.onend = () => {
    speaking.value = false
  }
  speechSynthesis.speak(utterance)
}
</script>
