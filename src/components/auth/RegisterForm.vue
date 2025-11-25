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

    <el-form-item label="Email (Account)" prop="email">
      <el-input
        v-model="form.email"
        placeholder="Enter your Email"
        :prefix-icon="User"
        size="large"
        required
      />
    </el-form-item>

    <el-form-item label="Password" prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="Enter password (at least 8 mixed characters)"
        :prefix-icon="Lock"
        size="large"
        show-password
        required
        minlength="8"
      />
    </el-form-item>

    <el-form-item label="Confirm Password" prop="confirmPassword">
      <el-input
        v-model="form.confirmPassword"
        type="password"
        placeholder="Re-enter your password"
        :prefix-icon="Lock"
        size="large"
        show-password
        required
      />
    </el-form-item>

    <el-form-item label="Select your role" prop="role" class="text-center">
      <el-radio-group v-model="form.role" size="large">
        <el-radio label="Freelancer" />
        <el-radio label="Employer" />
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
        {{ isLoading ? "Registering..." : "Register" }}
      </el-button>
    </el-form-item>

    <el-form-item class="text-center">
      <span style="margin-right: 20px">Already have an account?</span>
      <el-link type="primary" @click="$emit('switch-mode')">
        Go to Login
      </el-link>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
import { User, Lock } from "@element-plus/icons-vue";
import { register as apiRegister } from "@/api/auth.js";

const emit = defineEmits(["switch-mode"]);

const form = ref({
  email: "",
  password: "",
  confirmPassword: "", // 新增
  role: "Freelancer",
});
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleRegister = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  // 新增：檢查密碼是否一致
  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = "Passwords do not match. Please check again.";
    isLoading.value = false;
    return;
  }

  try {
    const payload = {
      email: form.value.email,
      password: form.value.password,
      role: form.value.role === "Freelancer" ? "自由工作者" : "雇主",
    };
    const response = await apiRegister(payload);

    successMessage.value = `Account ${response.data.email} registered successfully! Please switch to login.`;
  } catch (error) {
    errorMessage.value = error.response?.data?.detail || "Registration failed";
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

/* --- 樣式覆蓋 --- */

/* 按鈕顏色 (繼承自 LoginForm 風格) */
.el-button--primary {
  background-color: #a79c7fb0;
  border-color: #a79c7fb0;

  &:hover {
    background-color: #7d7561b0;
    border-color: #7d7561b0;
  }
}

/* 連結顏色 */
.el-link--primary {
  color: #756f5e;
  text-decoration: none;

  &:hover {
    color: #616130;
    font-weight: bold;
    text-decoration: none;
  }
}

/* 新增：覆蓋 el-radio 顏色 (需使用 :deep 穿透組件樣式) */
:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #a79c7fb0;
  background: #a79c7fb0;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #a79c7fb0;
}
/* ------------------------------------- */
</style>
