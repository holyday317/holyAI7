/**
 * SQLite 数据库配置
 * 使用 sql.js 实现，完全在内存中运行，可持久化到文件
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

class SQLiteDatabase {
  constructor() {
    this.db = null;
    // 将数据库文件放在项目根目录内的 data 文件夹中
    this.dbPath = path.join(__dirname, '../data/holy7.db');
    this.idCounters = new Map();
  }

  /**
   * 初始化数据库连接
   */
  async init() {
    try {
      // 初始化 sql.js
      const SQL = await initSqlJs();

      // 检查数据库文件是否存在
      if (fs.existsSync(this.dbPath)) {
        // 从文件加载数据库
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
        console.log('✅ SQLite 数据库已从文件加载:', this.dbPath);
      } else {
        // 创建新数据库
        this.db = new SQL.Database();
        console.log('✅ SQLite 数据库已创建');
      }

      // 初始化表结构
      this.initTables();
      
      // 加载 ID 计数器
      this.loadIdCounters();
      
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error);
      throw error;
    }
  }

  /**
   * 初始化数据表
   */
  initTables() {
    // 创建待办事项表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建聊天记录表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER DEFAULT NULL,
        model_type TEXT NOT NULL,
        user_message TEXT NOT NULL,
        ai_response TEXT,
        reasoning_content TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 检查并添加 conversation_id 字段（如果不存在）
    try {
      const result = this.db.exec("PRAGMA table_info(chats)");
      const hasConversationId = result[0].values.some(row => row[1] === 'conversation_id');
      
      if (!hasConversationId) {
        this.db.run(`ALTER TABLE chats ADD COLUMN conversation_id INTEGER DEFAULT NULL`);
        console.log('✅ 已为 chats 表添加 conversation_id 字段');
      }
    } catch (error) {
      console.warn('⚠️ 检查/添加 conversation_id 字段失败:', error.message);
    }

    // 创建用户表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login TEXT
      )
    `);

    // 创建 ID 计数器表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS id_counters (
        collection_name TEXT PRIMARY KEY,
        next_id INTEGER NOT NULL
      )
    `);

    // 创建会话表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        user_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建收藏表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        chat_id TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        note TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 创建问卷记录表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS questionnaires (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ 数据表初始化完成');
  }

  /**
   * 加载 ID 计数器
   */
  loadIdCounters() {
    const result = this.db.exec('SELECT collection_name, next_id FROM id_counters');
    if (result.length > 0 && result[0].values.length > 0) {
      result[0].values.forEach(([name, id]) => {
        this.idCounters.set(name, id);
      });
    } else {
      // 初始化默认计数器
      this.idCounters.set('todos', 1);
      this.idCounters.set('chats', 1);
      this.idCounters.set('users', 1);
      this.idCounters.set('conversations', 1);
      this.idCounters.set('bookmarks', 1);
      this.idCounters.set('questionnaires', 1);
    }
  }

  /**
   * 生成唯一 ID
   */
  generateId(collection) {
    const currentId = this.idCounters.get(collection) || 1;
    this.idCounters.set(collection, currentId + 1);
    
    // 更新数据库中的计数器
    this.db.run(
      `INSERT OR REPLACE INTO id_counters (collection_name, next_id) VALUES (?, ?)`,
      [collection, currentId + 1]
    );
    
    return currentId;
  }

  /**
   * 执行原始 SQL 语句
   */
  run(sql, params = []) {
    try {
      this.db.run(sql, params);
    } catch (error) {
      console.error('❌ 执行 SQL 失败:', error);
      throw error;
    }
  }

  /**
   * 执行查询并返回结果
   */
  exec(sql, params = []) {
    try {
      if (params && params.length > 0) {
        // 对于带参数的查询,需要先替换参数
        let paramIndex = 0;
        const sqlWithParams = sql.replace(/\?/g, () => {
          if (paramIndex < params.length) {
            const param = params[paramIndex++];
            if (typeof param === 'string') {
              return `'${param.replace(/'/g, "''")}'`;
            } else if (param === null) {
              return 'NULL';
            } else {
              return String(param);
            }
          }
          return '?';
        });
        return this.db.exec(sqlWithParams);
      } else {
        return this.db.exec(sql);
      }
    } catch (error) {
      console.error('❌ 查询 SQL 失败:', error);
      throw error;
    }
  }

  /**
   * 保存数据库到文件
   */
  save() {
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
      console.log('💾 数据库已保存到文件:', this.dbPath);
    } catch (error) {
      console.error('❌ 数据库保存失败:', error);
    }
  }

  /**
   * 插入数据
   */
  insert(table, data) {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map(() => '?').join(', ');
      
      const id = this.generateId(table);
      const now = new Date().toISOString();
      
      const query = `
        INSERT INTO ${table} (id, ${columns.join(', ')}, created_at)
        VALUES (?, ${placeholders}, ?)
      `;
      
      this.db.run(query, [id, ...values, now]);
      
      // 获取插入的数据
      const result = this.db.exec(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      const inserted = this.rowToObject(result);
      
      this.save();
      return inserted;
    } catch (error) {
      console.error('❌ 插入数据失败:', error);
      throw error;
    }
  }

  /**
   * 查找所有数据
   */
  findAll(table) {
    try {
      const result = this.db.exec(`SELECT * FROM ${table} ORDER BY created_at DESC`);
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
      console.error('❌ 查询数据失败:', error);
      return [];
    }
  }

  /**
   * 根据 ID 查找数据
   */
  findById(table, id) {
    try {
      const result = this.db.exec(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      if (result.length === 0 || result[0].values.length === 0) return null;
      
      const columns = result[0].columns;
      const row = result[0].values[0];
      
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    } catch (error) {
      console.error('❌ 查询数据失败:', error);
      return null;
    }
  }

  /**
   * 更新数据
   */
  update(table, id, updates) {
    try {
      const updateColumns = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = updateColumns.map(col => `${col} = ?`).join(', ');
      
      const now = new Date().toISOString();
      const query = `
        UPDATE ${table}
        SET ${setClause}, updated_at = ?
        WHERE id = ?
      `;
      
      this.db.run(query, [...values, now, id]);
      
      // 获取更新后的数据
      const result = this.db.exec(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      if (result.length === 0 || result[0].values.length === 0) return null;
      
      const columns = result[0].columns;
      const row = result[0].values[0];
      
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      
      this.save();
      return obj;
    } catch (error) {
      console.error('❌ 更新数据失败:', error);
      return null;
    }
  }

  /**
   * 删除数据
   */
  delete(table, id) {
    try {
      // 先获取要删除的数据
      const deleted = this.findById(table, id);
      if (!deleted) return null;
      
      // 执行删除
      this.db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
      
      this.save();
      return deleted;
    } catch (error) {
      console.error('❌ 删除数据失败:', error);
      return null;
    }
  }

  /**
   * 统计数量
   */
  count(table) {
    try {
      const result = this.db.exec(`SELECT COUNT(*) as count FROM ${table}`);
      if (result.length === 0) return 0;
      return result[0].values[0][0];
    } catch (error) {
      console.error('❌ 统计失败:', error);
      return 0;
    }
  }

  /**
   * 将查询结果转换为对象
   */
  rowToObject(result) {
    if (result.length === 0 || result[0].values.length === 0) return null;
    
    const columns = result[0].columns;
    const row = result[0].values[0];
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  }


  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.save();
      this.db.close();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

// 创建单例实例
const db = new SQLiteDatabase();

// 初始化数据库并导出
db.init().catch(error => {
  console.error('数据库初始化失败:', error);
  process.exit(1);
});

// 优雅关闭
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});

module.exports = db;
