const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * 根据用户名查找用户
   */
  static findByUsername(username) {
    try {
      const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
      if (result.length === 0 || result[0].values.length === 0) return null;
      
      const columns = result[0].columns;
      const row = result[0].values[0];
      
      const user = {};
      columns.forEach((col, i) => {
        user[col] = row[i];
      });
      return user;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  /**
   * 根据 ID 查找用户
   */
  static findById(id) {
    try {
      const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
      if (result.length === 0 || result[0].values.length === 0) return null;
      
      const columns = result[0].columns;
      const row = result[0].values[0];
      
      const user = {};
      columns.forEach((col, i) => {
        user[col] = row[i];
      });
      return user;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  /**
   * 创建新用户
   */
  static async create(username, password) {
    try {
      // 检查用户名是否已存在
      const existingUser = this.findByUsername(username);
      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 插入新用户
      const id = db.generateId('users');
      const now = new Date().toISOString();
      
      db.run(
        `INSERT INTO users (id, username, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
        [id, username, hashedPassword, now, now]
      );

      // 获取新创建的用户
      const newUser = this.findById(id);
      
      db.save();
      return newUser;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 验证密码
   */
  static async verifyPassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('密码验证失败:', error);
      return false;
    }
  }

  /**
   * 更新用户最后登录时间
   */
  static updateLastLogin(id) {
    try {
      const now = new Date().toISOString();
      db.run(
        `UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?`,
        [now, now, id]
      );
      db.save();
    } catch (error) {
      console.error('更新登录时间失败:', error);
    }
  }
}

module.exports = User;
