import axios from "axios";
import { useToast } from "vue-toastification";

const client = axios.create({
  baseURL: "/api",
});

let refreshPromise = null;

function readTokens() {
  return {
    token: localStorage.getItem("token"),
    refreshToken: localStorage.getItem("refresh_token"),
  };
}

async function tryRefresh() {
  const { refreshToken } = readTokens();
  if (!refreshToken) throw new Error("Нет refresh-токена");
  const { data } = await axios.post("/api/auth/refresh", { refreshToken });
  localStorage.setItem("token", data.token);
  if (data.refreshToken) localStorage.setItem("refresh_token", data.refreshToken);
  return data;
}

function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = tryRefresh()
      .catch((err) => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

client.interceptors.request.use((config) => {
  const { token } = readTokens();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isMutation(method) {
  return ["post", "put", "patch", "delete"].includes(method?.toLowerCase());
}

client.interceptors.response.use(
  (res) => {
    if (isMutation(res.config.method)) {
      const toast = useToast();
      const msg = res.config.method === "delete" ? "Удалено" : "Сохранено";
      toast.success(msg);
    }
    return res;
  },
  async (err) => {
    const url = err.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/login")
      || url.includes("/auth/refresh")
      || url.includes("/auth/logout")
      || url.includes("/auth/check-email")
      || url.includes("/auth/verify-2fa")
      || url.includes("/auth/resend-2fa");
    const retried = err.config?._retried;

    if (err.response?.status === 401 && !isAuthEndpoint && !retried) {
      try {
        const tokens = await refreshOnce();
        err.config._retried = true;
        err.config.headers.Authorization = `Bearer ${tokens.token}`;
        return client(err.config);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
      }
    }

    const toast = useToast();
    const msg = err.response?.data?.error || "Ошибка запроса";
    toast.error(msg);
    return Promise.reject(err);
  }
);

export default client;
