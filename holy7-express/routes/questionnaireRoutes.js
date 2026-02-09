const express = require('express');
const router = express.Router();
const Questionnaire = require('../models/Questionnaire');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * 获取用户的所有问卷记录
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;
    
    let questionnaires;
    if (type) {
      // 按类型筛选
      questionnaires = Questionnaire.findByUserIdAndType(userId, type);
    } else {
      // 获取所有记录
      questionnaires = Questionnaire.findByUserId(userId);
    }
    
    // 解析问卷数据
    questionnaires = Questionnaire.parseDataArray(questionnaires);
    
    logger.info('获取问卷记录列表', { userId, count: questionnaires.length });
    
    res.json({
      success: true,
      data: {
        questionnaires
      }
    });
  } catch (error) {
    logger.error('获取问卷记录列表失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '获取问卷记录列表失败'
    });
  }
});

/**
 * 获取单个问卷记录详情
 */
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const questionnaireData = Questionnaire.findById(id);
    
    if (!questionnaireData) {
      return res.status(404).json({
        success: false,
        message: '问卷记录不存在'
      });
    }
    
    // 检查权限
    if (questionnaireData.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权访问该问卷记录'
      });
    }
    
    // 解析问卷数据
    const questionnaire = Questionnaire.parseData(questionnaireData);
    
    logger.info('获取问卷记录详情', { userId, questionnaireId: id });
    
    res.json({
      success: true,
      data: {
        questionnaire
      }
    });
  } catch (error) {
    logger.error('获取问卷记录详情失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '获取问卷记录详情失败'
    });
  }
});

/**
 * 创建问卷记录
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { type, data } = req.body;
    const userId = req.user.id;

    // 验证必填字段
    if (!type || !data) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：type 或 data'
      });
    }

    const questionnaireData = Questionnaire.create({
      user_id: userId,
      type,
      data
    });

    // 解析问卷数据
    const questionnaire = Questionnaire.parseData(questionnaireData);

    logger.info('创建问卷记录成功', { userId, questionnaireId: questionnaire.id, type });

    res.status(201).json({
      success: true,
      message: '问卷记录创建成功',
      data: {
        questionnaire
      }
    });
  } catch (error) {
    logger.error('创建问卷记录失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '创建问卷记录失败'
    });
  }
});

/**
 * 删除问卷记录
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const questionnaire = Questionnaire.findById(id);
    
    if (!questionnaire) {
      return res.status(404).json({
        success: false,
        message: '问卷记录不存在'
      });
    }
    
    // 检查权限
    if (questionnaire.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权删除该问卷记录'
      });
    }

    const deletedQuestionnaire = Questionnaire.delete(id);

    logger.info('删除问卷记录成功', { userId, questionnaireId: id });

    res.json({
      success: true,
      message: '删除成功',
      data: {
        questionnaire: deletedQuestionnaire
      }
    });
  } catch (error) {
    logger.error('删除问卷记录失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

/**
 * 获取问卷统计信息
 */
router.get('/stats/summary', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const stats = Questionnaire.getStats(userId);
    
    logger.info('获取问卷统计信息', { userId, stats });
    
    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    logger.error('获取问卷统计信息失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '获取问卷统计信息失败'
    });
  }
});

module.exports = router;
