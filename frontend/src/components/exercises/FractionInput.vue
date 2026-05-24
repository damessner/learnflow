<template>
  <div>
    <p style="margin-bottom: 0.5rem">Build the fraction:</p>
    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem">
      <div style="text-align: center">
        <input
          v-if="!readonly"
          type="number"
          :value="modelValue?.numerator || ''"
          @input="update('numerator', $event.target.value)"
          style="width: 70px; text-align: center"
        />
        <span v-else>{{ modelValue?.numerator || '?' }}</span>
        <div style="border-top: 2px solid var(--text-main); margin: 0.25rem 0"></div>
        <input
          v-if="!readonly"
          type="number"
          :value="modelValue?.denominator || ''"
          @input="update('denominator', $event.target.value)"
          style="width: 70px; text-align: center"
        />
        <span v-else>{{ modelValue?.denominator || '?' }}</span>
      </div>
      <span
        v-if="block.denominator && modelValue?.denominator"
        style="font-size: 0.85rem; color: var(--text-muted)"
      >
        = {{ ((modelValue?.numerator || 0) / (modelValue?.denominator || 1)).toFixed(2) }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ block: Object, modelValue: Object, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

function update(field, value) {
  const val = { ...(props.modelValue || {}) }
  val[field] = Number(value) || 0
  emit('update:modelValue', val)
}
</script>
