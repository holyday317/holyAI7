# SQLite 数据库集成说明

本项目使用 **SQLite** 作为数据库，通过 `sql.js` 实现，具有轻量、无需配置、易于部署的特点。

## 📋 特性

- ✅ **零配置**：无需安装数据库服务器
- ✅ **轻量级**：单文件存储，占用空间小
- ✅ **持久化**：数据自动保存到 `data/holy7.db` 文件
- ✅ **分层架构**：遵循 MVC 模式，代码结构清晰
- ✅ **易于备份**：只需复制 `holy7.db` 文件即可备份

## 🗂️ 数据库结构

### 待办事项表 (todos)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| title | TEXT | 待办事项标题 |
| completed | INTEGER | 完成状态 (0: 未完成, 1: 已完成) |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### 聊天记录表 (chats)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| model_type | TEXT | 模型类型 (如: deepseek, deepseek-R1) |
| user_message | TEXT | 用户消息 |
| ai_response | TEXT | AI 响应内容 |
| reasoning_content | TEXT | AI 推理过程（如 R1 模型） |
| created_at | TEXT | 创建时间 |

### ID 计数器表 (id_counters)
| 字段 | 类型 | 说明 |
|------|------|------|
| collection_name | TEXT | 集合名称（主键） |
| next_id | INTEGER | 下一个 ID |

## 📦 安装依赖

数据库依赖已在 `package.json` 中配置：

```bash
cd holy7-express
npm install
```

## 🏗️ 项目架构

采用分层架构设计，遵循 MVC 模式：

```
holy7-express/
├── config/
│   └── database.js       # 数据库连接和基础 CRUD 操作
├── models/               # 数据模型层（业务逻辑）
│   ├── Todo.js          # 待办事项模型
│   └── Chat.js          # 聊天记录模型
├── controllers/          # 控制器层（处理 HTTP 请求）
│   ├── todoController.js
│   └── chatController.js
└── routes/               # 路由层
    ├── api.js
    └── chatRoutes.js
```

### 职责划分

- **config/database.js**：数据库连接管理、表初始化、基础 CRUD 操作
- **models/**：封装业务逻辑，提供特定领域的数据操作方法
- **controllers/**：处理 HTTP 请求和响应，调用 models 层
- **routes/**：定义 API 路由，连接 URL 和控制器

## 🚀 使用方法

### 在 Model 层使用（推荐）

```javascript
// models/Todo.js
const db = require('../config/database');

class Todo {
  static findAll() {
    return db.findAll('todos');
  }

  static create(data) {
    const { title, completed } = data;
    return db.insert('todos', { title, completed });
  }

  static getStats() {
    const todos = this.findAll();
    // 业务逻辑处理
    return { total: todos.length, ... };
  }
}
```

### 在 Controller 层使用

```javascript
// controllers/todoController.js
const Todo = require('../models/Todo');

const getAllTodos = (req, res, next) => {
  try {
    const todos = Todo.findAll();
    res.json({ success: true, data: todos });
  } catch (error) {
    next(error);
  }
};

const createTodo = (req, res, next) => {
  try {
    const { title } = req.body;
    const newTodo = Todo.create({ title, completed: 0 });
    res.json({ success: true, data: newTodo });
  } catch (error) {
    next(error);
  }
};
```

### 直接使用数据库（不推荐，仅用于 Model 层）

```javascript
// 仅在 models/ 层使用
const db = require('../config/database');

// 基础 CRUD 操作
const todos = db.findAll('todos');
const todo = db.findById('todos', 1);
const newTodo = db.insert('todos', { title: '学习 SQLite', completed: 0 });
const updatedTodo = db.update('todos', 1, { title: '已更新', completed: 1 });
const deletedTodo = db.delete('todos', 1);
const count = db.count('todos');
```

## 💾 数据持久化

数据库会自动保存到 `data/holy7.db` 文件：

- **自动保存**：每次插入、更新、删除操作后自动保存
- **手动保存**：调用 `db.save()` 方法
- **加载**：服务启动时自动从文件加载数据

## 🔧 配置

### 数据库文件位置

默认路径：`holy7-express/data/holy7.db`

如需修改，编辑 [`config/database.js`](config/database.js:13)：

```javascript
this.dbPath = path.join(__dirname, '../data/holy7.db');
```

### 环境变量

无需额外环境变量配置。

## 📊 数据备份与恢复

### 备份

```bash
# 复制数据库文件
cp holy7-express/data/holy7.db holy7-express/data/holy7.backup.db
```

### 恢复

```bash
# 恢复数据库文件
cp holy7-express/data/holy7.backup.db holy7-express/data/holy7.db
```

## 🔄 从内存数据库迁移

由于采用了分层架构，迁移步骤清晰：

1. 安装 `sql.js` 依赖
2. 替换 [`config/database.js`](config/database.js:1) 文件
3. 创建 Model 层文件（[`models/Todo.js`](models/Todo.js:1)、[`models/Chat.js`](models/Chat.js:1)）
4. 更新 Controller 层引用 Model 而非直接使用数据库
5. 重启服务

**优势**：
- 业务逻辑集中在 Model 层，易于维护和测试
- 数据库操作与业务逻辑分离，便于切换数据库
- 代码结构清晰，符合 MVC 最佳实践

## 🛡️ 注意事项

1. **并发写入**：SQLite 在写入时锁定整个数据库，不适合高并发写入场景
2. **数据量**：适合中小型应用（< 10GB 数据）
3. **备份**：定期备份 `holy7.db` 文件
4. **Git 忽略**：数据库文件已添加到 [`.gitignore`](.gitignore:9)，不会被提交到版本控制

## 📚 相关资源

- [sql.js 官方文档](https://sql.js.org/)
- [SQLite 官方文档](https://www.sqlite.org/docs.html)
- 项目配置文件：[`package.json`](package.json:1)

## 🎯 性能优化建议

- 定期清理历史数据
- 为常用查询字段添加索引
- 避免存储过大的文本字段
- 考虑分表存储不同类型的数据
