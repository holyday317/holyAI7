# PM2 使用指南

## 安装 PM2

```bash
npm install -g pm2
```

## 本地开发

### 启动开发环境
```bash
npm run pm2:dev
```

### 查看状态
```bash
npm run pm2:status
```

### 查看日志
```bash
npm run pm2:logs
```

### 停止服务
```bash
npm run pm2:stop
```

### 重启服务
```bash
npm run pm2:restart
```

### 删除服务
```bash
npm run pm2:delete
```

## 生产环境部署

### 1. 在服务器上安装 PM2
```bash
npm install -g pm2
```

### 2. 上传项目到服务器
使用 `upload_to_server.sh` 脚本上传项目

### 3. 在服务器上安装依赖
```bash
cd /root/holy/holyAI7/holy7-express
npm install
```

### 4. 启动生产环境服务
```bash
npm run pm2:start
```

### 5. 设置 PM2 开机自启动
```bash
pm2 startup
pm2 save
```

## PM2 常用命令

```bash
# 查看所有进程
pm2 list

# 查看详细信息
pm2 show holy7-express

# 实时监控
pm2 monit

# 清空日志
pm2 flush

# 重载配置(零停机重启)
pm2 reload holy7-express

# 查看日志文件路径
pm2 show holy7-express | grep log
```

## 日志文件位置

- 标准输出日志: `./logs/out.log`
- 错误日志: `./logs/error.log`

## 配置说明

`ecosystem.config.js` 配置文件包含:

- `name`: 应用名称
- `script`: 启动脚本
- `instances`: 实例数量
- `autorestart`: 自动重启
- `max_memory_restart`: 内存超过 1G 自动重启
- `env`: 生产环境变量
- `env_dev`: 开发环境变量
- `error_file`: 错误日志文件
- `out_file`: 标准输出日志文件

## 故障排查

### 查看错误日志
```bash
npm run pm2:logs -- --err
```

### 查看完整日志
```bash
pm2 logs holy7-express --lines 100
```

### 查看进程资源使用情况
```bash
pm2 monit
```
