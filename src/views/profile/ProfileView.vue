<template>
  <el-row justify="center" class="profile-view-wrapper">
    <el-col :xs="24" :sm="20" :md="16" :lg="12">
      <el-card v-if="isLoading" shadow="never">
        <el-skeleton :rows="5" animated />
      </el-card>

      <el-card v-if="!isLoading && !profile" shadow="hover">
        <template #header>
          <h2>Create Your Profile</h2>
          <p>Completing your profile is the first step to get started.</p>
        </template>
        <el-form
          ref="createFormRef"
          :model="createForm"
          label-position="top"
          @submit.prevent="handleCreateProfile"
        >
          <template v-if="authStore.userRole === '自由工作者'">
            <el-form-item label="Your Full Name (Required)" prop="full_name">
              <el-input v-model="createForm.full_name" required />
            </el-form-item>
            <el-form-item label="Bio" prop="bio">
              <el-input v-model="createForm.bio" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="Contact Phone" prop="phone">
              <el-input
                v-model="createForm.phone"
                placeholder="e.g., 0912-345-678"
              />
            </el-form-item>
            <el-form-item label="Avatar URL" prop="avatar_url">
              <el-input
                v-model="createForm.avatar_url"
                placeholder="e.g., https://.../avatar.png"
              />
            </el-form-item>
            <el-form-item prop="github">
              <template #label>
                <div class="icon-label">
                  <span>GitHub</span>
                </div>
              </template>
              <el-input
                v-model="createForm.social_links.github"
                placeholder="e.g., https://github.com/username"
              />
            </el-form-item>
            <el-form-item prop="linkedin">
              <template #label>
                <div class="icon-label">
                  <span>LinkedIn</span>
                </div>
              </template>
              <el-input
                v-model="createForm.social_links.linkedin"
                placeholder="e.g., https://linkedin.com/in/username"
              />
            </el-form-item>
          </template>

          <template v-if="authStore.userRole === '雇主'">
            <el-form-item
              label="Company/Team Name (Required)"
              prop="company_name"
            >
              <el-input v-model="createForm.company_name" required />
            </el-form-item>
            <el-form-item label="Company Bio" prop="company_bio">
              <el-input
                v-model="createForm.company_bio"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="Company Logo URL" prop="company_logo_url">
              <el-input
                v-model="createForm.company_logo_url"
                placeholder="e.g., https://.../logo.png"
              />
            </el-form-item>
            <el-form-item label="Contact Email" prop="contact_email">
              <el-input v-model="createForm.contact_email" />
            </el-form-item>
            <el-form-item label="Contact Phone" prop="contact_phone">
              <el-input v-model="createForm.contact_phone" />
            </el-form-item>
            <el-form-item prop="linkedin">
              <template #label>
                <div class="icon-label">
                  <span>LinkedIn</span>
                </div>
              </template>
              <el-input
                v-model="createForm.social_links.linkedin"
                placeholder="e.g., https://linkedin.com/company/username"
              />
            </el-form-item>
          </template>

          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              :loading="isSubmitting"
            >
              Save and Get Started
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
        <el-tab-pane label="Basic Info & Settings" name="basic">
          <el-form
            label-position="top"
            :model="editForm"
            @submit.prevent="handleUpdateProfile"
          >
            <div class="avatar-container">
              <el-avatar
                :size="150"
                :src="displayedAvatarUrl"
                :icon="UserFilled"
              />
            </div>
            <el-form-item v-if="!isEditing">
              <el-button type="primary" @click="isEditing = true">
                <el-icon><Edit /></el-icon> Edit Profile
              </el-button>
            </el-form-item>

            <template v-if="authStore.userRole === '自由工作者'">
              <el-form-item label="Full Name">
                <el-input v-model="editForm.full_name" :disabled="!isEditing" />
              </el-form-item>
              <el-form-item label="Bio">
                <el-input
                  v-model="editForm.bio"
                  type="textarea"
                  :rows="3"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="Contact Phone">
                <el-input v-model="editForm.phone" :disabled="!isEditing" />
              </el-form-item>
              <el-form-item label="Avatar URL">
                <el-input
                  v-model="editForm.avatar_url"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="icon-label">
                    <span>GitHub</span>
                  </div>
                </template>
                <el-input
                  v-model="editForm.social_links.github"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="icon-label">
                    <span>LinkedIn</span>
                  </div>
                </template>
                <el-input
                  v-model="editForm.social_links.linkedin"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="Profile Visibility">
                <el-radio-group
                  v-model="editForm.visibility"
                  :disabled="!isEditing"
                >
                  <el-radio label="公開">Public</el-radio>
                  <el-radio label="僅受邀">Invite Only</el-radio>
                  <el-radio label="私人">Private</el-radio>
                </el-radio-group>
              </el-form-item>
            </template>

            <template v-if="authStore.userRole === '雇主'">
              <el-form-item label="Company Name">
                <el-input
                  v-model="editForm.company_name"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="Company Bio">
                <el-input
                  v-model="editForm.company_bio"
                  type="textarea"
                  :rows="3"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="Company Logo URL">
                <el-input
                  v-model="editForm.company_logo_url"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="Contact Email">
                <el-input
                  v-model="editForm.contact_email"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="Contact Phone">
                <el-input
                  v-model="editForm.contact_phone"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item>
                <template #label>
                  <div class="icon-label">
                    <span>LinkedIn</span>
                  </div>
                </template>
                <el-input
                  v-model="editForm.social_links.linkedin"
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
                Save Changes
              </el-button>
              <el-button @click="cancelEdit">Cancel</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane
          v-if="authStore.userRole === '自由工作者'"
          label="My Skills"
          name="skills"
        >
          <el-form @submit.prevent="handleUpdateSkills">
            <el-form-item
              label="Please select the skills you master (Multiple choice)"
            >
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
              <div v-if="allTags.length === 0">Loading skills...</div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                :loading="isSubmitting"
              >
                Update Skills
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { useAuthStore } from "@/store/authStore.js";
import { ElMessage } from "element-plus";
import { Edit, UserFilled } from "@element-plus/icons-vue";
import {
  getMyProfile,
  createMyProfile,
  updateMySkills,
  updateMyProfile,
} from "@/api/profile.js";
import { getAllTags } from "@/api/tags.js";
import { cloneDeep } from "lodash-es";

