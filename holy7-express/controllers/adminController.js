/**
 * 管理控制器
 * 提供数据库数据的增删改查功能
 */

const db = require('../config/database');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Conversation = require('../models/Conversation');
const Bookmark = require('../models/Bookmark');

class AdminController {
  /**
   * 获取所有表名
   */
  static getTables(req, res) {
    try {
      const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      const tables = result.length > 0 ? result[0].values.map(row => row[0]) : [];
      res.json({ success: true, tables });
    } catch (error) {
      console.error('获取表名失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 获取表结构
   */
  static getTableSchema(req, res) {
    try {
      const { table } = req.params;
      const result = db.exec(`PRAGMA table_info(${table})`);
      const columns = result.length > 0 ? result[0].values.map(row => ({
        name: row[1],
        type: row[2],
        notNull: row[3] === 1,
        defaultValue: row[4],
        primaryKey: row[5] === 1
      })) : [];
      res.json({ success: true, columns });
    } catch (error) {
      console.error('获取表结构失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 获取表数据
   */
  static getTableData(req, res) {
    try {
      const { table } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // 获取总记录数
      const countResult = db.exec(`SELECT COUNT(*) as count FROM ${table}`);
      const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;

      // 获取数据
      const dataResult = db.exec(`SELECT * FROM ${table} ORDER BY rowid DESC LIMIT ? OFFSET ?`, [limit, offset]);
      
      let data = [];
      if (dataResult.length > 0) {
        const columns = dataResult[0].columns;
        data = dataResult[0].values.map(row => {
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      }

      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('获取表数据失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 根据 ID 获取单条记录
   */
  static getRecordById(req, res) {
    try {
      const { table, id } = req.params;
      const result = db.exec(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      
      if (result.length === 0 || result[0].values.length === 0) {
        return res.status(404).json({ success: false, error: '记录不存在' });
      }

      const columns = result[0].columns;
      const row = result[0].values[0];
      const record = {};
      columns.forEach((col, i) => {
        record[col] = row[i];
      });

      res.json({ success: true, record });
    } catch (error) {
      console.error('获取记录失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 创建记录
   */
  static createRecord(req, res) {
    try {
      const { table } = req.params;
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ success: false, error: '请提供数据' });
      }

      const result = db.insert(table, data);
      res.json({ success: true, record: result });
    } catch (error) {
      console.error('创建记录失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 更新记录
   */
  static updateRecord(req, res) {
    try {
      const { table, id } = req.params;
      const data = req.body;

      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ success: false, error: '请提供更新数据' });
      }

      const result = db.update(table, id, data);
      res.json({ success: true, record: result });
    } catch (error) {
      console.error('更新记录失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 删除记录
   */
  static deleteRecord(req, res) {
    try {
      const { table, id } = req.params;
      const result = db.delete(table, id);
      res.json({ success: true, deleted: result });
    } catch (error) {
      console.error('删除记录失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 搜索记录
   */
  static searchRecords(req, res) {
    try {
      const { table } = req.params;
      const { query, page = 1, limit = 20 } = req.query;

      if (!query) {
        return res.status(400).json({ success: false, error: '请提供搜索关键词' });
      }

      // 获取表结构以搜索所有文本列
      const schemaResult = db.exec(`PRAGMA table_info(${table})`);
      const columns = schemaResult.length > 0 ? schemaResult[0].values.map(row => row[1]) : [];

      // 构建 WHERE 条件
      const textColumns = columns.filter(col => {
        const type = schemaResult[0].values.find(row => row[1] === col)?.[2];
        return type && (type.includes('text') || type.includes('char') || type.includes('varchar'));
      });

      if (textColumns.length === 0) {
        return res.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }

      const whereClause = textColumns.map(col => `${col} LIKE ?`).join(' OR ');
      const searchParams = Array(textColumns.length).fill(`%${query}%`);

      // 获取总数
      const countResult = db.exec(`SELECT COUNT(*) as count FROM ${table} WHERE ${whereClause}`, searchParams);
      const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;

      // 获取数据
      const offset = (page - 1) * limit;
      const dataResult = db.exec(
        `SELECT * FROM ${table} WHERE ${whereClause} ORDER BY rowid DESC LIMIT ? OFFSET ?`,
        [...searchParams, limit, offset]
      );

      let data = [];
      if (dataResult.length > 0) {
        const resultColumns = dataResult[0].columns;
        data = dataResult[0].values.map(row => {
          const obj = {};
          resultColumns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      }

      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('搜索记录失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 获取数据库统计信息
   */
  static getStats(req, res) {
    try {
      const tables = [];
      const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      
      if (result.length > 0) {
        for (const row of result[0].values) {
          const tableName = row[0];
          const countResult = db.exec(`SELECT COUNT(*) as count FROM ${tableName}`);
          const count = countResult.length > 0 ? countResult[0].values[0][0] : 0;
          tables.push({ name: tableName, count });
        }
      }

      res.json({ success: true, tables });
    } catch (error) {
      console.error('获取统计信息失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 获取用户列表
   */
  static getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search, user_id } = req.query;
      const offset = (page - 1) * limit;
      
      let sql = 'SELECT * FROM users WHERE 1=1';
      const params = [];
      
      if (search) {
        sql += ' AND username LIKE ?';
        params.push(`%${search}%`);
      }
      
      if (user_id) {
        sql += ' AND id = ?';
        params.push(user_id);
      }
      
      // 获取总数
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
      const countResult = db.exec(countSql, params);
      const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;
      
      // 获取数据
      sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      const dataResult = db.exec(sql, [...params, parseInt(limit), offset]);
      
      let data = [];
      if (dataResult.length > 0) {
        const columns = dataResult[0].columns;
        data = dataResult[0].values.map(row => {
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      }
      
      // 为每个用户添加统计信息
      data = data.map(user => {
        const conversationResult = db.exec('SELECT COUNT(*) as count FROM conversations WHERE user_id = ?', [user.id]);
        const conversationCount = conversationResult.length > 0 ? conversationResult[0].values[0][0] : 0;
        
        const bookmarkResult = db.exec('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?', [user.id]);
        const bookmarkCount = bookmarkResult.length > 0 ? bookmarkResult[0].values[0][0] : 0;
        
        return {
          ...user,
          conversation_count: conversationCount,
          bookmark_count: bookmarkCount
        };
      });
      
      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 获取单个用户详情
   */
  static getUser(req, res) {
    try {
      const { id } = req.params;
      const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
      
      if (result.length === 0 || result[0].values.length === 0) {
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      
      const columns = result[0].columns;
      const row = result[0].values[0];
      const user = {};
      columns.forEach((col, i) => {
        user[col] = row[i];
      });
      
      // 添加统计信息
      const conversationResult = db.exec('SELECT COUNT(*) as count FROM conversations WHERE user_id = ?', [id]);
      user.conversation_count = conversationResult.length > 0 ? conversationResult[0].values[0][0] : 0;
      
      const bookmarkResult = db.exec('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?', [id]);
      user.bookmark_count = bookmarkResult.length > 0 ? bookmarkResult[0].values[0][0] : 0;
      
      res.json({ success: true, user });
    } catch (error) {
      console.error('获取用户详情失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 删除用户
   */
  static deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // 先删除用户的会话
      db.exec('DELETE FROM conversations WHERE user_id = ?', [id]);
      
      // 删除用户的书签
      db.exec('DELETE FROM bookmarks WHERE user_id = ?', [id]);
      
      // 删除用户
      const result = db.exec('DELETE FROM users WHERE id = ?', [id]);
      
      res.json({ success: true, deleted: result });
    } catch (error) {
      console.error('删除用户失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 获取用户的会话列表
   */
  static getUserConversations(req, res) {
    try {
      const { userId } = req.params;
      const result = db.exec('SELECT * FROM conversations WHERE user_id = ? ORDER BY id DESC', [userId]);
      
      let data = [];
      if (result.length > 0) {
        const columns = result[0].columns;
        data = result[0].values.map(row => {
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      }
      
      // 为每个会话添加聊天数量
      data = data.map(conv => {
        const chatResult = db.exec('SELECT COUNT(*) as count FROM chats WHERE conversation_id = ?', [conv.id]);
        return {
          ...conv,
          chat_count: chatResult.length > 0 ? chatResult[0].values[0][0] : 0
        };
      });
      
      res.json({ success: true, data });
    } catch (error) {
      console.error('获取用户会话列表失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 获取会话列表
   */
  static getConversations(req, res) {
    try {
      const { page = 1, limit = 20, search, user_id } = req.query;
      const offset = (page - 1) * limit;
      
      let sql = 'SELECT * FROM conversations WHERE 1=1';
      const params = [];
      
      if (search) {
        sql += ' AND title LIKE ?';
        params.push(`%${search}%`);
      }
      
      if (user_id) {
        sql += ' AND user_id = ?';
        params.push(user_id);
      }
      
      // 获取总数
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
      const countResult = db.exec(countSql, params);
      const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;
      
      // 获取数据
      sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      const dataResult = db.exec(sql, [...params, parseInt(limit), offset]);
      
      let data = [];
      if (dataResult.length > 0) {
        const columns = dataResult[0].columns;
        data = dataResult[0].values.map(row => {
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      }
      
      // 为每个会话添加聊天数量
      data = data.map(conv => {
        const chatResult = db.exec('SELECT COUNT(*) as count FROM chats WHERE conversation_id = ?', [conv.id]);
        return {
          ...conv,
          chat_count: chatResult.length > 0 ? chatResult[0].values[0][0] : 0
        };
      });
      
      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('获取会话列表失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 获取会话详情
   */
  static getConversation(req, res) {
    try {
      const { id } = req.params;
      const result = db.exec('SELECT * FROM conversations WHERE id = ?', [id]);
      
      if (result.length === 0 || result[0].values.length === 0) {
        return res.status(404).json({ success: false, error: '会话不存在' });
      }
      
      const columns = result[0].columns;
      const row = result[0].values[0];
      const conversation = {};
      columns.forEach((col, i) => {
        conversation[col] = row[i];
      });
      
      // 添加聊天数量
      const chatResult = db.exec('SELECT COUNT(*) as count FROM chats WHERE conversation_id = ?', [id]);
      conversation.chat_count = chatResult.length > 0 ? chatResult[0].values[0][0] : 0;
      
      res.json({ success: true, conversation });
    } catch (error) {
      console.error('获取会话详情失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 获取会话的聊天记录
   */
  static getConversationChats(req, res) {
    try {
      const { id } = req.params;
      const result = db.exec('SELECT * FROM chats WHERE conversation_id = ? ORDER BY id ASC', [id]);
      
      let data = [];
      if (result.length > 0) {
        const columns = result[0].columns;
        data = result[0].values.map(row => {
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      }
      
      res.json({ success: true, data });
    } catch (error) {
      console.error('获取聊天记录失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 删除会话
   */
  static deleteConversation(req, res) {
    try {
      const { id } = req.params;
      
      // 先删除会话的聊天记录
      db.exec('DELETE FROM chats WHERE conversation_id = ?', [id]);
      
      // 删除会话
      const result = db.exec('DELETE FROM conversations WHERE id = ?', [id]);
      
      res.json({ success: true, deleted: result });
    } catch (error) {
      console.error('删除会话失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 获取书签列表
   */
  static getBookmarks(req, res) {
    try {
      const { page = 1, limit = 20, search, user_id } = req.query;
      const offset = (page - 1) * limit;
      
      let sql = 'SELECT * FROM bookmarks WHERE 1=1';
      const params = [];
      
      if (search) {
        sql += ' AND content LIKE ?';
        params.push(`%${search}%`);
      }
      
      if (user_id) {
        sql += ' AND user_id = ?';
        params.push(user_id);
      }
      
      // 获取总数
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
      const countResult = db.exec(countSql, params);
      const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;
      
      // 获取数据
      sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      const dataResult = db.exec(sql, [...params, parseInt(limit), offset]);
      
      let data = [];
      if (dataResult.length > 0) {
        const columns = dataResult[0].columns;
        data = dataResult[0].values.map(row => {
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      }
      
      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('获取书签列表失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * 删除书签
   */
  static deleteBookmark(req, res) {
    try {
      const { id } = req.params;
      const result = db.exec('DELETE FROM bookmarks WHERE id = ?', [id]);
      res.json({ success: true, deleted: result });
    } catch (error) {
      console.error('删除书签失败:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = AdminController;
