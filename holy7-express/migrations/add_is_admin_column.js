/**
 * 数据库迁移脚本：添加 is_admin 字段到 users 表
 * 
 * 运行方式：node holy7-express/migrations/add_is_admin_column.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// 数据库路径
const dbPath = path.join(__dirname, '../../data/holy7.db');

console.log('开始数据库迁移：添加 is_admin 字段...');
console.log('数据库路径:', dbPath);

async function runMigration() {
  try {
    // 检查数据库文件是否存在
    if (!fs.existsSync(dbPath)) {
      console.error('数据库文件不存在，请先启动应用程序');
      process.exit(1);
    }

    // 初始化 sql.js
    const SQL = await initSqlJs();

    // 从文件加载数据库
    const fileBuffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    console.log('✅ 数据库已加载');

    // 检查 is_admin 字段是否已存在
    const pragmaResult = db.exec('PRAGMA table_info(users)');
    const hasIsAdminColumn = pragmaResult.length > 0 && pragmaResult[0].columns.includes('is_admin');

    if (hasIsAdminColumn) {
      console.log('✓ is_admin 字段已存在，跳过迁移');
    } else {
      console.log('正在添加 is_admin 字段...');
      
      // 添加 is_admin 字段
      db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0');
      
      console.log('✓ 成功添加 is_admin 字段');
      
      // 创建一个默认管理员账户（可选）
      const result = db.exec('SELECT * FROM users WHERE username = "admin"');
      
      if (result.length > 0 && result[0].values.length > 0) {
        // 将第一个用户设置为管理员
        db.exec('UPDATE users SET is_admin = 1 WHERE username = "admin"');
        console.log(`✓ 已将用户 "admin" 设置为管理员`);
      } else {
        console.log('⚠ 未找到 admin 用户，将第一个用户设置为管理员');
        const firstUserResult = db.exec('SELECT * FROM users LIMIT 1');
        if (firstUserResult.length > 0 && firstUserResult[0].values.length > 0) {
          db.exec('UPDATE users SET is_admin = 1 WHERE id = 1');
          console.log('✓ 已将第一个用户设置为管理员');
        }
      }
      
      // 保存数据库
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
      console.log('✅ 数据库已保存');
    }

    console.log('\n数据库迁移完成！');
    console.log('\n说明：');
    console.log('- 所有现有用户的 is_admin 值默认为 0（普通用户）');
    console.log('- admin 用户或第一个用户已被设置为管理员');
    console.log('- 您可以使用 User.setAsAdmin(userId) 方法将其他用户设置为管理员');

    process.exit(0);
  } catch (error) {
    console.error('数据库迁移失败:', error);
    process.exit(1);
  }
}

runMigration();
