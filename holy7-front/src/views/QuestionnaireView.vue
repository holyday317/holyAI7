<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { questionnaireConfigs, getQuestionnaireTypes } from '@/models/questionnaireConfigs'
import QuestionnaireDialog from '@/components/chat/QuestionnaireDialog.vue'

const router = useRouter()

// 当前选中的问卷类型
const selectedQuestionnaireType = ref(null)

// 问卷对话框是否打开
const isDialogOpen = ref(false)

// 获取所有问卷类型
const questionnaireTypes = getQuestionnaireTypes()

// 问卷卡片配置
const questionnaireCards = [
  {
    type: 'emotion_assessment',
    icon: '😊',
    title: '情绪评估',
    description: '评估你当前的整体情绪状态，包括焦虑、低落、压力等维度',
    color: '#667eea',
    category: '情绪管理'
  },
  {
    type: 'thought_record',
    icon: '📝',
    title: '认知记录表',
    description: '记录让你情绪波动的事件，分析情境、想法、情绪和行为的关系',
    color: '#f093fb',
    category: 'CBT工具'
  },
  {
    type: 'activity_plan',
    icon: '🎯',
    title: '活动计划表',
    description: '规划能带来愉悦感和掌控感的小活动，提升生活积极性',
    color: '#4facfe',
    category: 'CBT工具'
  },
  {
    type: 'problem_solving',
    icon: '💡',
    title: '问题解决工作表',
    description: '用结构化方法解决困扰你的问题，制定可行的行动方案',
    color: '#43e97b',
    category: '问题解决'
  },
  {
    type: 'mindfulness_breathing',
    icon: '🧘',
    title: '正念呼吸练习',
    description: '花几分钟时间关注你的呼吸，练习正念和放松',
    color: '#fa709a',
    category: '正念练习'
  },
  {
    type: 'mbti_test',
    icon: '🧩',
    title: 'MBTI性格测试',
    description: '通过60道题目了解你的性格类型，包括E/I、S/N、T/F、J/P四个维度',
    color: '#fee140',
    category: '心理测试'
  }
]

// 按类别分组问卷
const questionnairesByCategory = ref({})

// 初始化问卷分类
const initCategories = () => {
  const categories = {}
  questionnaireCards.forEach(card => {
    if (!categories[card.category]) {
      categories[card.category] = []
    }
    categories[card.category].push(card)
  })
  questionnairesByCategory.value = categories
}

// 打开问卷对话框
const openQuestionnaire = (type) => {
  selectedQuestionnaireType.value = type
  isDialogOpen.value = true
}

// 关闭问卷对话框
const closeDialog = () => {
  isDialogOpen.value = false
  selectedQuestionnaireType.value = null
}

// 处理问卷提交
const handleQuestionnaireSubmit = async (data) => {
  console.log('问卷提交:', data)
  closeDialog()
  // 跳转到聊天页面，让AI分析问卷结果
  router.push({
    path: '/chat',
    query: {
      questionnaire: JSON.stringify(data)
    }
  })
}

// 返回聊天页面
const goBack = () => {
  router.push('/chat')
}

// 初始化
initCategories()
</script>

<template>
  <div class="questionnaire-view">
    <!-- 顶部导航栏 -->
    <header class="top-container">
      <div class="logo">
        <button class="menu-btn" @click="goBack" aria-label="返回聊天">
          ←
        </button>
        <span class="logo-text">量表评估</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 欢迎信息 -->
      <div class="welcome-section">
        <h1 class="welcome-title">📊 心理健康量表评估</h1>
        <p class="welcome-description">
          选择下方的量表进行自我评估，了解当前的心理状态，获取个性化的建议和反馈
        </p>
      </div>

      <!-- 问卷卡片列表 -->
      <div class="questionnaire-list">
        <div
          v-for="(cards, category) in questionnairesByCategory"
          :key="category"
          class="category-section"
        >
          <h2 class="category-title">{{ category }}</h2>
          <div class="cards-grid">
            <div
              v-for="card in cards"
              :key="card.type"
              class="questionnaire-card"
              :style="{ '--card-color': card.color }"
              @click="openQuestionnaire(card.type)"
            >
              <div class="card-icon">{{ card.icon }}</div>
              <div class="card-content">
                <h3 class="card-title">{{ card.title }}</h3>
                <p class="card-description">{{ card.description }}</p>
              </div>
              <div class="card-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 问卷对话框 -->
    <QuestionnaireDialog
      :visible="isDialogOpen"
      :questionnaire-type="selectedQuestionnaireType"
      @close="closeDialog"
      @submit="handleQuestionnaireSubmit"
    />
  </div>
</template>

<style scoped>
/* ============================================================================
   基础布局
   ============================================================================ */
.questionnaire-view {
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
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 欢迎信息 */
.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #5568d3 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.welcome-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 12px 0;
  color: #fff;
}

.welcome-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

/* ============================================================================
   问卷列表
   ============================================================================ */
.questionnaire-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-title {
  font-size: 20px;
  font-weight: 600;
  color: #ccc;
  margin: 0;
  padding-left: 4px;
  border-left: 3px solid var(--card-color, #667eea);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

/* ============================================================================
   问卷卡片
   ============================================================================ */
.questionnaire-card {
  background-color: #262626;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.questionnaire-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--card-color, #667eea) 0%, rgba(0, 0, 0, 0) 100%);
}

.questionnaire-card:hover {
  background-color: #2d2d2d;
  border-color: var(--card-color, #667eea);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.questionnaire-card:active {
  transform: translateY(0);
}

.card-icon {
  font-size: 40px;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
}

.card-description {
  font-size: 14px;
  color: #888;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-arrow {
  font-size: 24px;
  color: var(--card-color, #667eea);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.questionnaire-card:hover .card-arrow {
  opacity: 1;
}

/* ============================================================================
   滚动条样式
   ============================================================================ */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #181818;
}

.main-content::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
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

  .welcome-section {
    padding: 24px 16px;
    margin-bottom: 32px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .welcome-description {
    font-size: 14px;
  }

  .category-title {
    font-size: 18px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .questionnaire-card {
    padding: 16px;
  }

  .card-icon {
    font-size: 32px;
    width: 48px;
    height: 48px;
  }

  .card-title {
    font-size: 16px;
  }

  .card-description {
    font-size: 13px;
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

  .welcome-section {
    padding: 20px 12px;
    margin-bottom: 24px;
  }

  .welcome-title {
    font-size: 20px;
  }

  .welcome-description {
    font-size: 13px;
  }

  .category-title {
    font-size: 16px;
  }

  .questionnaire-card {
    padding: 14px;
    gap: 12px;
  }

  .card-icon {
    font-size: 28px;
    width: 44px;
    height: 44px;
  }

  .card-title {
    font-size: 15px;
  }

  .card-description {
    font-size: 12px;
  }
}
</style>
