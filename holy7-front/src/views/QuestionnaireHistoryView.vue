<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { questionnaireConfigs } from '@/models/questionnaireConfigs'
import { getQuestionnaires, deleteQuestionnaire as deleteQuestionnaireApi } from '@/api/questionnaire'

const router = useRouter()

// 量表记录列表
const questionnaireHistory = ref([])

// 筛选条件
const selectedCategory = ref('all')

// 是否显示详情对话框
const showDetailDialog = ref(false)

// 当前查看的记录详情
const currentDetail = ref(null)

// 加载量表记录
const loadQuestionnaireHistory = async () => {
  try {
    const response = await getQuestionnaires()
    if (response.success && response.data.questionnaires) {
      questionnaireHistory.value = response.data.questionnaires
    }
  } catch (error) {
    console.error('加载量表记录失败:', error)
  }
}

// 获取问卷配置
const getQuestionnaireConfig = (type) => {
  return questionnaireConfigs[type] || { title: '未知问卷', description: '' }
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // 如果是今天
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 如果是昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 其他日期
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 获取问卷图标
const getQuestionnaireIcon = (type) => {
  const iconMap = {
    emotion_assessment: '😊',
    thought_record: '📝',
    activity_plan: '🎯',
    problem_solving: '💡',
    mindfulness_breathing: '🧘',
    mbti_test: '🧩'
  }
  return iconMap[type] || '📊'
}

// 获取问卷颜色
const getQuestionnaireColor = (type) => {
  const colorMap = {
    emotion_assessment: '#667eea',
    thought_record: '#f093fb',
    activity_plan: '#4facfe',
    problem_solving: '#43e97b',
    mindfulness_breathing: '#fa709a',
    mbti_test: '#fee140'
  }
  return colorMap[type] || '#667eea'
}

// 获取问卷类别
const getQuestionnaireCategory = (type) => {
  const categoryMap = {
    emotion_assessment: '情绪管理',
    thought_record: 'CBT工具',
    activity_plan: 'CBT工具',
    problem_solving: '问题解决',
    mindfulness_breathing: '正念练习',
    mbti_test: '心理测试'
  }
  return categoryMap[type] || '其他'
}

// 获取所有类别
const categories = computed(() => {
  const cats = new Set(['all'])
  questionnaireHistory.value.forEach(record => {
    const category = getQuestionnaireCategory(record.type)
    cats.add(category)
  })
  return Array.from(cats)
})

// 筛选后的记录
const filteredHistory = computed(() => {
  if (selectedCategory.value === 'all') {
    return questionnaireHistory.value
  }
  return questionnaireHistory.value.filter(record => 
    getQuestionnaireCategory(record.type) === selectedCategory.value
  )
})

// 显示记录详情
const showDetail = (record) => {
  const config = getQuestionnaireConfig(record.type)
  currentDetail.value = {
    ...record,
    title: config.title,
    description: config.description
  }
  showDetailDialog.value = true
}

// 关闭详情对话框
const closeDetailDialog = () => {
  showDetailDialog.value = false
  currentDetail.value = null
}

// 删除记录
const deleteRecord = async (id) => {
  if (confirm('确定要删除这条记录吗？')) {
    try {
      await deleteQuestionnaireApi(id)
      // 重新加载记录列表
      await loadQuestionnaireHistory()
      closeDetailDialog()
    } catch (error) {
      console.error('删除记录失败:', error)
    }
  }
}

// 返回聊天页面
const goBack = () => {
  router.push('/chat')
}

// 组件挂载时加载记录
onMounted(() => {
  loadQuestionnaireHistory()
})
</script>

<template>
  <div class="history-view">
    <!-- 顶部导航栏 -->
    <header class="top-container">
      <div class="logo">
        <button class="menu-btn" @click="goBack" aria-label="返回聊天">
          ←
        </button>
        <span class="logo-text">量表记录</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 筛选器 -->
      <div class="filter-section">
        <div class="filter-label">筛选:</div>
        <div class="filter-options">
          <button
            v-for="category in categories"
            :key="category"
            class="filter-btn"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category === 'all' ? '全部' : category }}
          </button>
        </div>
      </div>

      <!-- 记录列表 -->
      <div class="records-list">
        <div v-if="filteredHistory.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无量表记录</div>
          <button class="empty-action-btn" @click="router.push('/questionnaires')">
            去填写量表
          </button>
        </div>

        <div
          v-for="record in filteredHistory"
          :key="record.id"
          class="record-card"
          :style="{ '--card-color': getQuestionnaireColor(record.type) }"
          @click="showDetail(record)"
        >
          <div class="record-icon">{{ getQuestionnaireIcon(record.type) }}</div>
          <div class="record-content">
            <div class="record-header">
              <h3 class="record-title">{{ getQuestionnaireConfig(record.type).title }}</h3>
              <span class="record-time">{{ formatTime(record.created_at) }}</span>
            </div>
            <div class="record-category">{{ getQuestionnaireCategory(record.type) }}</div>
          </div>
          <div class="record-arrow">→</div>
        </div>
      </div>
    </main>

    <!-- 详情对话框 -->
    <div v-if="showDetailDialog && currentDetail" class="dialog-overlay" @click="closeDetailDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-title-section">
            <span class="dialog-icon">{{ getQuestionnaireIcon(currentDetail.type) }}</span>
            <div>
              <h3>{{ currentDetail.title }}</h3>
              <p class="dialog-time">{{ formatTime(currentDetail.created_at) }}</p>
            </div>
          </div>
          <button
            class="dialog-close-btn"
            @click="closeDetailDialog"
            aria-label="关闭对话框"
          >
            ✕
          </button>
        </div>
        <div class="dialog-body">
          <div class="detail-section">
            <h4 class="detail-section-title">问卷内容</h4>
            <div class="detail-content">
              <div
                v-for="(field, index) in (getQuestionnaireConfig(currentDetail.type).fields || [])"
                :key="index"
                class="detail-item"
              >
                <span class="detail-label">{{ field.label }}:</span>
                <span class="detail-value">{{ currentDetail.data[field.key] }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button
            class="dialog-btn dialog-btn-danger"
            @click="deleteRecord(currentDetail.id)"
          >
            删除记录
          </button>
          <button
            class="dialog-btn dialog-btn-cancel"
            @click="closeDetailDialog"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   基础布局
   ============================================================================ */
.history-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #181818;
  color: #fff;
  overflow: hidden;
  box-sizing: border-box;
}

