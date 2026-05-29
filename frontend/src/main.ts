import './utils/mockFetch'
import { bootstrapStandaloneSession } from './utils/standalone'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/theme.css'

// Must run before router resolves any guard so the guest session is in place
bootstrapStandaloneSession()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
