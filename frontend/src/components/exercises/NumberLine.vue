<template>
  <div>
    <p style="margin-bottom: 0.5rem">
      Click where the number <strong>{{ Math.round(marker) }}</strong> belongs on the number line:
    </p>
    <div style="display: flex; align-items: center; gap: 0.5rem">
      <span style="font-weight: 600">{{ block.min_value ?? 0 }}</span>
      <div
        ref="lineRef"
        style="
          flex: 1;
          height: 40px;
          position: relative;
          background: var(--bg-main);
          border-radius: 4px;
          cursor: pointer;
        "
        @click="clickLine"
      >
        <div
          v-for="(m, i) in block.markers || []"
          :key="i"
          :style="{
            position: 'absolute',
            left: calcPos(m) + '%',
            top: '-4px',
            width: '8px',
            height: '48px',
            background: m === marker ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: '4px',
            zIndex: 2,
          }"
        ></div>
        <div
          v-if="userPos != null"
          :style="{
            position: 'absolute',
            left: userPos + '%',
            top: '8px',
            width: '24px',
            height: '24px',
            background: 'var(--danger)',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
          }"
        ></div>
      </div>
      <span style="font-weight: 600">{{ block.max_value ?? 100 }}</span>
    </div>
    <p v-if="userPos != null" style="margin-top: 0.25rem; font-size: 0.85rem">
      Your value: ~{{ userValue }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ block: Object, modelValue: null, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])
const userPos = ref(null)
const userValue = computed(() => {
  if (userPos.value == null) return null
  const min = props.block.min_value ?? 0
  const max = props.block.max_value ?? 100
  return Math.round(min + (userPos.value / 100) * (max - min))
})
const marker = computed(() => (props.block.markers || [])[0])

function calcPos(val) {
  const min = props.block.min_value ?? 0
  const max = props.block.max_value ?? 100
  return ((val - min) / (max - min)) * 100
}

function clickLine(e) {
  if (props.readonly) return
  const rect = e.target.getBoundingClientRect()
  const pos = ((e.clientX - rect.left) / rect.width) * 100
  userPos.value = pos
  emit('update:modelValue', userValue.value)
}
</script>
