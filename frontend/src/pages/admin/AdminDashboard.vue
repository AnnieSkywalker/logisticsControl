<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <router-link to="/" class="font-bold text-lg text-turquoise">Logistics Control</router-link>
        <span class="text-sm text-gray-400 hidden sm:inline">Админка</span>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <span class="text-gray-500 hidden sm:inline">{{ auth.user?.email }}</span>
        <AppButton variant="outline" size="sm" @click="logout">Выйти</AppButton>
      </div>
    </header>

    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div class="flex gap-2">
          <button
            class="px-4 py-2 rounded-lg text-sm transition-colors"
            :class="tab === 'orders' ? 'bg-turquoise text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'"
            @click="tab = 'orders'"
          >
            Заявки
          </button>
          <button
            class="px-4 py-2 rounded-lg text-sm transition-colors"
            :class="tab === 'dict' ? 'bg-turquoise text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'"
            @click="tab = 'dict'"
          >
            Справочники
          </button>
        </div>

        <AppButton v-if="tab === 'orders'" variant="primary" @click="orders.exportFile()">
          Экспорт в Excel
        </AppButton>
      </div>

      <div v-show="tab === 'orders'" class="space-y-4">
        <OrdersFilterBar />

        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-sm transition-colors"
            :class="view === 'table' ? 'bg-turquoise text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'"
            @click="setView('table')"
          >
            Таблица
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm transition-colors"
            :class="view === 'cards' ? 'bg-turquoise text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'"
            @click="setView('cards')"
          >
            Плашки
          </button>
        </div>

        <OrdersTable v-if="view === 'table'" @edit="openEdit" />
        <OrdersCards v-else @edit="openEdit" />
      </div>

      <DictionariesManager v-show="tab === 'dict'" />

      <OrderEditModal :show="showEdit" :order="editing" @close="showEdit = false" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useOrdersStore } from "@/stores/orders.js";
import { useDictionariesStore } from "@/stores/dictionaries.js";
import AppButton from "@/components/ui/AppButton.vue";
import OrdersFilterBar from "@/components/OrdersFilterBar.vue";
import OrdersTable from "@/components/OrdersTable.vue";
import OrdersCards from "@/components/OrdersCards.vue";
import OrderEditModal from "@/components/OrderEditModal.vue";
import DictionariesManager from "@/components/DictionariesManager.vue";

const router = useRouter();
const auth = useAuthStore();
const orders = useOrdersStore();
const dict = useDictionariesStore();

const tab = ref("orders");
const view = ref("table");
const showEdit = ref(false);
const editing = ref(null);

onMounted(() => {
  dict.fetchAll();
  orders.fetch({}, { page: 1, limit: 200 });
});

function setView(v) {
  view.value = v;
  orders.fetch(orders.filters, { page: 1, limit: v === "cards" ? 10 : 200 });
}

function openEdit(order) {
  editing.value = order;
  showEdit.value = true;
}

function logout() {
  auth.logout();
  router.push("/");
}
</script>
