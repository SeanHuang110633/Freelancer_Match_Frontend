<template>
  <el-row justify="center">
    <el-col :xs="24" :sm="20" :md="16" :lg="12">
      <el-card v-if="isLoading" shadow="never">
        <el-skeleton :rows="5" animated />
      </el-card>

      <el-card v-if="!isLoading && !profile" shadow="hover">
        <template #header>
          <h2>建立您的 Profile</h2>
          <p>完成 Profile 是開始接案/刊登的第一步。</p>
        </template>
        <el-form
          ref="createFormRef"
          :model="createForm"
          label-position="top"
          @submit.prevent="handleCreateProfile"
        >
          <template v-if="authStore.userRole === '自由工作者'">
            <el-form-item label="您的全名 (必填)" prop="full_name">
              <el-input v-model="createForm.full_name" required />
            </el-form-item>
            <el-form-item label="個人簡介" prop="bio">
              <el-input v-model="createForm.bio" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="聯絡電話" prop="phone">
              <el-input
                v-model="createForm.phone"
                placeholder="e.g., 0912-345-678"
              />
            </el-form-item>
            <el-form-item label="頭像 URL" prop="avatar_url">
              <el-input
                v-model="createForm.avatar_url"
                placeholder="e.g., https://.../avatar.png"
              />
            </el-form-item>
            <el-form-item label="GitHub" prop="github">
              <el-input
                v-model="createForm.social_links.github"
                placeholder="e.g., https://github.com/username"
              />
            </el-form-item>
          </template>

          <template v-if="authStore.userRole === '雇主'">
            <el-form-item label="公司/團隊名稱 (必填)" prop="company_name">
              <el-input v-model="createForm.company_name" required />
            </el-form-item>
            <el-form-item label="公司簡介" prop="company_bio">
              <el-input
                v-model="createForm.company_bio"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="公司 Logo URL" prop="company_logo_url">
              <el-input
                v-model="createForm.company_logo_url"
                placeholder="e.g., https://.../logo.png"
              />
            </el-form-item>
            <el-form-item label="聯絡信箱" prop="contact_email">
              <el-input v-model="createForm.contact_email" />
            </el-form-item>
            <el-form-item label="聯絡電話" prop="contact_phone">
              <el-input v-model="createForm.contact_phone" />
            </el-form-item>
          </template>

          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              :loading="isSubmitting"
            >
              儲存並開始
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-tabs
        v-if="!isLoading && profile"
        v-model="activeTab"
        type="border-card"
        class="profile-tabs"
      >
        <el-tab-pane label="基本資料與設定" name="basic">
          <el-form
            label-position="top"
            :model="editForm"
            @submit.prevent="handleUpdateProfile"
          >
            <el-form-item v-if="!isEditing">
              <el-button type="primary" @click="isEditing = true">
                <el-icon><Edit /></el-icon> 編輯資料
              </el-button>
            </el-form-item>

            <template v-if="authStore.userRole === '自由工作者'">
              <el-form-item label="全名">
                <el-input v-model="editForm.full_name" :disabled="!isEditing" />
              </el-form-item>
              <el-form-item label="個人簡介">
                <el-input
                  v-model="editForm.bio"
                  type="textarea"
                  :rows="3"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="聯絡電話">
                <el-input v-model="editForm.phone" :disabled="!isEditing" />
              </el-form-item>
              <el-form-item label="頭像 URL">
                <el-input
                  v-model="editForm.avatar_url"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="GitHub">
                <el-input
                  v-model="editForm.social_links.github"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="檔案可見度">
                <el-radio-group
                  v-model="editForm.visibility"
                  :disabled="!isEditing"
                >
                  <el-radio label="公開">公開</el-radio>
                  <el-radio label="僅受邀">僅受邀</el-radio>
                  <el-radio label="私人">私人</el-radio>
                </el-radio-group>
              </el-form-item>
            </template>

            <template v-if="authStore.userRole === '雇主'">
              <el-form-item label="公司名稱">
                <el-input
                  v-model="editForm.company_name"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="公司簡介">
                <el-input
                  v-model="editForm.company_bio"
                  type="textarea"
                  :rows="3"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="公司 Logo URL">
                <el-input
                  v-model="editForm.company_logo_url"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="聯絡信箱">
                <el-input
                  v-model="editForm.contact_email"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="聯絡電話">
                <el-input
                  v-model="editForm.contact_phone"
                  :disabled="!isEditing"
                />
              </el-form-item>
            </template>

            <el-form-item v-if="isEditing">
              <el-button
                type="primary"
                native-type="submit"
                :loading="isSubmitting"
              >
                儲存變更
              </el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane
          v-if="authStore.userRole === '自由工作者'"
          label="我的技能"
          name="skills"
        >
          <el-form @submit.prevent="handleUpdateSkills">
            <el-form-item label="請勾選您擅長的技能 (可多選)">
              <el-checkbox-group v-model="selectedSkillIds">
                <el-checkbox
                  v-for="tag in allTags"
                  :key="tag.tag_id"
                  :label="tag.tag_id"
                  class="skill-checkbox"
                >
                  {{ tag.name }}
                </el-checkbox>
              </el-checkbox-group>
              <div v-if="allTags.length === 0">技能列表載入中...</div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                :loading="isSubmitting"
              >
                更新技能
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from "vue"; // (新增 reactive, watch)
import { useAuthStore } from "@/store/authStore.js";
import { ElMessage } from "element-plus";
import { Edit } from "@element-plus/icons-vue"; // (新增)
import {
  getMyProfile,
  createMyProfile,
  updateMySkills,
  updateMyProfile, // (更新) 確保已匯入
} from "@/api/profile.js";
import { getAllTags } from "@/api/tags.js";
import { cloneDeep } from "lodash-es"; // (新增) 用於取消編輯

