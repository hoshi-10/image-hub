// 所有页面，布局和导航栏都嵌套在 App.vue 里面
import App from './App.vue'

// 定义页面路径，让单页应用中实现 页面跳转 而 不刷新浏览器
import router from './router'

// 导入 UI 组件库 有按钮，表格，表单等
import Antd from 'ant-design-vue'

// 不同浏览器对 HTML 标签默认样式不一样，引入这个CSS文件统一清楚差异
import 'ant-design-vue/dist/reset.css'
import '@/access'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
//import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css'
// 基于App.vue主页面，创建一个全新的vue运行环境
const app = createApp(App)

// 安装状态管理插件
app.use(createPinia())
// 安装 Vue Router 路由插件
app.use(router)
// 安装 UI组件库插件
app.use(Antd)
//app.use(VueCropper)
// 通电启动，把上面组装好一切，全部渲染到网页上的 <div id="app"> 盒子里
app.mount('#app')






