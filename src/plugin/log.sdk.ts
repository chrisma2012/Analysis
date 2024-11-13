// 说明文档地址：https://help.aliyun.com/zh/sls/developer-reference/use-the-sts-plugin-of-the-webtracking-javascript-sdk-to-upload-logs?spm=a2c4g.11186623.0.0.34651c10gyqi6H
import SlsTracker from '@aliyun-sls/web-track-browser'
//通过STS可以获取自定义时效和访问权限的临时身份凭证，无需开启Logstore的WebTracking功能，不会产生脏数据
// import createStsPlugin from '@aliyun-sls/web-sts-plugin'
import { eventTypeEnum, type logDataType, type Navigator, type PageViewType, type pluginOptionType, type UserData } from './common.var'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const debounce = (func: Function, timeout: number = 2000) => {
  let handler: number
  return (e: Event) => {
    if (handler) {
      clearTimeout(handler)
    }
    handler = window.setTimeout(() => func(e), timeout)
  }
}

function stringify(obj: object) {
  let cache: unknown[] | null = []
  const str = JSON.stringify(obj, function (_key, value) {
    if (typeof value === 'object' && value !== null) {
      if ((cache as unknown[]).indexOf(value) !== -1) {
        // Circular reference found, discard key
        return
      }
      // Store value in our collection
      ;(cache as unknown[]).push(value)
    }
    return value
  })
  cache = null // reset the cache
  return str
}

const getEventInfo = () => {
  const { phone_province, phone_city, phone } = window._userData.phone_info
  return {
    page_length: `${(screen.availHeight / document.documentElement.scrollHeight) * screen.availHeight}/${document.body.clientHeight}`, //滚动条总长度/页面总长度
    current_page_length: document.documentElement.scrollTop, //当前滚动条位置
    phone_province: phone_province,
    phone_city: phone_city,
    phone: phone,
  }
}

// /(?<=MicroMessenger\/).+(?=\()/ 匹配MicroMessenger和）之间的字符
const getBrowserInfo = (ua: string) => {
  const mobile_browser = [
    {
      label: 'MicroMessenger',
      versionReg: new RegExp(/MicroMessenger(.*)\)/),
    },
    { label: 'MiuiBrowser', versionReg: new RegExp(/XiaoMi(.*)/) },
    {
      label: 'HuaweiBrowser',
      versionReg: new RegExp(/HuaweiBrowser(.*)\s/),
    },
    { label: 'VivoBrowser', versionReg: new RegExp(/VivoBrowser(.*)/) },
    {
      label: 'bdhonorbrowser',
      versionReg: new RegExp(/bdhonorbrowser(.*)\s/),
    },
    { label: 'MQQBrowser', versionReg: new RegExp(/MQQBrowser(.*)\s/) },
    { label: 'baiduboxapp', versionReg: new RegExp(/baiduboxapp(.*)\s/) },
    { label: 'Quark', versionReg: new RegExp(/Quark(.*)\s/) },
    { label: 'UCBrowser', versionReg: new RegExp(/UCBrowser(.*)\s/) },
    //注意最后2个元素的顺序不能更改
    { label: 'Chrome', versionReg: new RegExp(/Chrome(.*)\s/) },
    { label: 'Safari', versionReg: new RegExp(/Safari(.*)/) },
  ]
  const pc_browser = [
    { label: 'Edg', versionReg: new RegExp(/Edg(.*)/) },
    { label: 'Firefox', versionReg: new RegExp(/Firefox(.*)/) },
    {
      label: 'WindowsWechat',
      versionReg: new RegExp(/MicroMessenger(.*)\){1}/),
    },
    { label: 'QIHU 360EE', versionReg: `//` }, //360没有)版本号
    { label: 'QIHU 360SE', versionReg: `//` }, //360没有)版本号
    //注意最后2个元素的顺序不能更改
    { label: 'Chrome', versionReg: new RegExp(/Chrome(.*)\s/) },
    { label: 'Safari', versionReg: new RegExp(/Safari(.*)/) },
  ]
  const browserInfo = { platform: '', browser: '', browser_version: '' }

  //移动端的平台和浏览器判断
  if (ua.indexOf('Mobi') > -1) {
    if (ua.indexOf('Android') > -1) {
      browserInfo.platform = 'mobile Android'
      //安卓不用比较safari
      const target = mobile_browser.slice(1).find(item => ua.indexOf(item.label) > -1)
      browserInfo.browser = target?.label || ''
      browserInfo.browser_version = ua.match(target?.versionReg || /.*/)?.[0] || ''
    }
    if (ua.indexOf('iPhone') > -1) {
      browserInfo.platform = 'mobile iPhone'
    }
    if (ua.indexOf('iPad') > -1) {
      browserInfo.platform = 'iPad'
    }
    const target = mobile_browser.find(item => ua.indexOf(item.label) > -1)
    browserInfo.browser = target?.label || ''
    browserInfo.browser_version = ua.match(target?.versionReg || /.*/)?.[0] || ''

    // pc的浏览器手机模拟器该字段为'win32'
  } else if (ua.indexOf('Mobi') > -1 && navigator?.platform?.indexOf('Win32') > -1) {
    browserInfo.platform = 'window桌面devTool手机模拟器' //移动端还是pc端
  } else if (navigator?.platform?.indexOf('MacIntel') > -1 || ua.indexOf('Mac') > -1) {
    browserInfo.platform = 'MacIntel' //移动端还是pc端
  } else if (ua.indexOf('Windows') > -1) {
    browserInfo.platform = 'Windows'
    const target = pc_browser.find(item => ua.indexOf(item.label) > -1)
    browserInfo.browser = target?.label || ''
    browserInfo.browser_version = ua.match(target?.versionReg || /.*/)?.[0] || ''
  }

  return browserInfo
}

