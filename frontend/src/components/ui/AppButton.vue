<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none',
      variant === 'primary'
        ? 'bg-turquoise text-white hover:bg-turquoise-dark'
        : variant === 'outline'
          ? 'border-2 border-turquoise text-turquoise hover:bg-turquoise hover:text-white'
          : 'text-gray-600 hover:text-turquoise',
      size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-8 py-3 text-lg' : 'px-5 py-2.5 text-base',
      rounded ? 'rounded-full' : 'rounded-lg',
      block ? 'w-full' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: "primary" },
  size: { type: String, default: "md" },
  rounded: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
</script>
