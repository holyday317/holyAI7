#!/bin/bash

# 从云服务器下载脚本
# 功能: 从服务器下载文件夹到本地

# 服务器配置
SERVER_IP="106.54.34.24"
SERVER_USER="root"
SERVER_PASSWORD="Hao317"
SERVER_PATH="/root/holy/holyAI7"
LOCAL_PATH="/Users/holy/Documents/稀碎代码/holyAI7"
ARCHIVE_NAME="holyAI7_download_$(date +%Y%m%d_%H%M%S).tar.gz"

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
echo "开始从云服务器下载..."
echo "========================================"

# 1. 在服务器上压缩文件夹
echo ""
echo "正在服务器上压缩文件夹..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" << EOF
    cd /root/holy
    tar -czf "${ARCHIVE_NAME}" holyAI7
    echo "✓ 服务器端压缩完成"
    ls -lh "${ARCHIVE_NAME}"
EOF

if [ $? -eq 0 ]; then
    echo "✓ 服务器端压缩成功!"
else
    echo "✗ 服务器端压缩失败!"
    exit 1
fi

# 2. 下载压缩包到本地
echo ""
echo "正在从服务器下载到本地..."
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}:/root/holy/${ARCHIVE_NAME}" "${LOCAL_PATH}/"

if [ $? -eq 0 ]; then
    echo "✓ 下载成功!"
    ARCHIVE_SIZE=$(du -h "${LOCAL_PATH}/${ARCHIVE_NAME}" | cut -f1)
    echo "  文件大小: $ARCHIVE_SIZE"
else
    echo "✗ 下载失败!"
    exit 1
fi

# 3. 在本地解压
echo ""
echo "正在本地解压..."
cd "$LOCAL_PATH" || exit 1
tar -xzf "$ARCHIVE_NAME"
echo "✓ 解压完成"

# 4. 清理本地压缩包
echo ""
echo "清理本地压缩包..."
rm -f "$ARCHIVE_NAME"
echo "✓ 已删除: $ARCHIVE_NAME"

# 5. 清理服务器上的压缩包
echo ""
echo "清理服务器上的压缩包..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "rm -f /root/holy/${ARCHIVE_NAME}"
echo "✓ 已删除服务器上的压缩包"

echo ""
echo "========================================"
echo "下载完成! 文件已成功从服务器 $SERVER_IP 拉取到 $LOCAL_PATH/holyAI7"
echo "========================================"
