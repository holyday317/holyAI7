<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChat } from '@/composables/useChat'
import ConversationSidebar from '@/components/chat/ConversationSidebar.vue'
import ChatMessages from '@/components/chat/ChatMessages.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import ThoughtDialog from '@/components/chat/ThoughtDialog.vue'
import ModelSelector from '@/components/chat/ModelSelector.vue'
import {
  createConversation,
  getConversationChats
} from '@/api/conversation'

// ============================================================================
// 常量定义
// ============================================================================
const STORAGE_KEYS = {
  TOKEN: 'token',
  USERNAME: 'username'
}

const CHAT_CONFIG = {
  INPUT_MAX_LENGTH: 5000
}

// ============================================================================
// 路由和组合式函数
// ============================================================================
const router = useRouter()

const {
  chatList,
  isLoading,
  modelType,
  isShowThought,
  nowThought,
  sendMessage,
  showReasoningContent,
  changeModel
} = useChat()

// ============================================================================
// 响应式状态
// ============================================================================
// 会话相关状态
const isSidebarOpen = ref(false)
const currentConversationId = ref(null)
const showCreateDialog = ref(false)
const newConversationTitle = ref('')
const sidebarRef = ref(null)

// ============================================================================
// 计算属性
// ============================================================================
/**
 * 检查用户登录状态
 */
const isLoggedIn = computed(() => {
  return !!localStorage.getItem(STORAGE_KEYS.TOKEN)
})

/**
 * 获取用户名
 */
const username = computed(() => {
  return localStorage.getItem(STORAGE_KEYS.USERNAME) || '未登录'
})

// ============================================================================
// 事件处理函数
// ============================================================================
/**
 * 处理登录/登出操作
 */
const handleAuth = async () => {
  try {
    if (isLoggedIn.value) {
      // 登出
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USERNAME)
      
      // 刷新页面
      window.location.reload()
    } else {
      // 跳转到登录页面
      router.push('/login')
    }
  } catch (error) {
    console.error('认证操作失败:', error)
    alert('操作失败，请重试')
  }
}

/**
 * 处理发送消息
 */
