<template>
  <div class="dashboard-container max-w-7xl mx-auto px-4 py-8">
    <div v-if="user">
      <!-- Header Section -->
      <div class="dashboard-header mb-8">
        <h1 class="text-3xl font-bold mb-2">Benvenuto, {{ user.name }}</h1>
        <p class="text-gray-600">Ruolo: {{ user.role }}</p>
        
        <!-- Session Timer -->
        <div class="session-timer mt-4">
          <div class="progress-bar-container w-full md:w-1/2 bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              :class="progressBarClass"
              :style="{ width: `${progress}%` }"
              class="h-full transition-all duration-300"
            ></div>
          </div>
          <p class="text-sm text-gray-500 mt-1">Sessione attiva: {{ formatTime(timeRemaining) }}</p>
        </div>
      </div>
      
      <!-- Admin Dashboard -->
      <div v-if="user.role === 'ADMIN'" class="admin-dashboard">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-bold mb-4">Pannello di Amministrazione</h2>
          <div class="flex flex-wrap gap-4">
            <NuxtLink 
              to="/admin/allProducts" 
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Gestione Prodotti
            </NuxtLink>
            <button 
              @click="activeTab = 'users'" 
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Gestione Utenti
            </button>
          </div>
          
          <div class="mt-6">
            <div v-if="activeTab === 'products'">
              <ProductManagement />
            </div>
            <div v-if="activeTab === 'users'">
              <UserManagement />
            </div>
          </div>
        </div>
      </div>
      
      <!-- User Dashboard -->
      <div v-else class="user-dashboard grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- User Profile -->
          <UserProfile :userData="user" />
          
          <!-- Order History -->
          <OrderHistory :userId="user.id" :userData="user" />
        </div>
        
        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Wishlist Management -->
          <WishlistManagement />
          
          <!-- Product Recommendations -->
          <ProductRecommendations :userId="user.id" />
        </div>
      </div>
      
      <!-- Logout Button -->
      <div class="mt-8 text-center">
        <button 
          @click="handleLogout" 
          class="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-else class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import ProductManagement from './components/Managment/ProductManagement.vue';
import UserManagement from './components/Managment/UserManagement.vue';
import { useAuthStore } from '~/stores/authStore'
import { navigateTo } from 'nuxt/app';

// Import dashboard components
import UserProfile from '~/components/Dashboard/UserProfile.vue';
import OrderHistory from '~/components/Dashboard/OrderHistory.vue';
import WishlistManagement from '~/components/Dashboard/WishlistManagement.vue';
import ProductRecommendations from '~/components/Dashboard/ProductRecommendations.vue';

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
  // Use the auth store user data instead of making a separate API call
  if (authStore.user) {
    user.value = {
      id: authStore.user.id,
      name: authStore.user.email, // Using email as name if name is not available
      role: authStore.user.role,
      email: authStore.user.email,
      // Add additional user fields that might be needed by components
      address: authStore.user.address || '',
      number: authStore.user.number || '',
      surname: authStore.user.surname || ''
    };
    return;
  }
  
  // If no user in auth store, redirect to login
  navigateTo('/login');
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
  // Initialize auth store first
  authStore.initialize();
  
  // Then fetch user data
  fetchUser();
  startTimer();
  
  window.addEventListener('mousemove', handleUserActivity);
  window.addEventListener('click', handleUserActivity);
  window.addEventListener('keydown', handleUserActivity);
});

onUnmounted(() => {
  clearInterval(interval);
  window.removeEventListener('mousemove', handleUserActivity);
  window.removeEventListener('click', handleUserActivity);
  window.removeEventListener('keydown', handleUserActivity);
});
</script>

<style scoped>
.dashboard-container {
  min-height: calc(100vh - 80px);
}

.session-timer {
  transition: all 0.3s ease;
}

.tabs button {
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
}

@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 1.75rem;
  }
}
</style>
