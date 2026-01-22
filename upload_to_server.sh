#!/bin/bash

# 上传到云服务器脚本
# 功能: 压缩本地文件夹并上传到云服务器

# 服务器配置
SERVER_IP="106.54.34.24"
SERVER_USER="root"
SERVER_PASSWORD="@@Hao317"
SERVER_PATH="/root/holy/holyAI7"
LOCAL_PATH="/Users/holy/Documents/稀碎代码/holyAI7/holyAI7"
ARCHIVE_NAME="holyAI7_$(date +%Y%m%d_%H%M%S).tar.gz"

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
echo "开始上传到云服务器..."
echo "========================================"

# 1. 切换到项目目录
cd "$LOCAL_PATH" || exit 1
echo "✓ 已切换到项目目录: $LOCAL_PATH"

# 2. 压缩文件夹(排除node_modules和.git)
echo ""
echo "正在压缩文件夹..."
tar -czf "$ARCHIVE_NAME" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='dist' \
  --exclude='.DS_Store' \
  --exclude='upload_to_server.sh' \
  --exclude='download_from_server.sh' \
  .

if [ $? -eq 0 ]; then
    echo "✓ 压缩完成: $ARCHIVE_NAME"
    ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
    echo "  文件大小: $ARCHIVE_SIZE"
else
    echo "✗ 压缩失败!"
    exit 1
fi

# 3. 先在服务器上创建目录
echo ""
echo "在服务器上创建目录..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${SERVER_PATH}"
echo "✓ 目录已创建"

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
    tar -xzf "$ARCHIVE_NAME" -C .
    echo "✓ 解压完成"
    echo "解压后的文件:"
    ls -la "$SERVER_PATH" | head -20
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

echo ""
echo "========================================"
echo "上传完成! 文件已成功推送到 $SERVER_IP:$SERVER_PATH"
echo "========================================"
