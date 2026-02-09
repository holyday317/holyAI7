# Holy7 管理后台

基于 Vue 3 + Element Plus 的数据库管理控制台，提供完善的数据管理和系统监控功能。

## 功能特性

### 核心功能
- 📊 数据库表管理（查看、增删改查）
- 👥 用户管理
- 💬 会话管理
- ⭐ 书签管理
- 📈 数据统计与分析
- 🔍 系统日志查看
- ⚙️ 系统配置管理

### 技术特性
- 🎨 美观的UI设计（渐变色、响应式）
- 📊 丰富的数据可视化（ECharts图表）
- 🔄 环境自动切换（开发/生产）
- 📱 完全响应式布局
- 🚀 高性能加载（懒加载路由）

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

## 环境配置

项目支持多环境配置，通过环境变量自动切换 API 地址。

### 环境变量文件

项目包含以下环境配置文件：

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env.example` - 环境变量示例

### 配置说明

**开发环境** (`.env.development`):
```bash
VITE_API_BASE=http://localhost:3000
```

**生产环境** (`.env.production`):
```bash
VITE_API_BASE=http://106.54.34.24:3000
```

### 自动切换

应用会根据运行环境自动选择对应的配置文件：

- 运行 `npm run dev` 时使用开发环境配置
- 运行 `npm run build` 时使用生产环境配置

### Vite 配置

开发服务器配置在 `vite.config.js` 中：

```javascript
server: {
  port: 5173,  // 开发服务器端口
  host: true,  // 允许外部访问
}
```

### API 请求配置

API 请求基础路径配置在 `src/api/admin.js` 中：

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const API_BASE = `${API_BASE_URL}/api/admin`;
```

控制台会输出当前使用的环境：
```
[Admin API] 当前环境: development
[Admin API] API地址: http://localhost:3000/api/admin
```

## 项目结构

```
admin-front/
├── public/                      # 静态资源
├── src/
│   ├── api/
│   │   └── admin.js            # 管理后台 API 接口
│   ├── components/
│   │   └── AdminLayout.vue     # 管理后台布局组件
│   ├── router/
│   │   └── index.js            # 路由配置
│   ├── utils/
│   │   └── request.js          # Axios 请求封装
│   ├── views/
│   │   ├── HomeView.vue        # 仪表板首页
│   │   ├── UsersView.vue       # 用户管理
│   │   ├── ConversationsView.vue # 会话管理
│   │   ├── BookmarksView.vue   # 书签管理
│   │   ├── StatisticsView.vue  # 数据统计
│   │   ├── ActivityView.vue    # 用户活跃度分析
│   │   ├── LogsView.vue        # 系统日志
│   │   ├── ConfigView.vue      # 系统配置
│   │   └── TableView.vue       # 数据表管理
│   ├── App.vue
│   └── main.js
├── .env.development            # 开发环境配置
├── .env.production             # 生产环境配置
├── .env.example                # 环境变量示例
├── .gitignore
├── ADMIN_FEATURES.md           # 功能说明文档
├── IMPLEMENTATION_STATUS.md    # 实现状态文档
├── index.html
├── package.json
├── vite.config.js
└── README.md
```
