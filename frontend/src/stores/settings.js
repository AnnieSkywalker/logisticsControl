import { defineStore } from "pinia";
import client from "@/api/client.js";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    items: {},
    loading: false,
  }),
  actions: {
    async fetch() {
      this.loading = true;
      try {
        const { data } = await client.get("/settings");
        this.items = data;
      } finally {
        this.loading = false;
      }
    },
    async update(payload) {
      const { data } = await client.put("/settings", payload);
      this.items = data;
    },
  },
});
