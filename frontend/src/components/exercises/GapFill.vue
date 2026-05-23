<template>
  <div>
    <div v-if="!readonly" v-html="renderGaps()"></div>
    <div v-else>{{ block.template?.replace(/\(\(.*?\)\)/g, '___') }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

function renderGaps() {
  let html = props.block.template || ''
  let idx = 0
  html = html.replace(/\(\((.*?)\)\)/g, () => {
    const val = (props.modelValue || {})[idx] || ''
    const i = idx++
    return `<input type='text' value='${val}' oninput='window.__gf_${props.block.id}_update(${i}, this.value)' style='display:inline;width:auto;min-width:80px;padding:0.2rem 0.5rem;border:1px dashed var(--primary);border-radius:4px' />`
  })
  if (typeof window !== 'undefined' && props.block.id) {
    window[`__gf_${props.block.id}_update`] = (i, value) => {
      const updated = { ...(props.modelValue || {}) }
      updated[i] = value
      emit('update:modelValue', updated)
    }
  }
  return html
}
</script>
