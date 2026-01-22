<script setup>
import { ref } from 'vue'
import { useTodos } from '@/composables/useTodos'
import { healthCheck } from '@/api/todo'

const {
  todos,
  stats,
  loading,
  error,
  loadTodos,
  loadStats,
  addTodo,
  toggleTodo,
  removeTodo
} = useTodos()

const newTodoTitle = ref('')
const healthStatus = ref('检查中...')

// 检查后端服务健康状态
const checkHealth = async () => {
  try {
    const response = await healthCheck()
    healthStatus.value = response.status === 'ok' ? '✅ 正常' : '❌ 异常'
  } catch (err) {
    healthStatus.value = '❌ 无法连接'
    console.error('健康检查失败:', err)
  }
}

// 添加待办事项
const handleAddTodo = async () => {
  if (!newTodoTitle.value.trim()) return
  
  try {
    await addTodo(newTodoTitle.value.trim())
    newTodoTitle.value = ''
  } catch (err) {
    console.error('添加失败:', err)
  }
}

// 切换完成状态
const handleToggle = async (id) => {
  await toggleTodo(id)
}

// 删除待办事项
const handleDelete = async (id) => {
  if (confirm('确定要删除这个待办事项吗？')) {
    await removeTodo(id)
  }
}

// 刷新数据
const handleRefresh = () => {
  loadTodos()
  loadStats()
  checkHealth()
}

// 组件挂载时检查健康状态
checkHealth()
</script>

<template>
  <div class="todo-view">
    <div class="container">
      <div class="header">
        <h1>📝 待办事项管理</h1>
        <div class="health-check">
          后端服务状态: {{ healthStatus }}
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card total">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总计</div>
        </div>
        <div class="stat-card completed">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待完成</div>
        </div>
        <div class="stat-card rate">
          <div class="stat-value">{{ stats.completionRate }}%</div>
          <div class="stat-label">完成率</div>
        </div>
      </div>

      <!-- 添加待办事项 -->
      <div class="add-todo">
        <input
          v-model="newTodoTitle"
          type="text"
          placeholder="输入新的待办事项..."
          @keyup.enter="handleAddTodo"
          :disabled="loading"
        />
        <button @click="handleAddTodo" :disabled="loading || !newTodoTitle.trim()">
          {{ loading ? '添加中...' : '添加' }}
        </button>
        <button @click="handleRefresh" class="refresh-btn" :disabled="loading">
          🔄 刷新
        </button>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- 待办事项列表 -->
      <div class="todo-list">
        <div v-if="loading" class="loading">
          加载中...
        </div>
        <div v-else-if="todos.length === 0" class="empty">
          暂无待办事项，添加一个吧！
        </div>
        <div
          v-for="todo in todos"
          :key="todo.id"
          class="todo-item"
          :class="{ completed: todo.completed }"
        >
          <div class="todo-content">
            <input
              type="checkbox"
              :checked="todo.completed"
              @change="handleToggle(todo.id)"
            />
            <span class="todo-title">{{ todo.title }}</span>
            <span class="todo-time">{{ new Date(todo.createdAt).toLocaleString('zh-CN') }}</span>
          </div>
          <button @click="handleDelete(todo.id)" class="delete-btn">
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todo-view {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.health-check {
  font-size: 0.9rem;
  opacity: 0.9;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.total {
  border-top: 4px solid #667eea;
}

.stat-card.completed {
  border-top: 4px solid #48bb78;
}

.stat-card.pending {
  border-top: 4px solid #ed8936;
}

.stat-card.rate {
  border-top: 4px solid #4299e1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-todo {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.add-todo input {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-todo input:focus {
  outline: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.add-todo button {
  padding: 1rem 2rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-todo button:hover:not(:disabled) {
  background: #38a169;
}

.add-todo button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn {
  background: #4299e1 !important;
}

.refresh-btn:hover:not(:disabled) {
  background: #3182ce !important;
}

.error-message {
  background: #fc8181;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.todo-list {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading,
.empty {
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.1rem;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  transition: background 0.2s;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item:hover {
  background: #f7fafc;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.todo-content input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-title {
  flex: 1;
  font-size: 1rem;
  color: #2d3748;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: #a0aec0;
}

.todo-time {
  font-size: 0.85rem;
  color: #a0aec0;
}

.delete-btn {
  background: #fc8181;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #f56565;
}

@media (max-width: 640px) {
  .todo-view {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.8rem;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .add-todo {
    flex-direction: column;
  }

  .todo-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .todo-content {
    width: 100%;
  }

  .delete-btn {
    width: 100%;
  }
}
</style>