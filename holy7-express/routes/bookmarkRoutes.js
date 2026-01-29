const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * 获取用户的所有书签
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const bookmarks = Bookmark.findByUserId(userId);
    
    logger.info('获取书签列表', { userId, count: bookmarks.length });
    
    res.json({
      success: true,
      data: {
        bookmarks
      }
    });
  } catch (error) {
    logger.error('获取书签列表失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '获取书签列表失败'
    });
  }
});

/**
 * 创建书签
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { chatId, content, note } = req.body;
    const userId = req.user.id;

    // 验证必填字段
    if (!chatId || !content) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：chatId 或 content'
      });
    }

    // 检查是否已存在
    if (Bookmark.exists(chatId, userId)) {
      return res.status(400).json({
        success: false,
        message: '该内容已收藏'
      });
    }

    const bookmark = Bookmark.create({
      userId,
      chatId,
      content,
      note: note || ''
    });

    logger.info('创建书签成功', { userId, bookmarkId: bookmark.id, chatId });

    res.status(201).json({
      success: true,
      message: '收藏成功',
      data: {
        bookmark
      }
    });
  } catch (error) {
    logger.error('创建书签失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '收藏失败'
    });
  }
});

/**
 * 更新书签
 */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user.id;

    const updatedBookmark = Bookmark.update(id, userId, { note });

    if (!updatedBookmark) {
      return res.status(404).json({
        success: false,
        message: '书签不存在或无权访问'
      });
    }

    logger.info('更新书签成功', { userId, bookmarkId: id });

    res.json({
      success: true,
      message: '更新成功',
      data: {
        bookmark: updatedBookmark
      }
    });
  } catch (error) {
    logger.error('更新书签失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
});

/**
 * 删除书签
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedBookmark = Bookmark.delete(id, userId);

    if (!deletedBookmark) {
      return res.status(404).json({
        success: false,
        message: '书签不存在或无权访问'
      });
    }

    logger.info('删除书签成功', { userId, bookmarkId: id });

    res.json({
      success: true,
      message: '删除成功',
      data: {
        bookmark: deletedBookmark
      }
    });
  } catch (error) {
    logger.error('删除书签失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

/**
 * 检查聊天是否已收藏
 */
router.get('/check/:chatId', authMiddleware, (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const isBookmarked = Bookmark.exists(chatId, userId);

    res.json({
      success: true,
      data: {
        isBookmarked
      }
    });
  } catch (error) {
    logger.error('检查书签失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '检查失败'
    });
  }
});

module.exports = router;
