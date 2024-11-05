// 说明文档地址：https://help.aliyun.com/zh/sls/developer-reference/use-the-sts-plugin-of-the-webtracking-javascript-sdk-to-upload-logs?spm=a2c4g.11186623.0.0.34651c10gyqi6H

import SlsTracker from '@aliyun-sls/web-track-browser'
//通过STS可以获取自定义时效和访问权限的临时身份凭证，无需开启Logstore的WebTracking功能，不会产生脏数据
import createStsPlugin from '@aliyun-sls/web-sts-plugin'

interface Navigator {
  oscpu?: string
  connection?: { effectiveType: string }
}

enum eventTypeEnum {
  evt_console_error = 'evt_console_error',
  evt_page_view = 'evt_page_view',
  evt_button_click = 'evt_button_click',
  evt_device_info = 'evt_device_info',
  evt_performance = 'evt_performance',
  evt_visit_source = 'evt_visit_source',
  evt_share = 'evt_share',
}

// interface BaseInfo {
//   projectName: string //唯一值
// }
interface UserData {
  user_id: string | number
}

interface logDataType {
  eventType: eventTypeEnum
  [key: string]: unknown
}

declare global {
  interface Window {
    tracker: SlsTracker
    logReport: (data: logDataType, immediate: boolean) => void //日志上报通用方法
  }
}

const opts = {
  host: 'cn-guangzhou.log.aliyuncs.com', // 所在地域的服务入口。例如cn-hangzhou.log.aliyuncs.com
  project: 'project-webtrcking-qiheng-2024', // Project 名称
  logstore: 'web-tracking-log-store', // Logstore 名称
  time: 10, // 发送日志的时间间隔，默认是10秒
  count: 10, // 发送日志的数量大小，默认是10条
  topic: 'topic', // 自定义日志主题
  source: 'Analysis', //日志来源。您可以自定义该字段，以便于识别。此处取项目的项目名字。唯一值
  //日志标签信息。您可以自定义该字段，便于识别。
  tags: {
    sdk_version: '1.0.0',
    track_version: '1.0.0',
  },
}

const stsOpt = {
  accessKeyId: '',
  accessKeySecret: '',
  securityToken: '',
  // 以下是一个 stsToken 刷新函数的简单示例
  refreshSTSToken: () =>
    new Promise((resolve, reject) => {
      const xhr = new window.XMLHttpRequest()
      xhr.open('GET', 'http://8.138.16.88/get_sts_token', true)
      xhr.send()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const credential = JSON.parse(xhr.response)
            // 函数的本质目的：设置 stsOpt 的临时密钥和令牌
            stsOpt.accessKeyId = credential.AccessKeyId
            stsOpt.accessKeySecret = credential.AccessKeySecret
            stsOpt.securityToken = credential.SecurityToken
            resolve(null)
          } else {
            reject('Wrong status code.')
          }
        }
      }
    }),
  refreshSTSTokenInterval: 300000, //刷新令牌的间隔（毫秒），默认为 300000（5分钟）。
  stsTokenFreshTime: undefined, //最新的令牌获取时间，不用填写
}

// 创建 sts 插件
const stsPlugin = createStsPlugin(stsOpt)

const tracker = new SlsTracker(opts)
// 使用 sts 插件
tracker.useStsPlugin(stsPlugin)

window.tracker = tracker
window.logReport = logReport

let userData: UserData = {
  user_id: 1,
}

function logReport(data: logDataType | Array<logDataType>, immediate: boolean = false) {
  //立即上传
  if (immediate) {
    if (Array.isArray(data)) return tracker.sendBatchLogsImmediate(data)
    return tracker.sendImmediate(data)
  }
  if (Array.isArray(data)) return tracker.sendBatchLogs(data)
  return tracker.send(data)
}

logReport.prototype.setUserInfo = (data: UserData) => {
  userData = { ...userData, ...data }
}
console.log()

setTimeout(() => {
  const [platform] = navigator.userAgent.match(/(?<=\()(.+?)(?=\))/g) as RegExpMatchArray
  const [performanceNavigationTiming] = window.performance.getEntriesByType(
    'navigation',
  ) as Array<PerformanceNavigationTiming>

  let resourceTimeTotal = 0
  const timeOrigin = performance.timeOrigin
  const resourceTimingArray = (window.performance.getEntriesByType('resource') as Array<PerformanceResourceTiming>).map(
    item => {
      resourceTimeTotal += item.duration
      return {
        resource_name: item.name.match(/\/[^/]*$/)?.[0],
        encodedBodySize: item.encodedBodySize,
        initiatorType: item.initiatorType,
        loadStart: timeOrigin + item.startTime,
        loadEnd: timeOrigin + item.responseEnd,
        loadTime: item.duration,
      }
    },
  )

  logReport([
    {
      eventType: eventTypeEnum.evt_page_view,
      user_id: 1,
      key_url: location.href,
      key_referrer: document.referrer,
    },
    {
      eventType: eventTypeEnum.evt_device_info,
      user_id: 1,
      key_url: location.href,
      key_referrer: document.referrer,
      key_vendor: navigator.vendor || 'Firefox', //设备制造商
      key_system: platform || (navigator as Navigator)?.oscpu, //操作系统
      key_systemVersion: platform || (navigator as Navigator)?.oscpu, //操作系统版本
      key_screenHeight: screen.height,
      key_screenWidth: screen.width,
      key_connectionType: (navigator as Navigator).connection?.effectiveType, //手机上网类型
      key_language: navigator.language, //语言
    },
    {
      eventType: eventTypeEnum.evt_performance,
      //或者 performanceNavigationTiming.loadEventEnd - performanceNavigationTiming.startTime 值和duration一样
      key_pageloadstart: timeOrigin + performanceNavigationTiming.startTime,
      key_pageloadend: timeOrigin + performanceNavigationTiming.loadEventEnd,
      key_resourceloadTime: resourceTimeTotal,
      key_resourceArray: resourceTimingArray,
    },
    {
      eventType: eventTypeEnum.evt_visit_source,
      //或者 performanceNavigationTiming.loadEventEnd - performanceNavigationTiming.startTime 值和duration一样
      // key_pageloadstart: timeOrigin + performanceNavigationTiming.startTime,
      // key_pageloadend: timeOrigin + performanceNavigationTiming.loadEventEnd,
      // key_resourceloadTime: resourceTimeTotal,
      // key_resourceArray: resourceTimingArray,
    },
  ])
}, 5000)
