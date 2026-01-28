#!/bin/bash

# SQLite 数据库查看脚本
# 用法: ./view-db.sh [table] [sql_query]

DB_PATH="data/holy7.db"

# 检查数据库文件是否存在
if [ ! -f "$DB_PATH" ]; then
    echo "❌ 数据库文件不存在: $DB_PATH"
    exit 1
fi

# 如果没有参数，显示帮助
if [ $# -eq 0 ]; then
    echo "📊 SQLite 数据库查看工具"
    echo ""
    echo "用法:"
    echo "  ./view-db.sh                    # 显示所有表"
    echo "  ./view-db.sh <table_name>       # 查看指定表的所有数据"
    echo "  ./view-db.sh <table_name> <sql> # 执行自定义 SQL 查询"
    echo ""
    echo "示例:"
    echo "  ./view-db.sh                    # 显示所有表"
    echo "  ./view-db.sh todos             # 查看 todos 表"
    echo "  ./view-db.sh todos 'SELECT * FROM todos WHERE completed=1'"
    echo ""
    echo "当前数据库: $DB_PATH"
    exit 0
fi

TABLE_NAME=$1

# 如果只有一个参数，查看该表的所有数据
if [ $# -eq 1 ]; then
    echo "📋 表: $TABLE_NAME"
    echo "----------------------------------------"
    sqlite3 -header -column "$DB_PATH" "SELECT * FROM $TABLE_NAME;"
    exit 0
fi

# 如果有两个参数，执行自定义 SQL 查询
SQL_QUERY=$2
echo "🔍 查询: $SQL_QUERY"
echo "----------------------------------------"
sqlite3 -header -column "$DB_PATH" "$SQL_QUERY"
