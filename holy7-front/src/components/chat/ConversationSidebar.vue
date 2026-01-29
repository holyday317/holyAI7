<script setup>
import { ref, onMounted } from 'vue'
import {
  getConversations,
  updateConversation,
  deleteConversation
} from '@/api/conversation'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentConversationId: {
    type: Number,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'select', 'update', 'openCreateDialog'])

// 响应式状态
const conversations = ref([])
const editingConversationId = ref(null)
const editingConversationTitle = ref('')

/**
 * 加载会话列表
 */
const loadConversations = async () => {
  try {
    const response = await getConversations()
    if (response.success) {
      conversations.value = response.data.conversations
      console.log('加载会话列表成功:', {
        count: conversations.value.length
      })
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
  }
}

/**
 * 打开新建会话对话框
 */
const openNewConversationDialog = () => {
  emit('openCreateDialog')
}

/**
 * 选择会话
 */
const selectConversation = async (conversation) => {
  try {
    console.log('选择会话:', {
      conversationId: conversation.id,
      conversationTitle: conversation.title
    })
    
    emit('select', conversation.id)
    emit('close') // 移动端选择后关闭侧边栏
  } catch (error) {
    console.error('选择会话失败:', error)
  }
}

/**
 * 开始编辑会话标题
 */
const startEditConversation = (conversation, event) => {
  event.stopPropagation()
  editingConversationId.value = conversation.id
  editingConversationTitle.value = conversation.title
}

/**
 * 取消编辑会话标题
 */
const cancelEditConversation = () => {
  editingConversationId.value = null
  editingConversationTitle.value = ''
}

/**
 * 保存会话标题
 */
const saveConversationTitle = async (conversationId, event) => {
  event.stopPropagation()
  try {
    const title = editingConversationTitle.value.trim()
    if (!title) {
      cancelEditConversation()
      return
    }
    
    const response = await updateConversation(conversationId, { title })
    if (response.success) {
      await loadConversations()
      emit('update')
    }
    cancelEditConversation()
  } catch (error) {
    console.error('更新会话标题失败:', error)
    alert('更新会话标题失败')
  }
}

/**
 * 删除会话
 */
const handleDeleteConversation = async (conversationId, event) => {
  event.stopPropagation()
  
  if (!confirm('确定要删除这个会话吗?')) {
    return
  }
  
  try {
    const response = await deleteConversation(conversationId)
    if (response.success) {
      await loadConversations()
      emit('update')
      
      // 如果删除的是当前会话,通知父组件
      if (props.currentConversationId === conversationId) {
        emit('select', null)
      }
    }
  } catch (error) {
    console.error('删除会话失败:', error)
    alert('删除会话失败')
  }
}

// 组件挂载时加载会话列表
onMounted(() => {
  loadConversations()
})

// 暴露方法给父组件
defineExpose({
  loadConversations
})
</script>

<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-header">
      <h2 class="sidebar-title">会话列表</h2>
      <button
        class="close-sidebar-btn"
        @click="$emit('close')"
        aria-label="关闭侧边栏"
      >
        ✕
      </button>
    </div>

    <div class="sidebar-content">
      <!-- 新建会话按钮 -->
      <button
        class="new-conversation-btn"
        @click="openNewConversationDialog"
      >
        ➕ 新建会话
      </button>

      <!-- 会话列表 -->
      <div v-if="conversations.length > 0" class="conversation-list">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          class="conversation-item"
          :class="{ active: currentConversationId === conversation.id }"
          @click="selectConversation(conversation)"
        >
          <!-- 编辑模式 -->
          <div
            v-if="editingConversationId === conversation.id"
            class="conversation-edit"
            @click.stop
          >
            <input
              v-model="editingConversationTitle"
              class="conversation-title-input"
              @blur="saveConversationTitle(conversation.id, $event)"
              @keyup.enter="saveConversationTitle(conversation.id, $event)"
              @keyup.esc="cancelEditConversation"
              ref="editInput"
            />
            <div class="conversation-actions">
              <button
                class="action-btn"
                @click="saveConversationTitle(conversation.id, $event)"
              >
                ✓
              </button>
              <button
                class="action-btn"
                @click="cancelEditConversation"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- 显示模式 -->
          <div v-else class="conversation-info">
            <div class="conversation-title-text">
              {{ conversation.title }}
            </div>
            <div class="conversation-actions">
              <button
                class="action-btn"
                @click="startEditConversation(conversation, $event)"
                title="编辑标题"
              >
                ✏️
              </button>
              <button
                class="action-btn delete-btn"
                @click="handleDeleteConversation(conversation.id, $event)"
                title="删除会话"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-if="conversations.length === 0" class="sidebar-hint">
        暂无会话,点击上方按钮创建新会话
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* ============================================================================
   侧边栏样式
   ============================================================================ */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background-color: #1a1a1a;
  border-right: 1px solid #333;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.close-sidebar-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-sidebar-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.new-conversation-btn {
  width: 100%;
  padding: 12px 16px;
  background-color: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.new-conversation-btn:hover {
  background-color: #5568d3;
  transform: translateY(-1px);
}

.new-conversation-btn:active {
  transform: translateY(0);
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conversation-item {
  background-color: #262626;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.conversation-item:hover {
  background-color: #333;
  border-color: #555;
}

.conversation-item.active {
  background-color: #667eea;
  border-color: #667eea;
}

.conversation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.conversation-title-text {
  flex: 1;
  font-size: 14px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-item.active .conversation-title-text {
  color: #fff;
}

.conversation-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.action-btn.delete-btn:hover {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
}

.conversation-edit {
  display: flex;
  gap: 8px;
  align-items: center;
}

.conversation-title-input {
  flex: 1;
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  outline: none;
}

.conversation-title-input:focus {
  border-color: #667eea;
}

.sidebar-hint {
  text-align: center;
  color: #888;
  font-size: 14px;
  padding: 40px 20px;
}

/* 响应式 */
@media (max-width: 480px) {
  .sidebar {
    width: 280px;
  }
}
</style>
