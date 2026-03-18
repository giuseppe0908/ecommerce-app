<script setup lang="ts">
const route = useRoute()

await navigateTo(
  {
    path: '/product',
    query: { ...route.query },
  },
  {
    replace: true,
    redirectCode: 301,
  },
)
</script>

<template>
  <div class="sr-only">Redirecting to catalog...</div>
</template>
