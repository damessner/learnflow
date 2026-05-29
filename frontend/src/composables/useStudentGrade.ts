import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const TEXTBOOK_MAP: Record<number, string> = {
  1: 'more1',
  2: 'more2',
  3: 'more3',
  4: 'more4',
}

export function useStudentGrade() {
  const authStore = useAuthStore()

  const className = computed(() => authStore.user?.class_name || authStore.user?.classId || '')
  const gradeLevel = computed(() => authStore.user?.grade_level || '')

  const grade = computed(() => {
    if (gradeLevel.value) return parseInt(gradeLevel.value) || 1
    const match = className.value.match(/^(\d)/)
    return match ? parseInt(match[1]) : 1
  })

  const textbook = computed(() => TEXTBOOK_MAP[grade.value] || 'more1')
  const isAvailable = computed(() => grade.value === 1) // Only MORE!1 has full content currently

  return { grade, textbook, className, gradeLevel, isAvailable }
}
