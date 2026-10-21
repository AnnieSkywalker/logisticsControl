<template>
  <AppModal :show="show" max-width="md:max-w-2xl" @close="$emit('close')">
    <h2 class="text-xl font-bold mb-6">Заявка {{ form.order_number }}</h2>

    <form class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit.prevent="save">
      <AppSelect v-model="form.legal_entity_id" label="Юр. лицо" :options="nameOptions('legal-entities')" required />
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Дата и время</label>
        <input
          v-model="form.order_at"
          type="datetime-local"
          required
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none"
        />
      </div>
      <AppSelect v-model="form.loading_site_id" label="Площадка отгрузки" :options="nameOptions('loading-sites')" required />
      <AppSelect v-model="form.destination_site_id" label="Площадка доставки" :options="nameOptions('destination-sites')" required />
      <AppSelect v-model="form.fraction_id" label="Фракция" :options="nameOptions('fractions')" required />
      <AppSelect v-model="form.volume_id" label="Объём, т" :options="volumeOptions" required />
      <AppSelect v-model="form.vehicle_id" label="Номер авто" :options="nameOptions('vehicles', 'number')" required />
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
        <textarea v-model="form.comment" rows="3" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none" />
      </div>
      <div class="md:col-span-2 flex gap-3">
        <AppButton variant="primary" type="submit" :disabled="saving">{{ saving ? "Сохранение..." : "Сохранить" }}</AppButton>
        <AppButton variant="outline" type="button" @click="$emit('close')">Отмена</AppButton>
      </div>
    </form>
  </AppModal>
</template>

<script setup>
import { reactive, ref, computed, watch } from "vue";
import { useDictionariesStore } from "@/stores/dictionaries.js";
import { useOrdersStore } from "@/stores/orders.js";
import AppModal from "@/components/ui/AppModal.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import AppButton from "@/components/ui/AppButton.vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  order: { type: Object, default: null },
});
const emit = defineEmits(["close"]);

const dict = useDictionariesStore();
const orders = useOrdersStore();
const saving = ref(false);

const form = reactive({
  id: null,
  order_number: "",
  legal_entity_id: "",
  order_at: "",
  loading_site_id: "",
  destination_site_id: "",
  fraction_id: "",
  volume_id: "",
  vehicle_id: "",
  comment: "",
});

function nameOptions(type, field = "name") {
  return dict.active(type).map((item) => ({ value: item.id, label: item[field] }));
}
const volumeOptions = computed(() =>
  dict.active("volumes").map((v) => ({ value: v.id, label: `${v.value} ${v.unit || "т"}` }))
);

watch(
  () => props.order,
  (o) => {
    if (!o) return;
    Object.assign(form, {
      id: o.id,
      order_number: o.order_number,
      legal_entity_id: o.legal_entity_id,
      order_at: o.order_at,
      loading_site_id: o.loading_site_id,
      destination_site_id: o.destination_site_id,
      fraction_id: o.fraction_id,
      volume_id: o.volume_id,
      vehicle_id: o.vehicle_id,
      comment: o.comment || "",
    });
  }
);

async function save() {
  saving.value = true;
  try {
    await orders.update(form.id, {
      legal_entity_id: Number(form.legal_entity_id),
      order_at: form.order_at,
      loading_site_id: Number(form.loading_site_id),
      destination_site_id: Number(form.destination_site_id),
      fraction_id: Number(form.fraction_id),
      volume_id: Number(form.volume_id),
      vehicle_id: Number(form.vehicle_id),
      comment: form.comment,
    });
    emit("close");
  } finally {
    saving.value = false;
  }
}
</script>
