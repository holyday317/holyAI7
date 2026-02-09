/**
 * 管理路由
 * 提供数据库管理的 API 接口
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { adminAuthMiddleware } = require('../middleware/adminAuth');

// ==================== 数据库表管理 ====================
// 所有接口都需要管理员权限

// 获取所有表名
router.get('/tables', adminAuthMiddleware, AdminController.getTables);

// 获取数据库统计信息
router.get('/stats', adminAuthMiddleware, AdminController.getStats);

// 获取表结构
router.get('/tables/:table/schema', adminAuthMiddleware, AdminController.getTableSchema);

// 获取表数据
router.get('/tables/:table/data', adminAuthMiddleware, AdminController.getTableData);

// 搜索记录
router.get('/tables/:table/search', adminAuthMiddleware, AdminController.searchRecords);

// 根据 ID 获取单条记录
router.get('/tables/:table/records/:id', adminAuthMiddleware, AdminController.getRecordById);

// 创建记录
router.post('/tables/:table/records', adminAuthMiddleware, AdminController.createRecord);

// 更新记录
router.put('/tables/:table/records/:id', adminAuthMiddleware, AdminController.updateRecord);

// 删除记录
router.delete('/tables/:table/records/:id', adminAuthMiddleware, AdminController.deleteRecord);

// ==================== 用户管理 ====================

// 获取用户列表
router.get('/users', adminAuthMiddleware, AdminController.getUsers);

// 获取用户详情
router.get('/users/:id', adminAuthMiddleware, AdminController.getUser);

// 删除用户
router.delete('/users/:id', adminAuthMiddleware, AdminController.deleteUser);

// 获取用户的会话列表
router.get('/users/:userId/conversations', adminAuthMiddleware, AdminController.getUserConversations);

// ==================== 会话管理 ====================

// 获取会话列表
router.get('/conversations', adminAuthMiddleware, AdminController.getConversations);

// 获取会话详情
router.get('/conversations/:id', adminAuthMiddleware, AdminController.getConversation);

// 获取会话的聊天记录
router.get('/conversations/:id/chats', adminAuthMiddleware, AdminController.getConversationChats);

// 删除会话
router.delete('/conversations/:id', adminAuthMiddleware, AdminController.deleteConversation);

// ==================== 书签管理 ====================

// 获取书签列表
router.get('/bookmarks', adminAuthMiddleware, AdminController.getBookmarks);

// 删除书签
router.delete('/bookmarks/:id', adminAuthMiddleware, AdminController.deleteBookmark);

module.exports = router;
