<template>
  <div class="users-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名或手机号"
              clearable
              style="width: 250px; margin-right: 10px;"
              @keyup.enter="loadUsers"
            >
              <template #append>
                <el-button :icon="Search" @click="loadUsers" />
              </template>
            </el-input>
            <el-button :icon="Refresh" @click="loadUsers">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="users"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="活跃度" width="120">
          <template #default="{ row }">
            <el-tag :type="getActivityType(row)">
              {{ getActivityText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="统计信息">
          <template #default="{ row }">
            <el-tag size="small" type="info">会话: {{ row.conversation_count || 0 }}</el-tag>
            <el-tag size="small" type="success" style="margin-left: 5px;">书签: {{ row.bookmark_count || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewUserDetail(row)">
              详情
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
        @size-change="loadUsers"
        @current-change="loadUsers"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="800px"
    >
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '未绑定' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(currentUser.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="会话数量">{{ currentUser.conversation_count || 0 }}</el-descriptions-item>
        <el-descriptions-item label="书签数量">{{ currentUser.bookmark_count || 0 }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>最近的会话</el-divider>
      <el-table
        :data="userConversations"
        v-loading="conversationsLoading"
        stripe
        style="width: 100%"
        max-height="300"
      >
        <el-table-column prop="id" label="会话ID" width="80" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="chat_count" label="消息数" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getUsers, deleteUser, getUserConversations } from '../api/admin'

const loading = ref(false)
const users = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchKeyword = ref('')

const detailDialogVisible = ref(false)
const currentUser = ref(null)
const userConversations = ref([])
const conversationsLoading = ref(false)

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value
    })
    
    // 为每个用户获取统计信息
    users.value = (res.data || []).map(user => ({
      ...user,
      conversation_count: user.conversation_count || 0,
      bookmark_count: user.bookmark_count || 0
    }))
    total.value = res.pagination?.total || 0
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const viewUserDetail = async (user) => {
  currentUser.value = user
  detailDialogVisible.value = true
  conversationsLoading.value = true
  
  try {
    const res = await getUserConversations(user.id)
    userConversations.value = res.data || []
  } catch (error) {
    console.error('加载用户会话失败:', error)
    ElMessage.error('加载用户会话失败')
  } finally {
    conversationsLoading.value = false
  }
}

const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？这将同时删除该用户的所有数据。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteUser(user.id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getActivityType = (user) => {
  const daysSinceRegistration = user.created_at 
    ? Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
    : 0
  
  const conversationCount = user.conversation_count || 0
  
  if (daysSinceRegistration <= 7 && conversationCount > 0) {
    return 'success' // 活跃
  } else if (daysSinceRegistration <= 30 || conversationCount > 10) {
    return 'warning' // 中等活跃
  } else {
    return 'info' // 不活跃
  }
}

const getActivityText = (user) => {
  const daysSinceRegistration = user.created_at 
    ? Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
    : 0
  
  const conversationCount = user.conversation_count || 0
  
  if (daysSinceRegistration <= 7 && conversationCount > 0) {
    return '活跃'
  } else if (daysSinceRegistration <= 30 || conversationCount > 10) {
    return '中等活跃'
  } else {
    return '不活跃'
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-view {
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
