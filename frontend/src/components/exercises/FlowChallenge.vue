<template>
  <div>
    <p style="color: var(--text-muted)">Flow challenge: interactive activity</p>
    <input
      v-if="!readonly"
      type="number"
      :value="modelValue || 0"
      placeholder="Score"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-else>{{ modelValue || 0 }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({ block: Object, modelValue: null, readonly: Boolean })
defineEmits(['update:modelValue'])
</script>
