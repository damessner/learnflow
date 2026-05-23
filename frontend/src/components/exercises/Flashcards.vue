<template>
  <div>
    <div
      v-for="(card, ci) in block.cards || []"
      :key="ci"
      style="
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        margin-bottom: 0.25rem;
      "
    >
      <strong>Front:</strong> {{ card.front }} <br /><strong>Back:</strong> {{ card.back }}
      <br v-if="!readonly" />
      <button v-if="!readonly" class="btn-sm" @click="markCompleted">Mark Completed</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({ block: Object, modelValue: null, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])
function markCompleted() {
  emit('update:modelValue', 'completed')
}
</script>
