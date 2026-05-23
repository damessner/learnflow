<template>
  <div>
    <label
      v-for="(opt, oi) in block.options || []"
      :key="oi"
      style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0"
    >
      <input
        type="checkbox"
        :value="oi"
        :checked="(modelValue || []).includes(oi)"
        :disabled="readonly"
        @change="toggle(oi)"
      />
      {{ opt }}
    </label>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ block: Object, modelValue: Array, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])

function toggle(oi) {
  const val = props.modelValue || []
  const updated = val.includes(oi) ? val.filter((v) => v !== oi) : [...val, oi]
  emit('update:modelValue', updated)
}
</script>
