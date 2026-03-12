<script setup lang="ts">
const route = useRoute()
const rawGender = route.params.gender
const gender = Array.isArray(rawGender) ? rawGender[0] : rawGender

const nextQuery = Object.entries(route.query).reduce<Record<string, string | string[]>>(
  (accumulator, [key, value]) => {
    if (Array.isArray(value)) {
      const filteredValues = value.filter((entry): entry is string => typeof entry === 'string')
      if (filteredValues.length > 0) {
        accumulator[key] = filteredValues
      }
      return accumulator
    }

    if (typeof value === 'string') {
      accumulator[key] = value
    }

    return accumulator
  },
  {},
)

if (typeof gender === 'string' && gender.trim()) {
  nextQuery.gender = gender.trim().toLowerCase()
}

await navigateTo(
  {
    path: '/product',
    query: nextQuery,
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
