<template>
  <div class="table-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
          <h1>表: {{ tableName }}</h1>
        </div>
      </el-header>
      <el-main>
        <el-card>
          <!-- 工具栏 -->
          <div class="toolbar">
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增记录</el-button>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索记录"
              clearable
              style="width: 300px; margin-left: 10px;"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
            <el-button :icon="Refresh" @click="loadData">刷新</el-button>
          </div>

          <!-- 数据表格 -->
          <el-table
            :data="tableData"
            v-loading="loading"
            stripe
            border
            style="width: 100%; margin-top: 20px;"
            max-height="600"
          >
            <el-table-column
              v-for="column in columns"
              :key="column.name"
              :prop="column.name"
              :label="column.name"
              :min-width="getColumnWidth(column)"
              show-overflow-tooltip
            />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadData"
            @current-change="loadData"
            style="margin-top: 20px; justify-content: center;"
          />
        </el-card>
      </el-main>
    </el-container>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="formData" label-width="120px">
        <el-form-item
          v-for="column in columns"
          :key="column.name"
          :label="column.name"
          :required="column.notNull && !column.primaryKey"
        >
          <el-input
            v-if="isTextField(column)"
            v-model="formData[column.name]"
            :type="getColumnInputType(column)"
            :disabled="column.primaryKey && isEditMode"
            :placeholder="column.name"
          />
          <el-input-number
            v-else-if="isNumberField(column)"
            v-model="formData[column.name]"
            :disabled="column.primaryKey && isEditMode"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Plus,
  Search,
  Refresh
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTableSchema,
  getTableData,
  searchRecords,
  createRecord,
  updateRecord,
  deleteRecord
} from '../api/admin'

const route = useRoute()
const router = useRouter()
const tableName = ref(route.params.name)

const loading = ref(false)
const columns = ref([])
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchKeyword = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = ref({})
const currentRecord = ref(null)

const isEditMode = computed(() => !!currentRecord.value)

const goBack = () => {
  router.push('/')
}

const getColumnWidth = (column) => {
  const widths = {
    id: 80,
    title: 200,
    content: 300,
    created_at: 160,
    updated_at: 160,
    username: 120,
    password: 150
  }
  return widths[column.name] || 120
}

const isTextField = (column) => {
  const type = column.type?.toLowerCase() || ''
  return type.includes('text') || type.includes('char') || type.includes('varchar')
}

const isNumberField = (column) => {
  const type = column.type?.toLowerCase() || ''
  return type.includes('int') || type.includes('real') || type.includes('float') || type.includes('double')
}

const getColumnInputType = (column) => {
  const type = column.type?.toLowerCase() || ''
  if (type.includes('text') || column.name.includes('content')) {
    return 'textarea'
  }
  if (column.name.includes('password')) {
    return 'password'
  }
  return 'text'
}

const loadSchema = async () => {
  try {
    const res = await getTableSchema(tableName.value)
    columns.value = res.columns || []
  } catch (error) {
    console.error('加载表结构失败:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTableData(tableName.value, {
      page: currentPage.value,
      limit: pageSize.value
    })
    tableData.value = res.data || []
    total.value = res.pagination?.total || 0
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    loadData()
    return
  }
  
  loading.value = true
  try {
    const res = await searchRecords(tableName.value, {
      query: searchKeyword.value,
      page: currentPage.value,
      limit: pageSize.value
    })
    tableData.value = res.data || []
    total.value = res.pagination?.total || 0
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  currentRecord.value = null
  formData.value = {}
  dialogTitle.value = '新增记录'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  currentRecord.value = row
  formData.value = { ...row }
  dialogTitle.value = '编辑记录'
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteRecord(tableName.value, row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const resetForm = () => {
  formData.value = {}
  currentRecord.value = null
}

const handleSubmit = async () => {
  try {
    if (isEditMode.value) {
      await updateRecord(tableName.value, currentRecord.value.id, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createRecord(tableName.value, formData.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

onMounted(() => {
  loadSchema()
  loadData()
})
</script>

<style scoped>
.table-container {
  height: 100vh;
  background: #f5f5f5;
}

.el-header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.header-content h1 {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-left: 20px;
}

.el-main {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.toolbar {
  display: flex;
  align-items: center;
}
</style>
