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
              <el-input v-model="createForm.phone" />
            </el-form-item>

            <el-form-item label="Avatar (Click to upload)" prop="avatar_url">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :http-request="
                  (options) =>
                    customUploadRequest(options, 'create', 'avatar_url')
                "
                :before-upload="beforeAvatarUpload"
              >
                <img
                  v-if="createForm.avatar_url"
                  :src="getPreviewUrl(createForm.avatar_url)"
                  class="avatar"
                />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="form-tip">
                Recommended: Square image, less than 2MB
              </div>
            </el-form-item>

            <el-form-item prop="github" label="GitHub"
              ><el-input v-model="createForm.social_links.github"
            /></el-form-item>
            <el-form-item prop="linkedin" label="LinkedIn"
              ><el-input v-model="createForm.social_links.linkedin"
            /></el-form-item>
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

            <el-form-item
              label="Company Logo (Click to upload)"
              prop="company_logo_url"
            >
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :http-request="
                  (options) =>
                    customUploadRequest(options, 'create', 'company_logo_url')
                "
                :before-upload="beforeAvatarUpload"
              >
                <img
                  v-if="createForm.company_logo_url"
                  :src="getPreviewUrl(createForm.company_logo_url)"
                  class="avatar"
                />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <el-form-item label="Contact Email" prop="contact_email"
              ><el-input v-model="createForm.contact_email"
            /></el-form-item>
            <el-form-item label="Contact Phone" prop="contact_phone"
              ><el-input v-model="createForm.contact_phone"
            /></el-form-item>
            <el-form-item prop="linkedin" label="LinkedIn"
              ><el-input v-model="createForm.social_links.linkedin"
            /></el-form-item>
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
                v-if="!isEditing"
                :size="150"
                :src="displayedAvatarUrl"
                :icon="UserFilled"
              />

              <el-upload
                v-else
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :http-request="
                  (options) =>
                    customUploadRequest(
                      options,
                      'edit',
                      authStore.userRole === '雇主'
                        ? 'company_logo_url'
                        : 'avatar_url'
                    )
                "
                :before-upload="beforeAvatarUpload"
              >
                <img
                  v-if="displayedAvatarUrl"
                  :src="displayedAvatarUrl"
                  class="avatar"
                />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
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

              <el-form-item label="GitHub">
                <el-input
                  v-model="editForm.social_links.github"
                  :disabled="!isEditing"
                />
              </el-form-item>
              <el-form-item label="LinkedIn">
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
              <el-form-item label="Contact Email"
                ><el-input
                  v-model="editForm.contact_email"
                  :disabled="!isEditing"
              /></el-form-item>
              <el-form-item label="Contact Phone"
                ><el-input
                  v-model="editForm.contact_phone"
                  :disabled="!isEditing"
              /></el-form-item>
              <el-form-item label="LinkedIn"
                ><el-input
                  v-model="editForm.social_links.linkedin"
                  :disabled="!isEditing"
              /></el-form-item>
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
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                :loading="isSubmitting"
                >Update Skills</el-button
              >
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>

<script setup>
// 1. 匯入 uploadAvatar
import { ref, onMounted, reactive, computed } from "vue";
import { useAuthStore } from "@/store/authStore.js";
import { ElMessage } from "element-plus";
import { Edit, UserFilled, Plus } from "@element-plus/icons-vue"; // 加入 Plus Icon
import {
  getMyProfile,
  createMyProfile,
  updateMySkills,
  updateMyProfile,
  uploadAvatar, // (新增)
} from "@/api/profile.js";
import { getAllTags } from "@/api/tags.js";
import { cloneDeep } from "lodash-es";
import { API_BASE_URL } from "@/config/env.js";

const authStore = useAuthStore();
const isLoading = ref(true);
const isSubmitting = ref(false);
const avatarLoading = ref(false); // (新增) 上傳讀取狀態
const activeTab = ref("basic");
const isEditing = ref(false);

const profile = ref(null);
const allTags = ref([]);
const selectedSkillIds = ref([]);

const createForm = reactive({
  full_name: "",
  bio: "",
  phone: "",
  avatar_url: "",
  social_links: { github: "", linkedin: "" },
  company_name: "",
  company_bio: "",
  company_logo_url: "",
  contact_email: "",
  contact_phone: "",
});

const editForm = ref(null);

// (新增) 輔助函式：為 Create Form 的圖片加上 Base URL
const getPreviewUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

// (保持不變) Computed for Edit Mode
const displayedAvatarUrl = computed(() => {
  if (!editForm.value) return null;
  let imageUrl = null;
  if (authStore.userRole === "雇主") {
    imageUrl = editForm.value.company_logo_url;
  } else if (authStore.userRole === "自由工作者") {
    imageUrl = editForm.value.avatar_url;
  }
  if (imageUrl) {
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  }
  return null;
});

