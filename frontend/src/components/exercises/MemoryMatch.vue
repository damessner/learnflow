<template>
  <div>
    <div class="grid grid-2">
      <div v-for="(pair, pi) in (block.pairs || [])" :key="pi" class="card" style="padding:0.5rem;cursor:pointer;text-align:center"
        :style="{ background: selected.includes(pi) ? 'var(--primary-light)' : '' }"
        @click="select(pi)">
        {{ showBack ? pair.b : pair.a }}
      </div>
    </div>
    <button v-if="!readonly" class="btn-sm" style="margin-top:0.5rem" @click="showBack = !showBack">Flip</button>
    <button v-if="!readonly" class="btn-sm" style="margin-top:0.5rem;margin-left:0.5rem" @click="$emit('update:modelValue', 'completed')">Completed</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ block: Object, modelValue: null, readonly: Boolean })
defineEmits(['update:modelValue'])
const selected = ref([])
const showBack = ref(false)
function select(pi) {
  if (selected.value.includes(pi)) selected.value = selected.value.filter((v) => v !== pi)
  else selected.value = [...selected.value, pi]
}
</script>
