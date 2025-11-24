<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="updateVisible"
    :title="dialogTitle"
    width="500px"
    align-center
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="review-form"
    >
      <p class="instruction-text">
        請針對本次合作的體驗進行評分（1-5 顆星），提交後無法修改。
      </p>

      <div v-if="isEmployer">
        <el-form-item
          label="溝通協調 (Communication)"
          prop="rating_communication_fw"
        >
          <el-rate
            v-model="formData.rating_communication_fw"
            allow-half
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
        <el-form-item
          label="專業技術 (Professionalism)"
          prop="rating_professionalism_fw"
        >
          <el-rate
            v-model="formData.rating_professionalism_fw"
            allow-half
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
        <el-form-item
          label="準時交付 (Punctuality)"
          prop="rating_punctuality_fw"
        >
          <el-rate
            v-model="formData.rating_punctuality_fw"
            allow-half
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
        <el-form-item label="成果品質 (Quality)" prop="rating_quality_fw">
          <el-rate
            v-model="formData.rating_quality_fw"
            allow-half
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
      </div>

      <div v-else>
        <el-form-item
          label="溝通協調 (Communication)"
          prop="rating_communication_we"
        >
          <el-rate
            v-model="formData.rating_communication_we"
            allow-half
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
        <el-form-item
          label="需求明確度 (Quality of Requirements)"
          prop="rating_quality_we"
        >
          <el-rate
            v-model="formData.rating_quality_we"
            allow-half
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
        <el-form-item
          label="福利報酬 (Compensation)"
          prop="rating_compensation_we"
        >
          <el-rate
            v-model="formData.rating_compensation_we"
            allow-half
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
        <el-form-item label="合作流程順暢度 (Process)" prop="rating_process_we">
          <el-rate
            v-model="formData.rating_process_we"
            allow-half
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
      </div>

      <el-form-item label="文字評語 (選填)" prop="comment">
        <el-input
          v-model="formData.comment"
          type="textarea"
          :rows="3"
          placeholder="請分享您的具體回饋..."
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitReview" :loading="isSubmitting">
          提交評價
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { createReview } from "@/api/review.js";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  contractId: {
    type: String,
    required: true,
  },
  isEmployer: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:visible", "review-submitted"]);

const formRef = ref(null);
const isSubmitting = ref(false);

// 根據角色初始化表單資料
const initFormData = () => {
  if (props.isEmployer) {
    return {
      rating_communication_fw: 0,
      rating_professionalism_fw: 0,
      rating_punctuality_fw: 0,
      rating_quality_fw: 0,
      comment: "",
    };
  } else {
    return {
      rating_communication_we: 0,
      rating_quality_we: 0,
      rating_compensation_we: 0,
      rating_process_we: 0,
      comment: "",
    };
  }
};

const formData = ref(initFormData());

// 監聽 visible 變化，開啟時重置表單
watch(
  () => props.visible,
  (val) => {
    if (val) {
      formData.value = initFormData();
    }
  }
);

const dialogTitle = computed(() =>
  props.isEmployer ? "評價自由工作者" : "評價雇主"
);

// 驗證規則：所有評分欄位必填且 > 0
const validateRating = (rule, value, callback) => {
  if (!value || value <= 0) {
    callback(new Error("請給予評分"));
  } else {
    callback();
  }
};

const rules = computed(() => {
  const commonRules = {
    comment: [{ required: false }],
  };

  if (props.isEmployer) {
    return {
      ...commonRules,
      rating_communication_fw: [
        { validator: validateRating, trigger: "change" },
      ],
      rating_professionalism_fw: [
        { validator: validateRating, trigger: "change" },
      ],
      rating_punctuality_fw: [{ validator: validateRating, trigger: "change" }],
      rating_quality_fw: [{ validator: validateRating, trigger: "change" }],
    };
  } else {
    return {
      ...commonRules,
      rating_communication_we: [
        { validator: validateRating, trigger: "change" },
      ],
      rating_quality_we: [{ validator: validateRating, trigger: "change" }],
      rating_compensation_we: [
        { validator: validateRating, trigger: "change" },
      ],
      rating_process_we: [{ validator: validateRating, trigger: "change" }],
    };
  }
});

const updateVisible = (val) => {
  emit("update:visible", val);
};

const closeDialog = () => {
  updateVisible(false);
};

const submitReview = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true;
      try {
        const payload = {
          contract_id: props.contractId,
          ...formData.value,
        };

        await createReview(payload);
        ElMessage.success("評價提交成功！");
        emit("review-submitted"); // 通知父元件重新整理
        closeDialog();
      } catch (error) {
        ElMessage.error(error.response?.data?.detail || "提交評價失敗");
      } finally {
        isSubmitting.value = false;
      }
    }
  });
};
</script>

<style scoped>
.instruction-text {
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
  font-size: 14px;
}
.review-form :deep(.el-form-item__label) {
  font-weight: bold;
}
</style>
