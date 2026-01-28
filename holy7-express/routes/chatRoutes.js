const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// AI 聊天接口
router.post('/chat', chatController.chatWithAI);

// 获取支持的模型列表
router.get('/models', chatController.getModels);

// 获取可用的 prompt 类型列表
router.get('/prompts', chatController.getPromptTypes);

// AI 服务健康检查
router.get('/health', chatController.healthCheck);

module.exports = router;