const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体

// 请求日志中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'holy7-express'
  });
});

// 导入路由
const apiRoutes = require('./routes/api');
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/test', apiRoutes);
app.use('/api/ai', chatRoutes);

// 404 错误处理
app.use(notFoundHandler);

// 全局错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  logger.info(`🚀 服务器运行在 http://localhost:${PORT}`);
  logger.info(`📡 API 地址: http://localhost:${PORT}/api`);
  logger.info(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;