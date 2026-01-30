<script setup>
import { ref, computed, watch } from 'vue'
import { questionnaireConfigs } from '@/models/questionnaireConfigs'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  questionnaireType: {
    type: String,
    default: ''
  },
  questionnaireData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['close', 'submit'])

// Ref
const formData = ref({})
const loading = ref(false)
const step = ref(1)
const totalSteps = ref(1)

// 计算属性
const currentConfig = computed(() => {
  return questionnaireConfigs[props.questionnaireType] || questionnaireConfigs.custom
})

const isValid = computed(() => {
  const fields = currentConfig.value.fields
  if (!fields || fields.length === 0) return true
  
  return fields.every(field => {
    const value = formData.value[field.key]
    if (field.type === 'textarea' || field.type === 'text') {
      return value && value.trim().length > 0
    }
    return value !== undefined && value !== null && value !== ''
  })
})

// 初始化表单数据
const initFormData = () => {
  formData.value = {}
  const fields = currentConfig.value.fields || []
  fields.forEach(field => {
    if (field.type === 'slider') {
      formData.value[field.key] = field.min || 1
    } else if (field.type === 'select') {
      formData.value[field.key] = field.options?.[0] || ''
    } else {
      formData.value[field.key] = ''
    }
  })
}

// 重置表单
const resetForm = () => {
  initFormData()
  step.value = 1
  loading.value = false
}

// 提交表单
const handleSubmit = async () => {
  if (!isValid.value) {
    alert('请填写完整所有必填项')
    return
  }
  
  loading.value = true
  try {
    await emit('submit', {
      type: props.questionnaireType,
      data: formData.value
    })
    resetForm()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  emit('close')
}

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initFormData()
  }
})
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" class="questionnaire-overlay" @click.self="handleClose">
      <div class="questionnaire-dialog">
        <!-- 头部 -->
        <div class="dialog-header">
          <h2 class="dialog-title">{{ currentConfig.title }}</h2>
          <button class="close-btn" @click="handleClose" aria-label="关闭">
            ✕
          </button>
        </div>
        
        <!-- 内容 -->
        <div class="dialog-body">
          <p v-if="currentConfig.description" class="dialog-description">
            {{ currentConfig.description }}
          </p>
          
          <div v-if="currentConfig.fields && currentConfig.fields.length > 0" class="form-container">
            <div
              v-for="field in currentConfig.fields"
              :key="field.key"
              class="form-item"
            >
              <label class="form-label">{{ field.label }}</label>
              
              <!-- 滑块 -->
              <div v-if="field.type === 'slider'" class="slider-container">
                <input
                  v-model.number="formData[field.key]"
                  type="range"
                  :min="field.min"
                  :max="field.max"
                  class="slider-input"
                />
                <div class="slider-labels">
                  <span v-if="field.minLabel" class="slider-min">{{ field.minLabel }}</span>
                  <span class="slider-value">{{ formData[field.key] }}</span>
                  <span v-if="field.maxLabel" class="slider-max">{{ field.maxLabel }}</span>
                </div>
              </div>
              
              <!-- 下拉选择 -->
              <select
                v-else-if="field.type === 'select'"
                v-model="formData[field.key]"
                class="form-select"
              >
                <option v-for="option in field.options" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              
              <!-- 文本域 -->
              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="formData[field.key]"
                class="form-textarea"
                :placeholder="field.placeholder"
                rows="3"
              ></textarea>
              
              <!-- 文本输入 -->
              <input
                v-else
                v-model="formData[field.key]"
                type="text"
                class="form-input"
                :placeholder="field.placeholder"
              />
            </div>
          </div>
        </div>
        
        <!-- 底部 -->
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="handleClose" :disabled="loading">
            取消
          </button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="loading || !isValid">
            {{ loading ? '提交中...' : '提交' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ============================================================================
   弹窗容器
   ============================================================================ */
.questionnaire-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.questionnaire-dialog {
  background-color: #1e1e1e;
  border: 1px solid #444;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* ============================================================================
   弹窗头部
   ============================================================================ */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #333;
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* ============================================================================
   弹窗内容
   ============================================================================ */
.dialog-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.dialog-description {
  margin: 0 0 20px 0;
  color: #ccc;
  font-size: 15px;
  line-height: 1.6;
}

/* ============================================================================
   表单样式
   ============================================================================ */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

/* 文本输入框 */
.form-input,
.form-select,
.form-textarea {
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: #fff;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #666;
}

/* 滑块样式 */
.slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-input {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: #333;
  border-radius: 3px;
  outline: none;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: #7b8ee8;
}

.slider-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.slider-input::-moz-range-thumb:hover {
  transform: scale(1.2);
  background: #7b8ee8;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #888;
}

.slider-value {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
}

/* ============================================================================
   弹窗底部
   ============================================================================ */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #333;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-secondary {
  background-color: #333;
  color: #fff;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #444;
}

.btn-primary {
  background-color: #667eea;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5568d3;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================================================
   过渡动画
   ============================================================================ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================================================================
   响应式设计
   ============================================================================ */
@media (max-width: 640px) {
  .questionnaire-dialog {
    max-height: 95vh;
    border-radius: 12px;
  }
  
  .dialog-header {
    padding: 16px 20px;
  }
  
  .dialog-title {
    font-size: 18px;
  }
  
  .dialog-body {
    padding: 20px;
  }
  
  .dialog-footer {
    padding: 12px 20px;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

/* ============================================================================
   滚动条样式
   ============================================================================ */
.dialog-body::-webkit-scrollbar {
  width: 6px;
}

.dialog-body::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.dialog-body::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.dialog-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
