<template>
  <div class="chat-box-wrapper">
    <el-scrollbar class="message-display-area" ref="scrollbarRef">
      <div ref="messageContainerRef">
        <div
          v-for="msg in messages"
          :key="msg.message_id"
          class="message-bubble-wrapper"
          :class="{ 'is-sender': isSender(msg.sender_id) }"
        >
          <div class="message-bubble">
            <span class="sender-name" v-if="!isSender(msg.sender_id)">{{
              getSenderName(msg.sender)
            }}</span>
            <p class="message-content">{{ msg.content }}</p>
            <span class="message-time">{{ formatTime(msg.created_at) }}</span>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <div class="message-input-area">
      <el-input
        v-model="newMessage"
        placeholder="輸入訊息..."
        @keydown.enter.prevent="handleSendMessage"
        :disabled="!isConnected"
      >
        <template #append>
          <el-button
            @click="handleSendMessage"
            :disabled="!newMessage.trim() || !isConnected"
          >
            <el-icon><Promotion /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import { useAuthStore } from "@/store/authStore.js";
import { Promotion } from "@element-plus/icons-vue";

// --- Props & Emits ---

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
  isConnected: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["sendMessage"]);

// --- State ---

const authStore = useAuthStore();
const newMessage = ref("");
const scrollbarRef = ref(null);
const messageContainerRef = ref(null);

// --- 邏輯 ---

// 檢查是否為發送者 (用於 CSS)
const isSender = (senderId) => {
  return senderId === authStore.user?.user_id;
};

// 獲取發送者名稱
const getSenderName = (sender) => {
  // sender 是 MessageOut 上的 UserOut
  if (sender && sender.email) {
    return sender.email.split("@")[0]; // 顯示 email 前綴
  }
  return "對方";
};

// 格式化時間 (簡易版)
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- 發送訊息 ---
const handleSendMessage = () => {
  const content = newMessage.value.trim();
  if (!content || !props.isConnected) return;

  emit("sendMessage", content); // 觸發父元件 (ChatView) 的事件
  newMessage.value = ""; // 清空輸入框
};

// --- 自動滾動到底部 ---
const scrollToBottom = async () => {
  await nextTick();
  if (scrollbarRef.value) {
    scrollbarRef.value.setScrollTop(messageContainerRef.value.scrollHeight);
  }
};

// 監聽新訊息，自動滾動
watch(
  () => props.messages.length,
  () => {
    scrollToBottom();
  },
  { deep: true } // 確保在 messages 陣列變化時觸發
);
</script>

<style lang="scss" scoped>
.chat-box-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.message-display-area {
  flex-grow: 1;
  background-color: #ffffff;

  :deep(.el-scrollbar__view) {
    padding: 20px;
  }
}

.message-input-area {
  flex-shrink: 0;
  padding: 10px 20px;
  background-color: #f9f9f9;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* 聊天氣泡 (與 ChatView.vue 中完全相同) */
.message-bubble-wrapper {
  display: flex;
  margin-bottom: 15px;

  &:not(.is-sender) {
    justify-content: flex-start;
    .message-bubble {
      background-color: #f0f2f5;
      border-radius: 4px 18px 18px 18px;
    }
    .sender-name {
      color: #909399;
      font-size: 12px;
      margin-bottom: 4px;
    }
  }

  &.is-sender {
    justify-content: flex-end;
    .message-bubble {
      background-color: #d9ecff;
      color: #333;
      border-radius: 18px 4px 18px 18px;
    }
    .message-content {
      color: #000;
    }
  }
}

.message-bubble {
  padding: 10px 15px;
  max-width: 70%;

  .message-content {
    font-size: 14px;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .message-time {
    display: block;
    font-size: 11px;
    color: #909399;
    margin-top: 5px;
    text-align: right;
  }
}
</style>