const ajax = async (method: string, url: string) => {
  if (typeof fetch === 'function') {
    // Default options are marked with *
    const response = await fetch(url, {
      method,
    })

    return response.json() // parses JSON response into native JavaScript objects
  }
  return new Promise((resolve, reject) => {
    const xhr = new window.XMLHttpRequest()
    xhr.open(method, url, true)
    xhr.send()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.response))
        } else {
          reject('Wrong status code.')
        }
      }
    }
  })
}

let aliyun_config = {
  host: ' ', // 所在地域的服务入口。例如cn-hangzhou.log.aliyuncs.com
  project: ' ', // Project 名称
  logstore: ' ', // Logstore 名称
  time: 10, // 发送日志的时间间隔，默认是10秒
  count: 10, // 发送日志的数量大小，默认是10条
  topic: 'topic', // 自定义日志主题
  source: 'Analysis', //日志来源。您可以自定义该字段，以便于识别。此处取项目的项目名字。唯一值
  //日志标签信息。您可以自定义该字段，便于识别。
  tags: {
    // sdk_version: '1.0.0',
  },
}

// const stsOpt = {
//   accessKeyId: '',
//   accessKeySecret: '',
//   securityToken: '',
//   sts_token_api: '',
//   // 以下是一个 stsToken 刷新函数的简单示例
//   refreshSTSToken: () =>
//     ajax('GET', stsOpt.sts_token_api).then(res => {
//       stsOpt.accessKeyId = res.AccessKeyId
//       stsOpt.accessKeySecret = res.AccessKeySecret
//       stsOpt.securityToken = res.SecurityToken
//     }),
//   refreshSTSTokenInterval: 300000, //刷新令牌的间隔（毫秒），默认为 300000（5分钟）。
// }

/**
 * //定义日志上报SDK类
 *
 * @class LogReport
 */
export class LogReport {
  tracker

  toReportQueue: Array<logDataType | logDataType[]> = []

  // 版本
  static readonly sdk_version: string = '1.0.0'

  constructor(data: pluginOptionType) {
    window._userData = {} as UserData
    // stsOpt.sts_token_api = data.sts_token_api
    aliyun_config = { ...aliyun_config, ...data.aliyun_config }

    // const stsPlugin = createStsPlugin(stsOpt)
    const tracker = new SlsTracker(aliyun_config)
    // 使用 sts 插件
    // tracker.useStsPlugin(stsPlugin)
    this.tracker = tracker
    if (this.toReportQueue.length) {
      this.toReportQueue.forEach(item => this.logReport(item))
    }
  }

  async getIpPhoneConf(phone: string) {
    const res = await ajax('get', `http://47.119.183.29/app-api/get_ip_and_phone_info/${phone}`)
    const { ip_info, phone_info, server_ip } = res.data
    window._userData.phone_info = {
      phone,
      area_code: phone_info.area_code,
      phone_province: phone_info.province,
      phone_city: phone_info.city,
      operator: phone_info.phone_type,
    }
    window._userData.position = {
      server_ip,
      client_ip: ip_info.ip,
      client_ip_region: ip_info.country,
      client_ip_province: ip_info.region,
      client_ip_city: ip_info.city,
      longitude: ip_info.longitude,
      latitude: ip_info.latitude,
    }
  }

