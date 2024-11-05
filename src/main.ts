import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style/reset.scss'
// eslint-disable-next-line
//@ts-ignore
import tracker from './plugin/track'

// import VueMatomo from 'vue-matomo'

// const app = createApp(App).use(VueMatomo, {
//   // Configure your matomo server and site by providing
//   host: 'http://localhost:8080/',
//   siteId: 1,
// })
const app = createApp(App)
app.use(router)

app.use(tracker, { store: 1 })

app.mount('#app')

declare global {
  interface Window {
    _paq: Array<[string]>
  }
}
// window._paq.push(['trackPageView']) //To track pageview
