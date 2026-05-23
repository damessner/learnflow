<template>
  <div>
    <div
      v-for="(item, ii) in block.items || []"
      :key="ii"
      style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem"
    >
      <span
        style="
          background: var(--primary-light);
          color: #fff;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          cursor: grab;
        "
        >{{ item }}</span
      >
      <span>→</span>
      <input
        v-if="!readonly"
        :value="(modelValue || {})[ii] || ''"
        placeholder="Drop slot"
        style="width: 150px"
        @input="update(ii, $event.target.value)"
      />
      <span v-else>{{ (modelValue || {})[ii] || '___' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

function update(ii, value) {
  const updated = { ...(props.modelValue || {}) }
  updated[ii] = value
  emit('update:modelValue', updated)
}
</script>
