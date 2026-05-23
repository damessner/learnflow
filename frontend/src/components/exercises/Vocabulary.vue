<template>
  <div>
    <div
      v-for="(pair, pi) in pairs"
      :key="pi"
      style="
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.25rem;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
      "
    >
      <span style="flex: 1; font-weight: 500">{{ direction === 'r2l' ? pair.r : pair.l }}</span>
      <span style="color: var(--text-muted)">→</span>
      <input
        v-if="!readonly"
        :value="(modelValue || {})[pi] || ''"
        :placeholder="direction === 'r2l' ? 'Translate to source' : 'Translate'"
        style="flex: 1"
        @input="update(pi, $event.target.value)"
      />
      <span v-else style="flex: 1">{{ (modelValue || {})[pi] || '___' }}</span>
    </div>
    <button
      v-if="!readonly"
      class="btn-sm"
      @click="$emit('update:modelValue', { completed: 'true' })"
    >
      Mark Complete
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

const pairs = computed(() => {
  const v = props.block.vocabulary
  if (Array.isArray(v)) return v
  return v?.pairs || []
})

const direction = computed(() => {
  const v = props.block.vocabulary
  return (v && typeof v === 'object' && !Array.isArray(v) && v.direction) || 'l2r'
})

function update(pi, value) {
  const updated = { ...(props.modelValue || {}) }
  updated[pi] = value
  emit('update:modelValue', updated)
}
</script>