/* ============================================================================
   顶部导航栏
   ============================================================================ */
.top-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5vh 1.5vw;
  background-color: #181818;
  border-bottom: 1px solid #333;
  min-height: 6vh;
  box-sizing: border-box;
  flex-shrink: 0;
}

.menu-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-right: 8px;
}

.menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.logo {
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  user-select: none;
}

/* ============================================================================
   主内容区
   ============================================================================ */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* ============================================================================
   筛选器
   ============================================================================ */
.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  color: #888;
  flex-shrink: 0;
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #444;
  background-color: transparent;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background-color: #333;
  color: #fff;
}

.filter-btn.active {
  background-color: #667eea;
  border-color: #667eea;
  color: #fff;
}

/* ============================================================================
   记录列表
   ============================================================================ */
.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  background-color: #262626;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.record-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--card-color, #667eea) 0%, rgba(0, 0, 0, 0) 100%);
}

.record-card:hover {
  background-color: #2d2d2d;
  border-color: var(--card-color, #667eea);
  transform: translateX(4px);
}

.record-icon {
  font-size: 32px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.record-content {
  flex: 1;
  min-width: 0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.record-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.record-time {
  font-size: 12px;
  color: #888;
  flex-shrink: 0;
}

.record-category {
  font-size: 12px;
  color: #666;
}

.record-arrow {
  font-size: 20px;
  color: var(--card-color, #667eea);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.record-card:hover .record-arrow {
  opacity: 1;
}

/* ============================================================================
   空状态
   ============================================================================ */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #262626;
  border-radius: 12px;
  border: 1px dashed #444;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #888;
  margin-bottom: 24px;
}

.empty-action-btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  background-color: #667eea;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-action-btn:hover {
  background-color: #5568d3;
}

/* ============================================================================
   详情对话框
   ============================================================================ */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog {
  background-color: #262626;
  border: 1px solid #444;
  border-radius: 12px;
  min-width: 400px;
  max-width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
}

.dialog-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-icon {
  font-size: 36px;
}

.dialog-title-section h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.dialog-time {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #888;
}

.dialog-close-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  margin: 0 0 12px 0;
}

.detail-content {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 16px;
}

.detail-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  color: #888;
  min-width: 120px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 13px;
  color: #fff;
  word-break: break-word;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #333;
}

.dialog-btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.dialog-btn-cancel {
  background-color: #333;
  color: #fff;
}

.dialog-btn-cancel:hover {
  background-color: #444;
}

.dialog-btn-danger {
  background-color: #ff4757;
  color: #fff;
}

.dialog-btn-danger:hover {
  background-color: #e8414f;
}

/* ============================================================================
   滚动条样式
   ============================================================================ */
.main-content::-webkit-scrollbar,
.dialog-body::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track,
.dialog-body::-webkit-scrollbar-track {
  background: #181818;
}

.main-content::-webkit-scrollbar-thumb,
.dialog-body::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover,
.dialog-body::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* ============================================================================
   响应式设计
   ============================================================================ */
@media (max-width: 768px) {
  .top-container {
    padding: 1vh 1vw;
  }

  .logo {
    font-size: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .filter-section {
    gap: 8px;
  }

  .filter-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .record-card {
    padding: 14px;
  }

  .record-icon {
    font-size: 28px;
    width: 44px;
    height: 44px;
  }

  .record-title {
    font-size: 14px;
  }

  .dialog {
    min-width: 320px;
    max-height: 90vh;
  }
}

@media (max-width: 480px) {
  .top-container {
    padding: 0.8vh 0.8vw;
    min-height: 5vh;
  }

  .logo {
    font-size: 14px;
  }

  .menu-btn {
    font-size: 20px;
    padding: 2px 6px;
    margin-right: 4px;
  }

  .main-content {
    padding: 12px;
  }

  .record-card {
    padding: 12px;
    gap: 12px;
  }

  .record-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
  }

  .record-title {
    font-size: 13px;
  }

  .record-time {
    font-size: 11px;
  }
}
</style>
