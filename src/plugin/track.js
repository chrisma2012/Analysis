export default {
  install(app, option) {
    console.log('aappp', app, option)
    app.config.globalProperties.$router.beforeEach(item => {
      console.log(item, '路由跳转')
    })
  },
}