// (保持不變) Load Data ...
const ensureSocialLinks = (formObject) => {
  if (!formObject.social_links) formObject.social_links = {};
  if (!formObject.social_links.github) formObject.social_links.github = "";
  if (!formObject.social_links.linkedin) formObject.social_links.linkedin = "";
  return formObject;
};

const loadProfileData = async () => {
  // ... (保持不變) ...
  try {
    const profileRes = await getMyProfile();
    if (profileRes.data) {
      profile.value = profileRes.data;
      editForm.value = cloneDeep(ensureSocialLinks(profile.value));
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

// --- (新增) 上傳相關邏輯 ---

// 1. 驗證檔案 (大小與類型)
const beforeAvatarUpload = (rawFile) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error("Avatar picture must be JPG, PNG or WEBP format!");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("Avatar picture size can not exceed 2MB!");
    return false;
  }
  return true;
};

// 2. 自定義上傳請求
const customUploadRequest = async (options, mode, fieldName) => {
  const { file, onSuccess, onError } = options;
  avatarLoading.value = true;
  try {
    // 呼叫 API
    const res = await uploadAvatar(file);
    // res.data = { url: "..." }

    // 更新表單資料
    if (mode === "create") {
      createForm[fieldName] = res.data.url;
    } else if (mode === "edit" && editForm.value) {
      editForm.value[fieldName] = res.data.url;
    }

    ElMessage.success("Image uploaded successfully!");
    onSuccess(res.data);
  } catch (error) {
    console.error(error);
    ElMessage.error("Image upload failed");
    onError(error);
  } finally {
    avatarLoading.value = false;
  }
};

// --- (保持不變) 提交表單邏輯 ---
const handleCreateProfile = async () => {
  // ... (保持不變) ...
  isSubmitting.value = true;
  let dataToSend = {};
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
      social_links: social_links,
    };
  } else if (authStore.userRole === "雇主") {
    dataToSend = {
      company_name: createForm.company_name,
      company_bio: createForm.company_bio,
      contact_email: createForm.contact_email,
      contact_phone: createForm.contact_phone,
      company_logo_url: createForm.company_logo_url || null,
      social_links: social_links,
    };
  } else {
    ElMessage.error("Unknown user role");
    isSubmitting.value = false;
    return;
  }

  try {
    const res = await createMyProfile(dataToSend);
    profile.value = res.data;
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
    // (修改) 確保傳送的是 editForm 中的 URL (可能剛被上傳更新過)
    const dataToSend = {
      ...editForm.value,
      avatar_url: editForm.value.avatar_url || null,
      company_logo_url: editForm.value.company_logo_url || null,
    };

    const res = await updateMyProfile(dataToSend);
    profile.value = res.data;
    editForm.value = cloneDeep(ensureSocialLinks(res.data));
    isEditing.value = false;
    ElMessage.success("Basic info updated successfully");
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "Update failed");
  }
  isSubmitting.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
  editForm.value = cloneDeep(ensureSocialLinks(profile.value));
};

const handleUpdateSkills = async () => {
  // ... (保持不變) ...
  isSubmitting.value = true;
  try {
    const res = await updateMySkills(selectedSkillIds.value);
    profile.value.skills = res.data;
    ElMessage.success("Skills updated successfully");
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
.profile-view-wrapper {
  margin-top: 20px;
}

.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 150px; /* 固定寬高 */
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa; // 淡灰背景

  &:hover {
    border-color: #a79c7fb0; /* 修改為主題色 */
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  text-align: center;
  display: flex; /* 確保 icon 置中 */
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 150px;
  height: 150px;
  display: block;
  object-fit: cover;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
}

/* 調整編輯區塊的 Avatar Container */
.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;

  /* 讓 el-upload 繼承樣式 */
  .avatar-uploader {
    border-radius: 50%; /* 如果想要圓形頭貼，可取消註解 */
  }
}

/* --- 主題樣式覆蓋 (Theme Overrides) --- */

/* Button */
:deep(.el-button--primary) {
  background-color: #a79c7fb0;
  border-color: #a79c7fb0;

  &:hover,
  &:focus {
    background-color: #7d7561b0;
    border-color: #7d7561b0;
  }
}

/* Radio */
:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #a79c7fb0;
  background: #a79c7fb0;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #a79c7fb0;
}

/* Checkbox (for Skills) */
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #a79c7fb0;
  border-color: #a79c7fb0;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #a79c7fb0;
}

/* Tabs */
:deep(.el-tabs__item.is-active) {
  color: #616130;
  font-weight: bold;
}

:deep(.el-tabs__item:hover) {
  color: #a79c7fb0;
}
</style>
