import request from '@/utils/request'

/**
 * 保存问卷记录
 * @param {Object} data - 问卷数据
 * @param {string} data.type - 问卷类型
 * @param {Object} data.data - 问卷内容
 * @returns {Promise}
 */
export const saveQuestionnaire = (data) => {
  return request({
    url: '/questionnaires',
    method: 'post',
    data
  })
}

/**
 * 获取所有问卷记录
 * @returns {Promise}
 */
export const getQuestionnaires = () => {
  return request({
    url: '/questionnaires',
    method: 'get'
  })
}

/**
 * 获取单个问卷记录详情
 * @param {number} id - 问卷记录ID
 * @returns {Promise}
 */
export const getQuestionnaireById = (id) => {
  return request({
    url: `/questionnaires/${id}`,
    method: 'get'
  })
}

/**
 * 删除问卷记录
 * @param {number} id - 问卷记录ID
 * @returns {Promise}
 */
export const deleteQuestionnaire = (id) => {
  return request({
    url: `/questionnaires/${id}`,
    method: 'delete'
  })
}

/**
 * 按类型获取问卷记录
 * @param {string} type - 问卷类型
 * @returns {Promise}
 */
export const getQuestionnairesByType = (type) => {
  return request({
    url: '/questionnaires',
    method: 'get',
    params: { type }
  })
}
