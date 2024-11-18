<script setup lang="ts">
import { reactive, ref, shallowRef } from 'vue'

// import Input from '../components/Input.vue'
import { eventTypeEnum } from '../plugin/common.var'
import { ajax } from '@/js/util';

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
//     const imgDom = document.createElement('img')
//     imgDom.src = 'http://e.hiphotos.baidu.com/image/pic/item/a1ec08fa513d2697e542494057fbb2fb4316d81e.jpg'
//     document.body.appendChild(imgDom)
// }, 9000)
const showPopBusinessRules = () => {
    // currentPop.value = defineAsyncComponent(() => import('./popup/popBusinessRules.vue'))

}



window._reportData = {
    "header-img": {
        eventType: eventTypeEnum.evt_click,
        a: 1,
        b: 3
    }
}


const getIpPhoneConf = async (phone: string) => {
    // const res = await ajax('get', `http://172.16.60.214:5001/app-api/get_ip_and_phone_info/${phone}`)
    // const { ip_info, phone_info, server_ip } = res.data
    setTimeout(() => {
        window._userData.phone_info = {
            phone,
            area_code: '11',
            phone_province: '11',
            phone_city: '11',
            operator: '11',
        }
        window._userData.position = {
            server_ip: '8.9.8.8',
            client_ip: '11',
            client_ip_region: '11',
            client_ip_province: '11',
            client_ip_city: '11',
            longitude: 110,
            latitude: 120,
        }
    }, 1400)
}


// const getIpPhoneConf = async (phone: string) => {
//     const res = await ajax('get', `http://172.16.60.214:5001/app-api/get_ip_and_phone_info/${phone}`)
//     const { ip_info, phone_info, server_ip } = res.data
//     window._userData.phone_info = {
//         phone,
//         area_code: phone_info.area_code,
//         phone_province: phone_info.province,
//         phone_city: phone_info.city,
//         operator: phone_info.phone_type,
//     }
//     window._userData.position = {
//         server_ip,
//         client_ip: ip_info.ip,
//         client_ip_region: ip_info.country,
//         client_ip_province: ip_info.region,
//         client_ip_city: ip_info.city,
//         longitude: ip_info.longitude,
//         latitude: ip_info.latitude,
//     }
// }
getIpPhoneConf('13580563526')
</script>



<template>
    <RouterLink to="/about">关于页面</RouterLink>
    <!-- <Input v-log-input:evt_input="directData" /> -->
    <span class="anchor anchor-business-rules" @click="showPopBusinessRules"></span>
    <!-- <input type="text" v-log-input:evt_input="directData" /> -->
    <span class="anchor anchor-member-center"></span>
    <span class="anchor anchor-download-miguapp"></span>
    <span class="anchor anchor-unsubscribe"></span>
    <img class="header header1" id="header-img"
        src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_t_lonnianqicai.png" />
    <div class="mod-login">
        <div class="carousel"></div>
        <img src="https://gzsucai.diantads.com/static/t/xxl/tf/11801/step1.gif" />
        <van-form @submit="onSubmit">
            <!-- v-log-input:evt_input="directData" -->
            <van-field class="login-phone" v-model="formData.phone" name="手机号码" label="手机号码" placeholder="手机号码"
                :rules="[{ required: true, message: '请填写手机号码' }]" />
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