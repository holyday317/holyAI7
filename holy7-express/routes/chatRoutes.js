const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// AI 聊天接口
router.post('/chat', chatController.chatWithAI);

// 获取支持的模型列表
router.get('/models', chatController.getModels);

// AI 服务健康检查
router.get('/health', chatController.healthCheck);

module.exports = router;