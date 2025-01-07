<script setup>
// Componente per l'icona della borsa ingrandita
const props = defineProps(['colorPrimary']);
</script>

<template>
  <div class="flex">
    <!-- Icona della borsa -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="35"
      height="35"
      :fill="props.colorPrimary"
      class="text-black"
    >
      <!-- Corpo della borsa  -->
      <rect
        x="8"
        y="10"
        width="16"
        height="12"
        rx="3"
        ry="3"
        :fill="props.colorPrimary"
      />
      <!-- Manico della borsa -->
      <path
        d="M11 12V9a5 5 0 0 1 10 0v3"
        :stroke="props.colorPrimary"
        stroke-width="2"
        fill="none"
      />
      <!-- Badge Numerico -->
      <text
        x="16"
        y="17"
        text-anchor="middle"
        alignment-baseline="middle"
        font-size="7"
        fill="white"
        font-weight="bold"
      >
        3
      </text>
    </svg>
  </div>
</template>

<style scoped>
/* Stile aggiuntivo se necessario */
</style>
