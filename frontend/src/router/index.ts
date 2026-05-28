import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import StudentDashboard from '../views/StudentDashboard.vue'
import TeacherDashboard from '../views/TeacherDashboard.vue'
import WorksheetPlayer from '../views/WorksheetPlayer.vue'
import WorksheetBuilder from '../views/WorksheetBuilder.vue'
import WorksheetPreview from '../views/WorksheetPreview.vue'
import CourseView from '../views/CourseView.vue'
import TeacherRegistration from '../views/TeacherRegistration.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import StoryGenerator from '../views/StoryGenerator.vue'
import LearnFlowBank from '../views/LearnFlowBank.vue'
import WritingCoach from '../views/WritingCoach.vue'
import GrammarAcademy from '../views/GrammarAcademy.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/register-teacher',
    component: TeacherRegistration,
    meta: { requiresAuth: true, role: 'admin' },
  },
  { path: '/student', component: StudentDashboard, meta: { requiresAuth: true, role: 'student' } },
  {
    path: '/student/course/:id',
    component: CourseView,
    meta: { requiresAuth: true, role: 'student' },
  },
  {
    path: '/student/assignment/:id',
    component: WorksheetPlayer,
    meta: { requiresAuth: true, role: 'student' },
  },
  {
    path: '/teacher',
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: ['teacher', 'admin'] },
  },

  {
    path: '/teacher/builder',
    name: 'worksheet-builder-new',
    component: WorksheetBuilder,
    meta: { requiresAuth: true, role: ['teacher', 'admin'] },
  },
  {
    path: '/teacher/builder/:id',
    name: 'worksheet-builder-edit',
    component: WorksheetBuilder,
    meta: { requiresAuth: true, role: ['teacher', 'admin'] },
  },
  {
    path: '/teacher/preview/:id',
    component: WorksheetPreview,
    meta: { requiresAuth: true, role: ['teacher', 'admin'] },
  },
  {
    path: '/teacher/stories',
    component: StoryGenerator,
    meta: { requiresAuth: true, role: ['teacher', 'admin'] },
  },
  {
    path: '/teacher/bank',
    component: LearnFlowBank,
    meta: { requiresAuth: true, role: ['teacher', 'admin'] },
  },
  { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, role: 'admin' } },
  {
    path: '/writing-coach',
    component: WritingCoach,
    meta: { requiresAuth: true },
  },
  {
    path: '/grammar-academy',
    component: GrammarAcademy,
    meta: { requiresAuth: true },
  },
]

// Vite can expose an empty BASE_URL depending on how it was built/served.
// Vue Router needs a sane base so internal navigations resolve correctly.
const historyBase = import.meta.env.BASE_URL || '/'

const router = createRouter({
  // Use Vite's BASE_URL so hard-refresh/deep links work when deployed under a sub-path.
  history: createWebHistory(historyBase),
  routes,
})

router.onError((error, to) => {
  const message = error instanceof Error ? error.message : String(error)
  const isChunkError =
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed')

  if (isChunkError && to.fullPath) {
    const reloadKey = 'learnflow:chunk-reload'
    const alreadyReloaded = sessionStorage.getItem(reloadKey) === to.fullPath

    if (!alreadyReloaded) {
      sessionStorage.setItem(reloadKey, to.fullPath)
      window.location.assign(
        to.fullPath + (to.fullPath.includes('?') ? '&' : '?') + '_t=' + Date.now(),
      )
      return
    }
  }

  console.error('Navigation error:', error)
})

function getStoredUser() {
  const userStr = localStorage.getItem('user')
  if (!userStr) return {}

  try {
    return JSON.parse(userStr)
  } catch {
    localStorage.removeItem('user')
    return {}
  }
}

router.beforeEach((to) => {
  const user = getStoredUser()
  const role = user.role
  const isAuthenticated = !!role

  if (to.meta.requiresAuth && !isAuthenticated) return '/login'

  if (isAuthenticated) {
    if (to.path === '/login') {
      if (role === 'student' || user.isGuest) return '/student'
      if (role === 'admin') return '/admin'
      if (role === 'teacher') return '/teacher'
      return '/student'
    }

    if (to.meta.role) {
      const allowed = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role]
      if (!allowed.includes(role)) {
        if (role === 'student') return '/student'
        if (role === 'admin') return '/admin'
        if (role === 'teacher') return '/teacher'
        return '/login'
      }
    }
  }
})

router.afterEach(() => {
  sessionStorage.removeItem('learnflow:chunk-reload')
})

export default router
