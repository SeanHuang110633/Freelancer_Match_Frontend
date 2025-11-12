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
        placeholder="Enter your password"
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
        {{ isLoading ? "Loading..." : "Login" }}
      </el-button>
    </el-form-item>

    <el-form-item class="text-center">
      <span style="margin-right: 20px">No account yet? </span>
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

// 定義 emit 事件
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
    // 錯誤訊息改為英文
    errorMessage.value = "Login failed. Please check your email or password.";
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

/* 覆蓋el-button顏色 */
.el-button--primary {
  background-color: #a79c7fb0;
  border-color: #a79c7fb0;

  /* hover */
  &:hover {
    background-color: #7d7561b0;
    border-color: #7d7561b0;
  }
}

/* 覆蓋el-link顏色 */
.el-link--primary {
  color: #756f5e;
  /* 去除下劃線 */
  text-decoration: none;

  /* hover */
  &:hover {
    color: #616130;
    font-weight: bold;
    text-decoration: none;
  }
}

/* 覆蓋 */
</style>
