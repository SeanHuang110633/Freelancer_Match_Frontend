<template>
  <canvas ref="canvasRef" id="network-canvas"></canvas>

  <el-row class="auth-container" justify="center" align="middle">
    <el-col :xs="22" :sm="12" :md="8" :lg="6" class="auth-col">
      <el-card class="auth-card transparent-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="main-title" style="color: #616130"
              >Freelancer Match</span
            >
            <p class="slogan" style="color: #616130">
              Where talent meets demand
            </p>
          </div>
        </template>

        <component
          :is="isLoginMode ? LoginForm : RegisterForm"
          @switch-mode="toggleMode"
        />
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import LoginForm from "@/components/auth/LoginForm.vue";
import RegisterForm from "@/components/auth/RegisterForm.vue";

const isLoginMode = ref(true);
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
};

// --- 動態背景 Canvas 邏輯 ---

const canvasRef = ref(null);
let animationFrameId = null;

let ctx;
let width;
let height;
let particles = [];
const particleCount = 60;
const maxDistance = 150;
const icons = [
  "👤",
  "👥",
  "🧑‍💼",
  "👩‍💻",
  "📈",
  "📄",
  "💼",
  "👔",
  "🧑‍🔬",
  "🧑‍🚀",
  "👩‍🎨",
  "🧑‍⚖️",
];

// 節點 (粒子) 類別
class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;

    // 節點(圓形)大小 (半徑)
    this.radius = 18; // <-- 從 12 增加到 14

    this.icon = icons[Math.floor(Math.random() * icons.length)];

    // --- 可調整 ---
    // 調整 icon (Emoji) 大小，基於節點半徑
    this.fontSize = this.radius * 1.8; // <-- 從 1.5 增加到 1.6，讓 icon 稍大
  }

  draw() {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(210, 230, 255, 0.2)";
    ctx.fill();
    ctx.strokeStyle = "rgba(180, 210, 255, 0.4)";
    ctx.stroke();
    ctx.font = `${this.fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#555";
    ctx.fillText(this.icon, this.x, this.y + 1);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < this.radius || this.x > width - this.radius) this.vx *= -1;
    if (this.y < this.radius || this.y > height - this.radius) this.vy *= -1;
  }
}

// 初始化
function initCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  particles.length = 0;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

// 連接節點
function connect() {
  if (!ctx) return;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance;

        // --- 可調整 ---
        // 調整連線顏色和透明度 (rgba 最後一個值是透明度)
        // 顏色調得更深一點 (opacity 乘數從 0.4 增加到 0.6)
        ctx.strokeStyle = `rgba(180, 210, 255, ${opacity * 0.9})`;

        // --- 可調整 ---
        // 調整連線粗細
        ctx.lineWidth = 2.0; // <-- 從 1 增加到 1.5

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

// 動畫迴圈
function animate() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  connect();
  animationFrameId = requestAnimationFrame(animate);
}

// 處理視窗大小變化
const handleResize = () => {
  initCanvas();
};

// Vue 生命週期掛鉤
onMounted(() => {
  initCanvas();
  animate();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style lang="scss" scoped>
/* 畫布樣式 */
#network-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* 放置在內容之後 */
  background-color: rgba(252, 250, 248, 0.8); /* 溫和的奶茶色背景 */
}

.auth-container {
  height: 100%;
  position: relative; /* 確保在畫布之上 */
  z-index: 1;
}

/* 限制登入框的最大寬度，同 max-w-xs (20rem) */
.auth-col {
  max-width: 360px;
}

/* (新增) 毛玻璃透明卡片樣式 */
.auth-card.transparent-card {
  // 把這個背景色變成可以調整透明度
  background-color: rgba(255, 255, 255, 0.8); /* bg-white/70 */
  // background-color: rgba(255, 255, 255, 0.9); /* bg-white/90 */
  backdrop-filter: blur(4px); /* backdrop-blur-sm */
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04); /* shadow-xl */

  /* 覆蓋 Element Plus 預設背景和邊框 */
  --el-card-bg-color: transparent;
  border: none;
}

/* (新增) 確保 Card Header 也是透明的 */
:deep(.el-card__header) {
  background-color: transparent;
  border-bottom: none; /* 移除預設底線 */
}

/* (新增) 調整 body padding */
:deep(.el-card__body) {
  padding-top: 0;
}

/* (修改) Card Header 樣式 */
.card-header {
  text-align: center;
  .main-title {
    display: block;
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 5px;
  }
  .slogan {
    margin: 0;
    font-size: 0.9rem;
  }
}
</style>