// (!! 📍 PRODUCTION / GCP DEPLOYMENT NOTE 📍 !!)
// 這裡是匯入您本地的後端 URL (例如 "http://127.0.0.1:8000")。
// 當您部署到 GCP 時，您前端的 production build (例如 /config/env.production.js)
// 必須將此變數修改為您在 GCP App Engine 或 Cloud Run 上的 "後端 API 服務 URL"。
import { API_BASE_URL } from "@/config/env.js"; // (3. 匯入後端 URL)

const authStore = useAuthStore();
const isLoading = ref(true);
const isSubmitting = ref(false);
const activeTab = ref("basic");
const isEditing = ref(false);

const profile = ref(null);
const allTags = ref([]);
const selectedSkillIds = ref([]);

// (修改) 擴充 social_links
const createForm = reactive({
  full_name: "",
  bio: "",
  phone: "",
  avatar_url: "",
  social_links: { github: "", linkedin: "" }, // <-- (修改)
  company_name: "",
  company_bio: "",
  company_logo_url: "",
  contact_email: "",
  contact_phone: "",
});

const editForm = ref(null);

// (!! 4. 新增 computed 屬性 !!)
// 這個 computed 會自動組合出完整的頭貼 URL
const displayedAvatarUrl = computed(() => {
  // (新增) 檢查 editForm 是否已載入
  if (!editForm.value) {
    return null;
  }

  // (新增) 根據角色決定要讀取哪個 URL 欄位
  let imageUrl = null;
  if (authStore.userRole === "雇主") {
    imageUrl = editForm.value.company_logo_url; // 讀取雇主的 logo
  } else if (authStore.userRole === "自由工作者") {
    imageUrl = editForm.value.avatar_url; // 讀取工作者的 avatar
  }

  // (保持不變) 組合 URL 的邏輯
  if (imageUrl) {
    // 檢查是否為 GCS 或外部 URL
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    // 組合本地開發 URL (e.g., /static/...)
    console.log("Combining avatar URL:", `${API_BASE_URL}${imageUrl}`);
    return `${API_BASE_URL}${imageUrl}`;
  }

  // 如果沒有 URL，回傳 null，el-avatar 會顯示 icon
  return null;
});

