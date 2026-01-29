# 数据库管理控制台

基于 Vue 3 + Element Plus 的数据库管理控制台，用于对 SQLite 数据库进行增删改查操作。

## 功能特性

- 查看所有数据表
- 查看表结构
- 数据的增删改查
- 分页查询
- 搜索记录
- 响应式设计

## 技术栈

- Vue 3
- Element Plus
- Vue Router
- Axios
- Vite

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3001

### 构建生产版本

```bash
npm run build
```

## 配置

后端 API 地址配置在 `vite.config.js` 中：

```javascript
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

## 项目结构

```
admin-front/
├── public/
├── src/
│   ├── api/          # API 接口
│   ├── components/   # 组件
│   ├── router/       # 路由配置
│   ├── utils/        # 工具函数
│   ├── views/        # 页面视图
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```
