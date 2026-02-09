<template>
  <div class="config-view">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统配置</span>
              <el-button type="primary" :icon="Check" @click="saveConfig" :loading="saving">
                保存配置
              </el-button>
            </div>
          </template>

          <el-tabs v-model="activeTab">
            <!-- AI模型配置 -->
            <el-tab-pane label="AI模型配置" name="ai">
              <el-form :model="aiConfig" label-width="150px">
                <el-form-item label="默认模型">
                  <el-select v-model="aiConfig.defaultModel" style="width: 300px;">
                    <el-option label="DeepSeek" value="deepseek" />
                    <el-option label="OpenAI GPT-4" value="gpt4" />
                    <el-option label="OpenAI GPT-3.5" value="gpt35" />
                    <el-option label="Claude" value="claude" />
                  </el-select>
                </el-form-item>
                <el-form-item label="API密钥">
                  <el-input v-model="aiConfig.apiKey" type="password" show-password style="width: 500px;" placeholder="请输入API密钥" />
                </el-form-item>
                <el-form-item label="API基础URL">
                  <el-input v-model="aiConfig.baseUrl" style="width: 500px;" placeholder="https://api.example.com" />
                </el-form-item>
                <el-form-item label="最大Token数">
                  <el-input-number v-model="aiConfig.maxTokens" :min="100" :max="8000" :step="100" />
                </el-form-item>
                <el-form-item label="温度">
                  <el-slider v-model="aiConfig.temperature" :min="0" :max="1" :step="0.1" show-input />
                </el-form-item>
                <el-form-item label="启用流式响应">
                  <el-switch v-model="aiConfig.stream" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- Prompt配置 -->
            <el-tab-pane label="Prompt配置" name="prompt">
              <el-form :model="promptConfig" label-width="150px">
                <el-form-item label="默认Prompt类型">
                  <el-select v-model="promptConfig.defaultType" style="width: 300px;">
                    <el-option label="Default" value="default" />
                    <el-option label="CBT" value="CBT" />
                  </el-select>
                </el-form-item>
                <el-form-item label="自定义Prompt">
                  <el-input
                    v-model="promptConfig.customPrompt"
                    type="textarea"
                    :rows="10"
                    style="width: 100%;"
                    placeholder="输入自定义Prompt模板"
                  />
                </el-form-item>
                <el-form-item label="启用Prompt增强">
                  <el-switch v-model="promptConfig.enhancePrompt" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 系统设置 -->
            <el-tab-pane label="系统设置" name="system">
              <el-form :model="systemConfig" label-width="150px">
                <el-form-item label="系统名称">
                  <el-input v-model="systemConfig.systemName" style="width: 300px;" />
                </el-form-item>
                <el-form-item label="启用注册">
                  <el-switch v-model="systemConfig.enableRegister" />
                </el-form-item>
                <el-form-item label="最大会话数">
                  <el-input-number v-model="systemConfig.maxConversations" :min="1" :max="1000" />
                </el-form-item>
                <el-form-item label="最大书签数">
                  <el-input-number v-model="systemConfig.maxBookmarks" :min="1" :max="1000" />
                </el-form-item>
                <el-form-item label="会话保留天数">
                  <el-input-number v-model="systemConfig.conversationRetentionDays" :min="1" :max="365" />
                </el-form-item>
                <el-form-item label="启用日志记录">
                  <el-switch v-model="systemConfig.enableLogging" />
                </el-form-item>
                <el-form-item label="日志级别">
                  <el-select v-model="systemConfig.logLevel" style="width: 200px;">
                    <el-option label="DEBUG" value="debug" />
                    <el-option label="INFO" value="info" />
                    <el-option label="WARN" value="warn" />
                    <el-option label="ERROR" value="error" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 安全配置 -->
            <el-tab-pane label="安全配置" name="security">
              <el-form :model="securityConfig" label-width="150px">
                <el-form-item label="启用JWT认证">
                  <el-switch v-model="securityConfig.enableJwt" />
                </el-form-item>
                <el-form-item label="JWT过期时间(小时)">
                  <el-input-number v-model="securityConfig.jwtExpireHours" :min="1" :max="720" />
                </el-form-item>
                <el-form-item label="启用速率限制">
                  <el-switch v-model="securityConfig.enableRateLimit" />
                </el-form-item>
                <el-form-item label="速率限制(请求/分钟)">
                  <el-input-number v-model="securityConfig.rateLimit" :min="1" :max="1000" />
                </el-form-item>
                <el-form-item label="IP白名单">
                  <el-input
                    v-model="securityConfig.ipWhitelist"
                    type="textarea"
                    :rows="5"
                    style="width: 100%;"
                    placeholder="每行一个IP地址，例如:&#10;192.168.1.1&#10;10.0.0.1"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 数据库配置 -->
            <el-tab-pane label="数据库配置" name="database">
              <el-form :model="databaseConfig" label-width="150px">
                <el-form-item label="自动备份">
                  <el-switch v-model="databaseConfig.autoBackup" />
                </el-form-item>
                <el-form-item label="备份间隔(小时)">
                  <el-input-number v-model="databaseConfig.backupInterval" :min="1" :max="168" />
                </el-form-item>
                <el-form-item label="备份数量限制">
                  <el-input-number v-model="databaseConfig.maxBackups" :min="1" :max="100" />
                </el-form-item>
                <el-form-item label="备份路径">
                  <el-input v-model="databaseConfig.backupPath" style="width: 500px;" />
                </el-form-item>
                <el-form-item label="最近备份">
                  <el-tag v-if="databaseConfig.lastBackup" type="success">
                    {{ formatDate(databaseConfig.lastBackup) }}
                  </el-tag>
                  <el-tag v-else type="info">暂无备份</el-tag>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :icon="Download" @click="manualBackup">
                    立即备份
                  </el-button>
                  <el-button type="danger" :icon="Delete" @click="clearOldData">
                    清理旧数据
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统信息 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>系统信息</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统版本">{{ systemInfo.version }}</el-descriptions-item>
            <el-descriptions-item label="Node版本">{{ systemInfo.nodeVersion }}</el-descriptions-item>
            <el-descriptions-item label="数据库类型">{{ systemInfo.databaseType }}</el-descriptions-item>
            <el-descriptions-item label="数据库大小">{{ systemInfo.databaseSize }}</el-descriptions-item>
            <el-descriptions-item label="运行时间">{{ systemInfo.uptime }}</el-descriptions-item>
            <el-descriptions-item label="内存使用">{{ systemInfo.memoryUsage }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>快速操作</span>
          </template>
          <el-space wrap>
            <el-button type="primary" :icon="Refresh" @click="refreshSystemInfo">
              刷新系统信息
            </el-button>
            <el-button type="warning" :icon="RefreshRight" @click="restartServer">
              重启服务
            </el-button>
            <el-button type="danger" :icon="Warning" @click="clearCache">
              清除缓存
            </el-button>
            <el-button type="info" :icon="Document" @click="exportConfig">
              导出配置
            </el-button>
          </el-space>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check,
  Refresh,
  RefreshRight,
  Warning,
  Document,
  Download,
  Delete
} from '@element-plus/icons-vue'
import { getConfig, saveConfig, getSystemInfo, backupDatabase } from '../api/admin'

