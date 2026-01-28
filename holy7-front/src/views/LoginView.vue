<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '@/api/auth'

const router = useRouter()

// 是否为注册模式
const isRegister = ref(false)

// 表单数据
const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

// 加载状态
const isLoading = ref(false)

// 错误信息
const errorMessage = ref('')

// 切换登录/注册模式
const toggleMode = () => {
  isRegister.value = !isRegister.value
  errorMessage.value = ''
  formData.value = {
    username: '',
    password: '',
    confirmPassword: ''
  }
}

// 处理提交
const handleSubmit = async () => {
  errorMessage.value = ''
  
  // 基本验证
  if (!formData.value.username.trim()) {
    errorMessage.value = '请输入用户名'
    return
  }
  
  if (!formData.value.password.trim()) {
    errorMessage.value = '请输入密码'
    return
  }
  
  if (formData.value.password.length < 6) {
    errorMessage.value = '密码长度至少为 6 位'
    return
  }
  
  // 注册时需要确认密码
  if (isRegister.value) {
    if (!formData.value.confirmPassword.trim()) {
      errorMessage.value = '请确认密码'
      return
    }
    
    if (formData.value.password !== formData.value.confirmPassword) {
      errorMessage.value = '两次输入的密码不一致'
      return
    }
  }
  
  isLoading.value = true
  
  try {
    if (isRegister.value) {
      // 注册
      const response = await register({
        username: formData.value.username,
        password: formData.value.password
      })
      
      if (response.success) {
        // 注册成功，自动登录
        const loginResponse = await login({
          username: formData.value.username,
          password: formData.value.password
        })
        
        if (loginResponse.success) {
          localStorage.setItem('token', loginResponse.data.token)
          localStorage.setItem('username', formData.value.username)
          // 跳转到聊天页面
          router.push('/chat')
        } else {
          errorMessage.value = loginResponse.message || '登录失败，请手动登录'
          isRegister.value = false
        }
      } else {
        errorMessage.value = response.message || '注册失败'
      }
    } else {
      // 登录
      const response = await login({
        username: formData.value.username,
        password: formData.value.password
      })
      
      if (response.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('username', formData.value.username)
        // 跳转到聊天页面
        router.push('/chat')
      } else {
        errorMessage.value = response.message || '登录失败'
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    errorMessage.value = error.message || '操作失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 处理回车提交
const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <img src="@/assets/chathead.gif" alt="Logo" class="logo-img" />
        <h1>{{ isRegister ? '注册账号' : '登录' }}</h1>
      </div>
      
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名"
            @keypress="handleKeyPress"
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            @keypress="handleKeyPress"
            :disabled="isLoading"
          />
        </div>
        
        <div v-if="isRegister" class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            @keypress="handleKeyPress"
            :disabled="isLoading"
          />
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <button
          type="submit"
          class="submit-btn"
          :class="{ loading: isLoading }"
          :disabled="isLoading"
        >
          {{ isLoading ? '处理中...' : (isRegister ? '注册' : '登录') }}
        </button>
      </form>
      
      <div class="toggle-mode">
        <span v-if="!isRegister">还没有账号？</span>
        <span v-else>已有账号？</span>
        <button class="link-btn" @click="toggleMode" :disabled="isLoading">
          {{ isRegister ? '立即登录' : '立即注册' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #181818;
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: #262626;
  border: 1px solid #444;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  color: #fff;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #ccc;
  font-weight: 500;
}

.form-group input {
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  transition: border-color 0.2s;
  -webkit-appearance: none; /* 移除 iOS 默认样式 */
  -moz-appearance: textfield; /* 移除 Firefox 默认样式 */
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input::placeholder {
  color: #888;
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  color: #ff6b6b;
  text-align: center;
  word-wrap: break-word;
}

.submit-btn {
  background-color: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
  -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
}

.submit-btn:hover:not(:disabled) {
  background-color: #5568d3;
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  background-color: #4a5fc4;
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

.toggle-mode {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #ccc;
}

.toggle-mode .link-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 0;
  margin-left: 4px;
  text-decoration: underline;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
}

.toggle-mode .link-btn:hover:not(:disabled),
.toggle-mode .link-btn:active:not(:disabled) {
  color: #5568d3;
}

.toggle-mode .link-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .login-view {
    padding: 16px;
    align-items: flex-start;
    overflow-y: auto;
  }

  .login-container {
    padding: 24px 20px;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .login-header {
    margin-bottom: 24px;
  }

  .logo-img {
    width: 64px;
    height: 64px;
    margin-bottom: 12px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-form {
    gap: 16px;
  }

  .form-group label {
    font-size: 13px;
  }

  .form-group input {
    padding: 14px 16px;
    font-size: 16px; /* 防止 iOS 自动缩放 */
  }

  .error-message {
    padding: 10px;
    font-size: 13px;
  }

  .submit-btn {
    padding: 16px;
    font-size: 16px;
  }

  .toggle-mode {
    margin-top: 20px;
    font-size: 13px;
  }

  .toggle-mode .link-btn {
    font-size: 13px;
  }
}

/* 小屏幕手机适配 */
@media (max-width: 480px) {
  .login-view {
    padding: 12px;
  }

  .login-container {
    padding: 20px 16px;
    margin-top: 12px;
    margin-bottom: 12px;
  }

  .login-header {
    margin-bottom: 20px;
  }

  .logo-img {
    width: 56px;
    height: 56px;
  }

  .login-header h1 {
    font-size: 22px;
  }

  .login-form {
    gap: 14px;
  }

  .form-group {
    gap: 6px;
  }

  .form-group label {
    font-size: 12px;
  }

  .form-group input {
    padding: 12px 14px;
  }

  .error-message {
    padding: 8px 10px;
    font-size: 12px;
  }

  .submit-btn {
    padding: 14px;
  }

  .toggle-mode {
    margin-top: 16px;
    font-size: 12px;
  }

  .toggle-mode .link-btn {
    font-size: 12px;
  }
}

/* 超小屏幕适配 */
@media (max-width: 360px) {
  .login-container {
    padding: 16px 12px;
  }

  .logo-img {
    width: 48px;
    height: 48px;
  }

  .login-header h1 {
    font-size: 20px;
  }

  .form-group input {
    padding: 10px 12px;
  }
}
</style>
