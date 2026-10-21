<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
      <div class="font-bold text-lg text-turquoise">Logistics Control</div>

      <div v-if="!auth.isAuthenticated">
        <button
          class="text-sm text-gray-500 hover:text-turquoise transition-colors"
          @click="showLogin = true"
        >
          Вход
        </button>
      </div>
      <div v-else class="flex items-center gap-3 text-sm">
        <router-link to="/admin" class="text-turquoise hover:underline">Админка</router-link>
        <span class="text-gray-500 hidden sm:inline">{{ auth.user?.email }}</span>
        <AppButton variant="outline" size="sm" @click="auth.logout()">Выйти</AppButton>
      </div>
    </header>

    <main class="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
      <h1 class="text-2xl sm:text-3xl font-bold mb-2">Оформление отгрузки</h1>
      <p class="text-gray-600 mb-8">Заполните форму — заявка попадёт в систему учёта.</p>

      <OrderFormSection />
    </main>

    <LoginModal :show="showLogin" @close="onLoginClose" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.js";
import AppButton from "@/components/ui/AppButton.vue";
import LoginModal from "@/components/LoginModal.vue";
import OrderFormSection from "@/components/OrderFormSection.vue";

const auth = useAuthStore();
const showLogin = ref(false);

onMounted(() => {
  if (auth.token) auth.checkSession();
});

function onLoginClose() {
  showLogin.value = false;
}
</script>
