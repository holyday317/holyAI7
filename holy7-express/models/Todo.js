/**
 * Todo 模型
 * 封装待办事项的业务逻辑
 */

const db = require('../config/database');

class Todo {
  /**
   * 获取所有待办事项
   */
  static findAll() {
    return db.findAll('todos');
  }

  /**
   * 根据 ID 查找待办事项
   */
  static findById(id) {
    return db.findById('todos', id);
  }

  /**
   * 创建新待办事项
   */
  static create(data) {
    const { title, completed } = data;
    return db.insert('todos', { title, completed });
  }

  /**
   * 更新待办事项
   */
  static update(id, data) {
    const { title, completed } = data;
    return db.update('todos', id, { title, completed });
  }

  /**
   * 删除待办事项
   */
  static delete(id) {
    return db.delete('todos', id);
  }

  /**
   * 获取统计信息
   */
  static getStats() {
    const todos = this.findAll();
    const total = todos.length;
    const completed = todos.filter(t => t.completed === 1).length;
    const pending = total - completed;

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
    };
  }

  /**
   * 标记为完成/未完成
   */
  static toggleComplete(id) {
    const todo = this.findById(id);
    if (!todo) return null;

    return this.update(id, {
      completed: todo.completed === 1 ? 0 : 1
    });
  }

  /**
   * 批量更新完成状态
   */
  static bulkUpdateCompleted(ids, completed) {
    return ids.map(id => this.update(id, { completed }));
  }

  /**
   * 搜索待办事项
   */
  static search(keyword) {
    const todos = this.findAll();
    return todos.filter(todo => 
      todo.title.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 获取已完成的待办事项
   */
  static getCompleted() {
    const todos = this.findAll();
    return todos.filter(t => t.completed === 1);
  }

  /**
   * 获取未完成的待办事项
   */
  static getPending() {
    const todos = this.findAll();
    return todos.filter(t => t.completed === 0);
  }
}

module.exports = Todo;