  public reportPageView(data: PageViewType) {
    return this.logReport({
      eventType: eventTypeEnum.evt_page_view,
      track_version: LogReport.sdk_version,
      key_url: location.href,
      ...data,
    })
  }

  public async initReport(phone: string) {
    await this.getIpPhoneConf(phone)
    const [platform] = navigator.userAgent.match(/(?<=\()(.+?)(?=\))/g) as RegExpMatchArray

    const browserInfo = getBrowserInfo(navigator.userAgent)
    //上报基础信息
    // this.reportPageView({
    //   session_id: 'session_id',
    //   product_id: 130,
    //   product_name: 'product_name',
    //   page_cnt: 10000,
    //   clause_status: 'clause_status',
    // })
    this.logReport([
      {
        eventType: eventTypeEnum.evt_device_info,
        ...window._userData.position,
        device: navigator.vendor || 'Firefox', //设备制造商
        device_type: 'device_type',
        device_height: screen.height,
        device_width: screen.width,
        os: browserInfo.platform || (navigator as Navigator)?.oscpu, //操作系统
        os_version: platform || (navigator as Navigator)?.oscpu, //操作系统版本
        browser: browserInfo.browser,
        browser_version: browserInfo.browser_version,
        browser_ua: navigator.userAgent,
        package: 'package',
        app_name: 'app_name',
        app_version: 'app_version',
        traffic_type: (navigator as Navigator).connection?.effectiveType, //手机上网类型
        operator: window._userData.phone_info.operator,
        network_type: (navigator as Navigator).connection?.type || '',
        device_id: 'device_id',
        lang: navigator.language,
      },
      {
        eventType: eventTypeEnum.evt_visit_source,
        collect: 'collect', //收藏
        share: 'share',
        entrance_url: document.referrer,
        entrance_type: 'entrance_type', //来源分类
        channel_type: 'channel_type', //渠道来源
      },
    ])
  }

  /**
   *
   *
   * @param {(logDataType | Array<logDataType>)} data
   * @param {boolean} [immediate]
   * @return {*}
   * @memberof LogReport
   */
  public logReport(data: logDataType | Array<logDataType>, immediate?: boolean) {
    if (Array.isArray(data)) {
      //批量上报
      data = data.map(item => {
        item.user_id = window._userData?.user_id
        return item
      })
      if (this.tracker === undefined) return this.toReportQueue.push(data)
      return immediate ? this.tracker.sendBatchLogsImmediate(data) : this.tracker.sendBatchLogs(data)
    }
    //单个上报
    data = { ...data, user_id: window._userData?.user_id }
    if (this.tracker === undefined) return this.toReportQueue.push(data)
    return immediate ? this.tracker.sendImmediate(data) : this.tracker.send(data)
  }
}

const Log = (window.Log = new LogReport({
  // sts_token_api: 'http://8.138.16.88/get_sts_token',
  aliyun_config: {
    host: 'cn-guangzhou.log.aliyuncs.com', // 所在地域的服务入口。例如cn-hangzhou.log.aliyuncs.com
    project: 'project-webtrcking-qiheng-2024', // Project 名称
    logstore: 'log-cdn-store', // Logstore 名称
    time: 3, // 发送日志的时间间隔，默认是10秒
    count: 10, // 发送日志的数量大小，默认是10条
    topic: 'topic', // 自定义日志主题
    source: 'Analysis', //日志来源。您可以自定义该字段，以便于识别。此处取项目的项目名字。唯一值
    //日志标签信息。您可以自定义该字段，便于识别。
    tags: {
      // sdk_version: '1.0.0',
    },
  },
}))

// 监控控制台输出
function consoleWrapper(fn: () => void, eventType: eventTypeEnum, Log: LogReport) {
  return function (...args: []) {
    Log?.logReport({
      eventType,
      console_content: args.map(item => stringify(item)),
    })
    fn.apply(window, args)
  }
}

//改写console方法必须放在Log挂载window之后
console.log = consoleWrapper(console.log, eventTypeEnum.evt_console_log, Log)
console.error = consoleWrapper(console.error, eventTypeEnum.evt_console_error, Log)
console.warn = consoleWrapper(console.warn, eventTypeEnum.evt_console_warn, Log)

window._vueApp.config.globalProperties.$router.afterEach(() => {
  Log?.reportPageView({
    session_id: 'session_id',
    product_id: 130,
    product_name: 'product_name',
    page_cnt: 10000,
    clause_status: 'clause_status',
  })
})

