// 配套log.sdk.ts使用
import { type App } from 'vue'
import { eventTypeEnum } from './common.var'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const debounce = (func: Function, timeout: number = 2000) => {
  let handler: NodeJS.Timeout
  return (e: Event) => {
    if (handler) {
      clearTimeout(handler)
    }
    handler = setTimeout(() => func(e), timeout)
  }
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

export default {
  install(app: App) {
    //路由变化监控
    app.config.globalProperties.$router.afterEach(() => {
      //   console.log()
      window.Log.reportPageView({
        session_id: 'session_id',
        product_id: 130,
        product_name: 'product_name',
        page_cnt: app.config.globalProperties.$router.getRoutes().length,
        clause_status: 'clause_status',
      })
    })
    //错误监控
    app.config.errorHandler = err => {
      window.Log.logReport({
        eventType: eventTypeEnum.evt_error,
        errData: err,
      })
    }

    // location_page: 'location_page', //点击位置-页面
    // page_description: 'page_description', //页面说明
    // page_id: 'page_id',
    // page_name: 'page_name',
    // page_section: 'page_section', //版块
    // event_type: binding.arg, //事件类型
    // key_action: 'key_action', //关键行为
    // toast: 'toast行为', //toast行为
    // order_no: 'order_no', //订单号
    // basic_type: 'basic_type', //基础类型
    // track_source: 'track_source', //采集来源

    //点击事件指令定义
    app.directive('log-click', {
      mounted(el, binding) {
        el.addEventListener(
          'click',
          (el.clickHandler = function (e: PointerEvent) {
            console.log(el, binding)
            const { pageX, pageY, screenX, screenY } = e
            window.Log.logReport({
              eventType: binding.arg as eventTypeEnum,
              record_time: new Date(e.timeStamp + performance.timeOrigin),
              location_coor: {
                pageX,
                pageY,
                screenX,
                screenY,
              }, //点击位置-坐标
              ...getEventInfo(),
              ...binding.value,
            })
          }),
        )
      },
      beforeUnmount(el) {
        el.removeEventListener('click', el.clickHandler)
      },
    })

    //input事件指令定义
    app.directive('log-input', {
      mounted(el, binding) {
        //处理指令在封装的组件上使用的问题
        if (el.tagName !== 'INPUT') {
          el = el.getElementsByTagName('input')[0]
        }
        let location_coor = {}
        el.addEventListener(
          'click',
          (el.clickHandler = (e: PointerEvent) => {
            const { pageX, pageY, screenX, screenY } = e
            location_coor = { pageX, pageY, screenX, screenY }
          }),
        )
        el.addEventListener(
          'input',
          (el.inputHandler = debounce(function (e: InputEvent) {
            window.Log.logReport({
              eventType: binding.arg as eventTypeEnum,
              record_time: new Date(e.timeStamp + performance.timeOrigin),
              location_coor, //点击位置-坐标
              ...getEventInfo(),
              ...binding.value,
            })
          }, 3000)),
        )
      },
      beforeUnmount(el) {
        if (el.tagName !== 'INPUT') {
          el = el.getElementsByTagName('input')[0]
        }
        el.removeEventListener('input', el.inputHandler)
        el.removeEventListener('click', el.clickHandler)
      },
    })
  },
}
