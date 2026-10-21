<template>
  <div>
    <div v-if="orders.loading" class="text-center text-gray-400 py-10">Загрузка...</div>
    <div v-else-if="!orders.items.length" class="text-center text-gray-400 py-10">Заявок нет</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="o in orders.items"
        :key="o.id"
        class="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col"
      >
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="font-mono text-xs text-gray-400">{{ o.order_number }}</span>
          <span class="text-xs text-gray-500 whitespace-nowrap">{{ o.order_at?.replace("T", " ") }}</span>
        </div>

        <div class="font-bold text-gray-900 mb-2">{{ o.legal_entity }}</div>

        <div class="text-sm text-gray-600 space-y-1 mb-3">
          <div class="flex gap-1.5">
            <span class="text-gray-400">Маршрут:</span>
            <span>{{ o.loading_site }} → {{ o.destination_site }}</span>
          </div>
          <div class="flex gap-1.5">
            <span class="text-gray-400">Фракция:</span>
            <span>{{ o.fraction }}</span>
          </div>
          <div class="flex gap-1.5">
            <span class="text-gray-400">Объём:</span>
            <span>{{ o.volume }} {{ o.volume_unit }}</span>
          </div>
          <div class="flex gap-1.5">
            <span class="text-gray-400">Авто:</span>
            <span>{{ o.vehicle }}</span>
          </div>
        </div>

        <p v-if="o.comment" class="text-sm text-gray-500 italic mb-3 line-clamp-2">{{ o.comment }}</p>

        <div class="mt-auto flex gap-3 pt-3 border-t border-gray-100">
          <button class="text-sm text-turquoise hover:underline" @click="$emit('edit', o)">Изменить</button>
          <button class="text-sm text-red-500 hover:underline" @click="confirmDelete(o)">Удалить</button>
        </div>
      </article>
    </div>

    <div v-if="orders.total > orders.limit" class="flex items-center justify-center gap-3 mt-6">
      <button
        class="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40"
        :disabled="orders.page <= 1"
        @click="orders.goToPage(orders.page - 1)"
      >
        ← Назад
      </button>
      <span class="text-sm text-gray-500">{{ orders.page }} / {{ orders.totalPages }}</span>
      <button
        class="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40"
        :disabled="orders.page >= orders.totalPages"
        @click="orders.goToPage(orders.page + 1)"
      >
        Вперёд →
      </button>
    </div>
  </div>
</template>

<script setup>
import { useOrdersStore } from "@/stores/orders.js";

const orders = useOrdersStore();
defineEmits(["edit"]);

function confirmDelete(order) {
  if (window.confirm(`Удалить заявку ${order.order_number}?`)) {
    orders.remove(order.id);
  }
}
</script>
