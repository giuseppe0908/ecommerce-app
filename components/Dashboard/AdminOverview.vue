<template>
  <div class="admin-dashboard">
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Pannello di Amministrazione</h2>
      <div class="flex flex-wrap gap-4">
        <NuxtLink
          to="/admin/allProducts"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Gestione Prodotti
        </NuxtLink>
        <button
          @click="activeTab = 'products'"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Snapshot Prodotti
        </button>
        <button
          @click="activeTab = 'users'"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Gestione Utenti
        </button>
      </div>

      <div class="mt-6">
        <div v-if="activeTab === 'products'">
          <ProductManagement />
        </div>
        <div v-if="activeTab === 'users'">
          <UserManagement />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductManagement from '~/components/Managment/ProductManagement.vue'
import UserManagement from '~/components/Managment/UserManagement.vue'

const activeTab = ref('')
</script>