const handleSend = async (text) => {
  // 检查登录状态
  if (!isLoggedIn.value) {
    chatList.value.push({
      type: 'answer',
      content: '⚠️ 请先登录后再骚扰柒爷'
    })
    return
  }
  
  try {
    // 如果没有选中的会话,自动创建一个新会话
    if (!currentConversationId.value && isLoggedIn.value) {
      const response = await createConversation({ title: '新对话' })
      if (response.success) {
        currentConversationId.value = response.data.conversation.id
      }
    }
    
    await sendMessage(text, currentConversationId.value)
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

/**
 * 显示推理内容
 */
const handleShowReasoningContent = (content) => {
  showReasoningContent(content)
}

// ============================================================================
// 会话管理函数
// ============================================================================
/**
 * 切换侧边栏
 */
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

/**
 * 关闭侧边栏
 */
const closeSidebar = () => {
  isSidebarOpen.value = false
}

/**
 * 选择会话并加载聊天记录
 */
const handleSelectConversation = async (conversationId) => {
  try {
    console.log('选择会话:', { conversationId })
    
    if (conversationId === null) {
      // 如果 conversationId 为 null,表示清空当前会话
      currentConversationId.value = null
      chatList.value = []
      return
    }
    
    currentConversationId.value = conversationId
    
    // 加载会话的聊天记录
    console.log('正在加载会话聊天记录...')
    const response = await getConversationChats(conversationId)
    
    console.log('API响应:', {
      success: response.success,
      hasData: !!response.data,
      chatsCount: response.data?.chats?.length || 0
    })
    
    if (response.success) {
      // 将后端的聊天记录转换为前端格式
      const chatItems = []
      
      response.data.chats.forEach(chat => {
        // 先添加用户问题
        if (chat.user_message) {
          chatItems.push({
            type: 'question',
            content: chat.user_message
          })
        }
        
        // 再添加AI回复
        if (chat.ai_response) {
          chatItems.push({
            type: 'answer',
            content: chat.ai_response,
            reasoning_content: chat.reasoning_content
          })
        }
      })
      
      chatList.value = chatItems
    }
  } catch (error) {
    console.error('加载会话聊天记录失败:', error)
  }
}

// ============================================================================
// 对话框管理函数
// ============================================================================
/**
 * 打开新建会话对话框
 */
const handleOpenCreateDialog = () => {
  newConversationTitle.value = ''
  showCreateDialog.value = true
}

/**
 * 关闭新建会话对话框
 */
const closeCreateDialog = () => {
  showCreateDialog.value = false
  newConversationTitle.value = ''
}

/**
 * 创建新会话
 */
const handleCreateConversation = async () => {
  try {
    const title = newConversationTitle.value.trim() || '新对话'
    const response = await createConversation({ title })
    
    if (response.success) {
      console.log('创建会话成功:', response.data.conversation)
      currentConversationId.value = response.data.conversation.id
      chatList.value = []
      closeCreateDialog()
      
      // 刷新侧边栏的会话列表
      if (sidebarRef.value && sidebarRef.value.loadConversations) {
        await sidebarRef.value.loadConversations()
      }
      
      // 新会话默认发送 "喂喂喂"
      await sendMessage('喂喂喂', currentConversationId.value)
    }
  } catch (error) {
    console.error('创建会话失败:', error)
    alert('创建会话失败,请重试')
  }
}

/**
 * 自动创建新会话并发送"喂喂喂"
 * 用于组件挂载时和登录成功后
 */
const autoCreateConversationWithGreeting = async () => {
  // 如果没有当前会话ID，自动创建一个新会话并发送"喂喂喂"
  if (!currentConversationId.value) {
    try {
      const response = await createConversation({ title: '新对话' })
      if (response.success) {
        console.log('自动创建会话成功:', response.data.conversation)
        currentConversationId.value = response.data.conversation.id
        chatList.value = []
        
        // 刷新侧边栏的会话列表
        if (sidebarRef.value && sidebarRef.value.loadConversations) {
          await sidebarRef.value.loadConversations()
        }
        
        // 自动发送"喂喂喂"
        await sendMessage('喂喂喂', currentConversationId.value)
      }
    } catch (error) {
      console.error('自动创建会话失败:', error)
    }
  }
}

// ============================================================================
// 监听
// ============================================================================
// 监听当前会话ID变化,记录日志
watch(currentConversationId, (newId, oldId) => {
  console.log('当前会话ID变化:', { oldId, newId })
})

// ============================================================================
// 生命周期
// ============================================================================
/**
 * 组件挂载时自动创建新会话并发送"喂喂喂"
 */
onMounted(async () => {
  // 检查是否已登录
  if (!isLoggedIn.value) {
    return
  }
  
  // 自动创建会话并发送"喂喂喂"
  await autoCreateConversationWithGreeting()
})

// 导出函数供外部调用（如登录成功后）
defineExpose({
  autoCreateConversationWithGreeting
})
</script>

<template>
  <div class="chat-view">
    <!-- 会话列表侧边栏组件 -->
    <ConversationSidebar
      ref="sidebarRef"
      :is-open="isSidebarOpen"
      :current-conversation-id="currentConversationId"
      @close="closeSidebar"
      @select="handleSelectConversation"
      @update="currentConversationId = null; chatList = []"
      @open-create-dialog="handleOpenCreateDialog"
    />

    <!-- 顶部导航栏 -->
    <header class="top-container">
      <div class="logo">
        <button
          class="menu-btn"
          @click="toggleSidebar"
          aria-label="打开会话列表"
        >
          ☰
        </button>
        <img src="@/assets/chathead.gif" alt="Logo" class="logo-img" />
        <span class="logo-text">柒柒柒柒柒柒柒</span>
      </div>
      
      <div class="auth-section">
        <!-- <ModelSelector
          :model-type="modelType"
          @change="changeModel"
        /> -->
        <span class="username">{{ username }}</span>
        <button class="auth-btn" @click="handleAuth" :aria-label="isLoggedIn ? '退出登录' : '登录注册'">
          {{ isLoggedIn ? '退出登录' : '登录/注册' }}
        </button>
      </div>
    </header>

    <!-- 聊天内容区域组件 -->
    <ChatMessages
      :messages="chatList"
      :is-loading="isLoading"
      @show-reasoning="handleShowReasoningContent"
    />

    <!-- 输入区域组件 -->
    <ChatInput
      :is-loading="isLoading"
      :max-length="CHAT_CONFIG.INPUT_MAX_LENGTH"
      @send="handleSend"
    />

    <!-- 思考过程对话框 -->
    <ThoughtDialog
      v-if="isShowThought"
      :content="nowThought"
      @close="isShowThought = false"
    />

    <!-- 新建会话对话框 -->
    <div v-if="showCreateDialog" class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <h3>新建会话</h3>
          <button
            class="dialog-close-btn"
            @click="closeCreateDialog"
            aria-label="关闭对话框"
          >
            ✕
          </button>
        </div>
        <div class="dialog-body">
          <input
            v-model="newConversationTitle"
            class="dialog-input"
            placeholder="输入会话标题(可选)"
            @keyup.enter="handleCreateConversation"
          />
        </div>
        <div class="dialog-footer">
          <button
            class="dialog-btn dialog-btn-cancel"
            @click="closeCreateDialog"
          >
            取消
          </button>
          <button
            class="dialog-btn dialog-btn-confirm"
            @click="handleCreateConversation"
          >
            创建
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
.chat-view {
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

.logo-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 14px;
  color: #ccc;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #667eea;
  background-color: transparent;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.auth-btn:hover:not(:disabled) {
  background-color: #667eea;
  color: #fff;
  transform: scale(1.02);
}

.auth-btn:active:not(:disabled) {
  transform: scale(0.98);
}

/* ============================================================================
   模型选择器样式
   ============================================================================ */
.model-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
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
  
  .logo-img {
    width: 32px;
    height: 32px;
  }
  
  .username {
    max-width: 100px;
    font-size: 12px;
  }
  
  .auth-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }
  
  .username {
    display: none;
  }
}

/* ============================================================================
   对话框样式
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

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
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
  padding: 20px;
}

.dialog-input {
  width: 100%;
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.dialog-input:focus {
  border-color: #667eea;
}

.dialog-input::placeholder {
  color: #888;
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

.dialog-btn-confirm {
  background-color: #667eea;
  color: #fff;
}

.dialog-btn-confirm:hover:not(:disabled) {
  background-color: #5568d3;
}

.dialog-btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 480px) {
  .dialog {
    min-width: 320px;
  }
}
</style>
