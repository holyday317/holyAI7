import request from '@/utils/request'

/**
 * AI 聊天 API
 * 通过后端代理调用，保护 API Key
 */
export const chatWithAI = (data) => {
  return request({
    url: '/ai/chat',
    method: 'post',
    data
  })
}

/**
 * 获取支持的模型列表
 */
export const getModels = () => {
  return request({
    url: '/ai/models',
    method: 'get'
  })
}

/**
 * AI 服务健康检查
 */
export const healthCheck = () => {
  return request({
    url: '/ai/health',
    method: 'get'
  })
}

/**
 * 预设的模型配置（仅用于前端展示）
 */
export const MODEL_CONFIGS = {
  deepseek: {
    label: 'DeepSeek',
    modelName: 'deepseek-chat'
  },
  'deepseek-R1': {
    label: 'DeepSeek-R1',
    modelName: 'deepseek-reasoner'
  }
}

/**
 * 获取默认系统消息
 */
export const getDefaultSystemMessage = () => {
  return []
}