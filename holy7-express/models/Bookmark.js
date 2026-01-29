/**
 * 收藏模型
 * 使用 SQLite 数据库存储
 */

const db = require('../config/database');
const logger = require('../utils/logger');

class Bookmark {
  /**
   * 创建收藏
   */
  static create(data) {
    try {
      const { userId, chatId, content, note } = data;
      
      // 检查是否已存在
      if (this.exists(chatId, userId)) {
        throw new Error('该内容已收藏');
      }
      
      const bookmark = db.insert('bookmarks', {
        user_id: userId,
        chat_id: chatId,
        content: content,
        note: note || ''
      });
      
      logger.info('创建收藏成功', { userId, bookmarkId: bookmark.id, chatId });
      return bookmark;
    } catch (error) {
      logger.error('创建收藏失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 根据用户 ID 查找所有收藏
   */
  static findByUserId(userId) {
    try {
      const result = db.db.exec(
        'SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      if (result.length === 0) return [];
      
      const columns = result[0].columns;
      return result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });
    } catch (error) {
      logger.error('查找收藏失败', { error: error.message, userId });
      return [];
    }
  }

  /**
   * 根据 ID 查找收藏
   */
  static findById(id) {
    return db.findById('bookmarks', id);
  }

  /**
   * 更新收藏
   */
  static update(id, userId, updates) {
    try {
      const result = db.db.exec(
        'SELECT * FROM bookmarks WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (result.length === 0 || result[0].values.length === 0) {
        return null;
      }
      
      return db.update('bookmarks', id, updates);
    } catch (error) {
      logger.error('更新收藏失败', { error: error.message, id, userId });
      throw error;
    }
  }

  /**
   * 删除收藏
   */
  static delete(id, userId) {
    try {
      const result = db.db.exec(
        'SELECT * FROM bookmarks WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (result.length === 0 || result[0].values.length === 0) {
        return null;
      }
      
      const columns = result[0].columns;
      const row = result[0].values[0];
      const deleted = {};
      columns.forEach((col, i) => {
        deleted[col] = row[i];
      });
      
      db.db.run('DELETE FROM bookmarks WHERE id = ? AND user_id = ?', [id, userId]);
      db.save();
      
      logger.info('删除收藏成功', { userId, bookmarkId: id });
      return deleted;
    } catch (error) {
      logger.error('删除收藏失败', { error: error.message, id, userId });
      throw error;
    }
  }

  /**
   * 检查收藏是否存在
   */
  static exists(chatId, userId) {
    try {
      const result = db.db.exec(
        'SELECT COUNT(*) as count FROM bookmarks WHERE chat_id = ? AND user_id = ?',
        [chatId, userId]
      );
      
      if (result.length === 0) return false;
      return result[0].values[0][0] > 0;
    } catch (error) {
      logger.error('检查收藏失败', { error: error.message, chatId, userId });
      return false;
    }
  }

  /**
   * 统计用户的收藏数量
   */
  static countByUserId(userId) {
    try {
      const result = db.db.exec(
        'SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?',
        [userId]
      );
      
      if (result.length === 0) return 0;
      return result[0].values[0][0];
    } catch (error) {
      logger.error('统计收藏失败', { error: error.message, userId });
      return 0;
    }
  }
}

module.exports = Bookmark;
