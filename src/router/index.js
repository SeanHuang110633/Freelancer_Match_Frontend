import { createRouter, createWebHistory } from "vue-router";
import AuthView from "@/views/auth/AuthView.vue";
import HomeView from "@/views/HomeView.vue";
import ProfileView from "@/views/profile/ProfileView.vue";
import JobCreateView from "@/views/employer/JobCreateView.vue";
import JobListView from "@/views/freelancer/JobListView.vue";
import ProjectDetailView from "@/views/project/ProjectDetailView.vue";
import FreelancerDetailView from "@/views/freelancer/FreelancerDetailView.vue";
import MyJobListView from "@/views/employer/MyJobListView.vue";
import ProposalManagementView from "@/views/employer/ProposalManagementView.vue";
import MyProposalListView from "@/views/freelancer/MyProposalListView.vue";

// --- (M7) 匯入 M7 頁面 ---
// (規劃放 /views/shared/)
// 這是我們下一步 (Step 4 & 5) 將建立的新檔案
import ContractListView from "@/views/shared/ContractListView.vue";
import ContractView from "@/views/shared/ContractView.vue";
// --- (M7 結束) ---

// --- (M8.1 新增) 匯入 M8 聊天頁面 ---
import ChatView from "@/views/shared/ChatView.vue";
import JobEditView from "@/views/employer/JobEditView.vue";

import ProposalDetailView from "@/views/freelancer/ProposalDetailView.vue";

import FreelancerSearchView from "@/views/employer/FreelancerSearchView.vue";

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
  }, // (新增) 雇主刊登案件
  {
    path: "/post-job",
    name: "JobCreate",
    component: JobCreateView, // (可選，但建議) 加上 meta 標記，未來可用於路由守衛
    meta: { requiresRole: "雇主" },
  }, // (新增) 工作者搜尋案件

  {
    path: "/find-jobs",
    name: "JobList",
    component: JobListView,
    meta: { requiresRole: "自由工作者" },
  }, // (新增) 專案詳情頁面
  {
    path: "/projects/:projectId", // 使用動態路由參數
    name: "ProjectDetail",
    component: ProjectDetailView, // (可選) 加上 meta，確保只有登入者能看
    meta: { requiresAuth: true },
  },
  // (新增) 工作者詳情頁面
  {
    path: "/freelancers/:userId", // 使用 User ID
    name: "FreelancerDetail",
    component: FreelancerDetailView,
    meta: { requiresAuth: true },
  },
  // (新增) 雇主搜尋工作者路由
  {
    path: "/find-freelancers",
    name: "FreelancerSearch",
    component: FreelancerSearchView,
    meta: { requiresRole: "雇主" },
  },
  // (新增) 雇主查看自己刊登的案件
  {
    path: "/my-jobs",
    name: "MyJobList",
    component: MyJobListView,
    meta: { requiresRole: "雇主" }, // 限制只有雇主能訪問
  },
  // (新增) 編輯案件的路由
  {
    path: "/projects/:projectId/edit",
    name: "JobEdit",
    component: JobEditView,
    props: true, // 這會自動將 projectId 傳入 JobEditView.vue 作為 prop
    meta: { requiresRole: "雇主" },
  },
  {
    path: "/my-proposals",
    name: "MyProposalList",
    component: MyProposalListView,
    meta: { requiresRole: "自由工作者" },
  },
  {
    path: "/projects/:projectId/proposals",
    name: "ProposalManagement",
    component: ProposalManagementView,
    props: true, // 允許 :projectId 作為 props 傳入
    meta: { requiresRole: "雇主" },
  },
  // (新增) 需求三：工作者提案詳情頁
  {
    path: "/my-proposals/:proposalId",
    name: "ProposalDetail",
    component: ProposalDetailView,
    props: true, // 允許 :proposalId 作為 props 傳入
    meta: { requiresRole: "自由工作者" },
  },
  // --- (M7) 新增 M7 路由 ---
  {
    path: "/my-contracts",
    name: "ContractList", // M7.2 合約列表
    component: ContractListView,
    meta: { requiresAuth: true }, // 雙方都可看
  },
  {
    path: "/contracts/:contractId",
    name: "ContractDetail", // M7.2 詳情 & M7.3 編輯
    component: ContractView,
    props: true,
    meta: { requiresAuth: true }, // 雙方都可看
  },
  // --- (M7 結束) ---
  // --- (M8.1 新增) M8 聊天路由 ---
  {
    path: "/chat",
    name: "Chat",
    component: ChatView,
    meta: { requiresAuth: true }, // 必須登入才能聊天
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
