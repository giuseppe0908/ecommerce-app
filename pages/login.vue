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
          <div class="w-full">
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="mt-1 block w-[94.5%] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
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
            <span @click="togglePasswordVisibility" class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center cursor-pointer">
              <svg v-if="passwordFieldType === 'password'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
      <button
        @click="loginWithGitHub"
        class="mt-4 w-full flex items-center justify-center bg-gray-800 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.201 2.397.098 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.309.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd" />
        </svg>
        Accedi con GitHub
      </button>
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
useNoIndexPageSeo({
  title: 'Login',
  description: 'Accedi alla tua area personale per gestire ordini, preferiti e checkout.',
  path: '/login',
})

// Variabili reattive per email, password, e messaggi di errore
const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const passwordFieldType = ref('password');

// Controllo se l'utente è già autenticato e lo rendirizzo alla dashboard
onMounted(() => {
  authStore.initialize().then((isAuthenticated) => {
    if (isAuthenticated) {
      navigateTo('/dashboard')
    }
  })
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
const loginWithGitHub = async () => {
  try {
    const { url } = await $fetch('/api/auth/github')
    window.location.href = url // Reindirizza l'utente a GitHub per l'autenticazione 
  } catch (error) {
    console.error('GitHub login error:', error)
  }
}

</script>
