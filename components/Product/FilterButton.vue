<template>
  <button
    :class="['filter-button', { active }]"
    :style="{
      backgroundColor: active ? colorPrimary : 'white',
      color: active ? 'white' : colorPrimary,
      border: !active ? `1px solid ${colorPrimary}` : 'none'
    }"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
<script setup>
const props = defineProps({
  active: Boolean,
  colorPrimary: String
})
const emit = defineEmits(['click'])
</script>
<style scoped>
.filter-button {
  width: 74px;
  height: 31px;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-button.active {
  font-weight: bold;
}
</style>