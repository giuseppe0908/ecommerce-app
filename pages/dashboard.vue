<template>
    <div v-if="user">
      <h1>Benvenuto, {{ user.name }}</h1>
      <p>Ruolo: {{ user.role }}</p>
  
      <!-- Aggiungi il pulsante di logout -->
      <button @click="handleLogout" class="mt-4 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">
        Logout
      </button>
  
      <div v-if="user.role === 'ADMIN'">
        <h2>Funzionalità Admin</h2>
      </div>
  
      <div v-else>
        <h2>Funzionalità Utente</h2>
      </div>
    </div>
    <div v-else>
      <p>Caricamento...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  const user = ref(null);  // Stato reattivo per l'utente
  const router = useRouter();
  
  // Funzione per ottenere i dati dell'utente
  async function fetchUser() {
    const token = localStorage.getItem('authToken');
  
    if (!token) {
      router.push('/login');
      return;
    }
  
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        user.value = await response.json();
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  }
  
  // Funzione di logout
  function handleLogout() {
    // Rimuove il token dal localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Reindirizza l'utente alla pagina di login
    router.push('/login');
  }
  
  // Esegui la funzione quando il componente è montato
  onMounted(fetchUser);
  </script>
  