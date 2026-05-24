<template>
  <div>
    <p style="margin-bottom: 0.5rem">
      Calculate: <strong>{{ block.operand1 ?? 0 }} {{ opSymbol }} {{ block.operand2 ?? 0 }}</strong>
    </p>
    <input
      v-if="!readonly"
      type="number"
      :value="modelValue || ''"
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="Result"
      style="font-family: monospace; font-size: 1.1rem; max-width: 150px"
    />
    <p v-else style="font-size: 1.1rem">{{ modelValue || '___' }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ block: Object, modelValue: null, readonly: Boolean })
defineEmits(['update:modelValue'])

const opSymbol = computed(() => {
  const map = { add: '+', subtract: '−', multiply: '×', divide: '÷' }
  return map[props.block.operation] || '+'
})
</script>
