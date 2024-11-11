<!-- pages/login.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <!-- Titolo -->
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Login</h2>
  
        <!-- Form di Login -->
        <form @submit.prevent="handleLogin">
          <!-- Campo Email -->
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
  
          <!-- Campo Password -->
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
  
          <!-- Bottone di Login -->
          <button
            type="submit"
            class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Accedi
          </button>
        </form>
  
        <!-- Link alla Pagina di Registrazione -->
        <p class="mt-4 text-center text-sm text-gray-600">
          Non hai un account?
          <NuxtLink to="/register" class="text-indigo-600 hover:underline">Registrati</NuxtLink>
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  // Stati per email e password
  const email = ref('')
  const password = ref('')
  const router = useRouter()
  
  // Funzione per gestire il login
  const handleLogin = () => {
    // Aggiungi qui la logica per autenticare l'utente
    // Ad esempio, puoi chiamare un'API per autenticare l'utente
  
    console.log('Email:', email.value)
    console.log('Password:', password.value)
  
    // Esempio: reindirizza l'utente alla homepage dopo il login
    router.push('/')
  }
  </script>
  
  <style scoped>
  /* Eventuali stili aggiuntivi */
  </style>
  