//监听用户信息api接口，以初始化sdk上报
function watchUserApiToInitLogSdk() {
  const userInfoApiEntry = window.performance.getEntriesByType('resource').find(
    item =>
      // ['fetch', 'xmlhttprequest'].indexOf((item as PerformanceResourceTiming).initiatorType) > -1 &&
      ['script'].indexOf((item as PerformanceResourceTiming).initiatorType) > -1 && //此处要修改成用户接口的initiatorType相关字段
      item.name.indexOf('index') > -1, //此处要修改成用户接口的关键字/user/
  )

  if (userInfoApiEntry !== undefined) {
    //有可能为undefined。因为接口请求比js加载执行慢
    //事件上报开始
    // debugger
    Log.initReport('13856984586')
  }

  const perfObserver: PerformanceObserverCallback = list => {
    list.getEntries().forEach((entry: PerformanceEntry) => {
      //处理log.sdk.js的加载执行比用户信息接口请求快的情况，这里也需要监听一下。
      //监听请求用户信息的接口，判断用户信息是否存在，从而初始化日志sdk
      if (
        entry.entryType === 'resource' &&
        // ['fetch', 'xmlhttprequest'].indexOf((entry as PerformanceResourceTiming).initiatorType) > -1 &&
        // entry.name.indexOf('/get_ip_and_phone_info/') > -1 //此处等后台的用户接口实现后，需要修改为对应的接口关键字如 /user/。现在只是方便测试才这么写
        ['script'].indexOf((entry as PerformanceResourceTiming).initiatorType) > -1 && //此处要修改成用户接口的initiatorType相关字段
        entry.name.indexOf('index') > -1 //此处要修改成用户接口的关键字/user/
      ) {
        //事件上报开始
        // Log.initReport('13856984586')
      }
    })
  }
  const observer = new PerformanceObserver(perfObserver)
  observer.observe({ entryTypes: ['resource'] })

  return observer
}

const observerInstance = watchUserApiToInitLogSdk()

//错误监控
window.onerror = function (message, _url, line, column, error) {
  Log.logReport({
    eventType: eventTypeEnum.evt_error,
    content: `【${message}】:${error?.stack} 第${line}行 第${column}列`,
  })
}

window.addEventListener('unhandledrejection', ({ reason: { message, stack } }) => {
  Log.logReport({
    eventType: eventTypeEnum.evt_unhandledrejection,
    content: `【${message}】:${stack}`,
  })
})

// 页面卸载前上报性能日志
window.addEventListener('beforeunload', () => {
  //解除监听
  observerInstance?.disconnect()

  const [performanceNavigationTiming] = window.performance.getEntriesByType('navigation') as Array<PerformanceNavigationTiming>

  let resourceTimeTotal = 0
  const timeOrigin = performance.timeOrigin
  const resourceTimingArray = (window.performance.getEntriesByType('resource') as Array<PerformanceResourceTiming>).map(item => {
    resourceTimeTotal += item.duration
    return {
      resource_name: item.name.match(/\/[^/]*$/)?.[0],
      encodedBodySize: item.encodedBodySize,
      initiatorType: item.initiatorType,
      resource_load_start: timeOrigin + item.startTime,
      resource_load_end: timeOrigin + item.responseEnd,
      loadTime: item.duration,
    }
  })
  // localStorage.setItem('performance' + Date.now(), JSON.stringify(resourceTimingArray))
  Log.logReport(
    {
      eventType: eventTypeEnum.evt_performance,
      //或者 performanceNavigationTiming.loadEventEnd - performanceNavigationTiming.startTime 值和duration一样
      page_load_start: timeOrigin + performanceNavigationTiming.startTime,
      page_load_end: timeOrigin + performanceNavigationTiming.loadEventEnd,
      key_resourceloadTime: resourceTimeTotal,
      key_resourceArray: resourceTimingArray,
    },
    true,
  )
})

//记录点击的位置
let location_coor = {}
// 监听页面点击事件
window.addEventListener('click', e => {
  const { pageX, pageY, screenX, screenY } = e
  location_coor = { pageX, pageY, screenX, screenY }

  const domId = (e.target as HTMLElement)?.id
  const data = window._reportData?.[domId]
  if (!domId || !data) return
  Log.logReport({
    ...data,
  } as logDataType)
})

window.addEventListener(
  'input',
  debounce((e: InputEvent) => {
    Log.logReport({
      eventType: eventTypeEnum.evt_click,
      record_time: new Date(e.timeStamp + performance.timeOrigin),
      location_coor, //点击位置-坐标
      ...getEventInfo(),
    })
  }, 3000),
)
