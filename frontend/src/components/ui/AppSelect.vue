<template>
  <div>
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :required="required"
      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-turquoise focus:border-turquoise outline-none transition-colors"
      @change="onChange"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: "" },
  label: { type: String, default: "" },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: "— выберите —" },
  required: { type: Boolean, default: false },
  selectId: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

function onChange(e) {
  emit("update:modelValue", e.target.value);
}
</script>
