import request from '@/utils/request'

/**
 * 获取用户的所有书签
 */
export const getBookmarks = () => {
  return request({
    url: '/bookmarks',
    method: 'get'
  })
}

/**
 * 创建书签
 */
export const createBookmark = (data) => {
  return request({
    url: '/bookmarks',
    method: 'post',
    data
  })
}

/**
 * 更新书签
 */
export const updateBookmark = (id, data) => {
  return request({
    url: `/bookmarks/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除书签
 */
export const deleteBookmark = (id) => {
  return request({
    url: `/bookmarks/${id}`,
    method: 'delete'
  })
}

/**
 * 检查聊天是否已收藏
 */
export const checkBookmark = (chatId) => {
  return request({
    url: `/bookmarks/check/${chatId}`,
    method: 'get'
  })
}
