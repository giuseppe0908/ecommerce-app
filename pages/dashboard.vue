<!-- <template>
    <div v-if="user">
      <h1>Benvenuto, {{ user.name }}</h1>
      <p>Ruolo: {{ user.role }}</p>
      <div class="progress-bar" v-if="timeRemaining > 0">
        <div
          class="progress"
          :style="{ width: `${(timeRemaining / initialTime) * 100}%` }"
        ></div>
      </div>
      <!-- Aggiungi il pulsante di logout
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
  </template> -->
  
  <!-- <script setup>
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
   -->

   <template>
    <div v-if="user">
      <h1>Benvenuto, {{ user.name }}</h1>
      <p>Ruolo: {{ user.role }}</p>
  
      <!-- Barra del tempo rimanente -->
      <div class="progress-bar">
        <div
          :class="progressBarClass "
          :style="{ width: `${(timeRemaining / initialTime) * 100}%` }"
        ></div>
      </div>
      <p>Tempo rimanente: {{ formatTime(timeRemaining) }}</p>
  
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
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  
  // const user = ref({ name: 'Utente', role: 'USER' });
  const router = useRouter();
  const totalDuration =  60 * 1000; // 5 minuti in millisecondi
  const timeRemaining = ref(totalDuration); // Tempo rimanente
  let inactivityTimer = null; // Timer di inattività
  let logoutCountdown = null; // Timer di logout
  
  // Calcolo della percentuale di progresso
  const progress = computed(() => (timeRemaining.value / totalDuration) * 100);
  
  // Classe dinamica per la barra in base al tempo rimanente
  const progressBarClass = computed(() => {
    if (progress.value > 50) return 'bg-green-500'; // Verde sopra il 50%
    if (progress.value > 20) return 'bg-yellow-500'; // Giallo tra 20% e 50%
    return 'bg-red-500'; // Rosso sotto il 20%
  });
  
  // Funzione per formattare il tempo rimanente in mm:ss
  function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  // Funzione per il logout
  function handleLogout() {
    clearTimeout(inactivityTimer);
    clearInterval(logoutCountdown);
    localStorage.removeItem('authToken');
    router.push('/login');
  }
  
  // Funzione per gestire l'inattività
  function resetInactivityTimer() {
    // Reset del timer di inattività
    clearTimeout(inactivityTimer);
    clearInterval(logoutCountdown);
  
    // Reset del tempo rimanente
    timeRemaining.value = totalDuration;
  
    // Ricomincia il timer
    startInactivityTimer();
  }
  
  // Funzione per avviare il timer di inattività
  function startInactivityTimer() {
    inactivityTimer = setTimeout(() => {
      // Quando l'utente è inattivo, avvia il conto alla rovescia
      logoutCountdown = setInterval(() => {
        timeRemaining.value -= 1000; // Riduce di 1 secondo
        if (timeRemaining.value <= 0) {
          handleLogout(); // Effettua il logout
        }
      }, 1000);
    }, 60 * 1000); // Attivare il logout dopo 1 minuto di inattività
  }
  
  // Eventi per il monitoraggio dell'attività
  onMounted(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
  
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });
  
    // Avvia il timer di inattività iniziale
    startInactivityTimer();
  });
  
  onUnmounted(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
  
    events.forEach((event) => {
      window.removeEventListener(event, resetInactivityTimer);
    });
  
    clearTimeout(inactivityTimer);
    clearInterval(logoutCountdown);
  });
  </script>
  

   
   
<style>
.progress-bar {
  height: 8px;
  background-color: #e5e7eb; /* Grigio chiaro */
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.progress {
  height: 100%;
  transition: width 1s linear, background-color 1s;
}
.bg-green-500 {
  background-color: #4caf50; /* Verde */
}
.bg-yellow-500 {
  background-color: #ffeb3b; /* Giallo */
}
.bg-red-500 {
  background-color: #f44336; /* Rosso */
}
</style>
