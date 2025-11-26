<template>
  <div class="price-filter" role="group" aria-labelledby="price-filter-title">
    <h3 id="price-filter-title" class="price-filter__title" :style="{ color: colorPrimary }">
      Prezzo
    </h3>

    <!-- Price Range Display -->
    <div class="price-filter__range-display">
      <span class="price-filter__value">€{{ formattedMinPrice }}</span>
      <span class="price-filter__value">€{{ formattedMaxPrice }}</span>
    </div>

    <!-- Double Range Slider -->
    <div class="price-filter__slider-container">
      <div class="slider-track"></div>
      <div
        class="slider-range"
        :style="{
          left: `${minPercentage}%`,
          width: `${rangePercentage}%`,
          backgroundColor: colorPrimary
        }"
      ></div>

      <input
        v-model.number="localRange.min"
        type="range"
        :min="minPrice"
        :max="maxPrice"
        class="slider"
        :aria-label="`Prezzo minimo: €${localRange.min}`"
        @input="handleMinChange"
      />

      <input
        v-model.number="localRange.max"
        type="range"
        :min="minPrice"
        :max="maxPrice"
        class="slider"
        :aria-label="`Prezzo massimo: €${localRange.max}`"
        @input="handleMaxChange"
      />
    </div>

    <!-- Manual Input Fields -->
    <div class="price-filter__inputs">
      <div class="price-input">
        <span class="price-input__symbol">€</span>
        <input
          v-model.number="localRange.min"
          type="number"
          :min="minPrice"
          :max="localRange.max - 1"
          class="price-input__field"
          :class="{ 'price-input__field--error': minInputError }"
          @change="validateRange"
          @blur="handleBlur('min')"
        />
      </div>
      <span class="price-input__separator">-</span>
      <div class="price-input">
        <span class="price-input__symbol">€</span>
        <input
          v-model.number="localRange.max"
          type="number"
          :min="localRange.min + 1"
          :max="maxPrice"
          class="price-input__field"
          :class="{ 'price-input__field--error': maxInputError }"
          @change="validateRange"
          @blur="handleBlur('max')"
        />
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="minInputError || maxInputError" class="price-filter__errors">
      <p v-if="minInputError" class="error-message">{{ minInputError }}</p>
      <p v-if="maxInputError" class="error-message">{{ maxInputError }}</p>
    </div>

    <!-- Selection Info -->
    <div class="price-filter__info">
      Selezionato: €{{ localRange.min }} - €{{ localRange.max }}
    </div>

    <!-- Action Buttons -->
    <div class="price-filter__actions">
      <button
        class="action-button action-button--secondary"
        :disabled="isResetDisabled"
        @click="handleReset"
      >
        Reset
      </button>
      <button
        class="action-button action-button--primary"
        :style="{ backgroundColor: colorPrimary }"
        :disabled="isApplyDisabled"
        @click="handleApply"
      >
        Applica
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

/**
 * ============================================
 * PROPS DEFINITION
 * ============================================
 */
const props = defineProps({
  /** Minimum price boundary */
  minPrice: {
    type: Number,
    required: true,
    validator: (value) => value >= 0
  },
  /** Maximum price boundary */
  maxPrice: {
    type: Number,
    required: true,
    validator: (value) => value > 0
  },
  /** Current price range selection */
  currentRange: {
    type: Object,
    required: true,
    validator: (value) => value.min !== undefined && value.max !== undefined
  },
  /** Primary brand color for styling */
  colorPrimary: {
    type: String,
    default: '#007bff'
  }
});

/**
 * ============================================
 * EMITS DEFINITION
 * ============================================
 */
const emit = defineEmits(['update:range', 'apply', 'reset']);

/**
 * ============================================
 * LOCAL STATE
 * ============================================
 */
const localRange = ref({
  min: props.currentRange.min,
  max: props.currentRange.max
});

const minInputError = ref('');
const maxInputError = ref('');

/**
 * ============================================
 * COMPUTED PROPERTIES
 * ============================================
 */

/**
 * Formatted minimum price with thousands separator
 */
const formattedMinPrice = computed(() => {
  return new Intl.NumberFormat('it-IT').format(localRange.value.min);
});

/**
 * Formatted maximum price with thousands separator
 */
const formattedMaxPrice = computed(() => {
  return new Intl.NumberFormat('it-IT').format(localRange.value.max);
});

/**
 * Percentage position of minimum slider
 */
const minPercentage = computed(() => {
  return ((localRange.value.min - props.minPrice) / (props.maxPrice - props.minPrice)) * 100;
});

/**
 * Percentage width of selected range
 */
const rangePercentage = computed(() => {
  return ((localRange.value.max - localRange.value.min) / (props.maxPrice - props.minPrice)) * 100;
});

/**
 * Determines if reset button should be disabled
 */
