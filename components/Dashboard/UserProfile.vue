<template>
  <div class="user-profile bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 class="text-xl font-bold mb-4">Il mio profilo</h3>
    
    <!-- View Mode -->
    <div v-if="!isEditing" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="profile-item">
          <span class="text-gray-500 text-sm">Email</span>
          <p class="font-medium">{{ user.email }}</p>
        </div>
        <div class="profile-item">
          <span class="text-gray-500 text-sm">Nome</span>
          <p class="font-medium">{{ user.name || 'Non specificato' }}</p>
        </div>
        <div class="profile-item">
          <span class="text-gray-500 text-sm">Cognome</span>
          <p class="font-medium">{{ user.surname || 'Non specificato' }}</p>
        </div>
        <div class="profile-item">
          <span class="text-gray-500 text-sm">Indirizzo</span>
          <p class="font-medium">{{ user.address || 'Non specificato' }}</p>
        </div>
        <div class="profile-item">
          <span class="text-gray-500 text-sm">Telefono</span>
          <p class="font-medium">{{ user.number || 'Non specificato' }}</p>
        </div>
      </div>
      
      <button 
        @click="startEditing" 
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Modifica profilo
      </button>
    </div>
    
    <!-- Edit Mode -->
    <form v-else @submit.prevent="saveProfile" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input 
            type="text" 
            id="name" 
            v-model="editedUser.name" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="form-group">
          <label for="surname" class="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
          <input 
            type="text" 
            id="surname" 
            v-model="editedUser.surname" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="form-group">
          <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
          <input 
            type="text" 
            id="address" 
            v-model="editedUser.address" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="form-group">
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="editedUser.number" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div class="flex space-x-3">
        <button 
          type="submit" 
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Salva modifiche
        </button>
        <button 
          type="button" 
          @click="cancelEditing" 
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Annulla
        </button>
      </div>
    </form>
    
    <!-- Success Message -->
    <div v-if="successMessage" class="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
      {{ successMessage }}
    </div>
    
    <!-- Error Message -->
    <div v-if="errorMessage" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/authStore';

const props = defineProps({
  userData: {
    type: Object,
    required: true
  }
});

const authStore = useAuthStore();
const user = computed(() => props.userData);
const isEditing = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Create a copy of user data for editing
const editedUser = ref({});

const startEditing = () => {
  // Clone user data to avoid direct mutation
  editedUser.value = { ...user.value };
  isEditing.value = true;
  // Clear messages
  successMessage.value = '';
  errorMessage.value = '';
};

const cancelEditing = () => {
  isEditing.value = false;
  // Clear messages
  successMessage.value = '';
  errorMessage.value = '';
};

const saveProfile = async () => {
  try {
    // Here you would typically call an API to update the user profile
    // For now, we'll just simulate a successful update
    
    // In a real implementation, you would call an API endpoint
    // const response = await fetch('/api/user/update', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(editedUser.value)
    // });
    // if (!response.ok) throw new Error('Errore durante l\'aggiornamento del profilo');
    
    // Update the user in the auth store
    // authStore.updateUser(editedUser.value);
    
    // Show success message
    successMessage.value = 'Profilo aggiornato con successo!';
    errorMessage.value = '';
    isEditing.value = false;
    
    // In a real implementation, you would emit an event to update the parent component
    // emit('profile-updated', editedUser.value);
  } catch (error) {
    errorMessage.value = error.message || 'Si è verificato un errore durante l\'aggiornamento del profilo';
    successMessage.value = '';
  }
};
</script>

<style scoped>
.profile-item {
  margin-bottom: 0.5rem;
}
</style>