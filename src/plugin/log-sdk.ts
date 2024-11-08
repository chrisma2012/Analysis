export enum eventTypeEnum {
  evt_error = 'evt_error',
  evt_page_view = 'evt_page_view',
  evt_device_info = 'evt_device_info',
  evt_performance = 'evt_performance',
  evt_visit_source = 'evt_visit_source',
  evt_share = 'evt_share',
  evt_click = 'evt_click',
  evt_input = 'evt_input',
  evt_console_log = 'evt_console_log',
  evt_console_error = 'evt_console_error',
}
export interface UserData {
  user_id: string | number
  phone_info: {
    phone: string
    area_code: string
    phone_city: string
    phone_province: string
    operator: string
  }
  position: PositionType
}
export interface logDataType {
  eventType: eventTypeEnum
  [key: string]: unknown
}
interface PositionType {
  server_ip: string
  client_ip: string
  client_ip_region: string
  client_ip_province: string
  client_ip_city: string
  longitude: number
  latitude: number
}
export interface pluginOptionType {
  sts_token_api: string
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
