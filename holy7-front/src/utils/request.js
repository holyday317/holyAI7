import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等认证信息
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
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
          console.error('请求参数错误:', data.error)
          break
        case 404:
          console.error('资源不存在:', data.error)
          break
        case 500:
          console.error('服务器内部错误:', data.error)
          break
        default:
          console.error('未知错误:', data.error || '请求失败')
      }
      
      return Promise.reject(data.error || '请求失败')
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