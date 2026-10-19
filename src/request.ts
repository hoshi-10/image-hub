import axios from "axios";
import {message} from 'ant-design-vue'

//创建axios实例
const myAxios = axios.create({
  baseURL: "http://localhost:8123",
  timeout: 300000,
  withCredentials: true, // 携带凭证，允许发送 Cookie/Session
})

// 全局请求拦截器
myAxios.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  },

);

// 全局响应拦截器
myAxios.interceptors.response.use(function onFulfilled(response) {
  // 1. 解构：从 axios 的 response 对象中取出 data 属性
  const { data } = response

  // 此时：
  // data === { code: 200, msg: "success", data: { user: "张三" } }

  // 假设后端返回结构中包含 code 字段
  if (data && data.code === 40100) {
    // 排除登录接口本身，防止死循环
    if (
      //如果是登录请求 -> 放行（不处理）。
      // 如果是其他请求 -> 执行拦截。
      !response.request.responseURL.includes('user/get/login') &&
      !window.location.pathname.includes('user/login')
    ) {
      message.warning('请先登录')
      // 跳转登录页并携带当前路径作为重定向参数
      window.location.href = `/user/login?redirect=${encodeURIComponent(window.location.href)}`
    }
  }
  return response
}, function onRejected(error) {
  // 这里也可以处理网络错误或服务器报错 (如 500, 404)
  // message.error('请求失败');
  return Promise.reject(error);
});

// 导出实例，以便在其他文件中使用
export default myAxios;
