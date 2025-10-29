<template>
  <el-form
    ref="formRef"
    :model="form"
    label-position="top"
    @submit.prevent="handleRegister"
  >
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      :closable="false"
      class="mb-20"
    />
    <el-alert
      v-if="successMessage"
      :title="successMessage"
      type="success"
      show-icon
      :closable="false"
      class="mb-20"
    />

    <el-form-item label="Email (帳號)" prop="email">
      <el-input
        v-model="form.email"
        placeholder="請輸入 Email"
        :prefix-icon="User"
        size="large"
        required
      />
    </el-form-item>

    <el-form-item label="密碼" prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="請輸入密碼 (至少8碼英數混合)"
        :prefix-icon="Lock"
        size="large"
        show-password
        required
        minlength="8"
      />
    </el-form-item>

    <el-form-item label="選擇您的角色" prop="role" class="text-center">
      <el-radio-group v-model="form.role" size="large">
        <el-radio label="自由工作者" />
        <el-radio label="雇主" />
      </el-radio-group>
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        class="w-100"
        size="large"
        native-type="submit"
        :loading="isLoading"
        :disabled="!!successMessage"
      >
        {{ isLoading ? "註冊中..." : "註冊" }}
      </el-button>
    </el-form-item>

    <el-form-item class="text-center">
      <span>已有帳號？</span>
      <el-link type="primary" @click="$emit('switch-mode')"> 前往登入 </el-link>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/store/authStore.js";
import { User, Lock } from "@element-plus/icons-vue";
import { register as apiRegister } from "@/api/auth.js"; // 匯入註冊 API

const emit = defineEmits(["switch-mode"]);

const form = ref({
  email: "",
  password: "",
  role: "自由工作者", // 預設角色
});
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleRegister = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  // (TODO: 稍後可用 VeeValidate 強化密碼規則)

  try {
    const response = await apiRegister(form.value);
    successMessage.value = `帳號 ${response.data.email} 註冊成功！請切換登入。`;
  } catch (error) {
    errorMessage.value = error.response?.data?.detail || "註冊失敗";
  }

  isLoading.value = false;
};
</script>

<style scoped>
.w-100 {
  width: 100%;
}
.text-center {
  justify-content: center;
}
.mb-20 {
  margin-bottom: 20px;
}
</style>
