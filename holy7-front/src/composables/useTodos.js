import { ref, onMounted } from 'vue'
import { getAllTodos, createTodo, updateTodo, deleteTodo, getStats } from '@/api/todo'

export function useTodos() {
  const todos = ref([])
  const stats = ref({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0
  })
  const loading = ref(false)
  const error = ref(null)

  /**
   * 加载所有待办事项
   */
  const loadTodos = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getAllTodos()
      if (response.success) {
        todos.value = response.data
      } else {
        error.value = response.error || '加载失败'
      }
    } catch (err) {
      error.value = err.message || '加载待办事项失败'
      console.error('加载待办事项失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载统计信息
   */
  const loadStats = async () => {
    try {
      const response = await getStats()
      if (response.success) {
        stats.value = response.data
      }
    } catch (err) {
      console.error('加载统计信息失败:', err)
    }
  }

  /**
   * 添加待办事项
   */
  const addTodo = async (title) => {
    loading.value = true
    error.value = null
    try {
      const response = await createTodo({ title })
      if (response.success) {
        todos.value.push(response.data)
        await loadStats()
        return response.data
      } else {
        error.value = response.error || '添加失败'
        throw new Error(response.error)
      }
    } catch (err) {
      error.value = err.message || '添加待办事项失败'
      console.error('添加待办事项失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换待办事项完成状态
   */
  const toggleTodo = async (id) => {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return

    try {
      const response = await updateTodo(id, {
        completed: !todo.completed
      })
      if (response.success) {
        todo.completed = response.data.completed
        todo.updatedAt = response.data.updatedAt
        await loadStats()
      }
    } catch (err) {
      error.value = err.message || '更新待办事项失败'
      console.error('更新待办事项失败:', err)
    }
  }

  /**
   * 更新待办事项
   */
  const editTodo = async (id, data) => {
    try {
      const response = await updateTodo(id, data)
      if (response.success) {
        const index = todos.value.findIndex(t => t.id === id)
        if (index !== -1) {
          todos.value[index] = response.data
        }
        await loadStats()
      }
      return response.success
    } catch (err) {
      error.value = err.message || '更新待办事项失败'
      console.error('更新待办事项失败:', err)
      return false
    }
  }

  /**
   * 删除待办事项
   */
  const removeTodo = async (id) => {
    try {
      const response = await deleteTodo(id)
      if (response.success) {
        todos.value = todos.value.filter(t => t.id !== id)
        await loadStats()
      }
      return response.success
    } catch (err) {
      error.value = err.message || '删除待办事项失败'
      console.error('删除待办事项失败:', err)
      return false
    }
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadTodos()
    loadStats()
  })

  return {
    todos,
    stats,
    loading,
    error,
    loadTodos,
    loadStats,
    addTodo,
    toggleTodo,
    editTodo,
    removeTodo
  }
}