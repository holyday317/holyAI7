import request from '@/utils/request'

/**
 * 获取所有会话列表
 */
export const getConversations = () => {
  return request({
    url: '/conversations',
    method: 'get'
  })
}

/**
 * 创建新会话
 */
export const createConversation = (data) => {
  return request({
    url: '/conversations',
    method: 'post',
    data
  })
}

/**
 * 更新会话标题
 */
export const updateConversation = (id, data) => {
  return request({
    url: `/conversations/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除会话
 */
export const deleteConversation = (id) => {
  return request({
    url: `/conversations/${id}`,
    method: 'delete'
  })
}

/**
 * 获取会话下的聊天记录
 */
export const getConversationChats = (id) => {
  return request({
    url: `/conversations/${id}/chats`,
    method: 'get'
  })
}
