<template>
  <div class="relative">
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="handleFocus"
      @blur="handleBlur"
      class="floating-input"
      :class="{
        error: hasError,
        disabled: disabled,
        filled: modelValue || isFocused,
      }"
      placeholder=" "
    />
    <label
      :for="id"
      class="floating-label"
      :class="{
        error: hasError,
        disabled: disabled,
        active: modelValue || isFocused,
      }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Error message -->
    <div v-if="hasError && errorMessage" class="mt-1 text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

// State
const isFocused = ref(false)

// Computed
const hasError = computed(() => !!props.errorMessage)

// Methods
const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}
</script>

<style scoped>
.floating-input {
  display: block;
  width: 100%;
  padding: 20px 12px 8px 12px;
  font-size: 16px;
  color: #d1d5db;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.floating-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.floating-input.error {
  border-color: #ef4444;
}

.floating-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.floating-input.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.floating-label {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  font-size: 16px;
  color: #6b7280;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 10;
  background-color: #272838;
  padding: 0 4px;
}

.floating-label.active {
  top: 0;
  transform: translateY(-50%);
  font-size: 12px;
  color: #6366f1;
}

.floating-label.error.active {
  color: #ef4444;
}

.floating-label.disabled {
  color: #9ca3af;
}

/* Ensure label moves when input has value or is focused */
.floating-input:focus + .floating-label,
.floating-input.filled + .floating-label {
  top: 0;
  transform: translateY(-50%);
  font-size: 12px;
  color: #6366f1;
}

.floating-input.error:focus + .floating-label,
.floating-input.error.filled + .floating-label {
  color: #ef4444;
}

.floating-input.disabled:focus + .floating-label,
.floating-input.disabled.filled + .floating-label {
  color: #9ca3af;
}
</style>
