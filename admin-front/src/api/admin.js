/**
 * 管理控制台 API
 */

import request from '../utils/request';

// 使用环境变量配置API地址
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const API_BASE = `${API_BASE_URL}/api/admin`;

console.log(`[Admin API] 当前环境: ${import.meta.env.MODE}`);
console.log(`[Admin API] API地址: ${API_BASE}`);

/**
 * 获取所有表名
 */
export function getTables() {
  return request.get(`${API_BASE}/tables`);
}

/**
 * 获取数据库统计信息
 */
export function getStats() {
  return request.get(`${API_BASE}/stats`);
}

/**
 * 获取表结构
 */
export function getTableSchema(table) {
  return request.get(`${API_BASE}/tables/${table}/schema`);
}

/**
 * 获取表数据
 */
export function getTableData(table, params = {}) {
  return request.get(`${API_BASE}/tables/${table}/data`, { params });
}

/**
 * 搜索记录
 */
export function searchRecords(table, params = {}) {
  return request.get(`${API_BASE}/tables/${table}/search`, { params });
}

/**
 * 根据 ID 获取单条记录
 */
export function getRecordById(table, id) {
  return request.get(`${API_BASE}/tables/${table}/records/${id}`);
}

/**
 * 创建记录
 */
export function createRecord(table, data) {
  return request.post(`${API_BASE}/tables/${table}/records`, data);
}

/**
 * 更新记录
 */
export function updateRecord(table, id, data) {
  return request.put(`${API_BASE}/tables/${table}/records/${id}`, data);
}

/**
 * 删除记录
 */
export function deleteRecord(table, id) {
  return request.delete(`${API_BASE}/tables/${table}/records/${id}`);
}

/**
 * 获取用户列表
 */
export function getUsers(params = {}) {
  return request.get(`${API_BASE}/users`, { params });
}

/**
 * 获取单个用户
 */
export function getUser(id) {
  return request.get(`${API_BASE}/users/${id}`);
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request.delete(`${API_BASE}/users/${id}`);
}

/**
 * 获取用户的会话列表
 */
export function getUserConversations(userId) {
  return request.get(`${API_BASE}/users/${userId}/conversations`);
}

/**
 * 获取会话列表
 */
export function getConversations(params = {}) {
  return request.get(`${API_BASE}/conversations`, { params });
}

/**
 * 获取会话详情
 */
export function getConversation(id) {
  return request.get(`${API_BASE}/conversations/${id}`);
}

/**
 * 获取会话的聊天记录
 */
export function getConversationChats(conversationId) {
  return request.get(`${API_BASE}/conversations/${conversationId}/chats`);
}

/**
 * 删除会话
 */
export function deleteConversation(id) {
  return request.delete(`${API_BASE}/conversations/${id}`);
}

/**
 * 获取书签列表
 */
export function getBookmarks(params = {}) {
  return request.get(`${API_BASE}/bookmarks`, { params });
}

/**
 * 删除书签
 */
export function deleteBookmark(id) {
  return request.delete(`${API_BASE}/bookmarks/${id}`);
}

/**
 * 获取统计数据
 */
export function getStatistics(params = {}) {
  return request.get(`${API_BASE}/statistics`, { params });
}

/**
 * 获取活跃度统计
 */
export function getActivityStats(params = {}) {
  return request.get(`${API_BASE}/activity`, { params });
}

/**
 * 获取系统日志
 */
export function getLogs(params = {}) {
  return request.get(`${API_BASE}/logs`, { params });
}

/**
 * 获取系统配置
 */
export function getConfig() {
  return request.get(`${API_BASE}/config`);
}

/**
 * 保存系统配置
 */
export function saveConfig(config) {
  return request.post(`${API_BASE}/config`, config);
}

/**
 * 获取系统信息
 */
export function getSystemInfo() {
  return request.get(`${API_BASE}/system/info`);
}

/**
 * 备份数据库
 */
export function backupDatabase() {
  return request.post(`${API_BASE}/system/backup`);
}
