<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
      <div class="font-bold text-lg text-turquoise">Logistics Control</div>

      <button
        v-if="!auth.isAuthenticated"
        class="text-sm text-gray-500 hover:text-turquoise transition-colors"
        @click="showLogin = true"
      >
        Вход
      </button>
      <div v-else class="flex items-center gap-3 text-sm">
        <span class="text-gray-500 hidden sm:inline">{{ auth.user?.email }}</span>
        <AppButton variant="outline" size="sm" @click="auth.logout()">Выйти</AppButton>
      </div>
    </header>

    <main class="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12">
      <h1 class="text-2xl sm:text-4xl font-bold mb-4">
        {{ settings.items.h1 || settings.items.site_title || "Logistics Control" }}
      </h1>
      <p class="text-gray-600 leading-relaxed">
        {{ settings.items.site_description || "Проект готов. Настройки можно менять в админке после входа." }}
      </p>

      <section v-if="auth.isAuthenticated" class="mt-10 bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <h2 class="text-lg font-bold mb-4">Настройки</h2>
        <form class="space-y-4" @submit.prevent="save">
          <AppInput v-model="form.site_title" label="Название сайта" />
          <AppInput v-model="form.h1" label="Заголовок H1" />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              v-model="form.site_description"
              rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none transition-colors"
            />
          </div>
          <AppButton variant="primary" type="submit" :disabled="saving">
            {{ saving ? "Сохранение..." : "Сохранить" }}
          </AppButton>
        </form>
      </section>
    </main>

    <LoginModal :show="showLogin" @close="onLoginClose" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.js";
import { useSettingsStore } from "@/stores/settings.js";
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";
import LoginModal from "@/components/LoginModal.vue";

const auth = useAuthStore();
const settings = useSettingsStore();

const showLogin = ref(false);
const saving = ref(false);
const form = reactive({ site_title: "", h1: "", site_description: "" });

function fillForm() {
  form.site_title = settings.items.site_title || "";
  form.h1 = settings.items.h1 || "";
  form.site_description = settings.items.site_description || "";
}

onMounted(async () => {
  await settings.fetch();
  fillForm();
  if (auth.token) await auth.checkSession();
});

function onLoginClose() {
  showLogin.value = false;
  if (auth.isAuthenticated) fillForm();
}

async function save() {
  saving.value = true;
  try {
    await settings.update({ ...form });
    fillForm();
  } finally {
    saving.value = false;
  }
}
</script>
