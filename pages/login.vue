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
// Importa gli strumenti Vue
import { ref } from 'vue';
import { useRouter } from 'vue-router';


// Variabili reattive per email, password, e messaggi di errore
const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();


// Funzione per gestire il login
async function handleLogin() {
  try {
    // Effettua la chiamata API POST con fetch
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specifica il tipo di contenuto
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();
      // Verifica la risposta
    if (!response.ok) {
      throw new Error(data.message || 'Errore durante il login');
    }
    if (response.ok && data.success) {
      localStorage.setItem('authToken', data.token);  // Salva il token in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');  // Reindirizza alla pagina protetta
    } else {
      throw new Error(data.message || 'Errore durante il login');
    }
  } catch (err) {
    // Mostra un messaggio di errore
    error.value = err.message || 'Qualcosa è andato storto';
  }
}

</script>
