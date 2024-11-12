import './assets/main.css'
import { createApp, type App } from 'vue'
import AppCom from './App.vue'
import router from './router'
import './style/reset.scss'

// import logSdk from './plugin/log.sdk'
// import logSdk from 'log-h5-sdk'
import logSdkPlugin from './plugin/log-sdk-plugin'
// import logSdkPlugin from 'log-sdk-plugin-h5'

declare global {
  interface Window {
    app: App<Element>
  }
}

const app = (window.app = createApp(AppCom))
app.use(router)
app.use(logSdkPlugin)

app.mount('#app')
