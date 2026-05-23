<template>
  <div>
    <video
      v-if="block.src"
      :src="block.src"
      controls
      style="max-width: 100%; border-radius: var(--radius-sm)"
    ></video>
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
defineProps({ block: Object })
</script>
