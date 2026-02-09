const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');

// AI 聊天接口（需要登录）
router.post('/chat', authMiddleware, chatController.chatWithAI);

// 获取支持的模型列表
router.get('/models', chatController.getModels);

// 获取可用的 prompt 类型列表
router.get('/prompts', chatController.getPromptTypes);

// AI 服务健康检查
router.get('/health', chatController.healthCheck);

module.exports = router;