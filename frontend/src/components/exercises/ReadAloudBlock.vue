<template>
  <div>
    <p
      style="
        font-size: 1.1rem;
        line-height: 1.8;
        background: var(--bg-main);
        padding: 1rem;
        border-radius: var(--radius-sm);
        margin-bottom: 0.5rem;
      "
    >
      {{ block.text }}
    </p>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
      <button v-if="!readonly" class="btn-sm" :disabled="speaking" @click="speak">
        {{ speaking ? 'Speaking...' : ' Listen' }}
      </button>
      <button v-if="!readonly && !recording" class="btn-sm" @click="startRecord">Record</button>
      <button v-if="recording" class="btn-sm btn-danger" @click="stopRecord">Stop</button>
      <audio
        v-if="audioUrl"
        :src="audioUrl"
        controls
        style="height: 32px; max-width: 300px"
      ></audio>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
const props = defineProps({ block: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])
const speaking = ref(false)
const recording = ref(false)
const audioUrl = ref(null)
let mediaRecorder = null
let chunks = []

onUnmounted(() => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
})

function speak() {
  if (!('speechSynthesis' in window)) return
  speaking.value = true
  const utterance = new SpeechSynthesisUtterance(props.block.text)
  utterance.onend = () => {
    speaking.value = false
  }
  speechSynthesis.speak(utterance)
}

async function startRecord() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    chunks = []
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      audioUrl.value = URL.createObjectURL(blob)
      emit('update:modelValue', { recorded: true, blobUrl: audioUrl.value })
    }
    mediaRecorder.start()
    recording.value = true
  } catch {
    /* mic denied */
  }
}

function stopRecord() {
  if (mediaRecorder) {
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach((t) => t.stop())
  }
  recording.value = false
}
</script>
