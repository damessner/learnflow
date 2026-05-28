<template>
  <div>
    <div v-if="!readonly">
      <template v-for="(segment, i) in segments" :key="i">
        <span v-if="segment.type === 'text'">{{ segment.text }}</span>
        <input
          v-else
          type="text"
          :value="segment.value"
          @input="onGapInput(segment.index, $event)"
          style="
            display: inline;
            width: auto;
            min-width: 80px;
            padding: 0.2rem 0.5rem;
            border: 1px dashed var(--primary);
            border-radius: 4px;
          "
        />
      </template>
    </div>
    <div v-else>{{ block.template?.replace(/\(\(.*?\)\)/g, '___') }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

const segments = computed(() => {
  const parts: { type: string; text?: string; value?: string; index?: number }[] = []
  const template = props.block?.template || ''
  let lastIndex = 0
  let idx = 0
  const regex = /\(\((.*?)\)\)/g
  let match
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: template.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'input', value: (props.modelValue || {})[idx] || '', index: idx })
    idx++
    lastIndex = regex.lastIndex
  }
  if (lastIndex < template.length) {
    parts.push({ type: 'text', text: template.slice(lastIndex) })
  }
  return parts
})

function updateGap(i: number, value: string) {
  const updated = { ...(props.modelValue || {}) }
  updated[i] = value
  emit('update:modelValue', updated)
}

function onGapInput(i: number | undefined, event: Event) {
  if (typeof i !== 'number') return
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  updateGap(i, target.value)
}
</script>
