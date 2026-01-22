import request from '@/utils/request'

/**
 * 获取所有待办事项
 */
export const getAllTodos = () => {
  return request({
    url: '/test/todos',
    method: 'get',
  })
}

/**
 * 获取单个待办事项
 */
export const getTodoById = (id) => {
  return request({
    url: `/test/todos/${id}`,
    method: 'get',
  })
}

/**
 * 创建新待办事项
 */
export const createTodo = (data) => {
  return request({
    url: '/test/todos',
    method: 'post',
    data,
  })
}

/**
 * 更新待办事项
 */
export const updateTodo = (id, data) => {
  return request({
    url: `/test/todos/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除待办事项
 */
export const deleteTodo = (id) => {
  return request({
    url: `/test/todos/${id}`,
    method: 'delete',
  })
}

/**
 * 获取统计信息
 */
export const getStats = () => {
  return request({
    url: '/test/stats',
    method: 'get',
  })
}

/**
 * 检查后端服务健康状态
 */
export const healthCheck = () => {
  return request({
    url: '/health',
    method: 'get',
    baseURL: '', // 健康检查不在 /api 路径下
  })
}