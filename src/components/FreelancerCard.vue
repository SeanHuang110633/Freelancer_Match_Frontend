<template>
  <router-link :to="`/freelancers/${profile.user_id}`" class="freelancer-link">
    <el-card class="freelancer-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-avatar :size="40" :src="profile.avatar_url" />
          <div class="header-info">
            <span class="freelancer-name">{{ profile.full_name }}</span>
            <!-- <span class="freelancer-email">{{ profile.user.email }}</span> -->
          </div>
          <el-tag effect="light" round>
            {{ profile.reputation_score.toFixed(1) }}
          </el-tag>
        </div>
      </template>

      <p class="freelancer-bio">
        {{
          profile.bio
            ? profile.bio.substring(0, 100) +
              (profile.bio.length > 100 ? "..." : "")
            : "No bio provided."
        }}
      </p>

      <div class="freelancer-skills">
        <el-tag
          v-for="skill in profile.skills.slice(0, 5)"
          :key="skill.tag.tag_id"
          type="info"
          size="small"
          class="skill-tag"
        >
          {{ skill.tag.name }}
        </el-tag>
        <el-tag
          v-if="profile.skills.length > 5"
          size="small"
          type="info"
          class="skill-tag"
        >
          +{{ profile.skills.length - 5 }} more
        </el-tag>
      </div>
    </el-card>
  </router-link>
</template>

<script setup>
import { User } from "@element-plus/icons-vue";

defineProps({
  profile: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
/* (新增) 連結樣式 */
.freelancer-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.freelancer-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* (套用) 柔和風格 */
  border: 1px solid var(--el-border-color);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  .freelancer-link:hover & {
    border-color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-light);
  }

  /* (套用) 顏色 */
  :deep() {
    --el-text-color-primary: #616130;
    --el-text-color-regular: #616130;
    --el-text-color-secondary: #7d7561;
    --el-fill-color-lighter: #f6f5f1;
    --el-border-color-lighter: #eceae3;
  }

  :deep(.el-card__header) {
    padding: 10px 15px;
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-info {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      overflow: hidden;
    }
    .freelancer-name {
      font-weight: bold;
      color: var(--el-text-color-primary);
    }
    .freelancer-email {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :deep(.el-card__body) {
    padding: 15px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .freelancer-bio {
    color: var(--el-text-color-regular);
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
  }
  .freelancer-skills {
    font-size: 12px;
    .skill-tag {
      margin: 2px 4px 2px 0;
      background-color: var(--el-fill-color-lighter);
      border-color: var(--el-border-color-lighter);
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
