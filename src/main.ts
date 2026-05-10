import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './utils/canvasOptimize'
const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus)
app.mount('#app')
// console.log('当前运行环境：', import.meta.env.MODE)
