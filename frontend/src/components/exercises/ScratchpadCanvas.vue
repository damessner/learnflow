<template>
  <div>
    <canvas ref="canvas" width="400" height="300" style="border:1px solid var(--border-color);border-radius:var(--radius-sm);cursor:crosshair;max-width:100%"></canvas>
    <div style="margin-top:0.25rem">
      <button class="btn-sm" @click="clear">Clear</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const canvas = ref(null)
let ctx = null
let drawing = false

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  canvas.value.addEventListener('mousedown', startDraw)
  canvas.value.addEventListener('mousemove', draw)
  canvas.value.addEventListener('mouseup', stopDraw)
  canvas.value.addEventListener('mouseleave', stopDraw)
})

function startDraw(e) {
  drawing = true
  ctx.beginPath()
  ctx.moveTo(e.offsetX, e.offsetY)
}

function draw(e) {
  if (!drawing) return
  ctx.lineTo(e.offsetX, e.offsetY)
  ctx.strokeStyle = '#4f46e5'
  ctx.lineWidth = 2
  ctx.stroke()
}

function stopDraw() { drawing = false }
function clear() { if (ctx) ctx.clearRect(0, 0, 400, 300) }
</script>
