/**
 * 管理路由
 * 提供数据库管理的 API 接口
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

// 获取所有表名
router.get('/tables', AdminController.getTables);

// 获取数据库统计信息
router.get('/stats', AdminController.getStats);

// 获取表结构
router.get('/tables/:table/schema', AdminController.getTableSchema);

// 获取表数据
router.get('/tables/:table/data', AdminController.getTableData);

// 搜索记录
router.get('/tables/:table/search', AdminController.searchRecords);

// 根据 ID 获取单条记录
router.get('/tables/:table/records/:id', AdminController.getRecordById);

// 创建记录
router.post('/tables/:table/records', AdminController.createRecord);

// 更新记录
router.put('/tables/:table/records/:id', AdminController.updateRecord);

// 删除记录
router.delete('/tables/:table/records/:id', AdminController.deleteRecord);

module.exports = router;
