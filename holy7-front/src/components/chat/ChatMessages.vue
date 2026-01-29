<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { marked } from 'marked'
import ThoughtDialog from './ThoughtDialog.vue'
import { createBookmark, deleteBookmark, getBookmarks } from '@/api/bookmark'

// Props
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  conversationId: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['showReasoning'])

// Ref
const chatContainerRef = ref(null)
// 存储每个消息的 bookmark ID，key 为消息索引
const bookmarkIds = ref(new Map())

// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

/**
 * 渲染 Markdown 内容
 */
const renderMarkdown = (content) => {
  try {
    return marked(content || '')
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return content || ''
  }
}

/**
 * 显示推理内容
 */
const handleShowReasoning = (content) => {
  emit('showReasoning', content)
}

/**
 * 检查消息是否已收藏
 */
const isBookmarked = (index) => {
  return bookmarkIds.value.has(index)
}

/**
 * 生成简单的哈希值作为 chatId
 */
const generateChatId = (content) => {
  // 将 conversationId 和内容一起哈希，确保不同会话的相同内容有不同的 chatId
  const combinedString = `${props.conversationId || 'default'}_${content}`
  
  let hash = 0
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return `chat_${props.conversationId || 'default'}_${Math.abs(hash)}`
}

/**
 * 加载用户的收藏列表，匹配当前消息
 */
const loadUserBookmarks = async () => {
  try {
    console.log('加载收藏列表, conversationId:', props.conversationId)
    const response = await getBookmarks()
    if (response.success) {
      const bookmarks = response.data.bookmarks
      console.log('获取到收藏列表:', bookmarks.length, '条')
      
      // 清空之前的收藏状态
      bookmarkIds.value.clear()
      
      // 遍历所有消息，检查是否已收藏
      props.messages.forEach((message, index) => {
        if (message.type === 'answer') {
          const chatId = generateChatId(message.content)
          console.log(`消息 ${index} 的 chatId:`, chatId)
          const bookmark = bookmarks.find(b => b.chat_id === chatId)
          if (bookmark) {
            bookmarkIds.value.set(index, bookmark.id)
            console.log(`消息 ${index} 已收藏, bookmarkId:`, bookmark.id)
          } else {
            console.log(`消息 ${index} 未收藏`)
          }
        }
      })
    }
  } catch (error) {
    console.error('加载收藏列表失败:', error)
  }
}

/**
 * 处理收藏/取消收藏
 */
const handleBookmark = async (message, index) => {
  try {
    if (isBookmarked(index)) {
      // 已收藏，取消收藏
      const bookmarkId = bookmarkIds.value.get(index)
      if (bookmarkId) {
        const response = await deleteBookmark(bookmarkId)
        if (response.success) {
          bookmarkIds.value.delete(index)
          console.log('取消收藏成功')
        }
      }
    } else {
      // 未收藏，创建收藏
      const chatId = generateChatId(message.content)
      const response = await createBookmark({
        chatId,
        content: message.content,
        note: ''
      })
      
      if (response.success) {
        // 保存后端返回的 bookmark ID
        bookmarkIds.value.set(index, response.data.bookmark.id)
        console.log('收藏成功')
      } else {
        // 如果后端返回错误信息，显示给用户
        if (response.message) {
          console.log('收藏失败:', response.message)
        }
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

// ============================================================================
// 滚动管理
// ============================================================================
const isAtBottom = ref(true)
let scrollTimer = null

/**
 * 处理滚动事件
 */
const handleScroll = () => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  
  scrollTimer = setTimeout(() => {
    if (chatContainerRef.value) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.value
      isAtBottom.value = scrollTop + clientHeight >= scrollHeight - 100
    }
  }, 100)
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTo({
      top: chatContainerRef.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

/**
 * 滚动到底部（使用 nextTick 确保 DOM 更新）
 */
const scrollToBottomNextTick = () => {
  if (chatContainerRef.value && isAtBottom.value) {
    scrollToBottom()
  }
}

// 暴露方法给父组件
defineExpose({
  scrollToBottomNextTick
})

// 监听消息变化，自动滚动到底部并加载收藏状态
watch(() => props.messages, () => {
  scrollToBottomNextTick()
  loadUserBookmarks()
}, { deep: true })

// 生命周期
onMounted(() => {
  if (chatContainerRef.value) {
    chatContainerRef.value.addEventListener('scroll', handleScroll)
  }
  // 初始滚动到底部
  scrollToBottom()
  // 加载收藏状态
  loadUserBookmarks()
})

onBeforeUnmount(() => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  if (chatContainerRef.value) {
    chatContainerRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <main class="chat-container" ref="chatContainerRef">
    <div 
      v-for="(message, index) in messages" 
      :key="`chat-${index}`"
      class="chat-item"
    >
      <!-- AI 回复 -->
      <div v-if="message.type === 'answer'" class="answer-item">
        <div class="avatar" role="img" aria-label="AI 头像">
          <img src="@/assets/chathead.gif" alt="AI Avatar" class="avatar-img" />
        </div>
        <div class="chat-info">
          <div
            class="markdown-content"
            v-html="renderMarkdown(message.content)"
          ></div>
          <div class="action-buttons">
            <button
              v-if="message.reasoning_content"
              class="reasoning-btn"
              @click="handleShowReasoning(message.reasoning_content)"
              title="查看推理过程"
              aria-label="查看推理过程"
            >
              ❓
            </button>
            <button
              class="bookmark-btn"
              @click="handleBookmark(message, index)"
              :class="{ bookmarked: isBookmarked(index) }"
              :title="isBookmarked(index) ? '已收藏' : '收藏到马克本'"
              :aria-label="isBookmarked(index) ? '已收藏到马克本' : '收藏到马克本'"
            >
              {{ isBookmarked(index) ? '★' : '☆' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 用户提问 -->
      <div v-else class="ask-item" role="dialog" aria-label="用户消息">
        {{ message.content }}
      </div>
    </div>
    
    <!-- 加载状态提示 -->
    <div v-if="isLoading" class="loading-indicator">
      <span class="loading-text">柒爷正在思考...</span>
    </div>
  </main>
</template>

<style scoped>
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
   操作按钮组
   ============================================================================ */
.action-buttons {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

/* ============================================================================
   推理按钮
   ============================================================================ */
.reasoning-btn {
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
   收藏按钮
   ============================================================================ */
.bookmark-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: #888;
}

.bookmark-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
  color: #ffd700;
}

.bookmark-btn.bookmarked {
  color: #ffd700;
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
  .ask-item {
    max-width: 90%;
  }
}

@media (max-width: 480px) {
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
