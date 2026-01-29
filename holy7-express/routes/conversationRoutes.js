const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const { authMiddleware } = require('../middleware/auth');

/**
 * 获取所有会话列表
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = Conversation.findByUserId(userId);
    res.json({
      success: true,
      data: {
        conversations
      }
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取会话列表失败'
    });
  }
});

/**
 * 创建新会话
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    const conversation = Conversation.create({
      title: title || '新对话',
      user_id: userId
    });

    res.status(201).json({
      success: true,
      message: '会话创建成功',
      data: {
        conversation
      }
    });
  } catch (error) {
    console.error('创建会话失败:', error);
    res.status(500).json({
      success: false,
      message: '创建会话失败'
    });
  }
});

/**
 * 更新会话标题
 */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    // 检查会话是否属于该用户
    const existingConversation = Conversation.findById(id, userId);
    if (!existingConversation) {
      return res.status(404).json({
        success: false,
        message: '会话不存在或无权访问'
      });
    }

    const conversation = Conversation.update(id, { title });

    res.json({
      success: true,
      message: '会话更新成功',
      data: {
        conversation
      }
    });
  } catch (error) {
    console.error('更新会话失败:', error);
    res.status(500).json({
      success: false,
      message: '更新会话失败'
    });
  }
});

/**
 * 删除会话
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查会话是否属于该用户
    const existingConversation = Conversation.findById(id, userId);
    if (!existingConversation) {
      return res.status(404).json({
        success: false,
        message: '会话不存在或无权访问'
      });
    }

    const conversation = Conversation.delete(id);

    res.json({
      success: true,
      message: '会话删除成功',
      data: {
        conversation
      }
    });
  } catch (error) {
    console.error('删除会话失败:', error);
    res.status(500).json({
      success: false,
      message: '删除会话失败'
    });
  }
});

/**
 * 获取会话下的聊天记录
 */
router.get('/:id/chats', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chats = Conversation.getChats(id, userId);

    res.json({
      success: true,
      data: {
        chats
      }
    });
  } catch (error) {
    console.error('获取会话聊天记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取会话聊天记录失败'
    });
  }
});

module.exports = router;
