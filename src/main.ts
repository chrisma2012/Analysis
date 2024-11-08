import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style/reset.scss'

// import logSdk from './plugin/log.sdk'
// import logSdk from 'log-h5-sdk'
import logSdkPlugin from './plugin/log-sdk-plugin'
// import logSdkPlugin from 'log-sdk-plugin-h5'

const app = createApp(App)
app.use(router)
app.use(logSdkPlugin)
// app.use(logSdk, {
//   sts_token_api: 'http://8.138.16.88/get_sts_token', //sts_token获取接口
//   aliyun_config: {
//     host: 'cn-guangzhou.log.aliyuncs.com', // 所在地域的服务入口。例如cn-hangzhou.log.aliyuncs.com
//     project: 'project-webtrcking-qiheng-2024', // Project 名称
//     logstore: 'web-tracking-log-store', // Logstore 名称
//     time: 10, // 发送日志的时间间隔，默认是10秒
//     count: 10, // 发送日志的数量大小，默认是10条
//     topic: 'topic', // 自定义日志主题
//     source: 'Analysis', //日志来源。您可以自定义该字段，以便于识别。此处取项目的项目名字。唯一值
//     //日志标签信息。您可以自定义该字段，便于识别。
//     tags: {
//       // sdk_version: '1.0.0',
//     },
//   },
// })

app.mount('#app')
