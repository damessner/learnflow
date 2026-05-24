<template>
  <div>
    <p v-if="block.equation" style="margin-bottom:0.5rem">
      Solve: <strong>{{ block.equation.replace(/\*/g, '×') }}</strong>
    </p>
    <input
      v-if="!readonly"
      :value="modelValue || ''"
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="Enter your answer..."
      style="font-family:monospace;font-size:1.1rem"
    />
    <p v-else style="font-size:1.1rem;font-family:monospace">
      {{ modelValue || '___' }}
    </p>
  </div>
</template>

<script setup>
defineProps({ block: Object, modelValue: null, readonly: Boolean })
defineEmits(['update:modelValue'])
</script>
