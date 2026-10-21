import { defineStore } from "pinia";
import client from "@/api/client.js";

function cleanFilters(filters) {
  const params = {};
  for (const [key, value] of Object.entries(filters || {})) {
    if (value !== "" && value !== null && value !== undefined) params[key] = value;
  }
  return params;
}

export const useOrdersStore = defineStore("orders", {
  state: () => ({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    filters: {},
  }),
  getters: {
    totalPages: (state) => Math.max(1, Math.ceil(state.total / state.limit)),
  },
  actions: {
    async create(payload) {
      const { data } = await client.post("/orders", payload);
      return data;
    },
    async fetch(filters = this.filters, opts = {}) {
      this.filters = { ...filters };
      if (opts.page !== undefined) this.page = opts.page;
      if (opts.limit !== undefined) this.limit = opts.limit;
      this.loading = true;
      try {
        const { data } = await client.get("/orders", {
          params: { ...cleanFilters(this.filters), page: this.page, limit: this.limit },
        });
        this.items = data.items;
        this.total = data.total;
      } finally {
        this.loading = false;
      }
    },
    goToPage(page) {
      const target = Math.min(Math.max(1, page), this.totalPages);
      if (target !== this.page) this.fetch(this.filters, { page: target });
    },
    async update(id, payload) {
      await client.put(`/orders/${id}`, payload);
      await this.fetch();
    },
    async remove(id) {
      await client.delete(`/orders/${id}`);
      await this.fetch();
    },
    async exportFile() {
      const res = await client.get("/orders/export", {
        params: cleanFilters(this.filters),
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  },
});
