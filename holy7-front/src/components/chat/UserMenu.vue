<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  username: {
    type: String,
    default: '未登录'
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'logout', 'navigate'])

/**
 * 菜单项配置
 */
const menuItems = [
  {
    id: 'markbook',
    icon: '📚',
    label: '马克本',
    description: '我的收藏和笔记',
    disabled: false
  },
  {
    id: 'improvement',
    icon: '🚀',
    label: '改进计划',
    description: '功能反馈和优化建议',
    disabled: true
  }
]

/**
 * 处理菜单项点击
 */
const handleMenuItemClick = (item) => {
  if (item.disabled) {
    return
  }
  emit('navigate', item.id)
  emit('close')
}

/**
 * 处理退出登录
 */
const handleLogout = () => {
  emit('logout')
  emit('close')
}

/**
 * 关闭菜单
 */
const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="menu-overlay" @click="handleClose">
      <div class="user-menu" @click.stop>
        <!-- 用户信息头部 -->
        <div class="menu-header">
          <div class="user-avatar">
            <span class="avatar-icon">👤</span>
          </div>
          <div class="user-info">
            <div class="user-name">{{ username }}</div>
            <div class="user-status">已登录</div>
          </div>
        </div>

        <!-- 菜单项列表 -->
        <div class="menu-items">
          <div
            v-for="item in menuItems"
            :key="item.id"
            class="menu-item"
            :class="{ disabled: item.disabled }"
            @click="handleMenuItemClick(item)"
          >
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-content">
              <div class="item-label">{{ item.label }}</div>
              <div class="item-description">{{ item.description }}</div>
            </div>
            <div v-if="item.disabled" class="item-badge">即将上线</div>
          </div>
        </div>

        <!-- 底部操作区 -->
        <div class="menu-footer">
          <button class="logout-btn" @click="handleLogout">
            <span class="logout-icon">🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.user-menu {
  width: 360px;
  max-height: 100vh;
  background-color: #262626;
  border-left: 1px solid #444;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
  margin-top: 6vh; /* 对应顶部导航栏的高度 */
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* 用户信息头部 */
.menu-header {
  padding: 24px 20px;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #667eea 0%, #5568d3 100%);
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 32px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-status {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* 菜单项列表 */
.menu-items {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.menu-item:hover:not(.disabled) {
  background-color: #333;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-icon {
  font-size: 24px;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-label {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 4px;
}

.item-description {
  font-size: 12px;
  color: #888;
  line-height: 1.4;
}

.item-badge {
  background-color: #667eea;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

/* 底部操作区 */
.menu-footer {
  padding: 16px;
  border-top: 1px solid #333;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background-color: #333;
  border: 1px solid #ff4757;
  border-radius: 8px;
  color: #ff4757;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #ff4757;
  color: #fff;
}

.logout-icon {
  font-size: 16px;
}

/* 滚动条样式 */
.menu-items::-webkit-scrollbar {
  width: 6px;
}

.menu-items::-webkit-scrollbar-track {
  background: #262626;
}

.menu-items::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.menu-items::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* 响应式 */
@media (max-width: 768px) {
  .user-menu {
    width: 100%;
    max-width: 320px;
  }

  .menu-header {
    padding: 20px 16px;
  }

  .user-avatar {
    width: 50px;
    height: 50px;
  }

  .avatar-icon {
    font-size: 26px;
  }

  .user-name {
    font-size: 16px;
  }

  .menu-item {
    padding: 14px 16px;
  }

  .item-icon {
    font-size: 20px;
  }

  .item-label {
    font-size: 14px;
  }

  .item-description {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .user-menu {
    margin-top: 0;
    max-width: 100%;
  }

  .menu-header {
    padding: 16px;
  }

  .user-avatar {
    width: 45px;
    height: 45px;
  }

  .avatar-icon {
    font-size: 24px;
  }

  .menu-item {
    padding: 12px 16px;
  }
}
</style>
