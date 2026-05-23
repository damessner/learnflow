<template>
  <div class="page">
    <h2>Student Dashboard</h2>

    <div style="display:flex;gap:1rem;margin:1rem 0">
      <div style="flex:1;">
        <div class="form-group">
          <label>Join Class by Code</label>
          <div style="display:flex;gap:0.5rem">
            <input v-model="classCode" placeholder="Enter class code" />
            <button class="btn-primary" @click="joinClass" :disabled="joining">Join</button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top:1rem">
      <div class="card">
        <h3>My Classes</h3>
        <div v-if="myClasses.length === 0" style="color:var(--text-muted)">No classes yet</div>
        <div v-for="c in myClasses" :key="c.id" style="padding:0.5rem 0;border-bottom:1px solid var(--border-color)">
          <strong>{{ c.name }}</strong>
          <span class="badge" style="margin-left:0.5rem">{{ c.class_code }}</span>
        </div>
      </div>

      <div class="card">
        <h3>Announcements</h3>
        <div v-if="announcements.length === 0" style="color:var(--text-muted)">No announcements</div>
        <div v-for="a in announcements" :key="a.id" style="padding:0.5rem 0;border-bottom:1px solid var(--border-color)">
          <strong>{{ a.title }}</strong>
          <p style="font-size:0.85rem;color:var(--text-muted)">{{ a.content }}</p>
        </div>
      </div>

      <div class="card">
        <h3>My Submissions</h3>
        <div v-if="submissions.length === 0" style="color:var(--text-muted)">No submissions yet</div>
        <div v-for="s in submissions" :key="s.id" style="padding:0.5rem 0;border-bottom:1px solid var(--border-color)">
          <strong>{{ s.worksheet_title }}</strong>
          <span v-if="s.score != null" class="badge">{{ s.score }}/{{ s.max_score }}</span>
          <span v-else style="color:var(--warning);font-size:0.8rem">Not submitted</span>
        </div>
      </div>

      <div class="card">
        <h3>Courses</h3>
        <div v-if="courses.length === 0" style="color:var(--text-muted)">No courses assigned</div>
        <div v-for="c in courses" :key="c.id" style="padding:0.5rem 0;border-bottom:1px solid var(--border-color)">
          <router-link :to="`/student/course/${c.id}`">{{ c.name }}</router-link>
        </div>
      </div>

      <div class="card" v-if="gamification">
        <h3>Progress</h3>
        <p>XP: <strong>{{ gamification.xp }}</strong> | Level: <strong>{{ gamification.level }}</strong></p>
        <p>Streak: <strong>{{ gamification.streak_days }}</strong> days</p>
        <div v-if="gamification.badges.length" style="margin-top:0.5rem">
          <span v-for="b in gamification.badges" :key="b" class="badge" style="margin-right:0.25rem">{{ b }}</span>
        </div>
      </div>

      <div class="card">
        <h3>Mastery Map</h3>
        <div v-for="m in masteryList" :key="m.id" style="display:flex;align-items:center;gap:0.5rem;padding:0.25rem 0">
          <span style="flex:1">{{ m.topic }}</span>
          <div style="width:100px;height:8px;background:var(--border-color);border-radius:4px;overflow:hidden">
            <div :style="{ width: m.mastery_level + '%', background: 'var(--primary)', height:'100%' }"></div>
          </div>
          <span style="font-size:0.8rem">{{ m.mastery_level }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useClassesStore } from '../stores/classes'
import { useSubmissionsStore } from '../stores/submissions'
import { useCoursesStore } from '../stores/courses'
import { useLearningStore } from '../stores/learning'
import { useUiStore } from '../stores/ui'

const classesStore = useClassesStore()
const submissionsStore = useSubmissionsStore()
const coursesStore = useCoursesStore()
const learningStore = useLearningStore()
const uiStore = useUiStore()

const myClasses = ref([])
const announcements = ref([])
const submissions = ref([])
const courses = ref([])
const gamification = ref(null)
const masteryList = ref([])
const classCode = ref('')
const joining = ref(false)

onMounted(async () => {
  try {
    const [status, ann, summ, gam, mast] = await Promise.all([
      classesStore.fetchStudentStatus().catch(() => ({ classes: [] })),
      classesStore.fetchAnnouncements().catch(() => []),
      submissionsStore.fetchStudentSummary().catch(() => []),
      learningStore.fetchGamification().catch(() => null),
      learningStore.fetchMastery().catch(() => []),
    ])

    myClasses.value = status.classes || []
    announcements.value = ann || []
    submissions.value = submissionsStore.summary
    gamification.value = learningStore.gamification
    masteryList.value = learningStore.mastery

    const courseData = await coursesStore.fetchStudentCourses().catch(() => ({ courses: [] }))
    courses.value = coursesStore.courses
  } catch { /* */ }
})

async function joinClass() {
  if (!classCode.value.trim()) return
  joining.value = true
  try {
    await classesStore.joinClass(classCode.value.trim())
    uiStore.showToast('Joined class!', 'success')
    classCode.value = ''
    const status = await classesStore.fetchStudentStatus()
    myClasses.value = status.classes || []
  } catch (e) {
    uiStore.showToast(e.message, 'error')
  } finally {
    joining.value = false
  }
}
</script>
