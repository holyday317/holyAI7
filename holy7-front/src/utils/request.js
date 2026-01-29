import axios from 'axios'
import router from '@/router'

// 根据环境动态设置 baseURL
// 开发环境：使用 /api（由 Vite 代理到 localhost:3000）
// 生产环境：直接请求服务器地址
const getBaseURL = () => {
  // import.meta.env.PROD 在 Vite 中可用
  // true 表示生产环境，false 表示开发环境
  if (import.meta.env.PROD) {
    // 生产环境使用服务器地址
    return 'http://106.54.34.24:3000/api'
  } else {
    // 开发环境使用代理
    return '/api'
  }
}

// 创建 axios 实例
const request = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // 增加到 60 秒，适应推理模型的响应时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加 token 到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 如果后端返回的数据格式统一，可以在这里处理
    return res
  },
  (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          console.error('请求参数错误:', data.message || data.error)
          break
        case 401:
          console.error('未授权，请重新登录')
          // 清除本地存储的 token 和用户信息
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          // 跳转到登录页面
          if (router.currentRoute.value.path !== '/login') {
            router.push('/login')
          }
          break
        case 404:
          console.error('资源不存在:', data.message || data.error)
          break
        case 500:
          console.error('服务器内部错误:', data.message || data.error)
          break
        default:
          console.error('未知错误:', data.message || data.error || '请求失败')
      }
      
      return Promise.reject(data.message || data.error || '请求失败')
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查后端服务是否启动')
      return Promise.reject('网络错误，请检查后端服务是否启动')
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message)
      return Promise.reject(error.message)
    }
  }
)

export default request