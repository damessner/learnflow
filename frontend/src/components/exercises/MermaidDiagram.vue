<template>
  <div class="mermaid-wrapper">
    <div v-if="error" class="mermaid-error">
      <p style="color: var(--danger); font-size: 0.85rem; margin-bottom: 0.25rem">
        Diagram failed to render
      </p>
      <pre
        style="
          font-size: 0.75rem;
          opacity: 0.7;
          padding: 0.5rem;
          background: var(--bg-main);
          border-radius: 4px;
          overflow-x: auto;
        "
        >{{ code }}</pre
      >
    </div>
    <div ref="diagramEl" v-show="!error" style="display: flex; justify-content: center"></div>
    <p
      v-if="altText"
      style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; text-align: center"
    >
      {{ altText }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
})

const props = defineProps({
  code: { type: String, default: '' },
  altText: { type: String, default: '' },
})
const diagramEl = ref(null)
const error = ref(false)

async function render() {
  if (!props.code || !diagramEl.value) return
  error.value = false
  try {
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2)}`
    const { svg } = await mermaid.render(id, props.code)
    diagramEl.value.innerHTML = svg
  } catch {
    error.value = true
  }
}

onMounted(render)
watch(() => props.code, render)
</script>

<style scoped>
.mermaid-wrapper {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--bg-main);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}
.mermaid-error {
  padding: 0.5rem;
}
</style>
