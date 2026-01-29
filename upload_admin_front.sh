#!/bin/bash

# 上传 admin-front 到云服务器脚本
# 功能: 压缩 admin-front 文件夹并上传到云服务器

# 服务器配置
SERVER_IP="106.54.34.24"
SERVER_USER="root"
SERVER_PASSWORD="@@Hao317"
SERVER_PATH="/root/holy/holyAI7"
LOCAL_PATH="/Users/holy/Documents/稀碎代码/holyAI7/admin-front"
ARCHIVE_NAME="admin-front_$(date +%Y%m%d_%H%M%S).tar.gz"

# 检查是否安装了 sshpass
if ! command -v sshpass &> /dev/null; then
    echo "正在安装 sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install sshpass
        else
            echo "错误: 请先安装 Homebrew,然后运行: brew install sshpass"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update && sudo apt-get install -y sshpass
    else
        echo "错误: 不支持的操作系统"
        exit 1
    fi
fi

echo "========================================"
echo "开始上传 admin-front 到云服务器..."
echo "========================================"

# 1. 检查本地目录是否存在
if [ ! -d "$LOCAL_PATH" ]; then
    echo "✗ 错误: 本地目录不存在: $LOCAL_PATH"
    exit 1
fi
echo "✓ 本地目录存在: $LOCAL_PATH"

# 2. 切换到项目目录
cd "$LOCAL_PATH" || exit 1
echo "✓ 已切换到项目目录: $LOCAL_PATH"

# 3. 压缩文件夹(排除node_modules、.git、.DS_Store等)
echo ""
echo "正在压缩文件夹..."
tar -czf "$ARCHIVE_NAME" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='dist' \
  --exclude='.vite' \
  --exclude='upload_admin_front.sh' \
  .

if [ $? -eq 0 ]; then
    echo "✓ 压缩完成: $ARCHIVE_NAME"
    ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
    echo "  文件大小: $ARCHIVE_SIZE"
else
    echo "✗ 压缩失败!"
    exit 1
fi

# 4. 上传压缩包到服务器
echo ""
echo "正在上传到服务器 $SERVER_IP:$SERVER_PATH..."
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no "$ARCHIVE_NAME" "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"

if [ $? -eq 0 ]; then
    echo "✓ 上传成功!"
else
    echo "✗ 上传失败!"
    exit 1
fi

# 5. 在服务器上解压
echo ""
echo "正在服务器上解压..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" << EOF
    cd "$SERVER_PATH"
    rm -rf admin-front
    mkdir -p admin-front
    tar -xzf "$ARCHIVE_NAME" -C admin-front
    echo "✓ 解压完成"
    echo "解压后的文件:"
    ls -la "$SERVER_PATH/admin-front" | head -20
EOF

if [ $? -eq 0 ]; then
    echo "✓ 解压成功!"
else
    echo "✗ 解压失败!"
    exit 1
fi

# 6. 清理本地压缩包
echo ""
echo "清理本地压缩包..."
rm -f "$ARCHIVE_NAME"
echo "✓ 已删除: $ARCHIVE_NAME"

# 7. 清理服务器上的压缩包
echo ""
echo "清理服务器上的压缩包..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "rm -f ${SERVER_PATH}/${ARCHIVE_NAME}"
echo "✓ 已删除服务器上的压缩包: ${ARCHIVE_NAME}"

# 8. 在服务器上安装依赖
echo ""
echo "正在服务器上安装依赖..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" << EOF
    cd ${SERVER_PATH}/admin-front
    npm install
    echo "✓ 依赖安装完成"
EOF

echo ""
echo "========================================"
echo "上传完成! admin-front 已成功推送到 $SERVER_IP:$SERVER_PATH/admin-front"
echo "========================================"
echo ""
echo "后续操作提示:"
echo "1. 进入服务器目录: cd $SERVER_PATH/admin-front"
echo "2. 构建项目: npm run build"
echo "3. 启动开发服务器: npm run dev"
echo "4. 预览构建: npm run preview"
