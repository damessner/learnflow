<template>
  <div>
    <p style="margin-bottom:0.5rem">Click to plot points on the grid:</p>
    <div ref="gridRef" style="position:relative;width:100%;max-width:300px;aspect-ratio:1;border:1px solid var(--border-color);background:var(--bg-main);cursor:crosshair" @click="plotPoint">
      <div v-for="y in gridLines" :key="'h'+y" :style="{position:'absolute',left:0,top:(y/gridLines.length)*100+'%',width:'100%',height:'1px',background:'var(--border-color)',opacity:0.5}"></div>
      <div v-for="x in gridLines" :key="'v'+x" :style="{position:'absolute',top:0,left:(x/gridLines.length)*100+'%',width:'1px',height:'100%',background:'var(--border-color)',opacity:0.5}"></div>
      <div v-for="(pt, i) in userPoints" :key="'u'+i" :style="{position:'absolute',left:pt.x+'%',top:pt.y+'%',width:'12px',height:'12px',background:'var(--primary)',borderRadius:'50%',transform:'translate(-50%,-50%)'}"></div>
      <div v-for="(pt, i) in (block.points_to_plot || [])" :key="'e'+i" :style="{position:'absolute',left:calcPos(pt[0],0)+'%',top:calcPos(pt[1],1)+'%',width:'6px',height:'6px',background:'var(--success)',borderRadius:'50%',transform:'translate(-50%,-50%)',opacity:0.7}" :title="'('+pt[0]+','+pt[1]+')'"></div>
    </div>
    <button v-if="!readonly && userPoints.length" class="btn-sm" style="margin-top:0.25rem" @click="userPoints=[];emit('update:modelValue',[])">Clear</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ block: Object, modelValue: null, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])
const gridLines = Array.from({ length: 5 }, (_, i) => i + 1)
const userPoints = ref([])

function calcPos(val, axis) {
  const pts = props.block.points_to_plot || []
  if (!pts.length) return 50
  const max = Math.max(...pts.map((p) => p[axis])) + 1
  const min = Math.min(...pts.map((p) => p[axis])) - 1
  return ((val - min) / (max - min)) * 100
}

function plotPoint(e) {
  if (props.readonly) return
  const rect = e.target.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  userPoints.value.push({ x, y })
  emit('update:modelValue', userPoints.value.map((p) => [Math.round(p.x), Math.round(p.y)]))
}
</script>