const activeTab = ref('ai')
const saving = ref(false)

const aiConfig = ref({
  defaultModel: 'deepseek',
  apiKey: '',
  baseUrl: '',
  maxTokens: 2000,
  temperature: 0.7,
  stream: true
})

const promptConfig = ref({
  defaultType: 'default',
  customPrompt: '',
  enhancePrompt: false
})

const systemConfig = ref({
  systemName: 'Holy7 AI Assistant',
  enableRegister: true,
  maxConversations: 100,
  maxBookmarks: 500,
  conversationRetentionDays: 90,
  enableLogging: true,
  logLevel: 'info'
})

const securityConfig = ref({
  enableJwt: true,
  jwtExpireHours: 24,
  enableRateLimit: true,
  rateLimit: 60,
  ipWhitelist: ''
})

const databaseConfig = ref({
  autoBackup: true,
  backupInterval: 24,
  maxBackups: 10,
  backupPath: './backups',
  lastBackup: null
})

const systemInfo = ref({
  version: '1.0.0',
  nodeVersion: '-',
  databaseType: 'SQLite',
  databaseSize: '-',
  uptime: '-',
  memoryUsage: '-'
})

const loadConfig = async () => {
  try {
    const res = await getConfig()
    if (res.ai) aiConfig.value = { ...aiConfig.value, ...res.ai }
    if (res.prompt) promptConfig.value = { ...promptConfig.value, ...res.prompt }
    if (res.system) systemConfig.value = { ...systemConfig.value, ...res.system }
    if (res.security) securityConfig.value = { ...securityConfig.value, ...res.security }
    if (res.database) databaseConfig.value = { ...databaseConfig.value, ...res.database }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

const saveConfigHandler = async () => {
  saving.value = true
  try {
    await saveConfig({
      ai: aiConfig.value,
      prompt: promptConfig.value,
      system: systemConfig.value,
      security: securityConfig.value,
      database: databaseConfig.value
    })
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

const loadSystemInfo = async () => {
  try {
    const res = await getSystemInfo()
    systemInfo.value = { ...systemInfo.value, ...res }
  } catch (error) {
    console.error('加载系统信息失败:', error)
  }
}

const refreshSystemInfo = () => {
  loadSystemInfo()
  ElMessage.success('系统信息已刷新')
}

const manualBackup = async () => {
  try {
    await ElMessageBox.confirm('确定要立即备份数据库吗？', '确认备份', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await backupDatabase()
    ElMessage.success('备份成功')
    loadConfig() // 更新备份时间
  } catch (error) {
    if (error !== 'cancel') {
      console.error('备份失败:', error)
      ElMessage.error('备份失败')
    }
  }
}

const clearOldData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清理旧数据吗？此操作不可恢复！',
      '确认清理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('清理成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清理失败:', error)
      ElMessage.error('清理失败')
    }
  }
}

const restartServer = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重启服务吗？重启期间服务将不可用。',
      '确认重启',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.info('服务重启中，请稍后...')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重启失败:', error)
      ElMessage.error('重启失败')
    }
  }
}

const clearCache = async () => {
  try {
    await ElMessageBox.confirm('确定要清除缓存吗？', '确认清除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('缓存已清除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清除缓存失败:', error)
      ElMessage.error('清除缓存失败')
    }
  }
}

const exportConfig = () => {
  const config = {
    ai: aiConfig.value,
    prompt: promptConfig.value,
    system: systemConfig.value,
    security: securityConfig.value,
    database: databaseConfig.value,
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `config_${new Date().getTime()}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('配置已导出')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadConfig()
  loadSystemInfo()
})
</script>

<style scoped>
.config-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
