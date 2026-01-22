# holy7-express

holyAI7 项目的后端服务，基于 Express.js 构建。

## 功能特性

- ✅ RESTful API 设计
- ✅ CORS 跨域支持
- ✅ 请求日志记录
- ✅ 统一错误处理
- ✅ 待办事项 CRUD 操作
- ✅ AI 聊天接口（DeepSeek）
- ✅ 统计信息接口

## 技术栈

- **框架**: Express 5.2.1
- **跨域**: CORS 2.8.5
- **开发工具**: Nodemon 3.0.0

## 快速开始

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

根据需要修改 `.env` 文件中的配置：

```env
PORT=3000
NODE_ENV=development

# AI 服务配置
DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

**重要**：请确保设置了 `DEEPSEEK_API_KEY`，否则 AI 聊天功能无法使用。

### 运行服务

**开发模式（自动重启）**:
```bash
npm run dev
```

**生产模式**:
```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

## API 接口文档

### 基础信息

- **Base URL**: `http://localhost:3000`
- **响应格式**: JSON

### 待办事项接口 (`/api`)

#### 1. 健康检查
```
GET /health
```

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T05:35:00.000Z",
  "service": "holy7-express"
}
```

#### 2. 获取所有待办事项
```
GET /api/todos
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "学习 Vue 3",
      "completed": false,
      "createdAt": "2026-01-22T05:35:00.000Z"
    }
  ],
  "count": 1
}
```

#### 3. 获取单个待办事项
```
GET /api/todos/:id
```

#### 4. 创建待办事项
```
POST /api/todos
Content-Type: application/json

{
  "title": "新任务"
}
```

#### 5. 更新待办事项
```
PUT /api/todos/:id
Content-Type: application/json

{
  "title": "更新后的任务",
  "completed": true
}
```

#### 6. 删除待办事项
```
DELETE /api/todos/:id
```

#### 7. 获取统计信息
```
GET /api/stats
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 7,
    "pending": 3,
    "completionRate": "70.00"
  }
}
```

### AI 聊天接口 (`/ai`)

#### 1. AI 聊天
```
POST /ai/chat
Content-Type: application/json

{
  "modelType": "deepseek",
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ]
}
```

**参数说明**:
- `modelType`: 模型类型，支持 `deepseek` 或 `deepseek-R1`
- `messages`: 消息数组，格式遵循 OpenAI 标准

**响应示例**:
```json
{
  "success": true,
  "data": {
    "role": "assistant",
    "content": "你好！有什么我可以帮助你的吗？",
    "reasoning_content": "推理过程内容（仅 deepseek-R1 模型返回）"
  }
}
```

#### 2. 获取支持的模型列表
```
GET /ai/models
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "key": "deepseek",
      "label": "DeepSeek",
      "apiUrl": "https://api.deepseek.com/chat/completions",
      "modelName": "deepseek-chat"
    },
    {
      "key": "deepseek-R1",
      "label": "DeepSeek-R1",
      "apiUrl": "https://api.deepseek.com/chat/completions",
      "modelName": "deepseek-reasoner"
    }
  ]
}
```

#### 3. AI 服务健康检查
```
GET /ai/health
```

**响应示例**:
```json
{
  "success": true,
  "status": "ok",
  "hasApiKey": true,
  "timestamp": "2026-01-22T05:35:00.000Z"
}
```

## 项目结构

```
holy7-express/
├── server.js               # 主服务器文件
├── routes/
│   ├── api.js              # 待办事项路由
│   └── chatRoutes.js       # AI 聊天路由
├── controllers/
│   ├── todoController.js   # 待办事项控制器
│   └── chatController.js   # AI 聊天控制器
├── middleware/
│   └── errorHandler.js     # 错误处理中间件
├── config/
│   └── database.js         # 内存数据库配置
├── utils/
│   └── logger.js           # 日志工具
├── package.json            # 项目配置
├── .env.example            # 环境变量示例
├── .gitignore              # Git 忽略文件
└── README.md               # 项目文档
```

## 安全性

### API Key 保护

- ✅ API Key 存储在服务器环境变量中，不暴露给前端
- ✅ 前端通过后端代理调用 AI 接口
- ✅ 支持多模型切换，所有模型共享同一个 API Key

### CORS 配置

当前配置允许所有来源访问。在生产环境中，建议配置具体的允许来源：

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com']
}));
```

## 错误处理

所有 API 错误响应格式：

```json
{
  "success": false,
  "error": "错误信息"
}
```

常见 HTTP 状态码：
- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `404` - 资源不存在
- `500` - 服务器内部错误

## 开发建议

### 添加新路由

1. 在 `routes/` 目录下创建新的路由文件
2. 在 `server.js` 中导入并挂载路由

```javascript
const newRoutes = require('./routes/newRoutes');
app.use('/api/new', newRoutes);
```

### 添加中间件

在 `server.js` 中的中间件配置部分添加自定义中间件：

```javascript
app.use((req, res, next) => {
  // 自定义逻辑
  next();
});
```

### 数据库集成

当前版本使用内存存储数据。如需集成数据库：

1. 安装数据库驱动（如 MongoDB、PostgreSQL）
2. 创建数据库配置文件
3. 替换内存存储为数据库操作

## 前后端集成

前端项目（holy7-front）可以通过以下方式调用后端 API：

```javascript
// 示例：获取所有待办事项
const response = await fetch('http://localhost:3000/api/todos');
const data = await response.json();
```

配置 CORS 后，前端可以直接访问后端接口。

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| DEEPSEEK_API_KEY | DeepSeek API Key | 必填 |
| LOG_LEVEL | 日志级别 | info |

## 注意事项

1. **API Key 配置**：必须设置 `DEEPSEEK_API_KEY` 环境变量，否则 AI 聊天功能无法使用
2. **数据持久化**：当前使用内存存储，重启服务会丢失数据
3. **生产环境**：生产环境建议配置 CORS、启用 HTTPS、配置日志轮转等
4. **API 费用**：DeepSeek API 按使用量收费，请注意控制使用频率

## 许可证

ISC