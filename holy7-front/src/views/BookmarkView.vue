<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import {
  getBookmarks,
  deleteBookmark
} from '@/api/bookmark'

const router = useRouter()

// 响应式状态
const bookmarks = ref([])
const isLoading = ref(false)

// 获取收藏列表
const loadBookmarks = async () => {
  try {
    isLoading.value = true
    const response = await getBookmarks()
    
    if (response.success) {
      bookmarks.value = response.data.bookmarks
    }
  } catch (error) {
    console.error('加载收藏列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 删除收藏
const handleDeleteBookmark = async (bookmarkId) => {
  if (!confirm('确定要删除这个收藏吗?')) {
    return
  }
  
  try {
    const response = await deleteBookmark(bookmarkId)
    
    if (response.success) {
      // 重新加载收藏列表
      await loadBookmarks()
    } else {
      alert('删除失败: ' + (response.message || '未知错误'))
    }
  } catch (error) {
    console.error('删除收藏失败:', error)
    alert('删除失败,请重试')
  }
}

// 复制内容
const handleCopy = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    alert('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败,请重试')
  }
}

// 返回聊天页面
const handleBack = () => {
  router.push('/')
}

// 页面加载时获取收藏列表
onMounted(() => {
  loadBookmarks()
})
</script>

<template>
  <div class="bookmark-view">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack" aria-label="返回聊天">
          ← 返回
        </button>
        <h1 class="page-title">马克本</h1>
      </div>
      <div class="bookmark-count">
        共 {{ bookmarks.length }} 条收藏
      </div>
    </header>

    <!-- 收藏列表 -->
    <div class="bookmark-list">
      <div v-if="isLoading" class="loading">
        加载中...
      </div>
      
      <div v-else-if="bookmarks.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <p>还没有收藏任何内容</p>
        <button class="btn-primary" @click="handleBack">
          去聊天
        </button>
      </div>
      
      <div
        v-else
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        class="bookmark-item"
      >
        <div class="bookmark-header">
          <div class="bookmark-info">
            <span class="bookmark-date">
              {{ new Date(bookmark.created_at).toLocaleString('zh-CN') }}
            </span>
            <span v-if="bookmark.title" class="bookmark-title">
              {{ bookmark.title }}
            </span>
          </div>
          <div class="bookmark-actions">
            <button
              class="action-btn copy-btn"
              @click="handleCopy(bookmark.content)"
              title="复制内容"
              aria-label="复制内容"
            >
              📋
            </button>
            <button
              class="action-btn delete-btn"
              @click="handleDeleteBookmark(bookmark.id)"
              title="删除收藏"
              aria-label="删除收藏"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div
          class="bookmark-content"
          v-html="marked.parse(bookmark.content)"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   基础布局
   ============================================================================ */
.bookmark-view {
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
.header {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #667eea;
  background-color: transparent;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: #667eea;
  color: #fff;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.bookmark-count {
  font-size: 14px;
  color: #ccc;
}

/* ============================================================================
   收藏列表
   ============================================================================ */
.bookmark-list {
  flex: 1;
  overflow-y: auto;
  padding: 2vh 2vw;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4vh;
  color: #ccc;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8vh 2vw;
  color: #ccc;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 2vh;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 2vh;
}

.btn-primary {
  padding: 10px 24px;
  border-radius: 20px;
  border: 1px solid #667eea;
  background-color: #667eea;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #5568d3;
}

/* ============================================================================
   收藏项
   ============================================================================ */
.bookmark-item {
  background-color: #262626;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.2s ease;
}

.bookmark-item:hover {
  border-color: #444;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.bookmark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #333;
}

.bookmark-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bookmark-date {
  font-size: 12px;
  color: #888;
}

.bookmark-title {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
}

.bookmark-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background-color: rgba(102, 126, 234, 0.2);
}

.delete-btn:hover {
  background-color: rgba(255, 100, 100, 0.2);
}

.bookmark-content {
  color: #ddd;
  line-height: 1.6;
}

/* Markdown 样式 */
.bookmark-content :deep(h1),
.bookmark-content :deep(h2),
.bookmark-content :deep(h3),
.bookmark-content :deep(h4),
.bookmark-content :deep(h5),
.bookmark-content :deep(h6) {
  color: #fff;
  margin-top: 1.5vh;
  margin-bottom: 1vh;
}

.bookmark-content :deep(p) {
  margin-bottom: 1.2vh;
}

.bookmark-content :deep(code) {
  background-color: #333;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.bookmark-content :deep(pre) {
  background-color: #333;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.2vh 0;
}

.bookmark-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.bookmark-content :deep(ul),
.bookmark-content :deep(ol) {
  padding-left: 2vw;
  margin-bottom: 1.2vh;
}

.bookmark-content :deep(li) {
  margin-bottom: 0.6vh;
}

.bookmark-content :deep(blockquote) {
  border-left: 3px solid #667eea;
  padding-left: 1.2vw;
  margin: 1.2vh 0;
  color: #ccc;
  background-color: rgba(102, 126, 234, 0.1);
  padding: 1vh 1.2vw;
  border-radius: 4px;
}

.bookmark-content :deep(a) {
  color: #667eea;
  text-decoration: none;
}

.bookmark-content :deep(a:hover) {
  text-decoration: underline;
}

.bookmark-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.2vh;
}

.bookmark-content :deep(th),
.bookmark-content :deep(td) {
  border: 1px solid #444;
  padding: 8px 12px;
  text-align: left;
}

.bookmark-content :deep(th) {
  background-color: #333;
  font-weight: 600;
}

/* ============================================================================
   滚动条样式
   ============================================================================ */
.bookmark-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.bookmark-list::-webkit-scrollbar-track {
  background: #181818;
  border-radius: 4px;
}

.bookmark-list::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}

.bookmark-list::-webkit-scrollbar-thumb:hover {
  background: #444;
}

/* ============================================================================
   响应式设计
   ============================================================================ */
@media (max-width: 768px) {
  .header {
    padding: 1vh 1vw;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .bookmark-count {
    font-size: 12px;
  }
  
  .bookmark-item {
    padding: 16px;
  }
}
</style>
