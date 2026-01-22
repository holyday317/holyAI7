# 前端集成说明

## 概述

前端项目已成功集成 axios 并对接后端 API 接口，实现了完整的待办事项管理功能。

## 新增文件

### 1. API 层
- **[`src/api/todo.js`](src/api/todo.js:1)** - 待办事项 API 接口封装
  - `getAllTodos()` - 获取所有待办事项
  - `getTodoById(id)` - 获取单个待办事项
  - `createTodo(data)` - 创建待办事项
  - `updateTodo(id, data)` - 更新待办事项
  - `deleteTodo(id)` - 删除待办事项
  - `getStats()` - 获取统计信息
  - `healthCheck()` - 健康检查

### 2. 工具层
- **[`src/utils/request.js`](src/utils/request.js:1)** - Axios 封装
  - 统一的请求配置（baseURL、timeout、headers）
  - 请求拦截器（可添加 token 等认证信息）
  - 响应拦截器（统一错误处理、数据格式化）

### 3. 组合式函数
- **[`src/composables/useTodos.js`](src/composables/useTodos.js:1)** - 待办事项业务逻辑
  - 响应式状态管理（todos、stats、loading、error）
  - 完整的 CRUD 操作（addTodo、toggleTodo、editTodo、removeTodo）
  - 自动加载数据（onMounted）

### 4. 视图组件
- **[`src/views/TodoView.vue`](src/views/TodoView.vue:1)** - 待办事项管理页面
  - 统计卡片展示（总计、已完成、待完成、完成率）
  - 添加待办事项功能
  - 待办事项列表展示
  - 切换完成状态
  - 删除待办事项
  - 后端服务健康状态检查
  - 刷新功能
  - 响应式设计（支持移动端）

## 修改文件

### 1. 依赖配置
- **[`package.json`](package.json:17)** - 添加 `axios` 依赖

### 2. 构建配置
- **[`vite.config.js`](vite.config.js:19)** - 配置开发服务器代理
  ```javascript
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
  ```

### 3. 路由配置
- **[`src/router/index.js`](src/router/index.js:12)** - 添加 `/todo` 路由

### 4. 导航菜单
- **[`src/App.vue`](src/App.vue:14)** - 添加"待办事项"导航链接

## 功能特性

### 1. 数据交互
- ✅ 通过 axios 发送 HTTP 请求
- ✅ 统一的错误处理机制
- ✅ 请求/响应拦截器
- ✅ 自动加载和刷新数据

### 2. 用户体验
- ✅ 加载状态提示
- ✅ 错误信息展示
- ✅ 健康状态检查
- ✅ 响应式设计
- ✅ 流畅的动画效果

### 3. 业务功能
- ✅ 查看所有待办事项
- ✅ 添加新待办事项
- ✅ 标记完成/未完成
- ✅ 删除待办事项
- ✅ 查看统计信息
- ✅ 实时数据刷新

## 使用方法

### 1. 安装依赖

```bash
cd holy7-front
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端将运行在 `http://localhost:5173`

### 3. 启动后端服务

在另一个终端中：

```bash
cd holy7-express
npm install
npm run dev
```

后端将运行在 `http://localhost:3000`

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`，然后点击导航栏中的"待办事项"链接。

## API 调用示例

### 获取所有待办事项

```javascript
import { getAllTodos } from '@/api/todo'

const response = await getAllTodos()
console.log(response.data) // 待办事项数组
```

### 创建待办事项

```javascript
import { createTodo } from '@/api/todo'

const response = await createTodo({ title: '学习 Vue 3' })
console.log(response.data) // 新创建的待办事项
```

### 在组件中使用

```javascript
import { useTodos } from '@/composables/useTodos'

const { todos, loading, error, addTodo, toggleTodo, removeTodo } = useTodos()

// 添加待办事项
await addTodo('新任务')

// 切换完成状态
await toggleTodo(todoId)

// 删除待办事项
await removeTodo(todoId)
```

## 项目结构

```
src/
├── api/
│   └── todo.js              # API 接口封装
├── composables/
│   └── useTodos.js          # 待办事项业务逻辑
├── utils/
│   └── request.js           # Axios 封装
├── views/
│   └── TodoView.vue         # 待办事项页面
├── router/
│   └── index.js             # 路由配置
└── App.vue                  # 根组件
```

## 技术要点

### 1. Axios 配置
- 创建 axios 实例统一配置
- baseURL 设置为 `/api`，配合 Vite 代理
- 超时时间设置为 10 秒
- 统一的 Content-Type 设置

### 2. 代理配置
- Vite 开发服务器代理 `/api` 请求到 `http://localhost:3000`
- 避免跨域问题
- `changeOrigin: true` 确保正确的主机头

### 3. 错误处理
- 请求错误：网络错误、配置错误
- 响应错误：400、404、500 等状态码
- 统一的错误提示和日志记录

### 4. 组合式 API
- 使用 Vue 3 Composition API
- 响应式状态管理
- 自动数据加载和更新
- 可复用的业务逻辑

## 注意事项

1. **后端服务必须启动**：前端依赖后端 API，请确保后端服务运行在 `http://localhost:3000`

2. **端口配置**：如果后端端口不是 3000，需要修改 [`vite.config.js`](vite.config.js:21) 中的 `target` 配置

3. **跨域问题**：Vite 代理已解决开发环境的跨域问题，生产环境需要后端配置 CORS

4. **数据持久化**：当前使用内存存储，重启后端服务会丢失数据

## 后续优化建议

1. **添加认证**：实现用户登录和权限管理
2. **数据持久化**：集成真实数据库（MongoDB、PostgreSQL 等）
3. **实时更新**：使用 WebSocket 实现实时数据同步
4. **状态管理**：使用 Pinia 进行全局状态管理
5. **单元测试**：为 API 和组件编写测试用例
6. **生产优化**：配置生产环境的 API 地址和错误处理