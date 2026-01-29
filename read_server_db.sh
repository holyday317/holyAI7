#!/bin/bash

# 读取服务器数据库内容脚本
# 功能: 从服务器下载 SQLite 数据库文件并读取内容

# 服务器配置
SERVER_IP="106.54.34.24"
SERVER_USER="root"
SERVER_PASSWORD="@@Hao317"
SERVER_DB_PATH="/root/holy/holyAI7/holy7-express/data/holy7.db"
LOCAL_DB_PATH="./holy7_server.db"
LOCAL_TEMP_DIR="./temp_db_download"

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
echo "开始读取服务器数据库内容..."
echo "========================================"

# 1. 检查服务器上的数据库文件是否存在
echo ""
echo "检查服务器上的数据库文件..."
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "[ -f '${SERVER_DB_PATH}' ] && echo '✓ 数据库文件存在' || echo '✗ 数据库文件不存在: ${SERVER_DB_PATH}'"

if ! sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "[ -f '${SERVER_DB_PATH}' ]"; then
    echo "错误: 服务器上没有数据库文件"
    exit 1
fi

# 获取数据库文件信息
echo ""
echo "数据库文件信息:"
sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" << EOF
    echo "  文件路径: ${SERVER_DB_PATH}"
    echo "  文件大小: \$(du -h '${SERVER_DB_PATH}' | cut -f1)"
    echo "  修改时间: \$(stat -c '%y' '${SERVER_DB_PATH}' 2>/dev/null || stat -f '%Sm' -t '%Y-%m-%d %H:%M:%S' '${SERVER_DB_PATH}' 2>/dev/null)"
    echo "  文件权限: \$(ls -la '${SERVER_DB_PATH}' | awk '{print \$1}')"
EOF

# 2. 下载数据库文件
echo ""
echo "正在下载数据库文件..."
rm -f "$LOCAL_DB_PATH"
sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}:${SERVER_DB_PATH}" "$LOCAL_DB_PATH"

if [ $? -eq 0 ]; then
    echo "✓ 数据库文件下载成功: $LOCAL_DB_PATH"
else
    echo "✗ 数据库文件下载失败!"
    exit 1
fi

# 3. 创建输出目录
mkdir -p "$LOCAL_TEMP_DIR"

# 4. 使用 sqlite3 读取数据库内容
echo ""
echo "========================================"
echo "数据库内容"
echo "========================================"

# 检查是否安装了 sqlite3
if ! command -v sqlite3 &> /dev/null; then
    echo "警告: 未安装 sqlite3 命令行工具"
    echo "正在尝试安装..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS 通常自带 sqlite3
        echo "macOS 系统应该自带 sqlite3，请检查"
        exit 1
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y sqlite3
    fi
fi

# 显示所有表
echo ""
echo "--- 数据库表列表 ---"
sqlite3 "$LOCAL_DB_PATH" ".tables"

# 显示每个表的结构和数据
echo ""
echo "--- 表结构 ---"
sqlite3 "$LOCAL_DB_PATH" ".schema"

# 查询各个表的数据
echo ""
echo "========================================"
echo "表数据详情"
echo "========================================"

# users 表
echo ""
echo "【users 表】用户信息"
echo "----------------------------------------"
sqlite3 -header -column "$LOCAL_DB_PATH" "SELECT * FROM users;" || echo "无数据或表不存在"

# conversations 表
echo ""
echo "【conversations 表】会话信息"
echo "----------------------------------------"
sqlite3 -header -column "$LOCAL_DB_PATH" "SELECT * FROM conversations ORDER BY created_at DESC LIMIT 10;" || echo "无数据或表不存在"

# chats 表
echo ""
echo "【chats 表】聊天记录 (最近 10 条)"
echo "----------------------------------------"
sqlite3 -header -column "$LOCAL_DB_PATH" "SELECT id, conversation_id, model_type, SUBSTR(user_message, 1, 50) as user_message_preview, SUBSTR(ai_response, 1, 50) as ai_response_preview, created_at FROM chats ORDER BY created_at DESC LIMIT 10;" || echo "无数据或表不存在"

# bookmarks 表
echo ""
echo "【bookmarks 表】收藏信息"
echo "----------------------------------------"
sqlite3 -header -column "$LOCAL_DB_PATH" "SELECT * FROM bookmarks ORDER BY created_at DESC LIMIT 10;" || echo "无数据或表不存在"

# todos 表
echo ""
echo "【todos 表】待办事项"
echo "----------------------------------------"
sqlite3 -header -column "$LOCAL_DB_PATH" "SELECT * FROM todos;" || echo "无数据或表不存在"

# id_counters 表
echo ""
echo "【id_counters 表】ID 计数器"
echo "----------------------------------------"
sqlite3 -header -column "$LOCAL_DB_PATH" "SELECT * FROM id_counters;" || echo "无数据或表不存在"

# 统计信息
echo ""
echo "========================================"
echo "统计信息"
echo "========================================"
sqlite3 "$LOCAL_DB_PATH" << 'EOF'
.mode column
.headers on
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'chats', COUNT(*) FROM chats
UNION ALL
SELECT 'bookmarks', COUNT(*) FROM bookmarks
UNION ALL
SELECT 'todos', COUNT(*) FROM todos
UNION ALL
SELECT 'id_counters', COUNT(*) FROM id_counters;
EOF

# 5. 导出各表数据到 CSV 文件
echo ""
echo "========================================"
echo "导出数据到 CSV 文件"
echo "========================================"

sqlite3 "$LOCAL_DB_PATH" << 'EOF'
.output ./temp_db_download/users.csv
.mode csv
.headers on
SELECT * FROM users;

.output ./temp_db_download/conversations.csv
SELECT * FROM conversations;

.output ./temp_db_download/chats.csv
SELECT * FROM chats;

.output ./temp_db_download/bookmarks.csv
SELECT * FROM bookmarks;

.output ./temp_db_download/todos.csv
SELECT * FROM todos;

.output stdout
.quit
EOF

echo "✓ 数据已导出到 ./temp_db_download/ 目录"

# 6. 清理
echo ""
echo "是否保留本地数据库文件? (y/n)"
read -r keep_db
if [[ "$keep_db" != "y" && "$keep_db" != "Y" ]]; then
    echo "清理本地数据库文件..."
    rm -f "$LOCAL_DB_PATH"
    echo "✓ 已删除: $LOCAL_DB_PATH"
fi

echo ""
echo "========================================"
echo "读取完成!"
echo "========================================"
echo ""
echo "生成的文件:"
echo "  - 本地数据库文件: $LOCAL_DB_PATH"
echo "  - CSV 导出目录: $LOCAL_TEMP_DIR/"
echo ""
echo "查看 CSV 文件:"
ls -la "$LOCAL_TEMP_DIR/"
