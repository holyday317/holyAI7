<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChat } from '@/composables/useChat'
import { marked } from 'marked'
import ThoughtDialog from '@/components/ThoughtDialog.vue'
import { MODEL_CONFIGS, healthCheck } from '@/api/chat'

// ============================================================================
// 常量定义
// ============================================================================
const STORAGE_KEYS = {
  TOKEN: 'token',
  USERNAME: 'username'
}

const CHAT_CONFIG = {
  SCROLL_DEBOUNCE_DELAY: 100,
  INPUT_MAX_LENGTH: 5000,
  AUTO_SCROLL_THRESHOLD: 100
}

// ============================================================================
// 路由和组合式函数
// ============================================================================
const router = useRouter()

const {
  chatList,
  isLoading,
  isRound,
  modelType,
  inputText,
  isShowThought,
  nowThought,
  sendMessage,
  showReasoningContent,
  scrollToBottom,
  clearRound
} = useChat()

// ============================================================================
// 响应式状态
// ============================================================================
const chatContainerRef = ref(null)
const isAtBottom = ref(true)

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

/**
 * 发送按钮禁用状态
 */
const isSendDisabled = computed(() => {
  return isLoading.value || !inputText.value.trim()
})

/**
 * 输入框剩余字符数
 */
const remainingChars = computed(() => {
  return CHAT_CONFIG.INPUT_MAX_LENGTH - inputText.value.length
})

// ============================================================================
// 配置 marked 选项
// ============================================================================
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

/**
 * 渲染 Markdown 内容
 * @param {string} content - Markdown 内容
 * @returns {string} 渲染后的 HTML
 */
