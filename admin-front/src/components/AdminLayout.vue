<template>
  <el-container class="admin-layout">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <span v-if="!isCollapse">后台管理</span>
        <span v-else>后台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <template #title>仪表板</template>
        </el-menu-item>
        <el-sub-menu index="data">
          <template #title>
            <el-icon><DataLine /></el-icon>
            <span>数据管理</span>
          </template>
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/conversations">
            <el-icon><ChatLineRound /></el-icon>
            <template #title>会话管理</template>
          </el-menu-item>
          <el-menu-item index="/bookmarks">
            <el-icon><Star /></el-icon>
            <template #title>书签管理</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="analysis">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>数据分析</span>
          </template>
          <el-menu-item index="/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>数据统计</template>
          </el-menu-item>
          <el-menu-item index="/activity">
            <el-icon><Operation /></el-icon>
            <template #title>用户活跃度</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/logs">
            <el-icon><Document /></el-icon>
            <template #title>系统日志</template>
          </el-menu-item>
          <el-menu-item index="/config">
            <el-icon><Tools /></el-icon>
            <template #title>系统配置</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button :icon="isCollapse ? Expand : Fold" @click="toggleCollapse" />
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-icon><UserFilled /></el-icon>
              管理员
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Odometer,
  DataLine,
  User,
  ChatLineRound,
  Star,
  TrendCharts,
  DataAnalysis,
  Operation,
  Setting,
  Document,
  Tools,
  Fold,
  Expand,
  UserFilled,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #2b2f3a;
  transition: all 0.3s;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.main {
  background: #f0f2f5;
  padding: 20px;
}
</style>
