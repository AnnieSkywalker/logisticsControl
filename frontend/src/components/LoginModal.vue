<template>
  <AppModal :show="show" max-width="md:max-w-md" @close="$emit('close')">
    <h2 class="text-2xl font-bold mb-6 text-center">
      {{ title }}
    </h2>

    <form v-if="step === 'email'" @submit.prevent="submitEmail" class="space-y-4">
      <AppInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="Ваш email"
        required
      />
      <p v-if="unknownError" class="text-sm text-red-500 text-center">{{ unknownError }}</p>
      <AppButton variant="primary" size="lg" block type="submit" :disabled="loading">
        {{ loading ? 'Проверка...' : 'Продолжить' }}
      </AppButton>
    </form>

    <form v-else-if="step === 'password'" @submit.prevent="submitPassword" class="space-y-4">
      <p class="text-sm text-gray-500 text-center">{{ email }}</p>
      <AppInput
        v-model="password"
        label="Пароль"
        type="password"
        placeholder="••••••••"
        required
      />
      <AppButton variant="primary" size="lg" block type="submit" :disabled="loading">
        {{ loading ? 'Вход...' : 'Войти' }}
      </AppButton>
      <button type="button" class="w-full text-center text-sm text-gray-400 hover:text-gray-600" @click="step = 'email'">
        ← Назад
      </button>
    </form>

    <form v-else @submit.prevent="submit2fa" class="space-y-4">
      <p class="text-sm text-gray-500 text-center">Код из 4 цифр отправлен на {{ email }}</p>
      <input
        v-model="code"
        inputmode="numeric"
        maxlength="4"
        placeholder="••••"
        required
        class="w-full text-center text-2xl tracking-[0.5em] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none transition-colors"
      />
      <AppButton variant="primary" size="lg" block type="submit" :disabled="loading">
        {{ loading ? 'Проверка...' : 'Подтвердить' }}
      </AppButton>
      <button
        type="button"
        class="w-full text-center text-sm text-gray-400 hover:text-turquoise disabled:opacity-50"
        :disabled="cooldown > 0 || loading"
        @click="resend"
      >
        {{ cooldown > 0 ? `Отправить повторно через ${cooldown}с` : 'Отправить код повторно' }}
      </button>
    </form>
  </AppModal>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth.js";
import { useToast } from "vue-toastification";
import AppModal from "@/components/ui/AppModal.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";

const props = defineProps({ show: { type: Boolean, default: false } });
const emit = defineEmits(["close"]);

const auth = useAuthStore();

const step = ref("email");
const email = ref("");
const password = ref("");
const code = ref("");
const loading = ref(false);
const cooldown = ref(0);
const unknownError = ref("");
let timer = null;

const title = computed(() => {
  if (step.value === "password") return "Вход";
  if (step.value === "2fa") return "Подтверждение";
  return "Вход";
});

watch(
  () => props.show,
  (v) => {
    if (v) {
      step.value = "email";
      email.value = "";
      password.value = "";
      code.value = "";
      unknownError.value = "";
      cooldown.value = 0;
    }
  }
);

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

async function submitEmail() {
  loading.value = true;
  unknownError.value = "";
  try {
    const type = await auth.checkEmail(email.value);
    if (type === "user") {
      step.value = "password";
    } else {
      unknownError.value = "Такой email не зарегистрирован.";
    }
  } finally {
    loading.value = false;
  }
}

async function submitPassword() {
  loading.value = true;
  try {
    const res = await auth.login(email.value, password.value);
    if (res.step === "2fa") {
      step.value = "2fa";
      startCooldown();
    } else {
      finish();
    }
  } finally {
    loading.value = false;
  }
}

async function submit2fa() {
  loading.value = true;
  try {
    await auth.verify2fa(code.value);
    finish();
  } finally {
    loading.value = false;
  }
}

async function resend() {
  try {
    await auth.resend2fa();
    useToast().success("Код отправлен повторно");
    startCooldown();
  } catch {}
}

function startCooldown() {
  cooldown.value = 60;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    cooldown.value -= 1;
    if (cooldown.value <= 0) clearInterval(timer);
  }, 1000);
}

function finish() {
  emit("close");
}
</script>
