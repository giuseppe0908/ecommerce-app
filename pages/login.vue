<!-- pages/login.vue -->
<template>
  <div class="min-h-screen flex justify-center bg-gray-50">
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
         <div class="mb-6 relative">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="flex items-center">
            <input
              :type="passwordFieldType"
              id="password"
              v-model="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <span @click="togglePasswordVisibility" class="absolute right-0 pr-3 flex items-center cursor-pointer">
              <svg v-if="passwordFieldType === 'password'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
            </span>
          </div>
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
       <!-- Link Pagina  reset password -->
       <p class="mt-4 text-center text-sm text-gray-600">
         recupera Password
        <NuxtLink to="/forgotPassword" class="text-indigo-600 hover:underline">forgoutPassword</NuxtLink>
      </p>
    </div>
    <!-- Aggiungi dopo il form -->
<div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
  {{ error }}
</div>

  </div>
  
</template>

<script setup>
// Importa gli strumenti Vue
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'
import { navigateTo } from 'nuxt/app';

const authStore = useAuthStore()

// Variabili reattive per email, password, e messaggi di errore
const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const passwordFieldType = ref('password');

// Controllo se l'utente è già autenticato e lo rendirizzo alla dashboard
onMounted(() => {
  const localStorageToken = localStorage.getItem('authToken')
  const localStorageUser = localStorage.getItem('user')
  if (localStorageToken && localStorageUser) {
    navigateTo('/dashboard')
  }
})

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};


// Funzione per gestire il login
async function handleLogin() {

  try {
    error.value = ''
    await authStore.login(email.value, password.value)
    
    // Reindirizzamento in base al ruolo
    // if (authStore.isAdmin) {
    //   router.push('/admin')
    // } else {
      router.push('/dashboard')
    // }
    
  } catch (err) {
    error.value = err.message || 'Errore durante il login'
    console.error('Login error:', err)
  }
}

</script>
