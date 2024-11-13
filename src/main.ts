import './assets/main.css'
import { createApp } from 'vue'
import AppCom from './App.vue'
import router from './router'
import './style/reset.scss'

const app = (window._vueApp = createApp(AppCom))
app.use(router)

app.mount('#app')
