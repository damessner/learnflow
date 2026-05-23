export interface User {
  id: string
  username: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  isGuest?: boolean
}
