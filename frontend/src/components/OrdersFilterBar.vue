<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
    <AppSelect
      v-model="local.vehicle_id"
      label="Номер авто"
      :options="nameOptions('vehicles', 'number')"
      placeholder="Все"
    />
    <AppSelect
      v-model="local.legal_entity_id"
      label="Юр. лицо"
      :options="nameOptions('legal-entities')"
      placeholder="Все"
    />

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Дата</label>
      <input v-model="local.date" type="date" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Период с</label>
      <input v-model="local.date_from" type="date" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">по</label>
      <input v-model="local.date_to" type="date" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none" />
    </div>

    <div class="flex gap-2 lg:col-span-5">
      <AppButton variant="primary" @click="apply">Применить</AppButton>
      <AppButton variant="outline" @click="reset">Сбросить</AppButton>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { useDictionariesStore } from "@/stores/dictionaries.js";
import { useOrdersStore } from "@/stores/orders.js";
import AppSelect from "@/components/ui/AppSelect.vue";
import AppButton from "@/components/ui/AppButton.vue";

const dict = useDictionariesStore();
const orders = useOrdersStore();

const local = reactive({
  vehicle_id: "",
  legal_entity_id: "",
  date: "",
  date_from: "",
  date_to: "",
});

function nameOptions(type, field = "name") {
  return dict.active(type).map((item) => ({ value: item.id, label: item[field] }));
}

onMounted(() => {
  if (!dict.items.vehicles.length) dict.fetchAll();
  Object.assign(local, orders.filters);
});

function apply() {
  orders.fetch({ ...local });
}

function reset() {
  Object.assign(local, { vehicle_id: "", legal_entity_id: "", date: "", date_from: "", date_to: "" });
  orders.fetch({});
}
</script>
