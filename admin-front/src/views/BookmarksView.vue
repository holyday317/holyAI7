<template>
  <div class="bookmarks-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>书签管理</span>
          <div class="header-actions">
            <el-select v-model="filterUser" placeholder="选择用户" clearable style="width: 150px; margin-right: 10px;" @change="loadBookmarks">
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.username"
                :value="user.id"
              />
            </el-select>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索书签内容"
              clearable
              style="width: 250px; margin-right: 10px;"
              @keyup.enter="loadBookmarks"
            >
              <template #append>
                <el-button :icon="Search" @click="loadBookmarks" />
              </template>
            </el-input>
            <el-button :icon="Refresh" @click="loadBookmarks">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="bookmarks"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user_id" label="用户ID" width="100" />
        <el-table-column prop="chat_id" label="聊天ID" width="100" />
        <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="tags" label="标签" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="tag in parseTags(row.tags)"
              :key="tag"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ tag }}
            </el-tag>
            <span v-if="!row.tags || row.tags === '[]'">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewBookmark(row)">
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
        @size-change="loadBookmarks"
        @current-change="loadBookmarks"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>

    <!-- 书签详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="书签详情"
      width="700px"
    >
      <el-descriptions :column="1" border v-if="currentBookmark">
        <el-descriptions-item label="书签ID">{{ currentBookmark.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentBookmark.user_id }}</el-descriptions-item>
        <el-descriptions-item label="聊天ID">{{ currentBookmark.chat_id }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentBookmark.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="标签">
          <el-tag
            v-for="tag in parseTags(currentBookmark.tags)"
            :key="tag"
            style="margin-right: 5px;"
          >
            {{ tag }}
          </el-tag>
          <span v-if="!currentBookmark.tags || currentBookmark.tags === '[]'">无标签</span>
        </el-descriptions-item>
        <el-descriptions-item label="内容">
          <div class="bookmark-content">{{ currentBookmark.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getBookmarks, deleteBookmark } from '../api/admin'

const loading = ref(false)
const bookmarks = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchKeyword = ref('')
const filterUser = ref('')
const users = ref([])

const detailDialogVisible = ref(false)
const currentBookmark = ref(null)

const loadBookmarks = async () => {
  loading.value = true
  try {
    const res = await getBookmarks({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value,
      user_id: filterUser.value
    })
    
    bookmarks.value = res.data || []
    total.value = res.pagination?.total || 0
  } catch (error) {
    console.error('加载书签列表失败:', error)
    ElMessage.error('加载书签列表失败')
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

const viewBookmark = (bookmark) => {
  currentBookmark.value = bookmark
  detailDialogVisible.value = true
}

const handleDelete = async (bookmark) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个书签吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteBookmark(bookmark.id)
    ElMessage.success('删除成功')
    loadBookmarks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除书签失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const parseTags = (tagsStr) => {
  if (!tagsStr || tagsStr === '[]') return []
  try {
    return JSON.parse(tagsStr)
  } catch {
    return []
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadBookmarks()
  loadUsers()
})

// 导入 getUsers 函数
import { getUsers } from '../api/admin'
</script>

<style scoped>
.bookmarks-view {
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

.bookmark-content {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}
</style>
