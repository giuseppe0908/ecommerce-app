<template>
  <div v-if="user">
    <h1>Benvenuto, {{ user.name }}</h1>
    <p>Ruolo: {{ user.role }}</p>

    <!-- Barra del tempo rimanente -->
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div
          :class="progressBarClass"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
    <p>Tempo rimanente: {{ formatTime(timeRemaining) }}</p>


    <button @click="handleLogout" class="mt-4 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">
      Logout
    </button>

    <div v-if="user.role === 'ADMIN'">
      <h2>Funzionalità Admin</h2>
      <nuxt-link to="/admin/allProducts">Visualizza Prodotti</nuxt-link>
      <div class="tabs flex gap-2 mb-5">
        <button class="py-3 px-5" @click="activeTab = 'products'" :class="{ active: activeTab === 'products' }">Gestione Prodotti</button>
        <button class="py-3 px-5" @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">Gestione Utenti</button>
      </div>

      <div v-if="activeTab === 'products'">
        <ProductManagement />
      </div>
      <div v-if="activeTab === 'users'">
        <UserManagement />
      </div>

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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import ProductManagement from './components/Managment/ProductManagement.vue';
import UserManagement from './components/Managment/UserManagement.vue';
import { useAuthStore } from '~/stores/authStore'
import { navigateTo } from 'nuxt/app';

definePageMeta({
  middleware: [
    'auth',   // Controlla autenticazione
  ]
})

const authStore = useAuthStore()


const user = ref(null);
const activeTab = ref('');
const router = useRouter();
const totalDuration =5 * 60 * 1000; // 5 minuti in millisecondi
// const totalDuration =60 * 1000; 
const timeRemaining = ref(totalDuration); // Tempo rimanente
let interval = null;

async function fetchUser() {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // router.push('/login');
    navigateTo('/login')
    return;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      user.value = await response.json();
    } else {
      navigateTo('/login')  
    }
  } catch (error) {
    navigateTo('/login')
  }
}

// Calcolo della percentuale di progresso
const progress = computed(() => (timeRemaining.value / totalDuration) * 100);

// Classe dinamica per la barra in base al tempo rimanente
const progressBarClass = computed(() => {
  if (progress.value > 50) return 'bg-green-500'; // Verde sopra il 50%
  if (progress.value > 20) return 'bg-yellow-500'; // Giallo tra 20% e 50%
  return 'bg-red-500'; // Rosso sotto il 20%
});

// Funzione per formattare il tempo rimanente in mm:ss
const formatTime = (time) => {
  const minutes = Math.floor(time / 60 / 1000);
  const seconds = Math.floor((time % (60 * 1000)) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const handleLogout = () => {
  // Logica per il logout
  user.value = null;
  // localStorage.removeItem('authToken');
  // localStorage.removeItem('user');
  authStore.logout();
  router.push('/login');
};

const resetTimer = () => {
  timeRemaining.value = totalDuration;
};

const startTimer = () => {
  interval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value -= 1000;
    } else {
      clearInterval(interval);
      handleLogout();
    }
  }, 1000);
};

const handleUserActivity = () => {
  resetTimer();
};

onMounted(() => {
  
  fetchUser();
  startTimer();
  //INIZIALIZZO LO STORE  
  authStore.initialize()
  window.addEventListener('mousemove', handleUserActivity);
  window.addEventListener('click', handleUserActivity);
  window.addEventListener('keydown', handleUserActivity);

  onUnmounted(() => {
    clearInterval(interval);
    window.removeEventListener('mousemove', handleUserActivity);
    window.removeEventListener('click', handleUserActivity);
    window.removeEventListener('keydown', handleUserActivity);
  });
});
</script>

<style scoped>
.progress-bar-container {
  width: 50%; /* Modifica la larghezza della barra di progresso */
  margin: 0 auto; /* Centra la barra di progresso */
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar div {
  height: 100%;
  transition: width 0.5s ease;
}

.bg-green-500 {
  background-color: #48bb78; /* Verde */
}

.bg-yellow-500 {
  background-color: #ecc94b; /* Giallo */
}

.bg-red-500 {
  background-color: #f56565; /* Rosso */
}
button.active {
  background-color: #007bff;
  color: white;
}
</style>
