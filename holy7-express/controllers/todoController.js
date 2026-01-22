const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * 获取所有待办事项
 */
const getAllTodos = (req, res, next) => {
  try {
    const todos = db.findAll('todos');
    logger.info('获取所有待办事项', { count: todos.length });
    res.json({
      success: true,
      data: todos,
      count: todos.length
    });
  } catch (error) {
    logger.error('获取待办事项失败', { error: error.message });
    next(error);
  }
};

/**
 * 获取单个待办事项
 */
const getTodoById = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const todo = db.findById('todos', id);
    
    if (!todo) {
      logger.warn('待办事项不存在', { id });
      return res.status(404).json({
        success: false,
        error: '待办事项不存在'
      });
    }
    
    logger.info('获取单个待办事项', { id });
    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    logger.error('获取待办事项失败', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * 创建新待办事项
 */
const createTodo = (req, res, next) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      logger.warn('创建待办事项失败：标题为空');
      return res.status(400).json({
        success: false,
        error: '标题不能为空'
      });
    }
    
    const newTodo = db.insert('todos', { title, completed: false });
    logger.info('创建待办事项成功', { id: newTodo.id, title });
    
    res.status(201).json({
      success: true,
      data: newTodo,
      message: '待办事项创建成功'
    });
  } catch (error) {
    logger.error('创建待办事项失败', { error: error.message });
    next(error);
  }
};

/**
 * 更新待办事项
 */
const updateTodo = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;
    
    const updatedTodo = db.update('todos', id, { title, completed });
    
    if (!updatedTodo) {
      logger.warn('更新待办事项失败：不存在', { id });
      return res.status(404).json({
        success: false,
        error: '待办事项不存在'
      });
    }
    
    logger.info('更新待办事项成功', { id });
    res.json({
      success: true,
      data: updatedTodo,
      message: '待办事项更新成功'
    });
  } catch (error) {
    logger.error('更新待办事项失败', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * 删除待办事项
 */
const deleteTodo = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const deletedTodo = db.delete('todos', id);
    
    if (!deletedTodo) {
      logger.warn('删除待办事项失败：不存在', { id });
      return res.status(404).json({
        success: false,
        error: '待办事项不存在'
      });
    }
    
    logger.info('删除待办事项成功', { id });
    res.json({
      success: true,
      data: deletedTodo,
      message: '待办事项删除成功'
    });
  } catch (error) {
    logger.error('删除待办事项失败', { id: req.params.id, error: error.message });
    next(error);
  }
};

/**
 * 获取统计信息
 */
const getStats = (req, res, next) => {
  try {
    const todos = db.findAll('todos');
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    
    logger.info('获取统计信息', { total, completed, pending });
    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    logger.error('获取统计信息失败', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  getStats
};