const authStore = useAuthStore();
const isLoading = ref(true);
const isSubmitting = ref(false);
const activeTab = ref("basic");
const isEditing = ref(false); // (新增) 編輯模式

// --- 狀態 ---
const profile = ref(null);
const allTags = ref([]);
const selectedSkillIds = ref([]);

// (修改) 建立表單 (狀態 2)
const createForm = reactive({
  full_name: "",
  bio: "",
  phone: "",
  avatar_url: "",
  social_links: { github: "" }, // (修改) 初始化 social_links
  company_name: "",
  company_bio: "",
  company_logo_url: "",
  contact_email: "",
  contact_phone: "",
  // (注意) 雇主的 social_links 暫時未加
});

// (新增) 編輯表單 (狀態 3)
const editForm = ref(null);

// (Feedback 1) 成功後，更新本地狀態 (自動刷新)
const loadProfileData = async () => {
  try {
    const profileRes = await getMyProfile();

    if (profileRes.data) {
      profile.value = profileRes.data;

      // (新增) 將資料複製到 editForm
      // 使用 cloneDeep 避免響應式汙染
      editForm.value = cloneDeep(profile.value);

      // (新增) 確保 social_links 至少是個空物件
      if (!editForm.value.social_links) {
        editForm.value.social_links = { github: "" };
      }

      if (authStore.userRole === "自由工作者") {
        selectedSkillIds.value = profile.value.skills.map(
          (userSkill) => userSkill.tag.tag_id
        );
        if (allTags.value.length === 0) {
          const tagsRes = await getAllTags();
          allTags.value = tagsRes.data;
        }
      }
    }
  } catch (err) {
    ElMessage.error("載入 Profile 失敗");
  }
};

onMounted(async () => {
  isLoading.value = true;
  await loadProfileData();
  isLoading.value = false;
});

// --- 處理函式 ---

// 創建 Profile
const handleCreateProfile = async () => {
  isSubmitting.value = true;

  // (修正) <--- 根據角色動態建立 dataToSend
  let dataToSend = {};

  if (authStore.userRole === "自由工作者") {
    dataToSend = {
      full_name: createForm.full_name,
      bio: createForm.bio,
      phone: createForm.phone,
      // 確保空 URL 傳送 null
      avatar_url: createForm.avatar_url || null,
      // 確保 social_links 是物件
      social_links: {
        github: createForm.social_links.github || "",
      },
    };
  } else if (authStore.userRole === "雇主") {
    dataToSend = {
      company_name: createForm.company_name,
      company_bio: createForm.company_bio,
      contact_email: createForm.contact_email,
      contact_phone: createForm.contact_phone,
      // 確保空 URL 傳送 null
      company_logo_url: createForm.company_logo_url || null,
      // (TODO) 雇主的 social_links 尚未處理
      social_links: {},
    };
  } else {
    ElMessage.error("無法識別的使用者角色");
    isSubmitting.value = false;
    return; // 不繼續執行
  }

  try {
    // 現在 dataToSend 只包含該角色需要的欄位
    const res = await createMyProfile(dataToSend);
    profile.value = res.data;
    editForm.value = cloneDeep(res.data);

    // (新增) 確保 editForm 的 social_links 初始化
    if (!editForm.value.social_links) {
      if (authStore.userRole === "自由工作者") {
        editForm.value.social_links = { github: "" };
      } else {
        editForm.value.social_links = {};
      }
    }

    ElMessage.success("Profile 建立成功！");

    if (authStore.userRole === "自由工作者") {
      const tagsRes = await getAllTags();
      allTags.value = tagsRes.data;
      activeTab.value = "skills";
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "建立失敗");
  }
  isSubmitting.value = false;
};

// (新增) 更新 Profile
const handleUpdateProfile = async () => {
  isSubmitting.value = true;
  try {
    // (修改) 傳送 editForm
    // 確保空 URL 傳送 null
    const dataToSend = {
      ...editForm.value,
      avatar_url: editForm.value.avatar_url || null,
      company_logo_url: editForm.value.company_logo_url || null,
    };

    const res = await updateMyProfile(dataToSend);
    profile.value = res.data; // (Feedback 1) 更新
    editForm.value = cloneDeep(res.data); // 同步更新
    isEditing.value = false; // 退出編輯模式
    ElMessage.success("基本資料更新成功");
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "更新失敗");
  }
  isSubmitting.value = false;
};

// (新增) 取消編輯
const cancelEdit = () => {
  isEditing.value = false;
  // (Rollback) 從原始 profile 恢復
  editForm.value = cloneDeep(profile.value);
};

// 更新技能 (Tab 2)
const handleUpdateSkills = async () => {
  // ... (此函式保持不變) ...
  isSubmitting.value = true;
  try {
    const res = await updateMySkills(selectedSkillIds.value);
    profile.value.skills = res.data;
    ElMessage.success("技能更新成功");
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "更新技能失敗");
    selectedSkillIds.value = profile.value.skills.map(
      (userSkill) => userSkill.tag.tag_id
    );
  }
  isSubmitting.value = false;
};
</script>

<style lang="scss" scoped>
.profile-tabs {
  :deep(.el-tabs__content) {
    min-height: 200px;
  }
}
.skill-checkbox {
  margin: 5px;
}
</style>
