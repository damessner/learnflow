<template>
  <div>
    <!-- Draggable/available items pool -->
    <div
      v-if="block.items && block.items.length"
      style="
        margin-bottom: 0.75rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      "
    >
      <span style="font-size: 0.85rem; color: var(--text-muted)">Available Items:</span>
      <span
        v-for="(item, idx) in block.items"
        :key="idx"
        style="
          background: var(--primary-light);
          color: var(--primary);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 500;
          font-size: 0.85rem;
          border: 1px solid var(--primary-soft);
        "
      >
        {{ item }}
      </span>
    </div>

    <!-- Drop slots -->
    <div
      v-for="slotName in slots"
      :key="slotName"
      style="display: flex; gap: 0.75rem; margin-bottom: 0.5rem; align-items: center"
    >
      <span style="font-weight: 600; min-width: 120px; color: var(--text-main)">{{
        slotName
      }}</span>
      <span>→</span>
      <input
        v-if="!readonly"
        :value="(modelValue || {})[slotName] || ''"
        placeholder="Type/drop item here..."
        style="
          width: 180px;
          padding: 0.25rem 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        "
        @input="update(slotName, ($event.target as HTMLInputElement).value)"
      />
      <span v-else style="font-weight: 500; color: var(--primary)">{{
        (modelValue || {})[slotName] || '___'
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

const slots = computed(() => {
  if (!props.block?.answers) return []
  return Object.keys(props.block.answers)
})

function update(slotName: string, value: string) {
  const updated = { ...(props.modelValue || {}) }
  updated[slotName] = value
  emit('update:modelValue', updated)
}
</script>
