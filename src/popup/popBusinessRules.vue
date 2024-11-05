<template>
  <van-dialog :show="show" width="90vw" :show-confirm-button="false" teleport="body" class="pop-business-rule">
    <i class="close-btn" @click="show = false"></i>
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_w7_lonnianqicai.png" />
    <img src="https://gzsucai.diantads.com/static/t/xxl/tf/111386/cl129_w8_lonnianqicai.png" />
  </van-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)
</script>
<style lang="scss">
.van-dialog {
  background: rgb(255, 50, 61) !important;
}
.pop-business-rule {
  background: rgb(255, 50, 61) !important;
}
.close-btn {
  background-color: #b2b2b2;
  position: absolute;
  top: 0;
  left: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
}
img {
  width: 80vw;
  margin: auto;
}
</style>
