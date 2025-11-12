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
      <span>Already have an account?</span>
      <el-link type="primary" @click="$emit('switch-mode')">
        Go to Login
      </el-link>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
// import { useAuthStore } from "@/store/authStore.js"; // 註冊不需要 store
import { User, Lock } from "@element-plus/icons-vue";
import { register as apiRegister } from "@/api/auth.js";

const emit = defineEmits(["switch-mode"]);

const form = ref({
  email: "",
  password: "",
  role: "Freelancer", // 預設角色改為英文
});
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleRegister = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const response = await apiRegister(form.value);
    // 成功訊息改為英文
    successMessage.value = `Account ${response.data.email} registered successfully! Please switch to login.`;
  } catch (error) {
    // 錯誤訊息改為英文
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
</style>
