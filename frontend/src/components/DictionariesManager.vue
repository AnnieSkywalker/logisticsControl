<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6">
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="t in types"
        :key="t.key"
        class="px-3 py-1.5 rounded-lg text-sm transition-colors"
        :class="activeType === t.key ? 'bg-turquoise text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        @click="activeType = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <form class="flex gap-2 mb-6" @submit.prevent="add">
      <input
        v-model="newValue"
        :type="currentType.key === 'volumes' ? 'number' : 'text'"
        :placeholder="addPlaceholder"
        class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none"
      />
      <AppButton variant="primary" type="submit" :disabled="!newValue">Добавить</AppButton>
    </form>

    <ul class="divide-y divide-gray-100">
      <li
        v-for="item in dict.items[activeType]"
        :key="item.id"
        class="flex items-center gap-3 py-3"
      >
        <template v-if="editingId === item.id">
          <input
            v-model="editValue"
            :type="currentType.key === 'volumes' ? 'number' : 'text'"
            class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg outline-none"
          />
          <button class="text-turquoise hover:underline text-sm" @click="saveEdit(item)">ОК</button>
          <button class="text-gray-400 hover:underline text-sm" @click="editingId = null">Отмена</button>
        </template>
        <template v-else>
          <span class="flex-1" :class="item.is_active ? '' : 'text-gray-400 line-through'">
            {{ display(item) }}
          </span>
          <button class="text-sm text-gray-500 hover:text-turquoise" @click="startEdit(item)">Изменить</button>
          <button class="text-sm text-gray-500 hover:text-turquoise" @click="toggleActive(item)">
            {{ item.is_active ? "Отключить" : "Включить" }}
          </button>
          <button class="text-sm text-red-500 hover:underline" @click="removeItem(item)">Удалить</button>
        </template>
      </li>
      <li v-if="!dict.items[activeType].length" class="py-6 text-center text-gray-400">
        Список пуст
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useDictionariesStore, DICTIONARY_TYPES } from "@/stores/dictionaries.js";
import AppButton from "@/components/ui/AppButton.vue";

const dict = useDictionariesStore();
const types = DICTIONARY_TYPES;

const activeType = ref(types[0].key);
const newValue = ref("");
const editingId = ref(null);
const editValue = ref("");

const currentType = computed(() => types.find((t) => t.key === activeType.value));
const addPlaceholder = computed(() =>
  currentType.value.key === "volumes" ? "Объём в тоннах, напр. 20" : "Новое значение"
);

onMounted(() => {
  if (!dict.items[activeType.value].length) dict.fetchAll();
});

function display(item) {
  if (currentType.value.key === "volumes") return `${item.value} ${item.unit || "т"}`;
  return item[currentType.value.field];
}

function payload(value) {
  const field = currentType.value.field;
  const val = currentType.value.key === "volumes" ? Number(value) : value;
  return { [field]: val };
}

async function add() {
  if (!newValue.value) return;
  await dict.create(activeType.value, payload(newValue.value));
  newValue.value = "";
}

function startEdit(item) {
  editingId.value = item.id;
  editValue.value = item[currentType.value.field];
}

async function saveEdit(item) {
  await dict.update(activeType.value, item.id, payload(editValue.value));
  editingId.value = null;
}

async function toggleActive(item) {
  await dict.update(activeType.value, item.id, { is_active: !item.is_active });
}

async function removeItem(item) {
  if (window.confirm(`Удалить «${display(item)}»?`)) {
    await dict.remove(activeType.value, item.id);
  }
}
</script>
