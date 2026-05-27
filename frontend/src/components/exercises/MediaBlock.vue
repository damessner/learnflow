<template>
  <div>
    <img
      v-if="block.src && isImage"
      :src="block.src"
      :alt="block.caption"
      style="max-width: 100%; border-radius: var(--radius-sm)"
    />
    <video
      v-else-if="block.src && isVideo"
      controls
      style="max-width: 100%; border-radius: var(--radius-sm)"
    >
      <source :src="block.src" :type="mediaMimeType" />
    </video>
    <audio v-else-if="block.src && isAudio" controls style="width: 100%">
      <source :src="block.src" :type="mediaMimeType" />
    </audio>
    <div
      v-else
      style="
        padding: 2rem;
        text-align: center;
        color: var(--text-muted);
        border: 1px dashed var(--border-color);
        border-radius: var(--radius-sm);
      "
    >
      {{ block.caption || 'Media placeholder' }}
    </div>
    <p
      v-if="block.caption"
      style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem"
    >
      {{ block.caption }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({ block: Object })

const isImage = computed(() => /\.(png|jpe?g|gif|webp|svg)/i.test(props.block.src || ''))
const isVideo = computed(() => /\.(mp4|webm|ogg)/i.test(props.block.src || ''))
const isAudio = computed(() => /\.(mp3|wav|ogg|flac)/i.test(props.block.src || ''))
const mediaMimeType = computed(() => {
  const explicit = props.block?.mime_type
  if (explicit) return explicit
  const src = String(props.block?.src || '').toLowerCase()
  if (src.endsWith('.webm')) return 'video/webm'
  if (src.endsWith('.mp4')) return 'video/mp4'
  if (src.endsWith('.wav')) return 'audio/wav'
  if (src.endsWith('.ogg')) return isVideo.value ? 'video/ogg' : 'audio/ogg'
  return 'audio/mpeg'
})
</script>
