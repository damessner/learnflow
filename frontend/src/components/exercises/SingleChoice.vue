<template>
  <div>
    <label v-for="(opt, oi) in (block.options || [])" :key="oi" style="display:flex;align-items:center;gap:0.5rem;padding:0.25rem 0">
      <input type="radio" :value="oi" :checked="modelValue === oi" @change="$emit('update:modelValue', oi)" :disabled="readonly" :name="block.id" />
      {{ opt }}
    </label>
  </div>
</template>

<script setup>
defineProps({ block: Object, modelValue: null, readonly: Boolean })
defineEmits(['update:modelValue'])
</script>
