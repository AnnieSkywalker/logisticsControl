<template>
  <Dialog :open="show" @close="$emit('close')" class="relative z-50">
    <div class="fixed inset-0 bg-black/40" aria-hidden="true" />

    <div class="fixed inset-0 flex items-end md:items-center justify-center">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-y-full md:opacity-0 md:translate-y-0 md:scale-95"
        enter-to-class="translate-y-0 md:opacity-100 md:scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="translate-y-0 md:opacity-100 md:scale-100"
        leave-to-class="translate-y-full md:opacity-0 md:translate-y-0 md:scale-95"
      >
        <DialogPanel
          v-if="show"
          :class="[
            'relative w-full bg-white shadow-xl',
            'max-h-[90vh] md:max-h-[85vh] overflow-y-auto',
            'rounded-t-2xl md:rounded-2xl',
            'md:mx-4',
            maxWidth,
          ]"
        >
          <button
            class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
            @click="$emit('close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="p-6 md:p-8 overflow-x-hidden">
            <slot />
          </div>
        </DialogPanel>
      </Transition>
    </div>
  </Dialog>
</template>

<script setup>
import { Dialog, DialogPanel } from "@headlessui/vue";

defineProps({
  show: { type: Boolean, default: false },
  maxWidth: { type: String, default: "md:max-w-lg" },
});

defineEmits(["close"]);
</script>
