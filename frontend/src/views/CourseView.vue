<template>
  <div class="page">
    <div v-if="course">
      <h2>{{ course.name }}</h2>
      <p style="color: var(--text-muted)">{{ course.description }}</p>

      <div v-if="progress" class="card" style="margin: 1rem 0">
        <strong>Progress: {{ progress.completed }} / {{ progress.total }} worksheets</strong>
      </div>

      <div v-for="ws in worksheets" :key="ws.id" class="card" style="margin-bottom: 0.5rem">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div>
            <strong>{{ ws.title }}</strong>
            <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 0.5rem">{{
              ws.subject
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCoursesStore } from '../stores/courses'

const route = useRoute()
const store = useCoursesStore()
const course = ref(null)
const worksheets = ref([])
const progress = ref(null)

onMounted(async () => {
  try {
    const _data = await store.fetchCourse(route.params.id)
    const courseData = store.currentCourse
    course.value = courseData.course
    worksheets.value = courseData.worksheets || []
    progress.value = courseData.progress || null
  } catch {
    /* */
  }
})
</script>
