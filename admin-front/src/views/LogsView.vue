<template>
  <div class="logs-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统日志</span>
          <div class="header-actions">
            <el-select v-model="logLevel" placeholder="日志级别" style="width: 120px; margin-right: 10px;" @change="loadLogs">
              <el-option label="全部" value="" />
              <el-option label="INFO" value="INFO" />
              <el-option label="WARN" value="WARN" />
              <el-option label="ERROR" value="ERROR" />
            </el-select>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索日志内容"
              clearable
              style="width: 250px; margin-right: 10px;"
              @keyup.enter="loadLogs"
            >
              <template #append>
                <el-button :icon="Search" @click="loadLogs" />
              </template>
            </el-input>
            <el-button :icon="Download" @click="exportLogs">导出</el-button>
            <el-button :icon="Refresh" @click="loadLogs">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="logs"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="timestamp" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="方法" width="80" />
        <el-table-column prop="path" label="路径" width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <el-table-column prop="userAgent" label="用户代理" min-width="250" show-overflow-tooltip />
        <el-table-column prop="message" label="消息" min-width="300" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewLogDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100, 200]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadLogs"
        @current-change="loadLogs"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="800px"
    >
      <el-descriptions :column="1" border v-if="currentLog">
        <el-descriptions-item label="时间戳">{{ currentLog.timestamp }}</el-descriptions-item>
        <el-descriptions-item label="日志级别">
          <el-tag :type="getLevelType(currentLog.level)">
            {{ currentLog.level }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ currentLog.method }}</el-descriptions-item>
        <el-descriptions-item label="请求路径">{{ currentLog.path }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="用户代理">{{ currentLog.userAgent }}</el-descriptions-item>
        <el-descriptions-item label="消息内容">
          <pre class="log-message">{{ currentLog.message }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="完整日志" v-if="currentLog.raw">
          <pre class="log-raw">{{ currentLog.raw }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { getLogs } from '../api/admin'

const loading = ref(false)
const logs = ref([])
const currentPage = ref(1)
const pageSize = ref(50)
const total = ref(0)
const logLevel = ref('')
const searchKeyword = ref('')

const detailDialogVisible = ref(false)
const currentLog = ref(null)

const loadLogs = async () => {
  loading.value = true
  try {
    const res = await getLogs({
      page: currentPage.value,
      limit: pageSize.value,
      level: logLevel.value,
      search: searchKeyword.value
    })
    
    logs.value = (res.data || []).map(log => ({
      ...log,
      timestamp: log.timestamp || new Date(log.created_at).toLocaleString('zh-CN')
    }))
    total.value = res.pagination?.total || 0
  } catch (error) {
    console.error('加载日志失败:', error)
    ElMessage.error('加载日志失败')
  } finally {
    loading.value = false
  }
}

const viewLogDetail = (log) => {
  currentLog.value = log
  detailDialogVisible.value = true
}

const getLevelType = (level) => {
  const typeMap = {
    'INFO': 'info',
    'WARN': 'warning',
    'ERROR': 'danger',
    'DEBUG': 'success'
  }
  return typeMap[level] || 'info'
}

const getRowClassName = ({ row }) => {
  return `log-row-${row.level?.toLowerCase()}`
}

const exportLogs = async () => {
  try {
    const res = await getLogs({
      level: logLevel.value,
      search: searchKeyword.value,
      export: true
    })
    
    // 创建下载链接
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `logs_${new Date().getTime()}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出日志失败:', error)
    ElMessage.error('导出日志失败')
  }
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.logs-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.log-message {
  margin: 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.log-raw {
  margin: 0;
  padding: 10px;
  background: #2d2d2d;
  color: #f8f8f2;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* 日志行样式 */
:deep(.log-row-info) {
  background-color: #f0f9ff;
}

:deep(.log-row-warn) {
  background-color: #fdf6ec;
}

:deep(.log-row-error) {
  background-color: #fef0f0;
}

:deep(.log-row-debug) {
  background-color: #f0f9ff;
}
</style>
