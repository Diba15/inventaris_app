<script setup>
import { ref, computed } from 'vue'
import Eye from './Eye.vue'
import EyeWithSlash from './EyeWithSlash.vue'

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
  name: {
    type: String,
    default: '',
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
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'update:handlePriceInput'])

// State
const isFocused = ref(false)
const showPassword = ref(false)

// Computed
const hasError = computed(() => !!props.errorMessage)
const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})
const isPasswordField = computed(() => props.type === 'password')

// Methods
const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}

const handlePriceInput = (event) => {
  emit('handlePriceInput', event)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="relative">
    <input
      v-if="id !== 'product_price'"
      :id="id"
      :type="inputType"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :name="name"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="handleFocus"
      @blur="handleBlur"
      class="floating-input"
      :class="{
        error: hasError,
        disabled: disabled,
        filled: modelValue || isFocused,
        'with-icon': isPasswordField,
      }"
      placeholder=" "
      autocomplete="off"
    />

    <input
      v-else
      :id="id"
      :type="inputType"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :name="name"
      @input="handlePriceInput"
      @focus="handleFocus"
      @blur="handleBlur"
      class="floating-input"
      :class="{
        error: hasError,
        disabled: disabled,
        filled: modelValue || isFocused,
        'with-icon': isPasswordField,
      }"
      placeholder=" "
      autocomplete="off"
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
    </label>

    <!-- Password toggle button -->
    <button
      v-if="isPasswordField"
      type="button"
      @click="togglePasswordVisibility"
      class="password-toggle"
      :class="{ error: hasError }"
      tabindex="-1"
    >
      <!-- Eye open icon (password hidden - click to show) -->
      <Eye v-if="!showPassword" class="password-icon" />

      <!-- Eye closed icon (password visible - click to hide) -->
      <EyeWithSlash v-else class="password-icon" />
    </button>

    <!-- Error message -->
    <div v-if="hasError && errorMessage" class="mt-1 text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.floating-input {
  display: block;
  width: 100%;
  padding: 12px 8px 4px 8px;
  font-size: 16px;
  color: black;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.floating-input.with-icon {
  padding-right: 45px;
}

.floating-input:focus {
  border-color: #f2b418;
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
  background-color: white;
  padding: 0 4px;
}

.floating-label.active {
  top: 0;
  transform: translateY(-50%);
  font-size: 12px;
  color: #f2b418;
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
  color: #f2b418;
}

.floating-input.error:focus + .floating-label,
.floating-input.error.filled + .floating-label {
  color: #ef4444;
}

.floating-input.disabled:focus + .floating-label,
.floating-input.disabled.filled + .floating-label {
  color: #9ca3af;
}

/* Password toggle button */
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.password-toggle:hover {
  color: #f2b418;
}

.password-toggle.error {
  color: #ef4444;
}

.password-toggle.error:hover {
  color: #dc2626;
}

.password-icon {
  width: 20px;
  height: 20px;
}

/* Fix autocomplete styling */
.floating-input:-webkit-autofill,
.floating-input:-webkit-autofill:hover,
.floating-input:-webkit-autofill:focus,
.floating-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  -webkit-text-fill-color: black !important;
  transition: background-color 5000s ease-in-out 0s !important;
  background-clip: content-box !important;
}
</style>
