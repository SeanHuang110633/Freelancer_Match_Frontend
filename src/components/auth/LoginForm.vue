<template>
  <el-form
    ref="formRef"
    :model="form"
    label-position="top"
    @submit.prevent="handleLogin"
  >
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      :closable="false"
      class="mb-20"
    />

    <el-form-item label="Email" prop="email">
      <el-input
        v-model="form.email"
        placeholder="請輸入 Email"
        :prefix-icon="User"
        size="large"
        required
      />
    </el-form-item>

    <el-form-item label="Password" prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="請輸入密碼"
        :prefix-icon="Lock"
        size="large"
        show-password
        required
      />
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        class="w-100"
        size="large"
        native-type="submit"
        :loading="isLoading"
      >
        {{ isLoading ? "......" : "Login" }}
      </el-button>
    </el-form-item>

    <el-form-item class="text-center">
      <span>No account yet?</span>
      <el-link type="primary" @click="$emit('switch-mode')">
        Register right now
      </el-link>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore.js";
import { User, Lock } from "@element-plus/icons-vue";

// 定義 emit 事件，以便父層 (AuthView) 監聽
const emit = defineEmits(["switch-mode"]);

const form = ref({
  email: "",
  password: "",
});
const isLoading = ref(false);
const errorMessage = ref("");

const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  const success = await authStore.login(form.value.email, form.value.password);

  isLoading.value = false;

  if (success) {
    router.push("/");
  } else {
    errorMessage.value = "登入失敗，請檢查您的帳號或密碼。";
  }
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
