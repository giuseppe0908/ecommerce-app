<template>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="cart-icon "
      :class="customClass"
      :width="width"
      :height="height"
    >
      <path
        d="M7 4h14l-1.5 9H8.5L7 4zM5 2a1 1 0 0 0-1 1v1h-.17a1 1 0 0 0-.99.8l-.83 5a1 1 0 0 0 .99 1.2H5a1 1 0 0 0 1-1v-.17l.03-.17L6.64 3h.61l1.42 8h11.55l1.41-8H7.68L6.36 10.83a1 1 0 1 0 1.73.92L8.67 7h12.42L20.47 3H7V2H5zm2 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
      />
    </svg>
  </template>
  
  <script setup>
  defineProps({
    width: {
      type: String,
      default: '24'
    },
    height: {
      type: String,
      default: '24'
    },
    customClass: {
      type: String,
      default: ''
    },
    colorPrimary:{
        type: String,
        default: 'ff'
    }
  });
  </script>
  
  <style scoped>
  .cart-icon {
    fill: currentColor;
    cursor: pointer;
  }
  .color{}
  </style>
  