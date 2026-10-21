<template>
  <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm whitespace-nowrap">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3 font-medium">Номер заявки</th>
            <th class="text-left px-4 py-3 font-medium">Дата и время</th>
            <th class="text-left px-4 py-3 font-medium">Юр. лицо</th>
            <th class="text-left px-4 py-3 font-medium">Отгрузка</th>
            <th class="text-left px-4 py-3 font-medium">Доставка</th>
            <th class="text-left px-4 py-3 font-medium">Фракция</th>
            <th class="text-left px-4 py-3 font-medium">Объём</th>
            <th class="text-left px-4 py-3 font-medium">Авто</th>
            <th class="text-left px-4 py-3 font-medium">Комментарий</th>
            <th class="text-right px-4 py-3 font-medium">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="orders.loading">
            <td colspan="10" class="px-4 py-8 text-center text-gray-400">Загрузка...</td>
          </tr>
          <tr v-else-if="!orders.items.length">
            <td colspan="10" class="px-4 py-8 text-center text-gray-400">Заявок нет</td>
          </tr>
          <tr
            v-for="o in orders.items"
            :key="o.id"
            class="border-t border-gray-100 hover:bg-gray-50"
          >
            <td class="px-4 py-3 font-mono">{{ o.order_number }}</td>
            <td class="px-4 py-3">{{ o.order_at?.replace("T", " ") }}</td>
            <td class="px-4 py-3">{{ o.legal_entity }}</td>
            <td class="px-4 py-3">{{ o.loading_site }}</td>
            <td class="px-4 py-3">{{ o.destination_site }}</td>
            <td class="px-4 py-3">{{ o.fraction }}</td>
            <td class="px-4 py-3">{{ o.volume }} {{ o.volume_unit }}</td>
            <td class="px-4 py-3">{{ o.vehicle }}</td>
            <td class="px-4 py-3 max-w-[220px] truncate" :title="o.comment">{{ o.comment || "—" }}</td>
            <td class="px-4 py-3 text-right">
              <button class="text-turquoise hover:underline mr-3" @click="$emit('edit', o)">Изменить</button>
              <button class="text-red-500 hover:underline" @click="confirmDelete(o)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
      Всего: {{ orders.total }}
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