// (新增) 輔助函式：確保 social_links 欄位存在
const ensureSocialLinks = (formObject) => {
  if (!formObject.social_links) {
    formObject.social_links = {};
  }
  if (!formObject.social_links.github) {
    formObject.social_links.github = "";
  }
  if (!formObject.social_links.linkedin) {
    formObject.social_links.linkedin = "";
  }
  return formObject;
};

const loadProfileData = async () => {
  try {
    const profileRes = await getMyProfile();

    if (profileRes.data) {
      profile.value = profileRes.data;

      // (修改) 使用輔助函式確保欄位存在
      editForm.value = cloneDeep(ensureSocialLinks(profile.value));

      console.log("Loaded profile:", profile.value);

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
    ElMessage.error("Failed to load profile");
  }
};

onMounted(async () => {
  isLoading.value = true;
  await loadProfileData();
  isLoading.value = false;
});

const handleCreateProfile = async () => {
  isSubmitting.value = true;
  let dataToSend = {};

  // (修改) social_links 已在 createForm 中
  const social_links = {
    github: createForm.social_links.github || "",
    linkedin: createForm.social_links.linkedin || "",
  };

  if (authStore.userRole === "自由工作者") {
    dataToSend = {
      full_name: createForm.full_name,
      bio: createForm.bio,
      phone: createForm.phone,
      avatar_url: createForm.avatar_url || null,
      social_links: social_links, // <-- (修改)
    };
  } else if (authStore.userRole === "雇主") {
    dataToSend = {
      company_name: createForm.company_name,
      company_bio: createForm.company_bio,
      contact_email: createForm.contact_email,
      contact_phone: createForm.contact_phone,
      company_logo_url: createForm.company_logo_url || null,
      social_links: social_links, // <-- (修改)
    };
  } else {
    ElMessage.error("Unknown user role");
    isSubmitting.value = false;
    return;
  }

  try {
    const res = await createMyProfile(dataToSend);
    profile.value = res.data;

    // (修改) 使用輔助函式
    editForm.value = cloneDeep(ensureSocialLinks(res.data));

    ElMessage.success("Profile created successfully!");

    if (authStore.userRole === "自由工作者") {
      const tagsRes = await getAllTags();
      allTags.value = tagsRes.data;
      activeTab.value = "skills";
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "Creation failed");
  }
  isSubmitting.value = false;
};

const handleUpdateProfile = async () => {
  isSubmitting.value = true;
  try {
    const dataToSend = {
      ...editForm.value,
      avatar_url: editForm.value.avatar_url || null,
      company_logo_url: editForm.value.company_logo_url || null,
    };

    const res = await updateMyProfile(dataToSend);
    profile.value = res.data;
    editForm.value = cloneDeep(ensureSocialLinks(res.data)); // (修改)
    isEditing.value = false;
    ElMessage.success("Basic info updated successfully");
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "Update failed");
  }
  isSubmitting.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
  editForm.value = cloneDeep(ensureSocialLinks(profile.value)); // (修改)
};

const handleUpdateSkills = async () => {
  isSubmitting.value = true;
  try {
    const res = await updateMySkills(selectedSkillIds.value);
    profile.value.skills = res.data;
    ElMessage.success("Skills updated successfully");

    // (新增) 需求：切換回 "basic" tab
    activeTab.value = "basic";
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "Skill update failed");
    selectedSkillIds.value = profile.value.skills.map(
      (userSkill) => userSkill.tag.tag_id
    );
  }
  isSubmitting.value = false;
};
</script>

