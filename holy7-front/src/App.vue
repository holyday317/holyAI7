<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <!-- <header>
    <div class="header-content">
      <div class="logo">🤖 holyAI7</div>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/chat">AI 聊天</RouterLink>
        <RouterLink to="/todo">待办事项</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
    </div>
  </header> -->

  <main>
    <RouterView />
  </main>
</template>

<style scoped>

</style>
