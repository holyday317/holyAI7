<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelType: {
    type: String,
    default: 'deepseek'
  }
})

const emit = defineEmits(['change'])

const isOpen = ref(false)

// 模型配置
const models = {
  deepseek: {
    label: '标准版',
    description: '快速响应（薛定谔的快）'
  },
  'deepseek-R1': {
    label: '思考版',
    description: '慢悠悠'
  }
}

/**
 * 切换下拉菜单
 */
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

/**
 * 选择模型
 */
const selectModel = (modelKey) => {
  emit('change', modelKey)
  isOpen.value = false
}

/**
 * 获取当前模型的配置
 */
const currentModel = computed(() => {
  return models[props.modelType] || models.deepseek
})
</script>

<template>
  <div class="model-selector">
    <button
      class="model-button"
      @click="toggleDropdown"
      :class="{ active: isOpen }"
      aria-label="选择模型"
    >
      <span class="model-icon">🤖</span>
      <span class="model-label">{{ currentModel.label }}</span>
      <span class="dropdown-arrow" :class="{ open: isOpen }">▼</span>
    </button>

    <div v-if="isOpen" class="dropdown-menu" @click.stop>
      <div
        v-for="(model, key) in models"
        :key="key"
        class="dropdown-item"
        :class="{ active: modelType === key }"
        @click="selectModel(key)"
      >
        <div class="item-header">
          <span class="item-icon">🤖</span>
          <span class="item-label">{{ model.label }}</span>
          <span v-if="modelType === key" class="check-icon">✓</span>
        </div>
        <div class="item-description">{{ model.description }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-selector {
  position: relative;
  display: inline-block;
}

.model-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #262626;
  border: 1px solid #444;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.model-button:hover {
  background-color: #333;
  border-color: #555;
}

.model-button.active {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}

.model-icon {
  font-size: 16px;
}

.model-label {
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.2s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background-color: #262626;
  border: 1px solid #444;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #333;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #333;
}

.dropdown-item.active {
  background-color: rgba(102, 126, 234, 0.15);
  border-left: 3px solid #667eea;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.item-icon {
  font-size: 14px;
}

.item-label {
  flex: 1;
  font-weight: 500;
  font-size: 14px;
}

.check-icon {
  color: #667eea;
  font-weight: bold;
  font-size: 16px;
}

.item-description {
  padding-left: 22px;
  font-size: 12px;
  color: #888;
  line-height: 1.4;
}

.dropdown-item.active .item-description {
  color: #aaa;
}

/* 响应式 */
@media (max-width: 480px) {
  .model-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .dropdown-menu {
    min-width: 200px;
    right: 0;
  }

  .dropdown-item {
    padding: 10px 12px;
  }

  .item-label {
    font-size: 13px;
  }

  .item-description {
    font-size: 11px;
  }
}
</style>