<style lang="scss" scoped>
/* (新增) 需求：全域背景色 */
.profile-view-wrapper {
  /* 注意：這只會改變這個頁面的背景。
    要改變 "所有介面"，應在 App.vue 或 main.scss 的 body/html 上設定 
  */
  // --- 1. Define New Palette ---
  --app-bg-color: rgba(250, 247, 239, 0.973); // Soft beige
  --app-text-color: #616130;
  --app-text-color-secondary: #8a8a69;
  --app-hover-border-color: #dcd8c8;
  --app-hover-bg-color: rgba(252, 250, 248, 1); // More opaque
  --app-accent-color: #817c5b; // Muted olive-brown
  --app-warning-color: #c6a870; // Muted gold
  --app-danger-color: #b56f6f; // Brownish-red
  --app-info-bg-color: rgba(220, 216, 200, 0.3); // Muted beige bg for tags

  // --- 2. Override Element Plus Vars ---
  // This is the cleanest way to override the palette
  // It will affect all children Element Plus components within this view
  --el-text-color-primary: var(--app-text-color);
  --el-text-color-regular: var(--app-text-color);
  --el-text-color-secondary: var(--app-text-color-secondary);
  --el-text-color-placeholder: #a2a287;

  --el-bg-color: var(--app-bg-color);
  --el-bg-color-overlay: var(--app-hover-bg-color);
  --el-fill-color-light: var(--app-hover-bg-color);
  --el-fill-color-blank: transparent; // Make backgrounds transparent

  --el-card-bg-color: var(--app-bg-color);
  --el-card-border-color: transparent; // No borders on cards by default

  --el-border-color: var(--app-hover-border-color);
  --el-border-color-lighter: rgba(220, 216, 200, 0.5);
  --el-border-color-light: var(--app-hover-border-color);

  --el-color-primary: var(--app-accent-color);
  --el-color-primary-light-9: var(--app-info-bg-color);

  --el-color-warning: var(--app-warning-color);
  --el-color-warning-light-9: var(--app-info-bg-color);

  --el-color-info: var(--app-text-color-secondary);
  --el-color-info-light-9: var(--app-info-bg-color);

  --el-color-danger: var(--app-danger-color);
  --el-color-danger-light-9: rgba(181, 111, 111, 0.1);

  // --- 3. Apply Base Styles ---
  padding: 20px;
  color: var(--app-text-color);
  min-height: calc(100vh - 60px); // 假設 Navbar 高 60px
}

/* (新增) 需求：自訂 Element Plus 顏色 */
/* 我們使用 :deep() 來覆蓋 Element Plus 在此元件內的 CSS 變數。
  注意：這只會影響此 ProfileView.vue 及其子元件。
  要 "統一調整所有介面"，應在 src/styles/main.scss 中設定 :root {}。
*/
:deep() {
  /* 按鈕主色 */
  --el-color-primary: #a79c7f;
  --el-color-primary-dark-2: #7d7561; /* (Hover 色) */
  --el-color-primary-light-3: #c3bba9;
  --el-color-primary-light-5: #d4cec0;
  --el-color-primary-light-7: #e5e2d8;
  --el-color-primary-light-8: #eceae3;
  --el-color-primary-light-9: #f6f5f1;

  /* Checkbox 選中顏色 */
  --el-checkbox-checked-bg-color: #a79c7f;
  --el-checkbox-checked-icon-color: #ffffff;
  --el-checkbox-checked-border-color: #a79c7f;

  /* Tabs 選中顏色 */
  --el-tabs-header-border-color: #e0e0e0;
  --el-tabs-tab-active-text-color: #a79c7f;
  --el-tabs-tab-active-border-color: #a79c7f;
}
/* (新增結束) */

.profile-tabs {
  :deep(.el-tabs__content) {
    min-height: 200px;
  }
}
.skill-checkbox {
  margin: 5px;
}

/* (新增) 需求：Icon 樣式 */
.icon-label {
  display: flex;
  align-items: center;
  gap: 8px;
  .social-icon {
    width: 16px;
    height: 16px;
  }
}

// (!! 修正 !!)：加入頭貼樣式
.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;

  .el-avatar {
    border: 2px solid var(--el-border-color-lighter);
    /* (!! 修正 !!)：將備用 icon 放大以匹配 150px 的尺寸 */
    font-size: 75px;
    // 確保圖片正確顯示
    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
