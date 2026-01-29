#!/bin/bash

# 上传 CBT 提示词文件到云服务器脚本
# 功能: 上传单个 prompts/CBT.md 文件到服务器对应位置

# 服务器配置
SERVER_IP="106.54.34.24"
SERVER_USER="root"
SERVER_PASSWORD="@@Hao317"
SERVER_PATH="/root/holy/holyAI7/holy7-express/prompts"
LOCAL_FILE="/Users/holy/Documents/稀碎代码/holyAI7/holy7-express/prompts/CBT.md"

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
echo "开始上传 CBT 提示词文件到云服务器..."
echo "========================================"

# 1. 检查本地文件是否存在
if [ ! -f "$LOCAL_FILE" ]; then
    echo "✗ 错误: 本地文件不存在: $LOCAL_FILE"
    exit 1
fi
echo "✓ 本地文件存在: $LOCAL_FILE"

# 2. 显示文件信息
echo ""
echo "文件信息:"
FILE_SIZE=$(du -h "$LOCAL_FILE" | cut -f1)
echo "  大小: $FILE_SIZE"
echo "  修改时间: $(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$LOCAL_FILE" 2>/dev/null || stat -c "%y" "$LOCAL_FILE" 2>/dev/null)"

# 3. 备份服务器上的旧文件(如果存在)
echo ""
echo "备份服务器上的旧文件..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" << EOF
    if [ -f "${SERVER_PATH}/CBT.md" ]; then
        cp "${SERVER_PATH}/CBT.md" "${SERVER_PATH}/CBT.md.backup_\$(date +%Y%m%d_%H%M%S)"
        echo "✓ 已备份旧文件"
    else
        echo "✓ 无需备份(文件不存在)"
    fi
EOF

# 4. 在服务器上创建目录(如果不存在)
echo ""
echo "在服务器上创建目录..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${SERVER_PATH}"
echo "✓ 目录已创建: ${SERVER_PATH}"

# 5. 上传文件到服务器
echo ""
echo "正在上传到服务器 $SERVER_IP:$SERVER_PATH/CBT.md..."
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no "$LOCAL_FILE" "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/CBT.md"

if [ $? -eq 0 ]; then
    echo "✓ 上传成功!"
else
    echo "✗ 上传失败!"
    exit 1
fi

# 6. 验证上传的文件
echo ""
echo "验证上传的文件..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" << EOF
    if [ -f "${SERVER_PATH}/CBT.md" ]; then
        SERVER_FILE_SIZE=\$(du -h "${SERVER_PATH}/CBT.md" | cut -f1)
        echo "✓ 文件已上传"
        echo "  服务器文件大小: \$SERVER_FILE_SIZE"
        echo "  文件路径: ${SERVER_PATH}/CBT.md"
    else
        echo "✗ 文件验证失败!"
        exit 1
    fi
EOF

echo ""
echo "========================================"
echo "上传完成! CBT.md 已成功替换服务器上的文件"
echo "========================================"
echo ""
echo "提示:"
echo "1. 文件已上传到: $SERVER_IP:$SERVER_PATH/CBT.md"
echo "2. 旧文件已备份到同目录下(如果存在)"
echo "3. 如需回滚，可以查看备份文件列表"
echo ""
echo "查看服务器上的文件:"
echo "  ssh root@$SERVER_IP \"ls -la $SERVER_PATH/ | grep CBT\""
