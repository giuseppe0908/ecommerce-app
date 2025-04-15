<template>
  <div 
    v-if="visible"
    class="fixed z-50 transition-all duration-300"
    :class="[
      positionClasses,
      visible ? 'opacity-100' : 'opacity-0'
    ]"
  >
    <div 
      class="p-4 rounded-lg shadow-lg flex items-center"
      :class="typeClasses"
    >
      <div v-if="type === 'success'" class="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div v-else-if="type === 'error'" class="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => [
      'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
    ].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
});

const visible = ref(false);

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top-right': return 'top-4 right-4';
    case 'top-left': return 'top-4 left-4';
    case 'bottom-right': return 'bottom-4 right-4';
    case 'bottom-left': return 'bottom-4 left-4';
    case 'top-center': return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-center': return 'bottom-4 left-1/2 transform -translate-x-1/2';
    default: return 'top-4 right-4';
  }
});

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-green-500 text-white';
    case 'error': return 'bg-red-500 text-white';
    case 'info': return 'bg-blue-500 text-white';
    case 'warning': return 'bg-yellow-500 text-white';
    default: return 'bg-green-500 text-white';
  }
});

onMounted(() => {
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, props.duration);
});
</script>