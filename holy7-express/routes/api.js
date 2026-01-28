const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

// 待办事项路由
router.get('/todos', todoController.getAllTodos);
router.get('/todos/stats', todoController.getStats);
router.get('/todos/:id', todoController.getTodoById);
router.post('/todos', todoController.createTodo);
router.put('/todos/:id', todoController.updateTodo);
router.delete('/todos/:id', todoController.deleteTodo);

module.exports = router;