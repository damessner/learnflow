<template>
  <div class="page">
    <div v-if="course">
      <!-- Premium Glassmorphism Course Header Card -->
      <div
        class="card"
        style="
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          color: white;
          border: none;
          padding: 2.5rem;
          margin-bottom: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
        "
      >
        <!-- Background decorative blobs -->
        <div
          style="
            position: absolute;
            top: -50px;
            right: -50px;
            width: 200px;
            height: 200px;
            background: rgba(99, 102, 241, 0.15);
            filter: blur(40px);
            border-radius: 50%;
          "
        ></div>

        <div style="position: relative; z-index: 1">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              flex-wrap: wrap;
              gap: 1rem;
            "
          >
            <div>
              <span
                class="badge"
                style="background: rgba(255, 255, 255, 0.2); color: #fff; margin-bottom: 0.75rem"
                >Course</span
              >
              <h2
                style="
                  font-size: 2.5rem;
                  font-weight: 800;
                  margin-bottom: 0.5rem;
                  letter-spacing: -0.025em;
                  line-height: 1.2;
                "
              >
                {{ course.name }}
              </h2>
              <p style="color: #cbd5e1; font-size: 1.1rem; max-width: 600px">
                {{ course.description }}
              </p>
            </div>

            <!-- Course Badge Display -->
            <div
              v-if="course.badge_name"
              style="
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--radius-lg);
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                backdrop-filter: blur(10px);
              "
            >
              <span style="font-size: 2.5rem; filter: drop-shadow(0 0 8px #fbbf24)">🏆</span>
              <div>
                <span
                  style="
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                  "
                >
                  Reward Badge
                </span>
                <strong style="font-size: 1.05rem; color: #fbbf24">{{ course.badge_name }}</strong>
              </div>
            </div>
          </div>

          <!-- Course Progress and Metadata -->
          <div
            style="
              margin-top: 2rem;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              padding-top: 1.5rem;
              display: flex;
              flex-wrap: wrap;
              gap: 2rem;
            "
          >
            <div v-if="course.deadline">
              <span
                style="
                  display: block;
                  font-size: 0.8rem;
                  color: #94a3b8;
                  text-transform: uppercase;
                  font-weight: 600;
                "
                >Course Deadline</span
              >
              <strong style="font-size: 1.1rem; color: #f87171">{{
                new Date(course.deadline).toLocaleDateString()
              }}</strong>
            </div>
            <div>
              <span
                style="
                  display: block;
                  font-size: 0.8rem;
                  color: #94a3b8;
                  text-transform: uppercase;
                  font-weight: 600;
                "
                >Unlock Threshold</span
              >
              <strong style="font-size: 1.1rem; color: #818cf8"
                >{{ course.unlock_threshold || 60 }}% Correct</strong
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Celebratory Completion Banner -->
      <div
        v-if="courseCompleted"
        class="card"
        style="
          background: linear-gradient(135deg, #15803d, #166534);
          color: white;
          border: none;
          padding: 1.5rem 2rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          box-shadow: 0 10px 15px -3px rgba(22, 101, 52, 0.3);
          border-radius: var(--radius-lg);
          animation: bounce 1s ease infinite alternate;
        "
      >
        <span style="font-size: 3rem; filter: drop-shadow(0 0 8px #fff)">🎉</span>
        <div>
          <h3 style="margin: 0; font-size: 1.3rem; font-weight: 800">Course Fully Completed!</h3>
          <p style="margin: 0.25rem 0 0 0; color: #dcfce7; font-size: 0.95rem">
            Congratulations! You've mastered all topics.
            <span v-if="course.badge_name" style="font-weight: 700; color: #fef08a">
              The "{{ course.badge_name }}" badge has been added to your profile! (+100 XP)
            </span>
          </p>
        </div>
      </div>

      <!-- Course Progress Track -->
      <div v-if="progress" class="card" style="margin-bottom: 2rem; padding: 1.5rem">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
          "
        >
          <h3 style="margin: 0; font-size: 1.15rem">Your Learning Journey</h3>
          <span style="font-weight: 700; color: var(--primary)">
            {{ progress.completed }} / {{ progress.total }} Completed
          </span>
        </div>
        <div
          style="
            width: 100%;
            height: 12px;
            background: var(--border-color);
            border-radius: 6px;
            overflow: hidden;
            position: relative;
          "
        >
          <div
            :style="{
              width: (progress.total > 0 ? (progress.completed / progress.total) * 100 : 0) + '%',
              background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
              height: '100%',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }"
          ></div>
        </div>
      </div>

      <!-- Worksheets Flow Sequence -->
      <h3 style="margin-bottom: 1rem; font-weight: 700; font-size: 1.3rem">Worksheet Modules</h3>
      <div
        v-for="(ws, idx) in worksheets"
        :key="ws.id"
        class="card"
        style="
          margin-bottom: 1rem;
          transition: all 0.3s ease;
          border-left: 5px solid;
          position: relative;
        "
        :style="{
          opacity: ws.is_locked ? 0.7 : 1,
          borderLeftColor: ws.is_completed
            ? 'var(--success)'
            : ws.is_locked
              ? 'var(--border-color)'
              : 'var(--primary)',
          boxShadow: ws.is_locked ? 'none' : 'var(--shadow-sm)',
        }"
      >
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
          "
        >
          <div style="flex: 1; min-width: 250px">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem">
              <span
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 28px;
                  height: 28px;
                  border-radius: 50%;
                  font-weight: 700;
                  font-size: 0.85rem;
                "
                :style="{
                  background: ws.is_completed
                    ? 'rgba(34, 197, 94, 0.15)'
                    : ws.is_locked
                      ? 'var(--border-color)'
                      : 'rgba(79, 70, 229, 0.15)',
                  color: ws.is_completed
                    ? 'var(--success)'
                    : ws.is_locked
                      ? 'var(--text-muted)'
                      : 'var(--primary)',
                }"
              >
                {{ idx + 1 }}
              </span>
              <strong style="font-size: 1.15rem">{{ ws.title }}</strong>
              <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 0.25rem">
                ({{ ws.subject || 'General' }})
              </span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.75rem">
              {{ ws.description || 'No description available for this module.' }}
            </p>

            <!-- Metadata Row -->
            <div
              style="
                display: flex;
                flex-wrap: wrap;
                gap: 1.5rem;
                font-size: 0.8rem;
                color: var(--text-muted);
              "
            >
              <span v-if="ws.deadline">
                📅 Deadline: <strong>{{ new Date(ws.deadline).toLocaleDateString() }}</strong>
              </span>
              <span>
                🎯 Unlock Next Threshold: <strong>{{ ws.unlock_threshold }}%</strong>
              </span>
              <span v-if="ws.best_score != null || ws.is_completed">
                🏆 Best Attempt:
                <strong :style="{ color: ws.is_completed ? 'var(--success)' : 'var(--danger)' }">
                  {{ ws.best_score }} / {{ ws.max_score }} ({{
                    Math.round((ws.best_score / (ws.max_score || 1)) * 100) || 0
                  }}%)
                </strong>
              </span>
            </div>
          </div>

          <!-- Actions and lock states -->
          <div style="display: flex; align-items: center; gap: 1rem">
            <!-- Locked State -->
            <div
              v-if="ws.is_locked"
              style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: var(--text-muted);
                font-weight: 600;
                font-size: 0.9rem;
              "
            >
              <span>🔒 Locked</span>
            </div>

            <!-- Unlocked State -->
            <div v-else>
              <!-- Completed State -->
              <span
                v-if="ws.is_completed"
                style="
                  background: rgba(34, 197, 94, 0.15);
                  color: var(--success);
                  padding: 0.4rem 1rem;
                  border-radius: 50px;
                  font-weight: 700;
                  font-size: 0.85rem;
                  display: inline-block;
                  margin-right: 0.5rem;
                "
              >
                ✅ Completed
              </span>

              <!-- Play Button -->
              <router-link
                v-if="ws.assignment_id"
                :to="`/student/assignment/${ws.assignment_id}`"
                class="btn-primary"
                style="
                  padding: 0.5rem 1.25rem;
                  border-radius: var(--radius-md);
                  font-weight: 600;
                  display: inline-block;
                  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
                "
              >
                {{ ws.is_completed ? 'Practice Again' : 'Start worksheet' }}
              </router-link>
              <span
                v-else
                style="
                  color: var(--text-muted);
                  font-size: 0.85rem;
                  background: var(--border-color);
                  padding: 0.4rem 0.8rem;
                  border-radius: var(--radius-sm);
                  font-weight: 500;
                "
              >
                Not assigned yet
              </span>
            </div>
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
const courseCompleted = ref(false)
const badgeAwarded = ref(false)
const xpGained = ref(0)

onMounted(async () => {
  try {
    await store.fetchStudentCourse(route.params.id)
    const courseData = store.currentCourse
    course.value = courseData.course
    worksheets.value = courseData.worksheets || []
    progress.value = courseData.progress || null
    courseCompleted.value = courseData.course_completed || false
    badgeAwarded.value = courseData.badge_awarded || false
    xpGained.value = courseData.xp_gained || 0
  } catch {
    /* */
  }
})
</script>

<style scoped>
@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-4px);
  }
}
</style>
