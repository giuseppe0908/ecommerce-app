<template>
  <div class="dashboard-header mb-8">
    <h1 class="text-3xl font-bold mb-2">Benvenuto, {{ displayName }}</h1>
    <p class="text-gray-600">Ruolo: {{ user?.role || 'N/A' }}</p>

    <div class="session-timer mt-4">
      <div class="progress-bar-container w-full md:w-1/2 bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          :class="progressBarClass"
          :style="{ width: `${progress}%` }"
          class="h-full transition-all duration-300"
        ></div>
      </div>
      <p class="text-sm text-gray-500 mt-1">Sessione attiva: {{ formattedTime }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  progress: {
    type: Number,
    default: 0,
  },
  progressBarClass: {
    type: String,
    default: 'bg-green-500',
  },
  formattedTime: {
    type: String,
    default: '0:00',
  },
})

const displayName = computed(() => props.user?.name || props.user?.email || 'Utente')
</script>
