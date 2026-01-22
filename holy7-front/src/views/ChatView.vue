<script setup>
import { ref } from 'vue'
import { useChat } from '@/composables/useChat'
import { marked } from 'marked'
import ThoughtDialog from '@/components/ThoughtDialog.vue'
import { MODEL_CONFIGS, healthCheck } from '@/api/chat'

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

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

// 渲染 Markdown
const renderMarkdown = (content) => {
  return marked(content || '')
}

// 处理发送
const handleSend = () => {
  sendMessage()
}

// 处理回车发送
const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 检查后端服务健康状态
const checkHealth = async () => {
  try {
    const response = await healthCheck()
    if (!response.success || !response.data?.hasApiKey) {
      chatList.value.push({
        type: 'answer',
        content: '⚠️ 后端服务未配置 API Key，请联系管理员'
      })
    }
  } catch (error) {
    console.error('健康检查失败:', error)
    chatList.value.push({
      type: 'answer',
      content: '⚠️ 无法连接到后端服务，请确保后端服务已启动'
    })
  }
}

// 组件挂载时检查健康状态
checkHealth()
</script>

<template>
  <div class="chat-view">
    <div class="top-container">
      <div class="logo">
        <img src="@/assets/chathead.gif" alt="Logo" class="logo-img" />
        柒柒柒柒柒柒柒
      </div>
    </div>

    <div class="bar-container">
      <!-- 模型选择 -->
      <div class="model-selector">
        <label v-for="(config, key) in MODEL_CONFIGS" :key="key" class="radio-label">
          <input
            type="radio"
            v-model="modelType"
            :value="key"
          />
          <span>{{ config.label }}</span>
        </label>
      </div>

      <!-- 多轮对话开关 -->
      <div class="round-toggle">
        <span>联系上下文</span>
        <button 
          class="toggle-btn" 
          :class="{ active: isRound === '1' }"
          @click="isRound = isRound === '1' ? '0' : '1'"
        >
          {{ isRound === '1' ? 'ON' : 'OFF' }}
        </button>
        <button 
          v-if="isRound === '1'"
          class="clear-btn"
          @click="clearRound"
          title="清空上下文"
        >
          🗑️
        </button>
      </div>
    </div>

    <div class="chat-container" ref="chatContainer">
      <div 
        v-for="(item, index) in chatList" 
        :key="index"
        class="chat-item"
      >
        <!-- AI 回复 -->
        <div v-if="item.type === 'answer'" class="answer-item">
          <div class="avatar">
            <img src="@/assets/chathead.gif" alt="AI Avatar" class="avatar-img" />
          </div>
          <div class="chat-info">
            <div class="markdown-content" v-html="renderMarkdown(item.content)"></div>
            <button 
              v-if="item.reasoning_content"
              class="reasoning-btn"
              @click="showReasoningContent(item.reasoning_content)"
              title="查看推理过程"
            >
              ❓
            </button>
          </div>
        </div>
        
        <!-- 用户提问 -->
        <div v-else class="ask-item">
          {{ item.content }}
        </div>
      </div>
    </div>

    <div class="input-container">
      <textarea
        v-model="inputText"
        class="input-textarea"
        placeholder="输入您的问题..."
        @keypress="handleKeyPress"
        :disabled="isLoading"
      ></textarea>
      <button 
        class="submit-btn"
        :class="{ loading: isLoading }"
        @click="handleSend"
        :disabled="isLoading || !inputText.trim()"
      >
        {{ isLoading ? '🔄' : '喂?' }}
      </button>
    </div>


    <!-- 思考过程对话框 -->
    <ThoughtDialog
      v-if="isShowThought"
      :content="nowThought"
      @close="isShowThought = false"
    />
  </div>
</template>

<style scoped>
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

.top-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5vh 1.5vw;
  background-color: #181818;
  border-bottom: 1px solid #333;
  min-height: 6vh;
  box-sizing: border-box;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.bar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 1.5vw;
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
  gap: 1.5vw;
  box-sizing: border-box;
}

.model-selector {
  display: flex;
  gap: 1.5vw;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  cursor: pointer;
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

.toggle-btn {
  padding: 6px 16px;
  border-radius: 12px;
  border: 1px solid #555;
  background-color: #333;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
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
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background-color: rgba(255, 107, 107, 0.1);
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5vh 1.5vw;
  background-color: #181818;
  box-sizing: border-box;
  overflow-x: hidden;
}

.chat-item {
  margin-bottom: 1.5vh;
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
}

.markdown-content {
  line-height: 1.8;
  font-size: 15px;
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
}

.markdown-content :deep(h1) {
  font-size: 24px;
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
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.markdown-content :deep(pre) {
  background-color: #333;
  padding: 1.2vh;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1.2vh;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
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
  border-left: 3px solid #fff;
  padding-left: 1.2vw;
  margin: 1.2vh 0;
  color: #ccc;
}

.reasoning-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.reasoning-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.input-container {
  display: flex;
  gap: 1.2vw;
  padding: 1.5vh 1.5vw;
  background-color: #1a1a1a;
  border-top: 1px solid #333;
  box-sizing: border-box;
}

.input-textarea {
  flex: 1;
  background-color: #262626;
  color: #fff;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  resize: none;
  height: 80px;
  font-family: inherit;
}

.input-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.input-textarea::placeholder {
  color: #888;
}

.input-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn {
  background-color: #667eea;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  height: 80px;
  min-width: 80px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #5568d3;
  transform: scale(1.02);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn.loading {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 滚动条样式 */
.chat-container::-webkit-scrollbar {
  width: 8px;
}

.chat-container::-webkit-scrollbar-track {
  background: #181818;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>