<template>
  <div class="activity-view">
    <el-row :gutter="20">
      <!-- 活跃度统计卡片 -->
      <el-col :span="6" v-for="stat in activityStats" :key="stat.key">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="30">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 活跃用户趋势 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活跃用户趋势</span>
              <el-select v-model="trendPeriod" @change="loadTrendData" style="width: 120px;">
                <el-option label="近7天" value="7" />
                <el-option label="近30天" value="30" />
                <el-option label="近90天" value="90" />
              </el-select>
            </div>
          </template>
          <div class="chart-container" ref="trendChart"></div>
        </el-card>
      </el-col>

      <!-- 用户活跃度分布 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户活跃度分布</span>
              <el-button :icon="Refresh" @click="loadDistribution" circle />
            </div>
          </template>
          <div class="chart-container" ref="distributionChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 活跃时段分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户活跃时段分析</span>
              <el-button :icon="Refresh" @click="loadTimeAnalysis" circle />
            </div>
          </template>
          <div class="chart-container" ref="timeChart"></div>
        </el-card>
      </el-col>

      <!-- 用户留存率 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户留存率</span>
              <el-select v-model="retentionPeriod" @change="loadRetentionData" style="width: 120px;">
                <el-option label="近7天" value="7" />
                <el-option label="近30天" value="30" />
              </el-select>
            </div>
          </template>
          <div class="chart-container" ref="retentionChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 活跃用户列表 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活跃用户TOP20</span>
              <el-button :icon="Refresh" @click="loadActiveUsers" circle />
            </div>
          </template>
          <el-table
            :data="activeUsers"
            v-loading="loading"
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="id" label="用户ID" width="100" />
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="conversations_count" label="会话数" width="120">
              <template #default="{ row }">
                <el-tag type="primary">{{ row.conversations_count || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="chats_count" label="消息数" width="120">
              <template #default="{ row }">
                <el-tag type="success">{{ row.chats_count || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="bookmarks_count" label="书签数" width="120">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.bookmarks_count || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="last_active" label="最后活跃" width="180">
              <template #default="{ row }">
                {{ formatDate(row.last_active) }}
              </template>
            </el-table-column>
            <el-table-column label="活跃度评分" width="150">
              <template #default="{ row }">
                <el-rate
                  v-model="row.activity_score"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  TrendCharts,
  Clock,
  Star,
  Refresh
} from '@element-plus/icons-vue'
import { getActivityStats } from '../api/admin'
import * as echarts from 'echarts'

const loading = ref(false)
const trendPeriod = ref('7')
const retentionPeriod = ref('7')
const activeUsers = ref([])

const activityStats = ref([
  {
    key: 'daily_active',
    label: '日活跃用户',
    value: 0,
    icon: User,
    color: '#409eff'
  },
  {
    key: 'weekly_active',
    label: '周活跃用户',
    value: 0,
    icon: TrendCharts,
    color: '#67c23a'
  },
  {
    key: 'monthly_active',
    label: '月活跃用户',
    value: 0,
    icon: Clock,
    color: '#e6a23c'
  },
  {
    key: 'new_users',
    label: '新增用户',
    value: 0,
    icon: Star,
    color: '#f56c6c'
  }
])

const trendChart = ref(null)
const distributionChart = ref(null)
const timeChart = ref(null)
const retentionChart = ref(null)

let trendChartInstance = null
let distributionChartInstance = null
let timeChartInstance = null
let retentionChartInstance = null

const loadActivityStats = async () => {
  try {
    const res = await getActivityStats({ type: 'overview' })
    activityStats.value[0].value = res.daily_active || 0
    activityStats.value[1].value = res.weekly_active || 0
    activityStats.value[2].value = res.monthly_active || 0
    activityStats.value[3].value = res.new_users || 0
  } catch (error) {
    console.error('加载活跃度统计失败:', error)
  }
}

const loadTrendData = async () => {
  try {
    const res = await getActivityStats({ type: 'trend', period: trendPeriod.value })
    renderTrendChart(res.data || [])
  } catch (error) {
    console.error('加载趋势数据失败:', error)
  }
}

const renderTrendChart = (data) => {
  if (!trendChart.value) return
  
  if (!trendChartInstance) {
    trendChartInstance = echarts.init(trendChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['活跃用户', '新增用户']
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '活跃用户',
        type: 'line',
        data: data.map(d => d.active_users),
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        itemStyle: {
          color: '#409eff'
        }
      },
      {
        name: '新增用户',
        type: 'line',
        data: data.map(d => d.new_users),
        smooth: true,
        itemStyle: {
          color: '#67c23a'
        }
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}

const loadDistribution = async () => {
  try {
    const res = await getActivityStats({ type: 'distribution' })
    renderDistributionChart(res.data || [])
  } catch (error) {
    console.error('加载分布数据失败:', error)
  }
}

const renderDistributionChart = (data) => {
  if (!distributionChart.value) return
  
  if (!distributionChartInstance) {
    distributionChartInstance = echarts.init(distributionChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: data.map(d => ({
        value: d.count,
        name: d.level
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  distributionChartInstance.setOption(option)
}

const loadTimeAnalysis = async () => {
  try {
    const res = await getActivityStats({ type: 'time_analysis' })
    renderTimeChart(res.data || [])
  } catch (error) {
    console.error('加载时段分析失败:', error)
  }
}

const renderTimeChart = (data) => {
  if (!timeChart.value) return
  
  if (!timeChartInstance) {
    timeChartInstance = echarts.init(timeChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(d => `${d.hour}:00`)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.map(d => d.count),
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#a0cfff' }
        ])
      }
    }]
  }
  
  timeChartInstance.setOption(option)
}

const loadRetentionData = async () => {
  try {
    const res = await getActivityStats({ type: 'retention', period: retentionPeriod.value })
    renderRetentionChart(res.data || [])
  } catch (error) {
    console.error('加载留存数据失败:', error)
  }
}

const renderRetentionChart = (data) => {
  if (!retentionChart.value) return
  
  if (!retentionChartInstance) {
    retentionChartInstance = echarts.init(retentionChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.day)
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      data: data.map(d => d.rate),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
          { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
        ])
      },
      itemStyle: {
        color: '#67c23a'
      }
    }]
  }
  
  retentionChartInstance.setOption(option)
}

const loadActiveUsers = async () => {
  loading.value = true
  try {
    const res = await getActivityStats({ type: 'top_users' })
    activeUsers.value = (res.data || []).map(user => ({
      ...user,
      activity_score: calculateActivityScore(user)
    }))
  } catch (error) {
    console.error('加载活跃用户失败:', error)
    ElMessage.error('加载活跃用户失败')
  } finally {
    loading.value = false
  }
}

const calculateActivityScore = (user) => {
  const conversations = user.conversations_count || 0
  const chats = user.chats_count || 0
  const bookmarks = user.bookmarks_count || 0
  
  // 简单的评分算法
  let score = 0
  score += Math.min(conversations / 10, 5) // 会话数最高5分
  score += Math.min(chats / 50, 3) // 消息数最高3分
  score += Math.min(bookmarks / 10, 2) // 书签数最高2分
  
  return Math.round(score)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadActivityStats()
  loadTrendData()
  loadDistribution()
  loadTimeAnalysis()
  loadRetentionData()
  loadActiveUsers()
  
  // 窗口大小改变时重绘图表
  window.addEventListener('resize', () => {
    trendChartInstance?.resize()
    distributionChartInstance?.resize()
    timeChartInstance?.resize()
    retentionChartInstance?.resize()
  })
})

onUnmounted(() => {
  trendChartInstance?.dispose()
  distributionChartInstance?.dispose()
  timeChartInstance?.dispose()
  retentionChartInstance?.dispose()
})
</script>

<style scoped>
.activity-view {
  padding: 0;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
