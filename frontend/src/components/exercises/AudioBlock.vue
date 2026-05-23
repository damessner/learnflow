<template>
  <div>
    <audio v-if="block.src" :src="block.src" controls style="width:100%"></audio>
    <div v-else style="padding:2rem;text-align:center;color:var(--text-muted);border:1px dashed var(--border-color);border-radius:var(--radius-sm)">
      Audio placeholder
    </div>
    <p v-if="block.caption" style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem">{{ block.caption }}</p>
  </div>
</template>

<script setup>
defineProps({ block: Object })
</script>
