// 说明文档地址：https://help.aliyun.com/zh/sls/developer-reference/use-the-sts-plugin-of-the-webtracking-javascript-sdk-to-upload-logs?spm=a2c4g.11186623.0.0.34651c10gyqi6H

import SlsTracker from '@aliyun-sls/web-track-browser'
//通过STS可以获取自定义时效和访问权限的临时身份凭证，无需开启Logstore的WebTracking功能，不会产生脏数据
import createStsPlugin from '@aliyun-sls/web-sts-plugin'
import { eventTypeEnum, type logDataType, type PageViewType, type pluginOptionType, type UserData } from './log-sdk'

declare global {
  interface Window {
    Log: LogReport
    userData: UserData
  }
}
interface Navigator {
  oscpu?: string
  connection?: { effectiveType: string; type: string }
}

// 监控控制台输出
function consoleWrapper(fn: () => void, eventType: eventTypeEnum) {
  return function (...args: []) {
    window.Log.logReport({
      eventType,
      args,
    })
    fn.apply(window, args)
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

const stsOpt = {
  accessKeyId: '',
  accessKeySecret: '',
  securityToken: '',
  sts_token_api: '',
  // 以下是一个 stsToken 刷新函数的简单示例
  refreshSTSToken: () =>
    ajax('GET', stsOpt.sts_token_api).then(res => {
      stsOpt.accessKeyId = res.AccessKeyId
      stsOpt.accessKeySecret = res.AccessKeySecret
      stsOpt.securityToken = res.SecurityToken
    }),
  refreshSTSTokenInterval: 300000, //刷新令牌的间隔（毫秒），默认为 300000（5分钟）。
  stsTokenFreshTime: undefined, //最新的令牌获取时间，不用填写
}

/**
 * //定义日志上报SDK类
 *
 * @class LogReport
 */
export class LogReport {
  private tracker!: SlsTracker

  private toReportQueue: Array<logDataType | logDataType[]> = []

  // 版本
  static readonly sdk_version: string = '1.0.0'

  constructor() {
    window.userData = {} as UserData
  }

  public setSlsConf(data: pluginOptionType) {
    stsOpt.sts_token_api = data.sts_token_api
    aliyun_config = { ...aliyun_config, ...data.aliyun_config }

    const stsPlugin = createStsPlugin(stsOpt)
    const tracker = new SlsTracker(aliyun_config)
    // 使用 sts 插件
    tracker.useStsPlugin(stsPlugin)
    this.tracker = tracker

    console.log('----待上报事件队列', this.toReportQueue)
    if (this.toReportQueue.length) {
      this.toReportQueue.forEach(item => this.logReport(item))
    }
  }

  async getIpPhoneConf(phone: string) {
    const { ip_info, phone_info, server_ip } = await ajax('get', `http://47.109.194.67/get_ip_and_phone_info/${phone}`)
    window.userData.phone_info = {
      phone,
      area_code: phone_info.area_code,
      phone_province: phone_info.province,
      phone_city: phone_info.city,
      operator: phone_info.phone_type,
    }
    window.userData.position = {
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

    const browserInfo = getBrowserInfo(navigator.userAgent)
    // //页面pv事件上报
    // this.reportPageView({
    //   session_id: 'session_id',
    //   product_id: 110,
    //   product_name: 'product_name',
    //   page_cnt: 2,
    //   clause_status: 'clause_status',
    // })
    //上报基础信息
    this.logReport([
      {
        eventType: eventTypeEnum.evt_device_info,
        ...window.userData.position,
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
        operator: window.userData.phone_info.operator,
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
      {
        eventType: eventTypeEnum.evt_performance,
        //或者 performanceNavigationTiming.loadEventEnd - performanceNavigationTiming.startTime 值和duration一样
        page_load_start: timeOrigin + performanceNavigationTiming.startTime,
        page_load_end: timeOrigin + performanceNavigationTiming.loadEventEnd,
        key_resourceloadTime: resourceTimeTotal,
        key_resourceArray: resourceTimingArray,
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
        item.user_id = window.userData?.user_id
        return item
      })
      if (this.tracker === undefined) return this.toReportQueue.push(data)
      return immediate ? this.tracker.sendBatchLogsImmediate(data) : this.tracker.sendBatchLogs(data)
    }
    //单个上报
    data = { ...data, user_id: window.userData?.user_id }
    if (this.tracker === undefined) return this.toReportQueue.push(data)
    return immediate ? this.tracker.sendImmediate(data) : this.tracker.send(data)
  }
}

const Log = new LogReport()

console.log = consoleWrapper(console.log, eventTypeEnum.evt_console_log)
console.error = consoleWrapper(console.error, eventTypeEnum.evt_console_error)

//错误监控
const errorCallback = (err: unknown) => {
  Log.logReport({
    eventType: eventTypeEnum.evt_error,
    errData: err,
  })
}
function errorMonitor() {
  window.addEventListener('error', errorCallback)
  window.addEventListener('unhandledrejection', errorCallback)
}
errorMonitor()
//挂载到全局
window.Log = Log
