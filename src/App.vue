<template>
  <el-container class="app-container">
    <el-header height="60px">
      <Navbar />
    </el-header>

    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<script setup>
import Navbar from "@/components/layout/Navbar.vue";
</script>

<style lang="scss" scoped>
.app-container {
  height: 100%;
}

.el-header {
  padding: 0; /* 移除 ElHeader 預設 padding */
}

.el-main {
  /* ElMain 繼承自 main.scss 的 100% 高度和灰色背景
    我們需要加上 padding 來容納 fixed 的 Navbar
  */
  padding-top: 15px; /* Navbar 的高度 */
  padding-left: 20px; /* 給內容區一點 breathing room */
  padding-right: 20px;
  padding-bottom: 20px;

  /* 確保 main 區域高度計算正確 
    (100% 高度 - 60px Navbar)
  */
  height: calc(100% - 60px);
}
</style>
