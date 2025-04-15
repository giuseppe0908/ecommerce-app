<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p class="mt-4 text-gray-600">Verifica token in corso...</p>
        </div>
  
        <!-- Error State -->
        <div v-else-if="errorMessage" class="text-center">
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ errorMessage }}
                </h3>
                <div class="mt-4">
                  <button
                    @click="handlerResetPassword()"
                    class="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                  >
                    Richiedi nuovo reset password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Reset Password Form -->
        <div v-else>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <form class="mt-8 space-y-6" @submit.prevent="resetPassword">
            <div class="rounded-md shadow-sm -space-y-px">
              <div>
                <label for="password" class="sr-only">Nuova Password</label>
                <input
                  id="password"
                  v-model="password"
                  :disabled="!isTokenValid"
                  type="password"
                  required
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Nuova Password"
                >
              </div>
              <div>
                <label for="confirm-password" class="sr-only">Conferma Password</label>
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  :disabled="!isTokenValid"
                  type="password"
                  required
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Conferma Password"
                >
              </div>
            </div>
  
            <div>
              <button
                type="submit"
                :disabled="!isTokenValid"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
  
        <!-- Success Message -->
        <div v-if="successMessage" class="rounded-md bg-green-50 p-4 mt-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">
                {{ successMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  
  const route = useRoute();
  const router = useRouter();
  const token = route.query.token;
  const password = ref('');
  const confirmPassword = ref('');
  const successMessage = ref('');
  const errorMessage = ref('');
  const loading = ref(true);
  const isTokenValid = ref(false);
  
  const fetchVerifyToken = async () => {
    try {
      const response = await fetch('/api/verify-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Token non valido o scaduto');
      }
  
      const data = await response.json();
      isTokenValid.value = data.success;
    } catch (error) {
      errorMessage.value = error.message;
      isTokenValid.value = false;
    } finally {
      loading.value = false;
    }
  };
  
  const resetPassword = async () => {
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Le password non coincidono!';
      return;
    }
  
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: password.value,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Errore durante il reset della password');
      }
  
      successMessage.value = 'Password resettata con successo!';
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      errorMessage.value = error.message;
    }
  };
  
  const handlerResetPassword = () => {
   
  };
  
  onMounted(() => {
    if (!token) {
      errorMessage.value = 'Token mancante';
      loading.value = false;
      return;
    }
    fetchVerifyToken();
  });
  </script>
  
  <style scoped>
  .reset-password {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
  }
  
  .reset-password h1 {
      text-align: center;
      margin-bottom: 20px;
  }
  
  .reset-password form div {
      margin-bottom: 15px;
  }
  
  .reset-password label {
      display: block;
      margin-bottom: 5px;
  }
  
  .reset-password input {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
  }
  
  .reset-password button {
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
  }
  
  .reset-password button:hover {
      background-color: #0056b3;
  }
  </style>