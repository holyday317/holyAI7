<template>
  <div class="home-container">
    <el-container>
      <el-header>
        <h1>数据库管理控制台</h1>
      </el-header>
      <el-main>
        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row" v-if="stats.length > 0">
          <el-col :span="6" v-for="item in stats" :key="item.name">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-name">{{ item.name }}</div>
                <div class="stat-count">{{ item.count }} 条记录</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 表格列表 -->
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>数据表列表</span>
              <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
            </div>
          </template>
          <el-table :data="tables" v-loading="loading" stripe>
            <el-table-column prop="name" label="表名" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="viewTable(row.name)">
                  查看数据
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
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

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home-container {
  height: 100vh;
  background: #f5f5f5;
}

.el-header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-header h1 {
  font-size: 24px;
  font-weight: 500;
  color: #333;
}

.el-main {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px 0;
}

.stat-name {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.stat-count {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.table-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