const renderMarkdown = (content) => {
  try {
    return marked(content || '')
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return content || ''
  }
}

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
      
      // 可选：清除聊天历史
      // chatList.value = []
      
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
const handleSend = async () => {
  if (isSendDisabled.value) return
  
  // 检查登录状态
  if (!isLoggedIn.value) {
    // alert('请先登录后再骚扰柒爷')
    // router.push('/login')

    chatList.value.push({
      type: 'answer',
      content: '⚠️ 请先登录后再骚扰柒爷'
    })
    return
  }
  
  try {
    await sendMessage()
    // 发送后自动聚焦输入框
    nextTick(() => {
      const textarea = document.querySelector('.input-textarea')
      if (textarea) {
        textarea.focus()
      }
    })
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

/**
 * 处理键盘按键事件
 * @param {KeyboardEvent} e - 键盘事件对象
 */
const handleKeyPress = (e) => {
  // Enter 发送（Shift + Enter 换行）
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

/**
 * 处理输入框内容变化
 */
const handleInputChange = (e) => {
  const value = e.target.value
  // 限制输入长度
  if (value.length > CHAT_CONFIG.INPUT_MAX_LENGTH) {
    inputText.value = value.slice(0, CHAT_CONFIG.INPUT_MAX_LENGTH)
  }
}

/**
 * 处理聊天容器滚动事件
 */
let scrollTimer = null
const handleScroll = () => {
  // 防抖处理
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  
  scrollTimer = setTimeout(() => {
    if (chatContainerRef.value) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.value
      isAtBottom.value = scrollTop + clientHeight >= scrollHeight - CHAT_CONFIG.AUTO_SCROLL_THRESHOLD
    }
  }, CHAT_CONFIG.SCROLL_DEBOUNCE_DELAY)
}

/**
 * 滚动到底部（优化版）
 */
const scrollToBottomOptimized = () => {
  if (chatContainerRef.value) {
    nextTick(() => {
      chatContainerRef.value.scrollTo({
        top: chatContainerRef.value.scrollHeight,
        behavior: 'smooth'
      })
    })
  }
}

// ============================================================================
// 健康检查
// ============================================================================
/**
 * 检查后端服务健康状态
 * 可选：如果需要在组件加载时检查，取消注释
 */
// const checkHealth = async () => {
//   try {
//     const response = await healthCheck()
//     if (!response.success || !response.data?.hasApiKey) {
//       chatList.value.push({
//         type: 'answer',
//         content: '⚠️ 后端服务未配置 API Key，请联系管理员'
//       })
//     }
//   } catch (error) {
//     console.error('健康检查失败:', error)
//     chatList.value.push({
//       type: 'answer',
//       content: '⚠️ 无法连接到后端服务，请确保后端服务已启动'
//     })
//   }
// }

// ============================================================================
// 生命周期钩子
// ============================================================================
onMounted(() => {
  // 组件挂载时检查健康状态（可选）
  // checkHealth()
  
  // 添加滚动监听
  if (chatContainerRef.value) {
    chatContainerRef.value.addEventListener('scroll', handleScroll)
  }
})

onBeforeUnmount(() => {
  // 清理定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  
  // 移除滚动监听
  if (chatContainerRef.value) {
    chatContainerRef.value.removeEventListener('scroll', handleScroll)
  }
})

// 监听聊天列表变化，自动滚动到底部
const { stop } = watch(chatList, () => {
  if (isAtBottom.value) {
    scrollToBottomOptimized()
  }
}, { deep: true })

// 组件卸载时停止监听
onBeforeUnmount(stop)
</script>

<template>
  <div class="chat-view">
    <!-- 顶部导航栏 -->
    <header class="top-container">
      <div class="logo">
        <img src="@/assets/chathead.gif" alt="Logo" class="logo-img" />
        <span class="logo-text">柒柒柒柒柒柒柒</span>
      </div>
      
      <div class="auth-section">
        <span class="username">{{ username }}</span>
        <button class="auth-btn" @click="handleAuth" :aria-label="isLoggedIn ? '退出登录' : '登录注册'">
          {{ isLoggedIn ? '退出登录' : '登录/注册' }}
        </button>
      </div>
    </header>

    <!-- 模型选择和上下文切换（已注释，如需启用请取消注释） -->
    <!-- 
    <div class="bar-container">
      <div class="model-selector">
        <label v-for="(config, key) in MODEL_CONFIGS" :key="key" class="radio-label">
          <input
            type="radio"
            v-model="modelType"
            :value="key"
            :id="`model-${key}`"
          />
          <span :for="`model-${key}`">{{ config.label }}</span>
        </label>
      </div>

      <div class="round-toggle">
        <span class="round-label">联系上下文</span>
        <button 
          class="toggle-btn" 
          :class="{ active: isRound === '1' }"
          @click="isRound = isRound === '1' ? '0' : '1'"
          :aria-label="isRound === '1' ? '关闭上下文' : '开启上下文'"
        >
          {{ isRound === '1' ? 'ON' : 'OFF' }}
        </button>
        <button 
          v-if="isRound === '1'"
          class="clear-btn"
          @click="clearRound"
          title="清空上下文"
          aria-label="清空上下文"
        >
          🗑️
        </button>
      </div>
    </div>
    -->

    <!-- 聊天内容区域 -->
    <main class="chat-container" ref="chatContainerRef">
      <div 
        v-for="(item, index) in chatList" 
        :key="`chat-${index}`"
        class="chat-item"
      >
        <!-- AI 回复 -->
        <div v-if="item.type === 'answer'" class="answer-item">
          <div class="avatar" role="img" aria-label="AI 头像">
            <img src="@/assets/chathead.gif" alt="AI Avatar" class="avatar-img" />
          </div>
          <div class="chat-info">
            <div 
              class="markdown-content" 
              v-html="renderMarkdown(item.content)"
              v-bind="$attrs"
            ></div>
            <button 
              v-if="item.reasoning_content"
              class="reasoning-btn"
              @click="showReasoningContent(item.reasoning_content)"
              title="查看推理过程"
              aria-label="查看推理过程"
            >
              ❓
            </button>
          </div>
        </div>
        
        <!-- 用户提问 -->
        <div v-else class="ask-item" role="dialog" aria-label="用户消息">
          {{ item.content }}
        </div>
      </div>
      
      <!-- 加载状态提示 -->
      <div v-if="isLoading" class="loading-indicator">
        <span class="loading-text">柒爷正在思考...</span>
      </div>
    </main>

    <!-- 输入区域 -->
    <footer class="input-container">
      <div class="input-wrapper">
        <textarea
          v-model="inputText"
          class="input-textarea"
          :placeholder="isLoading ? '正在处理...' : '输入您的问题...'"
          @keypress="handleKeyPress"
          @input="handleInputChange"
          :disabled="isLoading"
          :maxlength="CHAT_CONFIG.INPUT_MAX_LENGTH"
          :aria-label="isLoading ? '正在处理消息' : '输入消息'"
          rows="1"
        ></textarea>
        <div v-if="remainingChars < 100" class="char-count">
          {{ remainingChars }}
        </div>
      </div>
      
      <button 
        class="submit-btn"
        :class="{ loading: isLoading }"
        @click="handleSend"
        :disabled="isSendDisabled"
        :aria-label="isLoading ? '发送中' : '发送消息'"
      >
        {{ isLoading ? '🔄' : '喂?' }}
      </button>
    </footer>

    <!-- 思考过程对话框 -->
    <ThoughtDialog
      v-if="isShowThought"
      :content="nowThought"
      @close="isShowThought = false"
    />
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
   工具栏
   ============================================================================ */
.bar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 1.5vw;
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
  gap: 1.5vw;
  box-sizing: border-box;
  flex-shrink: 0;
}

.model-selector {
  display: flex;
  gap: 1.5vw;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.radio-label input[type="radio"] {
  cursor: pointer;
  accent-color: #667eea;
}

.radio-label span {
  user-select: none;
}

.round-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.round-label {
  user-select: none;
}

.toggle-btn {
  padding: 6px 16px;
  border-radius: 12px;
  border: 1px solid #555;
  background-color: #333;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.toggle-btn:hover:not(:disabled) {
  background-color: #444;
  transform: scale(1.05);
}

.toggle-btn.active {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.clear-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-btn:hover:not(:disabled) {
  background-color: rgba(255, 107, 107, 0.1);
  transform: scale(1.1);
}

/* ============================================================================
   聊天内容区域
   ============================================================================ */
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5vh 1.5vw;
  background-color: #181818;
  box-sizing: border-box;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

.chat-item {
  margin-bottom: 1.5vh;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ask-item {
  max-width: 80%;
  margin-left: auto;
  background-color: #262626;
  border: 1px solid #444;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.answer-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.chat-info {
  flex: 1;
  background-color: #262626;
  border: 1px solid #444;
  border-radius: 12px;
  padding: 12px 16px;
  position: relative;
  min-width: 0;
}

/* ============================================================================
   Markdown 内容样式
   ============================================================================ */
.markdown-content {
  line-height: 1.8;
  font-size: 15px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1.6vh;
  margin-bottom: 0.8vh;
  color: #fff;
  font-weight: 600;
}

.markdown-content :deep(h1) {
  font-size: 24px;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5vh;
}

.markdown-content :deep(h2) {
  font-size: 20px;
}

.markdown-content :deep(h3) {
  font-size: 18px;
}

.markdown-content :deep(p) {
  margin-bottom: 1.2vh;
}

.markdown-content :deep(code) {
  background-color: #333;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Consolas, Monaco, monospace;
  font-size: 14px;
  color: #e6db74;
}

.markdown-content :deep(pre) {
  background-color: #1e1e1e;
  padding: 1.2vh;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1.2vh;
  border: 1px solid #333;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 2vw;
  margin-bottom: 1.2vh;
}

.markdown-content :deep(li) {
  margin-bottom: 0.6vh;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid #667eea;
  padding-left: 1.2vw;
  margin: 1.2vh 0;
  color: #ccc;
  background-color: rgba(102, 126, 234, 0.1);
  padding: 1vh 1.2vw;
  border-radius: 4px;
}

.markdown-content :deep(a) {
  color: #667eea;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.2vh;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #444;
  padding: 8px 12px;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #333;
  font-weight: 600;
}

/* ============================================================================
   推理按钮
   ============================================================================ */
.reasoning-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.reasoning-btn:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

/* ============================================================================
   加载指示器
   ============================================================================ */
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2vh;
  color: #ccc;
}

.loading-text {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ============================================================================
   输入区域
   ============================================================================ */
.input-container {
  display: flex;
  gap: 1.2vw;
  padding: 1.5vh 1.5vw;
  background-color: #1a1a1a;
  border-top: 1px solid #333;
  box-sizing: border-box;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.input-textarea {
  width: 100%;
  background-color: #262626;
  color: #fff;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  resize: none;
  height: 80px;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-textarea::placeholder {
  color: #888;
}

.input-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-textarea:enabled:hover {
  border-color: #555;
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: #888;
  pointer-events: none;
}

.char-count.warning {
  color: #ff9800;
}

.char-count.danger {
  color: #f44336;
}

/* ============================================================================
   提交按钮
   ============================================================================ */
.submit-btn {
  background-color: #667eea;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 80px;
  min-width: 80px;
  flex-shrink: 0;
}

.submit-btn:hover:not(:disabled) {
  background-color: #5568d3;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn.loading {
  animation: pulse 1.5s infinite;
  pointer-events: none;
}

/* ============================================================================
   滚动条样式
   ============================================================================ */
.chat-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.chat-container::-webkit-scrollbar-track {
  background: #181818;
  border-radius: 4px;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: #555;
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
  
  .ask-item {
    max-width: 90%;
  }
  
  .input-container {
    padding: 1vh 1vw;
    gap: 0.8vw;
  }
  
  .input-textarea {
    height: 60px;
    font-size: 14px;
  }
  
  .submit-btn {
    height: 60px;
    padding: 0 20px;
    min-width: 60px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .chat-container {
    padding: 1vh 1vw;
  }
  
  .answer-item {
    gap: 8px;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
  }
  
  .chat-info {
    padding: 10px 12px;
  }
  
  .markdown-content {
    font-size: 14px;
  }
}
</style>
