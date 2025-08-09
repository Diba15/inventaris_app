<template>
  <div class="relative" ref="autocompleteRef">
    <div class="relative">
      <input
        :id="id"
        type="text"
        :value="displayValue"
        :disabled="disabled"
        :required="required"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        class="autocomplete-input"
        :class="{
          'error': hasError,
          'disabled': disabled,
          'filled': displayValue || isFocused,
          'dropdown-open': isDropdownOpen
        }"
        autocomplete="off"
      />

      <label
        :for="id"
        class="autocomplete-label"
        :class="{
          'error': hasError,
          'disabled': disabled,
          'active': displayValue || isFocused,
        }"
      >
        {{ label }}
        <span v-if="required" class="text-red-500 ml-1">*</span>
      </label>

      <!-- Clear button -->
      <button
        v-if="selectedValue && !disabled"
        type="button"
        @click="clearSelection"
        class="clear-button"
        tabindex="-1"
      >
        <svg class="clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Dropdown arrow -->
      <button
        type="button"
        @click="toggleDropdown"
        class="dropdown-arrow"
        :class="{
          'open': isDropdownOpen,
          'with-clear': selectedValue && !disabled
        }"
        tabindex="-1"
      >
        <svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <!-- Dropdown Options -->
    <div
      v-show="isDropdownOpen && filteredOptions.length > 0"
      class="dropdown-menu"
    >
      <div class="dropdown-content">
        <div
          v-for="(option, index) in filteredOptions"
          :key="getOptionValue(option)"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
          class="dropdown-option"
          :class="{
            'highlighted': index === highlightedIndex,
            'selected': getOptionValue(option) === selectedValue
          }"
        >
          {{ getOptionLabel(option) }}
        </div>
      </div>
    </div>

    <!-- No results -->
    <div
      v-show="isDropdownOpen && filteredOptions.length === 0 && searchQuery"
      class="dropdown-menu"
    >
      <div class="dropdown-content">
        <div class="dropdown-option no-results">
          No results found
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="hasError && errorMessage" class="mt-1 text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

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
  placeholder: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number, Object],
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  optionLabel: {
    type: String,
    default: 'label', // Key untuk label dari object
  },
  optionValue: {
    type: String,
    default: 'value', // Key untuk value dari object
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
  filterOnFocus: {
    type: Boolean,
    default: true,
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'select'])

// Refs
const autocompleteRef = ref(null)
const isFocused = ref(false)
const isDropdownOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const selectedValue = ref(props.modelValue)

// Computed
const hasError = computed(() => !!props.errorMessage)

const displayValue = computed(() => {
  // Selama user sedang mengetik (focus dan ada searchQuery), tampilkan searchQuery
  if (isFocused.value && searchQuery.value !== '') {
    return searchQuery.value
  }

  // Jika ada selectedValue dan user tidak sedang mengetik, tampilkan label yang dipilih
  if (selectedValue.value && (!isFocused.value || searchQuery.value === '')) {
    const selectedOption = props.options.find(option =>
      getOptionValue(option) === selectedValue.value
    )
    return selectedOption ? getOptionLabel(selectedOption) : ''
  }

  return searchQuery.value
})

const filteredOptions = computed(() => {
  // Jika tidak ada searchQuery, tampilkan semua options
  if (!searchQuery.value || searchQuery.value.trim() === '') {
    return props.options
  }

  // Filter berdasarkan searchQuery
  return props.options.filter(option => {
    const label = getOptionLabel(option)
    return label.toLowerCase().includes(searchQuery.value.toLowerCase().trim())
  })
})

// Methods
const getOptionLabel = (option) => {
  if (typeof option === 'string' || typeof option === 'number') {
    return option.toString()
  }
  return option[props.optionLabel] || ''
}

const getOptionValue = (option) => {
  if (typeof option === 'string' || typeof option === 'number') {
    return option
  }
  return option[props.optionValue] || option
}

const handleInput = (event) => {
  const inputValue = event.target.value
  searchQuery.value = inputValue

  // Jika user menghapus semua text, reset selectedValue
  if (inputValue === '') {
    selectedValue.value = ''
    emit('update:modelValue', '')
  }

  // Buka dropdown jika belum terbuka
  if (!isDropdownOpen.value) {
    isDropdownOpen.value = true
  }
  highlightedIndex.value = -1
}