const isResetDisabled = computed(() => {
  return localRange.value.min === props.minPrice && localRange.value.max === props.maxPrice;
});

/**
 * Determines if apply button should be disabled
 */
const isApplyDisabled = computed(() => {
  return (
    !!minInputError.value ||
    !!maxInputError.value ||
    localRange.value.min >= localRange.value.max
  );
});

/**
 * ============================================
 * METHODS
 * ============================================
 */

/**
 * Handles minimum slider change
 */
const handleMinChange = () => {
  clearErrors();
  if (localRange.value.min >= localRange.value.max) {
    localRange.value.min = localRange.value.max - 1;
  }
  emit('update:range', { ...localRange.value });
};

/**
 * Handles maximum slider change
 */
const handleMaxChange = () => {
  clearErrors();
  if (localRange.value.max <= localRange.value.min) {
    localRange.value.max = localRange.value.min + 1;
  }
  emit('update:range', { ...localRange.value });
};

/**
 * Validates price range and sets error messages
 */
const validateRange = () => {
  clearErrors();

  if (localRange.value.min < props.minPrice) {
    minInputError.value = `Il prezzo minimo non può essere inferiore a €${props.minPrice}`;
    localRange.value.min = props.minPrice;
  } else if (localRange.value.min >= localRange.value.max) {
    minInputError.value = 'Il prezzo minimo deve essere inferiore al massimo';
    localRange.value.min = localRange.value.max - 1;
  }

  if (localRange.value.max > props.maxPrice) {
    maxInputError.value = `Il prezzo massimo non può superare €${props.maxPrice}`;
    localRange.value.max = props.maxPrice;
  } else if (localRange.value.max <= localRange.value.min) {
    maxInputError.value = 'Il prezzo massimo deve essere superiore al minimo';
    localRange.value.max = localRange.value.min + 1;
  }

  if (!minInputError.value && !maxInputError.value) {
    emit('update:range', { ...localRange.value });
  }
};

/**
 * Handles input blur event with value rounding
 */
const handleBlur = (type) => {
  if (type === 'min') {
    localRange.value.min = Math.max(
      props.minPrice,
      Math.min(localRange.value.max - 1, localRange.value.min)
    );
  } else {
    localRange.value.max = Math.min(
      props.maxPrice,
      Math.max(localRange.value.min + 1, localRange.value.max)
    );
  }
  validateRange();
};

/**
 * Clears all error messages
 */
const clearErrors = () => {
  minInputError.value = '';
  maxInputError.value = '';
};

/**
 * Handles apply button click
 */
const handleApply = () => {
  if (!isApplyDisabled.value) {
    emit('apply');
  }
};

/**
 * Handles reset button click
 */
const handleReset = () => {
  localRange.value.min = props.minPrice;
  localRange.value.max = props.maxPrice;
  clearErrors();
  emit('reset');
};

/**
 * ============================================
 * WATCHERS
 * ============================================
 */

/**
 * Sync local range with prop changes
 */
watch(
  () => props.currentRange,
  (newRange) => {
    localRange.value = { ...newRange };
  },
  { deep: true }
);
</script>

<style scoped>
/**
 * Price Filter Container
 */
.price-filter {
  background-color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}

.price-filter__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/**
 * Range Display
 */
.price-filter__range-display {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.price-filter__value {
  font-weight: 500;
  font-size: 0.875rem;
}

/**
 * Slider Components
 */
.price-filter__slider-container {
  position: relative;
  margin-bottom: 1.5rem;
  padding-top: 1.25rem;
}

.slider-track {
  position: absolute;
  width: 100%;
  height: 4px;
  background-color: #d1d5db;
  border-radius: 2px;
}

.slider-range {
  position: absolute;
  height: 4px;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.slider {
  position: absolute;
  width: 100%;
  height: 4px;
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: auto;
  cursor: pointer;
  z-index: 2;
  margin: 0;
  padding: 0;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: v-bind(colorPrimary);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 3;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: v-bind(colorPrimary);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 3;
}

/**
 * Input Fields
 */
.price-filter__inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.price-input {
  position: relative;
  flex: 1;
}

.price-input__symbol {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 0.875rem;
}

.price-input__field {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
}

.price-input__field:focus {
  border-color: v-bind(colorPrimary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.price-input__field--error {
  border-color: #ef4444;
}

.price-input__separator {
  color: #6b7280;
  font-size: 0.875rem;
}

/**
 * Error Messages
 */
.price-filter__errors {
  margin-bottom: 0.5rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin: 0;
}

/**
 * Selection Info
 */
.price-filter__info {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 1rem;
}

/**
 * Action Buttons
 */
.price-filter__actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.action-button {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-button--secondary {
  background-color: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.action-button--secondary:hover:not(:disabled) {
  background-color: #f9fafb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.action-button--primary {
  color: white;
}

.action-button--primary:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
