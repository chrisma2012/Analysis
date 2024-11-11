<script setup lang="ts">
import { defineAsyncComponent, reactive, ref, shallowRef } from 'vue'
import { eventTypeEnum } from './plugin/log.sdk'
import Input from './components/Input.vue'

const formData = reactive({
  phone: '',
})
const checked = ref(false)

const onSubmit = () => { }

const currentPop = shallowRef()

const directData = {
  a: 2,
  b: 4,
}
// setTimeout(() => {
//   throw new Error('错误')
// }, 4000)
const showPopBusinessRules = () => {
  // currentPop.value = defineAsyncComponent(() => import('./popup/popBusinessRules.vue'))
  // window.Log.logReport({
  //   eventType: eventTypeEnum.evt_click,
  //   productName: '规则弹窗',
  //   price: 500,
  // })
}
</script>

<template>
  <RouterLink to="/about">关于</RouterLink>

  <Input v-log-input:evt_input="directData" />
  <span class="anchor anchor-business-rules" @click="showPopBusinessRules"></span>
  <!-- <input type="text" v-log-input:evt_input="directData" /> -->
  <span class="anchor anchor-member-center"></span>
  <span class="anchor anchor-download-miguapp"></span>
  <span class="anchor anchor-unsubscribe"></span>
  <img class="header" src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_t_lonnianqicai.png" />
  <div class="mod-login">
    <div class="carousel"></div>
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/11801/step1.gif" />
    <van-form @submit="onSubmit">
      <van-field class="login-phone" v-log-input:evt_input="directData" v-model="formData.phone" name="手机号码"
        label="手机号码" placeholder="手机号码" :rules="[{ required: true, message: '请填写手机号码' }]" />
      <img native-type="submit" class="login-btn"
        src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_an_lonnianqicai.png" />
    </van-form>
  </div>
  <div class="login-attention">
    <div class="attention-checkbox">
      <van-checkbox v-model="checked"></van-checkbox>
      我已阅读并同意 <a href="...">《隐私政策》</a> <a href="...">《服务协议》</a>和<a href="...">《解约条款》</a>
    </div>
    <p>1、开通 “音乐全曲包-七彩歌曲15元包” 资费：15元/月，通过话费扣取，未退订按自然月续订和续费。</p>
    <p>2、开通 “音乐全曲包-七彩歌曲15元包” 可享咪咕音乐白金会员、 视频彩铃权益、32选1热门会员月卡、歌曲专区试听及下载权益</p>
    <p>3、如需退款业务，请点击右侧 “退订” 按钮，或短信发送0000至10086，根据收到的短信提示操作进行退订。</p>
  </div>
  <div class="privilege-item">
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_w1_lonnianqicai.png" alt="" />
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_w2_lonnianqicai.png" alt="" />
  </div>
  <div class="privilege-item">
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_w3_lonnianqicai.png" alt="" />
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_w4_lonnianqicai.png" alt="" />
  </div>
  <div class="privilege-item">
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_yk_lonnianqicai.png" alt="" />
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_yktk_lonnianqicai.png" alt="" />
  </div>
  <div class="privilege-item">
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_w5_lonnianqicai.png" alt="" />
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_w6_lonnianqicai.png" alt="" />
  </div>
  <div class="privilege-item">
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_w7_lonnianqicai.png" alt="" />
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_w8_lonnianqicai.png" alt="" />
  </div>

  <Suspense>
    <component :is="currentPop"></component>
    <template #fallback> 展位。。。 </template>
  </Suspense>
  <RouterView></RouterView>
</template>

<style scoped>
body {
  position: relative;
}

.anchor {
  position: fixed;
  right: 0;
  z-index: 1;
  background-repeat: no-repeat;
  background-size: contain;
}

.anchor-business-rules,
.anchor-member-center {
  top: 280px;
  width: 46px;
  height: 151px;
  background-image: url('https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_ywgz_lonnianqicai.png');
}

.anchor-member-center {
  top: 480px;
  background-image: url('https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_hyzx_lonnianqicai.png');
}

.anchor-download-miguapp {
  top: 700px;
  width: 58px;
  height: 75px;
  background-image: url('https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_xzapp_lonnianqicai.png');
}

.anchor-unsubscribe {
  top: 850px;
  width: 48px;
  height: 58px;
  background-image: url('https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_td_lonnianqicai.png');
}

.header {
  width: 750px;
}

.mod-login {
  width: 750px;
  /* height: 720px; */
}

.mod-login {
  img {
    width: 289px;
    height: 36px;
  }

  .login-phone {
    width: 666px;
    height: 50px;
    margin: auto;
    border-radius: 25px;
  }

  .login-btn {
    margin: 20px auto 0;
    width: 387px;
    height: 88px;
  }
}

.login-attention {
  padding: 0 25px;
  margin: 0 0 150px 0;
  font-size: 20px;
  color: white;

  .attention-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
  }

  a {
    color: white;
  }
}

.privilege-item {
  img {
    width: 740px;
  }
}
</style>
