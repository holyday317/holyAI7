<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-card" shadow="never">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>欢迎使用 Holy7 数据库管理控制台</h2>
          <p>实时监控系统运行状态，高效管理用户数据</p>
        </div>
        <div class="welcome-actions">
          <el-button type="primary" :icon="Refresh" @click="loadData">刷新数据</el-button>
          <el-button :icon="Setting" @click="$router.push('/config')">系统设置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row" v-if="stats.length > 0">
      <el-col :span="6" v-for="item in stats" :key="item.name">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :class="getIconClass(item.name)">
              <el-icon :size="32">
                <component :is="getIcon(item.name)" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-name">{{ item.name }}</div>
              <div class="stat-count">{{ item.count }}</div>
              <div class="stat-label">条记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20" class="actions-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" :icon="User" @click="$router.push('/users')">
              用户管理
            </el-button>
            <el-button type="success" :icon="ChatLineRound" @click="$router.push('/conversations')">
              会话管理
            </el-button>
            <el-button type="warning" :icon="Star" @click="$router.push('/bookmarks')">
              书签管理
            </el-button>
            <el-button type="info" :icon="TrendCharts" @click="$router.push('/statistics')">
              数据统计
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统状态</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="运行时间">正常运行</el-descriptions-item>
            <el-descriptions-item label="数据库状态">
              <el-tag type="success">正常</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="API状态">
              <el-tag type="success">正常</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表列表 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>数据表列表</span>
          <el-button type="primary" :icon="Refresh" @click="loadData" circle />
        </div>
      </template>
      <el-table :data="tables" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="name" label="表名" min-width="150" />
        <el-table-column label="记录数" width="120">
          <template #default="{ row }">
            <el-tag type="info">{{ getTableCount(row.name) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewTable(row.name)">
              查看数据
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Setting, User, ChatLineRound, Star, TrendCharts } from '@element-plus/icons-vue'
import { getTables, getStats } from '../api/admin'

const router = useRouter()
const loading = ref(false)
const tables = ref([])
const stats = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const [tablesRes, statsRes] = await Promise.all([
      getTables(),
      getStats()
    ])
    
    // 将字符串数组转换为对象数组，以便 el-table 可以正确显示
    tables.value = (tablesRes.tables || []).map(name => ({ name }))
    stats.value = statsRes.tables || []
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const viewTable = (tableName) => {
  router.push(`/table/${tableName}`)
}

const getTableCount = (tableName) => {
  const stat = stats.value.find(s => s.name === tableName)
  return stat ? stat.count : 0
}

const getIcon = (tableName) => {
  const iconMap = {
    'users': User,
    'conversations': ChatLineRound,
    'bookmarks': Star,
    'chats': ChatLineRound
  }
  return iconMap[tableName] || Document
}

const getIconClass = (tableName) => {
  const classMap = {
    'users': 'icon-users',
    'conversations': 'icon-conversations',
    'bookmarks': 'icon-bookmarks',
    'chats': 'icon-chats'
  }
  return classMap[tableName] || 'icon-default'
}

onMounted(() => {
  loadData()
})

import { Document } from '@element-plus/icons-vue'
</script>

<style scoped>
.home-container {
  padding: 0;
}

.welcome-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.welcome-card :deep(.el-card__header) {
  border-bottom: none;
}

.welcome-card :deep(.el-card__body) {
  padding: 30px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.welcome-actions {
  display: flex;
  gap: 10px;
}

.welcome-actions .el-button {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.welcome-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 15px;
}

.icon-users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.icon-conversations {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.icon-bookmarks {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.icon-chats {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.icon-default {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  text-align: left;
}

.stat-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-count {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.actions-row {
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-actions .el-button {
  flex: 1;
  min-width: 120px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
