<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Crea un Account</h1>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nome -->
          <div>
            <label for="name" class="block text-gray-700 font-medium">Nome</label>
            <input
              v-model="form.name"
              id="name"
              type="text"
              placeholder="Inserisci il tuo nome"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
  
          <!-- Cognome -->
          <div>
            <label for="surname" class="block text-gray-700 font-medium">Cognome</label>
            <input
              v-model="form.surname"
              id="surname"
              type="text"
              placeholder="Inserisci il tuo cognome"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
  
          <!-- Email -->
          <div>
            <label for="email" class="block text-gray-700 font-medium">Email</label>
            <input
              v-model="form.email"
              id="email"
              type="email"
              placeholder="Inserisci la tua email"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
  
          <!-- Password -->
          <div>
            <label for="password" class="block text-gray-700 font-medium">Password</label>
            <input
              v-model="form.password"
              id="password"
              type="password"
              placeholder="Inserisci una password sicura"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

           <!-- Address -->
           <div>
            <label for="address" class="block text-gray-700 font-medium">address</label>
            <input
              v-model="form.address"
              id="address"
              type="text"
              placeholder="Inserisciil tuo indirizzo"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

           <!-- Number -->
           <div>
            <label for="number" class="block text-gray-700 font-medium">Number</label>
            <input
              v-model="form.number"
              id="number"
              type="text"
              placeholder="Inserisci il tuo numero telefonico"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <!-- Pulsante di invio -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
          >
            {{ isSubmitting ? 'Registrazione in corso...' : 'Registrati' }}
          </button>
        </form>
        <p v-if="errorMessage" class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref } from "vue";
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authStore';

  const router = useRouter();
  const authStore = useAuthStore();
  useNoIndexPageSeo({
    title: 'Registrazione',
    description: 'Crea un account per salvare preferiti, gestire ordini e completare il checkout piu rapidamente.',
    path: '/register',
  })
  const form = reactive({
    name: "",
    surname: "",
    email: "",
    password: "",
    address: "",
    number: "",
  });
  const isSubmitting = ref(false);
  const errorMessage = ref("");
  
  const handleSubmit = async () => {
    errorMessage.value = "";

    if (!form.name || !form.surname || !form.email || !form.password || !form.address || !form.number) {
      errorMessage.value = "Per favore, compila tutti i campi.";
      return;
    }
  
    isSubmitting.value = true;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
  
      if (response.ok) {
        await authStore.login(form.email, form.password);
        router.push('/dashboard');
      } else {
        const error = await response.json();
        errorMessage.value = error.message || "Errore durante la registrazione.";
      }
    } catch (error) {
      errorMessage.value = "Errore durante la registrazione. Riprova.";
      console.error(error);
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>
  
