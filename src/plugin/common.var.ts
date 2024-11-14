import type { App } from 'vue'

export enum eventTypeEnum {
  evt_error = 'evt_error',
  evt_unhandledrejection = 'evt_unhandledrejection',
  evt_page_view = 'evt_page_view',
  evt_device_info = 'evt_device_info',
  evt_performance = 'evt_performance',
  evt_visit_source = 'evt_visit_source',
  evt_share = 'evt_share',
  evt_click = 'evt_click',
  evt_input = 'evt_input',
  evt_console_log = 'evt_console_log',
  evt_console_error = 'evt_console_error',
  evt_console_warn = 'evt_console_warn',
  evt_test = 'evt_test',
}
declare global {
  interface Window {
    Log: LogReport
    _userData: UserData
    _reportData: Record<string, logDataType>
    logSdkPlugin: {
      install: (app: App) => void
    }
    _vueApp: App<Element>
  }
}

// export interface App {
//   __vue_app__: App<Element>
// }
export interface Navigator {
  oscpu?: string
  connection?: { effectiveType: string; type: string }
}
export interface logDataType {
  eventType: eventTypeEnum
  [key: string]: unknown
}
export interface UserData {
  phone_info: {
    phone: string
    area_code: string
    phone_city: string
    phone_province: string
    operator: string
  }
  position: PositionType
}
export interface PositionType {
  server_ip: string
  client_ip: string
  client_ip_region: string
  client_ip_province: string
  client_ip_city: string
  longitude: number
  latitude: number
}
export interface pluginOptionType {
  // sts_token_api: string
  aliyun_config: {
    host: string
    project: string
    logstore: string
    time?: number
    count?: number
    topic?: string
    source?: string
    tags?: Record<string, string>
  }
}
export interface PageViewType {
  session_id: string
  product_id: number
  product_name: string
  page_cnt: number
  clause_status: string
}

/**
 * //定义日志上报SDK类
 *
 * @class LogReport
 */
export declare class LogReport {
  tracker: unknown
  toReportQueue: Array<logDataType | logDataType[]>
  static readonly sdk_version: string
  constructor()
  reportPageView(data: PageViewType): number | void
  initReport(phone: string): Promise<void>
  /**
   *
   *
   * @param {(logDataType | Array<logDataType>)} data
   * @param {boolean} [immediate]
   * @return {*}
   * @memberof LogReport
   */
  logReport(data: logDataType | Array<logDataType>, immediate?: boolean): number | void
}
