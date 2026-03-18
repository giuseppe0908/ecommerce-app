<template>
    <div class="min-h-screen flex  justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recupera Password
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Inserisci la tua email per ricevere il link di recupero
          </p>
        </div>
        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">Email</label>
              <input 
                id="email-address" 
                name="email" 
                type="email" 
                v-model="email"
                required 
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                placeholder="Indirizzo email"
              >
            </div>
          </div>
  
          <div>
            <button 
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg 
                  class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  aria-hidden="true"
                >
                  <path 
                    fill-rule="evenodd" 
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                    clip-rule="evenodd" 
                  />
                </svg>
              </span>
              {{ loading ? 'Invio in corso...' : 'Invia link di recupero' }}
            </button>
          </div>
        </form>
  
        <!-- Alert di successo -->
        <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">
                {{ successMessage }}
              </p>
            </div>
          </div>
        </div>
  
        <!-- Alert di errore -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  useNoIndexPageSeo({
    title: 'Recupera password',
    description: 'Richiedi il link per reimpostare in modo sicuro la password del tuo account.',
    path: '/forgotPassword',
  })

  const email = ref('');
  const loading = ref(false);
  const successMessage = ref('');
  const errorMessage = ref('');
  
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSubmit = async () => {
    loading.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    
    // Validate email format
    if (!isValidEmail(email.value)) {
      errorMessage.value = 'Inserisci un indirizzo email valido';
      loading.value = false;
      return;
    }
  
    try {
      // Chiamata API per il recupero password
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.value }),
      });
  
      if (!response.ok) {
        throw new Error('Errore durante l\'invio dell\'email');
      }
  
      successMessage.value = 'Email inviata con successo! Controlla la tua casella di posta.';
      email.value = '';
    } catch (error) {
      errorMessage.value = error.message || 'Si è verificato un errore. Riprova più tardi.';
    } finally {
      loading.value = false;
    }
  };
  </script>
