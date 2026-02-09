<template>
  <div class="statistics-view">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="stat in statistics" :key="stat.key">
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
              <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                <el-icon>
                  <component :is="stat.trend > 0 ? TrendCharts : Bottom" />
                </el-icon>
                {{ Math.abs(stat.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 用户增长趋势 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
              <el-select v-model="userGrowthPeriod" @change="loadUserGrowthData" style="width: 120px;">
                <el-option label="近7天" value="7" />
                <el-option label="近30天" value="30" />
                <el-option label="近90天" value="90" />
              </el-select>
            </div>
          </template>
          <div class="chart-container" ref="userGrowthChart"></div>
        </el-card>
      </el-col>

      <!-- 会话活跃度 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>会话活跃度</span>
              <el-select v-model="activityPeriod" @change="loadActivityData" style="width: 120px;">
                <el-option label="近7天" value="7" />
                <el-option label="近30天" value="30" />
                <el-option label="近90天" value="90" />
              </el-select>
            </div>
          </template>
          <div class="chart-container" ref="activityChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 模型使用分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>AI模型使用分布</span>
              <el-button :icon="Refresh" @click="loadModelData" circle />
            </div>
          </template>
          <div class="chart-container" ref="modelChart"></div>
        </el-card>
      </el-col>

      <!-- 用户活跃时段分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户活跃时段分布</span>
              <el-button :icon="Refresh" @click="loadTimeDistribution" circle />
            </div>
          </template>
          <div class="chart-container" ref="timeChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 热门Prompt类型 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Prompt类型使用统计</span>
              <el-button :icon="Refresh" @click="loadPromptData" circle />
            </div>
          </template>
          <el-table
            :data="promptStats"
            v-loading="loading"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="prompt_type" label="Prompt类型" width="200" />
            <el-table-column prop="count" label="使用次数" width="150" />
            <el-table-column prop="percentage" label="占比" width="150">
              <template #default="{ row }">
                {{ row.percentage }}%
              </template>
            </el-table-column>
            <el-table-column label="使用趋势">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.percentage"
                  :color="getProgressColor(row.percentage)"
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
  ChatLineRound,
  Star,
  TrendCharts,
  Refresh,
  Bottom
} from '@element-plus/icons-vue'
import { getStatistics } from '../api/admin'
import * as echarts from 'echarts'

const loading = ref(false)
const userGrowthPeriod = ref('7')
const activityPeriod = ref('7')
const promptStats = ref([])

const statistics = ref([
  {
    key: 'users',
    label: '总用户数',
    value: 0,
    icon: User,
    color: '#409eff',
    trend: 12
  },
  {
    key: 'conversations',
    label: '总会话数',
    value: 0,
    icon: ChatLineRound,
    color: '#67c23a',
    trend: 8
  },
  {
    key: 'messages',
    label: '总消息数',
    value: 0,
    icon: TrendCharts,
    color: '#e6a23c',
    trend: 15
  },
  {
    key: 'bookmarks',
    label: '总书签数',
    value: 0,
    icon: Star,
    color: '#f56c6c',
    trend: -3
  }
])

const userGrowthChart = ref(null)
const activityChart = ref(null)
const modelChart = ref(null)
const timeChart = ref(null)

let userGrowthChartInstance = null
let activityChartInstance = null
let modelChartInstance = null
let timeChartInstance = null

const loadStatistics = async () => {
  loading.value = true
  try {
    const res = await getStatistics()
    
    // 更新统计卡片
    statistics.value[0].value = res.total_users || 0
    statistics.value[1].value = res.total_conversations || 0
    statistics.value[2].value = res.total_messages || 0
    statistics.value[3].value = res.total_bookmarks || 0
    
    // 更新趋势数据
    if (res.trends) {
      statistics.value[0].trend = res.trends.users || 0
      statistics.value[1].trend = res.trends.conversations || 0
      statistics.value[2].trend = res.trends.messages || 0
      statistics.value[3].trend = res.trends.bookmarks || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const loadUserGrowthData = async () => {
  try {
    const res = await getStatistics({ type: 'user_growth', period: userGrowthPeriod.value })
    renderUserGrowthChart(res.data || [])
  } catch (error) {
    console.error('加载用户增长数据失败:', error)
  }
}

const renderUserGrowthChart = (data) => {
  if (!userGrowthChart.value) return
  
  if (!userGrowthChartInstance) {
    userGrowthChartInstance = echarts.init(userGrowthChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.map(d => d.count),
      type: 'line',
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
    }]
  }
  
  userGrowthChartInstance.setOption(option)
}

const loadActivityData = async () => {
  try {
    const res = await getStatistics({ type: 'activity', period: activityPeriod.value })
    renderActivityChart(res.data || [])
  } catch (error) {
    console.error('加载活跃度数据失败:', error)
  }
}

const renderActivityChart = (data) => {
  if (!activityChart.value) return
  
  if (!activityChartInstance) {
    activityChartInstance = echarts.init(activityChart.value)
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
      data: data.map(d => d.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.map(d => d.count),
      type: 'bar',
      itemStyle: {
        color: '#67c23a'
      }
    }]
  }
  
  activityChartInstance.setOption(option)
}

const loadModelData = async () => {
  try {
    const res = await getStatistics({ type: 'model_distribution' })
    renderModelChart(res.data || [])
  } catch (error) {
    console.error('加载模型分布数据失败:', error)
  }
}

const renderModelChart = (data) => {
  if (!modelChart.value) return
  
  if (!modelChartInstance) {
    modelChartInstance = echarts.init(modelChart.value)
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
        name: d.model
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
  
  modelChartInstance.setOption(option)
}

const loadTimeDistribution = async () => {
  try {
    const res = await getStatistics({ type: 'time_distribution' })
    renderTimeChart(res.data || [])
  } catch (error) {
    console.error('加载时段分布数据失败:', error)
  }
}

const renderTimeChart = (data) => {
  if (!timeChart.value) return
  
  if (!timeChartInstance) {
    timeChartInstance = echarts.init(timeChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
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
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
          { offset: 1, color: 'rgba(230, 162, 60, 0.1)' }
        ])
      },
      itemStyle: {
        color: '#e6a23c'
      }
    }]
  }
  
  timeChartInstance.setOption(option)
}

const loadPromptData = async () => {
  loading.value = true
  try {
    const res = await getStatistics({ type: 'prompt_distribution' })
    promptStats.value = (res.data || []).map(item => ({
      ...item,
      percentage: parseFloat((item.percentage || 0).toFixed(2))
    }))
  } catch (error) {
    console.error('加载Prompt统计失败:', error)
    ElMessage.error('加载Prompt统计失败')
  } finally {
    loading.value = false
  }
}

const getProgressColor = (percentage) => {
  if (percentage >= 50) return '#67c23a'
  if (percentage >= 20) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  loadStatistics()
  loadUserGrowthData()
  loadActivityData()
  loadModelData()
  loadTimeDistribution()
  loadPromptData()
  
  // 窗口大小改变时重绘图表
  window.addEventListener('resize', () => {
    userGrowthChartInstance?.resize()
    activityChartInstance?.resize()
    modelChartInstance?.resize()
    timeChartInstance?.resize()
  })
})

onUnmounted(() => {
  userGrowthChartInstance?.dispose()
  activityChartInstance?.dispose()
  modelChartInstance?.dispose()
  timeChartInstance?.dispose()
})
</script>

<style scoped>
.statistics-view {
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
  margin-bottom: 5px;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-trend.up {
  color: #67c23a;
}

.stat-trend.down {
  color: #f56c6c;
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
