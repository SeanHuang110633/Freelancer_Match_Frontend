<template>
  <div class="chat-view-container">
    <el-row class="chat-layout-row">
      <el-col :xs="24" :sm="8" :md="7" class="room-list-col">
        <el-card class="room-list-card" shadow="never">
          <template #header>
            <div class="room-list-header">
              <span>我的聊天室</span>
              <el-icon
                :class="{ loading: chatStore.isLoadingRooms }"
                @click="chatStore.fetchRooms"
                ><Refresh
              /></el-icon>
            </div>
          </template>

          <el-scrollbar>
            <el-menu
              v-if="chatStore.rooms.length > 0"
              :default-active="chatStore.activeRoomId"
              class="room-list-menu"
              @select="handleRoomSelect"
            >
              <el-menu-item
                v-for="room in chatStore.rooms"
                :key="room.room_id"
                :index="room.room_id"
              >
                <el-icon><ChatDotRound /></el-icon>
                <template #title>
                  <span class="room-title">{{ getRoomDisplayName(room) }}</span>
                </template>
              </el-menu-item>
            </el-menu>
            <el-empty
              v-else-if="!chatStore.isLoadingRooms"
              description="目前沒有聊天室"
              :image-size="80"
            />
          </el-scrollbar>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="16" :md="17" class="chat-box-col">
        <el-card class="chat-box-card" shadow="never">
          <template #header>
            <div class="chat-box-header">
              <span v-if="chatStore.activeRoom">{{
                getRoomDisplayName(chatStore.activeRoom)
              }}</span>
              <span v-else>請選擇一個聊天室</span>
              <el-tag
                v-if="chatStore.activeRoomId"
                :type="chatStore.isConnected ? 'success' : 'info'"
                size="small"
                effect="dark"
              >
                {{
                  chatStore.isConnected
                    ? "已連線"
                    : chatStore.isConnecting
                    ? "連線中..."
                    : "已斷線"
                }}
              </el-tag>
            </div>
          </template>

          <ChatBox
            v-if="chatStore.activeRoomId"
            :messages="chatStore.messages"
            :is-connected="chatStore.isConnected"
            @send-message="handleSendMessage"
          />
          <el-empty v-else description="請從左側選擇一個聊天室開始對話" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// (修正) 移除 ref, watch, nextTick，因為邏輯移到 ChatBox 中
import { onMounted, computed } from "vue";
import { useChatStore } from "@/store/chatStore.js"; // 步驟四
import { useAuthStore } from "@/store/authStore.js"; // 步驟一

// (修正) 匯入 ChatBox 元件
import ChatBox from "@/components/ChatBox.vue";
import {
  Refresh,
  ChatDotRound,
  // (修正) Promotion 移至 ChatBox
} from "@element-plus/icons-vue";

const chatStore = useChatStore();
const authStore = useAuthStore();

// (修正) 移除 newMessage 和 messageContainer，邏輯移至 ChatBox

// --- 載入聊天室 ---
onMounted(() => {
  chatStore.fetchRooms();
});

// --- 處理聊天室選擇 ---
const handleRoomSelect = (roomId) => {
  chatStore.selectRoom(roomId);
};

// --- 處理訊息發送 ---
// (修正) 此函式現在由 ChatBox 元件觸發 (@sendMessage)
const handleSendMessage = (content) => {
  chatStore.sendChatMessage(content);
};

// --- 輔助函式 ---
// (修正) getRoomDisplayName 保持不變
const getRoomDisplayName = (room) => {
  if (!room) return "Loading...";
  // 1. (新邏輯) 優先使用專案標題
  console.log("Room data:", room);
  if (room.project && room.project.title) {
    return room.project.title; //
  }

  // 2. (舊邏輯) 如果沒有專案標題，則 fallback 回顯示對方使用者
  const otherParticipant = room.participants.find(
    (p) => p.user_id !== authStore.user?.user_id
  );

  // (優化) 假設 participant 上有關聯的 user (來自 Repo 優化)
  if (otherParticipant && otherParticipant.user) {
    return `與 ${otherParticipant.user.email.split("@")[0]} 的對話`;
  }

  return otherParticipant
    ? `與 ${otherParticipant.user_id.substring(0, 8)}... 的對話`
    : room.room_id;
};

// (修正) isSender 和 formatTime 移至 ChatBox

// (修正) 自動滾動邏輯移至 ChatBox
</script>

<style lang="scss" scoped>
/* (修正) 大部分樣式被移至 ChatBox.vue，這裡只保留佈局樣式 */

.chat-view-container {
  height: 100%;
  padding: 10px;
  background-color: #f4f4f5;
}

.chat-layout-row {
  height: 100%;
}

.room-list-col,
.chat-box-col {
  height: 100%;
  display: flex;
}

.room-list-card,
.chat-box-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-card__header) {
    flex-shrink: 0;
  }
  :deep(.el-card__body) {
    flex-grow: 1;
    height: 100%;
    padding: 0; /* (修正) ChatBox 內部有 padding，這裡設為 0 */
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

// 左側：聊天室列表
.room-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .el-icon {
    cursor: pointer;
    &.loading {
      animation: spin 1s linear infinite;
    }
  }
}
.room-list-menu {
  border-right: none;
}
.room-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 右側：聊天視窗
.chat-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* (修正) .message-display-area 和 .message-input-area 樣式已移至 ChatBox.vue */
/* (修正) .message-bubble-* 樣式已移至 ChatBox.vue */

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
