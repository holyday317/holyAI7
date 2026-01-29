/**
 * 管理控制台 API
 */

import request from '../utils/request';

const API_BASE = 'http://106.54.34.24:3000/api/admin';

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
