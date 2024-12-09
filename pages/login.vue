<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
      <h2 class="text-2xl font-bold text-center text-gray-800">Login</h2>

      <form @submit.prevent="handleLogin">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Inserisci la tua email"
            class="block w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Inserisci la tua password"
            class="block w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Submit Button -->
        <div class="mt-4">
          <button
            type="submit"
            class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </div>
      </form>

      <!-- Error Message -->
      <div v-if="error" class="p-4 text-sm text-red-600 bg-red-100 rounded">
        {{ error }}
      </div>
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
