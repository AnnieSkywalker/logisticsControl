import { defineStore } from "pinia";
import client from "@/api/client.js";

export const DICTIONARY_TYPES = [
  { key: "legal-entities", field: "name", label: "Юр. лица" },
  { key: "loading-sites", field: "name", label: "Площадки отгрузки" },
  { key: "destination-sites", field: "name", label: "Площадки доставки" },
  { key: "fractions", field: "name", label: "Фракции" },
  { key: "volumes", field: "value", label: "Объёмы, т" },
  { key: "vehicles", field: "number", label: "Номера авто" },
];

const EMPTY = () => ({
  "legal-entities": [],
  "loading-sites": [],
  "destination-sites": [],
  fractions: [],
  volumes: [],
  vehicles: [],
});

export const useDictionariesStore = defineStore("dictionaries", {
  state: () => ({
    items: EMPTY(),
    loading: false,
  }),
  getters: {
    active: (state) => (type) => state.items[type].filter((i) => i.is_active),
  },
  actions: {
    async fetchAll() {
      this.loading = true;
      try {
        const types = Object.keys(this.items);
        const results = await Promise.all(
          types.map((type) => client.get(`/dictionaries/${type}`))
        );
        types.forEach((type, i) => {
          this.items[type] = results[i].data;
        });
      } finally {
        this.loading = false;
      }
    },
    async fetchType(type) {
      const { data } = await client.get(`/dictionaries/${type}`);
      this.items[type] = data;
      return data;
    },
    async create(type, payload) {
      await client.post(`/dictionaries/${type}`, payload);
      await this.fetchType(type);
    },
    async update(type, id, payload) {
      await client.put(`/dictionaries/${type}/${id}`, payload);
      await this.fetchType(type);
    },
    async remove(type, id) {
      await client.delete(`/dictionaries/${type}/${id}`);
      await this.fetchType(type);
    },
  },
});
