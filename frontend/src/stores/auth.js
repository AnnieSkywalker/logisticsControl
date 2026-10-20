import { defineStore } from "pinia";
import axios from "axios";
import client from "@/api/client.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refresh_token") || null,
    loginId: null,
    pendingEmail: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async checkEmail(email) {
      const { data } = await client.post("/auth/check-email", { email });
      this.pendingEmail = email;
      return data.type;
    },
    async login(email, password) {
      const { data } = await client.post("/auth/login", { email, password });
      if (data.step === "2fa") {
        this.loginId = data.loginId;
        return { step: "2fa" };
      }
      this.setSession(data);
      return { step: "ok" };
    },
    async verify2fa(code) {
      const { data } = await client.post("/auth/verify-2fa", {
        loginId: this.loginId,
        code,
      });
      this.loginId = null;
      this.setSession(data);
      return { step: "ok" };
    },
    async resend2fa() {
      await client.post("/auth/resend-2fa", { loginId: this.loginId });
    },
    setSession(data) {
      this.token = data.token;
      this.user = data.user;
      if (data.refreshToken) this.refreshToken = data.refreshToken;
      localStorage.setItem("token", data.token);
      if (data.refreshToken) localStorage.setItem("refresh_token", data.refreshToken);
    },
    async checkSession() {
      if (!this.token) return;
      try {
        const { data } = await client.get("/auth/me");
        this.user = data;
      } catch {
        this.logout();
      }
    },
    logout() {
      if (this.refreshToken) {
        axios.post("/api/auth/logout", { refreshToken: this.refreshToken }).catch(() => {});
      }
      this.token = null;
      this.user = null;
      this.loginId = null;
      this.pendingEmail = null;
      this.refreshToken = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
    },
  },
});