const handleFocus = (event) => {
  isFocused.value = true

  // Jika ada selectedValue, set searchQuery ke kosong untuk memungkinkan pencarian baru
  if (selectedValue.value) {
    searchQuery.value = ''
  }

  if (props.filterOnFocus) {
    isDropdownOpen.value = true
  }
  emit('focus', event)
}

const handleBlur = (event) => {
  // Delay blur to allow click events on dropdown
  setTimeout(() => {
    isFocused.value = false
    isDropdownOpen.value = false

    // Jika ada searchQuery tapi tidak ada yang dipilih, reset
    if (searchQuery.value && !selectedValue.value) {
      searchQuery.value = ''
    }

    // Jika user keluar tanpa memilih apapun dan field kosong, pastikan tetap kosong
    if (!selectedValue.value) {
      searchQuery.value = ''
    }

    emit('blur', event)
  }, 200)
}

const handleKeydown = (event) => {
  if (!isDropdownOpen.value) {
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      isDropdownOpen.value = true
      return
    }
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (highlightedIndex.value < filteredOptions.value.length - 1) {
        highlightedIndex.value++
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--
      }
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      isDropdownOpen.value = false
      highlightedIndex.value = -1
      break
  }
}

const selectOption = (option) => {
  const value = getOptionValue(option)
  selectedValue.value = value
  searchQuery.value = ''
  isDropdownOpen.value = false
  highlightedIndex.value = -1

  emit('update:modelValue', value)
  emit('select', option)
}

const clearSelection = () => {
  selectedValue.value = ''
  searchQuery.value = ''
  emit('update:modelValue', '')
}

const toggleDropdown = () => {
  if (props.disabled) return

  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    nextTick(() => {
      const input = autocompleteRef.value?.querySelector('input')
      input?.focus()
    })
  }
}

// Watch for external modelValue changes
const updateSelectedValue = () => {
  selectedValue.value = props.modelValue
  // Reset searchQuery when modelValue changes externally
  if (!isFocused.value) {
    searchQuery.value = ''
  }
}

// Handle click outside
const handleClickOutside = (event) => {
  if (autocompleteRef.value && !autocompleteRef.value.contains(event.target)) {
    isDropdownOpen.value = false
    highlightedIndex.value = -1
  }
}

onMounted(() => {
  updateSelectedValue()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.autocomplete-input {
  display: block;
  width: 100%;
  padding: 12px 8px 4px 8px;
  font-size: 16px;
  color: #1f2937;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.autocomplete-input:focus,
.autocomplete-input.dropdown-open {
  border-color: #f2b418;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.autocomplete-input.error {
  border-color: #ef4444;
}

.autocomplete-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.autocomplete-input.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.autocomplete-label {
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

.autocomplete-label.active {
  top: 0;
  transform: translateY(-50%);
  font-size: 12px;
  color: #f2b418;
}

.autocomplete-label.error.active {
  color: #ef4444;
}

.autocomplete-label.disabled {
  color: #9ca3af;
}

/* Label positioning rules */
.autocomplete-input:focus + .autocomplete-label,
.autocomplete-input.filled + .autocomplete-label {
  top: 0;
  transform: translateY(-50%);
  font-size: 12px;
  color: #f2b418;
}

.autocomplete-input.error:focus + .autocomplete-label,
.autocomplete-input.error.filled + .autocomplete-label {
  color: #ef4444;
}

.dropdown-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
  z-index: 10;
}

.dropdown-arrow:hover {
  color: #f2b418;
}

.dropdown-arrow.open {
  transform: translateY(-50%) rotate(180deg);
}

.dropdown-arrow.with-clear {
  right: 12px;
}

.clear-button {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #9ca3af;
  transition: all 0.2s ease;
  z-index: 10;
}

.clear-button:hover {
  color: #ef4444;
}

.clear-icon {
  width: 16px;
  height: 16px;
}

.arrow-icon {
  width: 20px;
  height: 20px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 2px;
}

.dropdown-content {
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  color: #1f2937;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.dropdown-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid #f3f4f6;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover,
.dropdown-option.highlighted {
  background-color: #f3f4f6;
}

.dropdown-option.selected {
  background-color: #f2b418;
  color: white;
}

.dropdown-option.selected:hover {
  background-color: #f2b418;
}

.dropdown-option.no-results {
  color: #9ca3af;
  cursor: default;
  text-align: center;
  font-style: italic;
}

.dropdown-option.no-results:hover {
  background-color: transparent;
}

/* Scrollbar styling for dropdown */
.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
