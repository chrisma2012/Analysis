;(function (window) {
  if (window && window.umami === undefined) return
  //   基础属性（采集一次）

  const sdk_base = {
    sdk_version: 'v1.0.0',
    pageUrl: location.href, //网页地址
    origin: document.referrer, //从哪个页面进来的
  }

  window.umami.track(props => ({
    ...props,
    name: 'sdk-info',
    data: sdk_base,
  }))

  // 终端设备信息（一次采集）
  const [platform] = navigator.userAgent.match(/(?<=\()(.+?)(?=\))/g)
  let device = {
    vendor: navigator.vendor, //设备制造商
    screenHeight: screen.height,
    screenWidth: screen.width,
    system: platform, //操作系统
    systemVersion: platform, //操作系统版本
    // browserName: navigator.userAgentData.brands[1].brand, //浏览器名字
    // browserVersion: navigator.userAgentData.brands[1].version, //浏览器版本
    connectionType: navigator.connection.effectiveType, //手机上网类型
    language: navigator.language, //语言
    deviceNo: platform, //设备型号
  }
  // 火狐
  if (navigator.userAgent.indexOf('Firefox') > -1) {
    const userAgentArr = navigator.userAgent.split(' ')
    device = {
      ...device,
      vendor: 'Firefox',
      system: platform || navigator.oscpu, //操作系统
      systemVersion: platform || navigator.oscpu, //操作系统版本
      browserName: 'Firefox',
      browserVersion: userAgentArr[userAgentArr.length - 1], //浏览器版本
      connectionType: '不支持', //火狐不支持该属性
    }
  }

  window.umami.track(props => ({
    ...props,
    name: 'device-info',
    data: device,
  }))
  console.log(sdk_base)

  // window.addEventListener('popstate', () => {
  //   console.log('路由有跳转')
  // })
  // window.addEventListener('pushState', () => {
  //   console.log('hash偶变化')
  // })
  //   window.addEventListener('replaceState', () => {
  //     console.log('hash偶变化')
  //   })

  //   因为pushState或者replaceState调用时不会触发相关事件，因此改写这2个方法，
  // 实现相应事件的创建和派发，原理和发布订阅模式类型
  // const routerEventWrapper = function (eventType) {
  //   const orig = history[eventType]
  //   return function () {
  //     orig.apply(this, arguments) //做原来的事，
  //     //以下为新加的逻辑
  //     const e = new Event(eventType)
  //     e.arguments = arguments
  //     window.dispatchEvent(e)
  //   }
  // }
  // history.pushState = routerEventWrapper('pushState')
  // history.replaceState = routerEventWrapper('replaceState')
})(window)
