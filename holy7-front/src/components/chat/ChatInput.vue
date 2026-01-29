<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  maxLength: {
    type: Number,
    default: 5000
  }
})

// Emits
const emit = defineEmits(['send'])

// Ref
const inputText = ref('')
const textareaRef = ref(null)

// Computed
const isSendDisabled = computed(() => {
  return props.isLoading || !inputText.value.trim()
})

const remainingChars = computed(() => {
  return props.maxLength - inputText.value.length
})

/**
 * 处理发送消息
 */
const handleSend = () => {
  if (isSendDisabled.value) return
  
  const text = inputText.value.trim()
  if (!text) return
  
  emit('send', text)
  inputText.value = ''
  
  // 发送后自动聚焦输入框
  setTimeout(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  }, 100)
}

/**
 * 处理键盘按键事件
 */
const handleKeyPress = (e) => {
  // Enter 发送（Shift + Enter 换行）
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

/**
 * 处理输入框内容变化
 */
const handleInputChange = (e) => {
  const value = e.target.value
  // 限制输入长度
  if (value.length > props.maxLength) {
    inputText.value = value.slice(0, props.maxLength)
  } else {
    inputText.value = value
  }
}

/**
 * 暴露方法给父组件
 */
const clearInput = () => {
  inputText.value = ''
}

defineExpose({
  clearInput,
  focus: () => {
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  }
})
</script>

<template>
  <footer class="input-container">
    <div class="input-wrapper">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        class="input-textarea"
        :placeholder="isLoading ? '正在处理...' : '输入您的问题...'"
        @keypress="handleKeyPress"
        @input="handleInputChange"
        :disabled="isLoading"
        :maxlength="maxLength"
        :aria-label="isLoading ? '正在处理消息' : '输入消息'"
        rows="1"
      ></textarea>
      <div v-if="remainingChars < 100" class="char-count">
        {{ remainingChars }}
      </div>
    </div>
    
    <button 
      class="submit-btn"
      :class="{ loading: isLoading }"
      @click="handleSend"
      :disabled="isSendDisabled"
      :aria-label="isLoading ? '发送中' : '发送消息'"
    >
      {{ isLoading ? '🔄' : '喂?' }}
    </button>
  </footer>
</template>

<style scoped>
/* ============================================================================
   输入区域
   ============================================================================ */
.input-container {
  display: flex;
  gap: 1.2vw;
  padding: 1.5vh 1.5vw;
  background-color: #1a1a1a;
  border-top: 1px solid #333;
  box-sizing: border-box;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.input-textarea {
  width: 100%;
  background-color: #262626;
  color: #fff;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  resize: none;
  height: 80px;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-textarea::placeholder {
  color: #888;
}

.input-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-textarea:enabled:hover {
  border-color: #555;
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: #888;
  pointer-events: none;
}

.char-count.warning {
  color: #ff9800;
}

.char-count.danger {
  color: #f44336;
}

/* ============================================================================
   提交按钮
   ============================================================================ */
.submit-btn {
  background-color: #667eea;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 80px;
  min-width: 80px;
  flex-shrink: 0;
}

.submit-btn:hover:not(:disabled) {
  background-color: #5568d3;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn.loading {
  animation: pulse 1.5s infinite;
  pointer-events: none;
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
   响应式设计
   ============================================================================ */
@media (max-width: 768px) {
  .input-container {
    padding: 1vh 1vw;
    gap: 0.8vw;
  }
  
  .input-textarea {
    height: 60px;
    font-size: 14px;
  }
  
  .submit-btn {
    height: 60px;
    padding: 0 20px;
    min-width: 60px;
    font-size: 14px;
  }
}
</style>
