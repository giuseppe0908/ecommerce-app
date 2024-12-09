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

          <div class="flex">
            <input v-model="form.role" type="checkbox">
            <label for="">Admin</label>
          </div>
         
  
          <!-- Pulsante di invio -->
          <button
            type="submit"
            class="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
          >
            Registrati
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive } from "vue";
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const form = reactive({
    name: "",
    surname: "",
    email: "",
    password: "",
    role: false // Imposta il ruolo come booleano per il checkbox
  });
  
  const handleSubmit = async () => {
    // Controlla che tutti i campi siano riempiti
    if (!form.name || !form.surname || !form.email || !form.password) {
      alert("Per favore, compila tutti i campi.");
      return;
    }
  
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Assicurati che il corpo sia interpretato come JSON
        },
        body: JSON.stringify(form), // Serializza il form come JSON
      });
  
      if (response.ok) {
        alert("Registrazione avvenuta con successo!");
        router.push('/dashboard');  // Reindirizza alla pagina protetta
        // Resetta il form o redirigi l'utente dove necessario
      } else {
        const error = await response.json();
        alert(error.message || "Errore durante la registrazione.");
      }
    } catch (error) {
      alert("Errore durante la registrazione. Riprova.");
      console.error(error);
    }
  };
  </script>
  