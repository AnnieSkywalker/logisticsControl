import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue";
import AdminDashboard from "@/pages/admin/AdminDashboard.vue";
import { useAuthStore } from "@/stores/auth.js";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminDashboard,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore();
    if (!auth.isAuthenticated) return next("/");
    if (!auth.user) {
      try {
        await auth.checkSession();
      } catch {}
    }
    if (!auth.isAuthenticated) return next("/");
  }
  next();
});

export default router;
