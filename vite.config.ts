import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
// eslint-disable-next-line
// @ts-ignore
import postcsspxtoviewport from 'postcss-px-to-viewport'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    AutoImport({
      resolvers: [VantResolver()],
    }),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    postcss: {
      plugins: [
        //参数详见以下链接
        //https://github.com/evrone/postcss-px-to-viewport/blob/HEAD/README_CN.md
        // file => {
        //   let num = 1920;
        //   if (file.indexOf('m_') !== -1) {
        //     num = 375;
        //   }
        //   return num;
        // }
        postcsspxtoviewport({
          unitToConvert: 'px',
          viewportWidth: 750, //设计稿的视口宽度
          unitPrecision: 5, //单位转换后保留的精度
          propList: ['*'],
          viewportUnit: 'vw',
          fontViewportUnit: 'vw',
          selectorBlackList: [], //需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位
          minPixelValue: 1, //设置最小的转换数值。如果为1的话，只有大于1的值会被转换
          mediaQuery: false, //媒体查询里的单位是否需要转换单位
          replace: true,
          exclude: undefined,
          include: undefined,
          landscape: false, //是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
          landscapeUnit: 'vw',
          landscapeWidth: 1920, //横屏时使用的视口宽度
        }),
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes('aliyun-sls')) {
            return 'aliyun-sls'
          }
        },
      },
    },
  },
})
