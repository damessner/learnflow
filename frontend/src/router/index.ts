import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const Login = () => import('../views/Login.vue')
const StudentDashboard = () => import('../views/StudentDashboard.vue')
const TeacherDashboard = () => import('../views/TeacherDashboard.vue')
const WorksheetPlayer = () => import('../views/WorksheetPlayer.vue')
const WorksheetBuilder = () => import('../views/WorksheetBuilder.vue')
const WorksheetPreview = () => import('../views/WorksheetPreview.vue')
const CourseView = () => import('../views/CourseView.vue')
const TeacherRegistration = () => import('../views/TeacherRegistration.vue')
const AdminDashboard = () => import('../views/AdminDashboard.vue')
const StoryGenerator = () => import('../views/StoryGenerator.vue')

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
    path: '/teacher/builder/:id?',
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
  { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, role: 'admin' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.onError((error, to) => {
  const message = error instanceof Error ? error.message : String(error)
  const isChunkError =
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed')

  if (!isChunkError || !to.fullPath) return

  const reloadKey = 'learnflow:chunk-reload'
  const alreadyReloaded = sessionStorage.getItem(reloadKey) === to.fullPath
  if (alreadyReloaded) return

  sessionStorage.setItem(reloadKey, to.fullPath)
  window.location.assign(to.fullPath)
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
  const isAuthenticated = !!user.role

  if (to.meta.requiresAuth && !isAuthenticated) return '/login'

  if (isAuthenticated) {
    if (to.path === '/login') {
      if (user.role === 'student' || user.isGuest) return '/student'
      if (user.role === 'admin') return '/admin'
      return '/teacher'
    }

    if (to.meta.role) {
      const allowed = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role]
      if (!allowed.includes(user.role)) {
        if (user.role === 'student') return '/student'
        if (user.role === 'admin') return '/admin'
        return '/teacher'
      }
    }
  }
})

router.afterEach(() => {
  sessionStorage.removeItem('learnflow:chunk-reload')
})

export default router
