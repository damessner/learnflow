<template>
  <div>
    <div
      v-for="(pair, pi) in block.pairs || []"
      :key="pi"
      style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem"
    >
      <span style="min-width: 120px">{{ pair[0] }}</span>
      <input
        v-if="!readonly"
        :value="(modelValue || {})[pi] || ''"
        style="flex: 1"
        @input="update(pi, $event.target.value)"
      />
      <span v-else style="flex: 1; color: var(--text-muted)">{{
        (modelValue || {})[pi] || '___'
      }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

function update(pi, value) {
  const updated = { ...(props.modelValue || {}) }
  updated[pi] = value
  emit('update:modelValue', updated)
}
</script>
