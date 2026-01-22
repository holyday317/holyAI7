<script setup>
import { defineProps, defineEmits } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

const renderedContent = marked(props.content || '')
</script>

<template>
  <Teleport to="body">
    <div class="thought-dialog-overlay" @click="emit('close')">
      <div class="thought-dialog" @click.stop>
        <div class="thought-dialog-header">
          <h3>是这样的：</h3>
          <button class="close-btn" @click="emit('close')">×</button>
        </div>
        <div class="thought-dialog-content">
          <div class="markdown-content" v-html="renderedContent"></div>
        </div>
        <div class="thought-dialog-footer">
          <button class="close-btn-bottom" @click="emit('close')">哦</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.thought-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}

.thought-dialog {
  background-color: #181818;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 15px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  cursor: default;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.thought-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
}

.thought-dialog-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #333;
}

.thought-dialog-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

.markdown-content {
  line-height: 1.8;
  font-size: 14px;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #fff;
}

.markdown-content :deep(p) {
  margin-bottom: 16px;
}

.markdown-content :deep(code) {
  background-color: #333;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.markdown-content :deep(pre) {
  background-color: #333;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 16px;
}

.markdown-content :deep(li) {
  margin-bottom: 8px;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #fff;
  padding-left: 16px;
  margin: 16px 0;
  color: #ccc;
}

.thought-dialog-footer {
  padding: 16px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: flex-end;
}

.close-btn-bottom {
  background-color: #181818;
  color: #fff;
  border: 2px solid #fff;
  padding: 12px 40px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.close-btn-bottom:hover {
  background-color: #333;
}

@media (max-width: 640px) {
  .thought-dialog {
    width: 95%;
    max-height: 95vh;
  }

  .thought-dialog-header h3 {
    font-size: 20px;
  }

  .markdown-content {
    font-size: 13px;
  }
}
</style>
