<template>
  <div>
    <video
      v-if="block.src"
      controls
      style="max-width: 100%; border-radius: var(--radius-sm)"
    >
      <source :src="block.src" :type="mimeType" />
    </video>
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
      Video placeholder
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

const mimeType = computed(() => {
  const explicit = props.block?.mime_type
  if (explicit) return explicit
  const src = String(props.block?.src || '').toLowerCase()
  if (src.endsWith('.webm')) return 'video/webm'
  if (src.endsWith('.mov')) return 'video/quicktime'
  return 'video/mp4'
})
</script>
