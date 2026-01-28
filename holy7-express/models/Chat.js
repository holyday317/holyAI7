/**
 * Chat 模型
 * 封装聊天记录的业务逻辑
 */

const db = require('../config/database');

class Chat {
  /**
   * 获取所有聊天记录
   */
  static findAll() {
    return db.findAll('chats');
  }

  /**
   * 根据 ID 查找聊天记录
   */
  static findById(id) {
    return db.findById('chats', id);
  }

  /**
   * 创建新聊天记录
   */
  static create(data) {
    const { model_type, user_message, ai_response, reasoning_content } = data;
    return db.insert('chats', {
      model_type,
      user_message,
      ai_response,
      reasoning_content
    });
  }

  /**
   * 更新聊天记录
   */
  static update(id, data) {
    const { ai_response, reasoning_content } = data;
    return db.update('chats', id, { ai_response, reasoning_content });
  }

  /**
   * 删除聊天记录
   */
  static delete(id) {
    return db.delete('chats', id);
  }

  /**
   * 根据模型类型查询
   */
  static findByModelType(modelType) {
    const chats = this.findAll();
    return chats.filter(chat => chat.model_type === modelType);
  }

  /**
   * 获取最近的聊天记录
   */
  static getRecent(limit = 10) {
    const chats = this.findAll();
    return chats.slice(0, limit);
  }

  /**
   * 清空所有聊天记录
   */
  static clearAll() {
    const chats = this.findAll();
    chats.forEach(chat => this.delete(chat.id));
    return { deletedCount: chats.length };
  }

  /**
   * 统计聊天次数
   */
  static getStats() {
    const chats = this.findAll();
    const stats = {
      total: chats.length,
      byModel: {}
    };

    chats.forEach(chat => {
      const model = chat.model_type;
      if (!stats.byModel[model]) {
        stats.byModel[model] = 0;
      }
      stats.byModel[model]++;
    });

    return stats;
  }
}

module.exports = Chat;
