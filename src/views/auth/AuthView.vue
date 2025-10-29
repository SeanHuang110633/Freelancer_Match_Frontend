<template>
  <el-row class="auth-container" justify="center" align="middle">
    <el-col :xs="22" :sm="12" :md="8" :lg="6">
      <el-card class="auth-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="main-title">Freelancer Match</span>
            <p class="slogan">Where talent meets demand</p>
          </div>
        </template>

        <component
          :is="isLoginMode ? LoginForm : RegisterForm"
          @switch-mode="toggleMode"
        />
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref } from "vue"; // (修正) 移除 computed，因為不再需要
import LoginForm from "@/components/auth/LoginForm.vue";
import RegisterForm from "@/components/auth/RegisterForm.vue";

const isLoginMode = ref(true);
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
};
</script>

<style lang="scss" scoped>
.auth-container {
  height: 100%;
}

/* (修改) Card Header 樣式 */
.card-header {
  text-align: center;
  .main-title {
    display: block; /* 讓 slogan 換行 */
    font-size: 1.8rem; /* 可以調整大小 */
    font-weight: bold;
    margin-bottom: 5px; /* 與 slogan 間距 */
  }
  .slogan {
    margin: 0;
    font-size: 0.9rem; /* 較小的字體 */
    color: #909399; /* Element Plus 次要文字顏色 */
  }
}
</style>
