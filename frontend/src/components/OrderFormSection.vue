<template>
  <section id="order-form" class="bg-white rounded-2xl border border-gray-200 p-6">
    <h2 class="text-xl font-bold mb-6">Заказ на отгрузку</h2>

    <form class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit.prevent="submit">
      <AppSelect
        v-model="form.legal_entity_id"
        label="Юр. лицо"
        :options="nameOptions('legal-entities')"
        required
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Дата и время</label>
        <input
          v-model="form.order_at"
          type="datetime-local"
          required
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none transition-colors"
        />
      </div>

      <AppSelect
        v-model="form.loading_site_id"
        label="Площадка отгрузки"
        :options="nameOptions('loading-sites')"
        required
      />
      <AppSelect
        v-model="form.destination_site_id"
        label="Площадка доставки"
        :options="nameOptions('destination-sites')"
        required
      />
      <AppSelect
        v-model="form.fraction_id"
        label="Название фракции"
        :options="nameOptions('fractions')"
        required
      />
      <AppSelect
        v-model="form.volume_id"
        label="Объём, т"
        :options="volumeOptions"
        required
      />
      <AppSelect
        v-model="form.vehicle_id"
        label="Номер авто"
        :options="nameOptions('vehicles', 'number')"
        required
      />

      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
        <textarea
          v-model="form.comment"
          rows="3"
          placeholder="Необязательно"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none transition-colors"
        />
      </div>

      <div class="md:col-span-2">
        <AppButton variant="primary" size="lg" type="submit" :disabled="saving || dict.loading">
          {{ saving ? "Сохранение..." : "Сохранить" }}
        </AppButton>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useDictionariesStore } from "@/stores/dictionaries.js";
import { useOrdersStore } from "@/stores/orders.js";
import AppSelect from "@/components/ui/AppSelect.vue";
import AppButton from "@/components/ui/AppButton.vue";

const dict = useDictionariesStore();
const orders = useOrdersStore();
const toast = useToast();

const saving = ref(false);

const emptyForm = () => ({
  legal_entity_id: "",
  order_at: "",
  loading_site_id: "",
  destination_site_id: "",
  fraction_id: "",
  volume_id: "",
  vehicle_id: "",
  comment: "",
});

const form = reactive(emptyForm());

function nameOptions(type, field = "name") {
  return dict.active(type).map((item) => ({ value: item.id, label: item[field] }));
}

const volumeOptions = computed(() =>
  dict.active("volumes").map((v) => ({ value: v.id, label: `${v.value} ${v.unit || "т"}` }))
);

onMounted(() => {
  dict.fetchAll();
});

async function submit() {
  saving.value = true;
  try {
    const payload = {
      legal_entity_id: Number(form.legal_entity_id),
      order_at: form.order_at,
      loading_site_id: Number(form.loading_site_id),
      destination_site_id: Number(form.destination_site_id),
      fraction_id: Number(form.fraction_id),
      volume_id: Number(form.volume_id),
      vehicle_id: Number(form.vehicle_id),
      comment: form.comment,
    };
    await orders.create(payload);
    toast.success("Заявка сохранена");
    Object.assign(form, emptyForm());
  } finally {
    saving.value = false;
  }
}
</script>
