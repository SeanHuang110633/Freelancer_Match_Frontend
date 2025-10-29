import { createRouter, createWebHistory } from "vue-router";
// (我們等一下會建立這兩個 View)
import AuthView from "@/views/auth/AuthView.vue";
import HomeView from "@/views/HomeView.vue";
import ProfileView from "@/views/profile/ProfileView.vue";
import JobCreateView from "@/views/employer/JobCreateView.vue";
import JobListView from "@/views/freelancer/JobListView.vue";
import ProjectDetailView from "@/views/project/ProjectDetailView.vue";
import FreelancerDetailView from "@/views/freelancer/FreelancerDetailView.vue";
import MyJobListView from "@/views/employer/MyJobListView.vue";
const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "Login",
    component: AuthView,
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfileView,
  },
  // (新增) 雇主刊登案件
  {
    path: "/post-job",
    name: "JobCreate",
    component: JobCreateView,
    // (可選，但建議) 加上 meta 標記，未來可用於路由守衛
    meta: { requiresRole: "雇主" },
  },

  // (新增) 工作者搜尋案件
  {
    path: "/find-jobs",
    name: "JobList",
    component: JobListView,
    meta: { requiresRole: "自由工作者" },
  },
  // (新增) 專案詳情頁面
  {
    path: "/projects/:projectId", // 使用動態路由參數
    name: "ProjectDetail",
    component: ProjectDetailView,
    // (可選) 加上 meta，確保只有登入者能看
    meta: { requiresAuth: true },
  },
  // (新增) 工作者詳情頁面
  {
    path: "/freelancers/:userId", // 使用 User ID
    name: "FreelancerDetail",
    component: FreelancerDetailView,
    meta: { requiresAuth: true },
  },
  // (新增) 雇主查看自己刊登的案件
  {
    path: "/my-jobs",
    name: "MyJobList",
    component: MyJobListView,
    meta: { requiresRole: "雇主" }, // 限制只有雇主能訪問
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
