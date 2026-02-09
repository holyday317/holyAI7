<template>
  <div class="conversations-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会话管理</span>
          <div class="header-actions">
            <el-select v-model="filterUser" placeholder="选择用户" clearable style="width: 150px; margin-right: 10px;" @change="loadConversations">
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.username"
                :value="user.id"
              />
            </el-select>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索会话标题"
              clearable
              style="width: 250px; margin-right: 10px;"
              @keyup.enter="loadConversations"
            >
              <template #append>
                <el-button :icon="Search" @click="loadConversations" />
              </template>
            </el-input>
            <el-button :icon="Refresh" @click="loadConversations">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="conversations"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user_id" label="用户ID" width="100" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="chat_count" label="消息数" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewConversation(row)">
              查看详情
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadConversations"
        @current-change="loadConversations"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>

    <!-- 会话详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="会话详情"
      width="900px"
    >
      <el-descriptions :column="2" border v-if="currentConversation">
        <el-descriptions-item label="会话ID">{{ currentConversation.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentConversation.user_id }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ currentConversation.title }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentConversation.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(currentConversation.updated_at) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>聊天记录</el-divider>
      <div v-loading="chatsLoading">
        <div v-for="chat in conversationChats" :key="chat.id" style="margin-bottom: 20px;">
          <!-- 用户消息 -->
          <div v-if="chat.user_message" style="margin-bottom: 10px;">
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <el-tag type="primary" size="small" style="margin-right: 10px;">用户</el-tag>
              <span style="color: #909399; font-size: 12px;">{{ formatDate(chat.created_at) }}</span>
            </div>
            <div style="background: #f0f9ff; padding: 10px; border-radius: 4px; border-left: 3px solid #409eff;">
              {{ chat.user_message }}
            </div>
          </div>
          
          <!-- AI 回复 -->
          <div v-if="chat.ai_response" style="margin-bottom: 10px;">
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <el-tag type="success" size="small" style="margin-right: 10px;">AI ({{ chat.model_type }})</el-tag>
              <span style="color: #909399; font-size: 12px;">{{ formatDate(chat.created_at) }}</span>
            </div>
            <div style="background: #f0f9ff; padding: 10px; border-radius: 4px; border-left: 3px solid #67c23a; white-space: pre-wrap;">
              {{ chat.ai_response }}
            </div>
          </div>
          
          <!-- 推理内容 -->
          <div v-if="chat.reasoning_content" style="margin-bottom: 10px;">
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <el-tag type="info" size="small" style="margin-right: 10px;">推理过程</el-tag>
            </div>
            <div style="background: #f4f4f5; padding: 10px; border-radius: 4px; border-left: 3px solid #909399; white-space: pre-wrap; font-size: 12px; color: #606266;">
              {{ chat.reasoning_content }}
            </div>
          </div>
        </div>
        
        <el-empty v-if="conversationChats.length === 0 && !chatsLoading" description="暂无聊天记录" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getConversations, deleteConversation, getConversationChats } from '../api/admin'

const loading = ref(false)
const conversations = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchKeyword = ref('')
const filterUser = ref('')
const users = ref([])

const detailDialogVisible = ref(false)
const currentConversation = ref(null)
const conversationChats = ref([])
const chatsLoading = ref(false)

const loadConversations = async () => {
  loading.value = true
  try {
    const res = await getConversations({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value,
      user_id: filterUser.value
    })
    
    conversations.value = res.data || []
    total.value = res.pagination?.total || 0
  } catch (error) {
    console.error('加载会话列表失败:', error)
    ElMessage.error('加载会话列表失败')
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const res = await getUsers({ limit: 1000 })
    users.value = res.data || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

const viewConversation = async (conversation) => {
  currentConversation.value = conversation
  detailDialogVisible.value = true
  chatsLoading.value = true
  
  try {
    const res = await getConversationChats(conversation.id)
    conversationChats.value = res.data || []
  } catch (error) {
    console.error('加载聊天记录失败:', error)
    ElMessage.error('加载聊天记录失败')
  } finally {
    chatsLoading.value = false
  }
}

const handleDelete = async (conversation) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除会话 "${conversation.title}" 吗？这将同时删除该会话的所有聊天记录。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteConversation(conversation.id)
    ElMessage.success('删除成功')
    loadConversations()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除会话失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadConversations()
  loadUsers()
})

// 导入 getUsers 函数
import { getUsers } from '../api/admin'
</script>

<style scoped>
.conversations-view {
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
</style>
