<script setup>
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()

onMounted(async () => {
  try {
        const route = useRoute()
        const token = route.query.token 
        
        if (token) {
          authStore.token = token
          localStorage.setItem('authToken', token)
          await authStore.checkAuth()
        }
      } catch (error) {
        authStore.handleAuthError(error)
      }
  if (authStore.user) {
    // Se l'utente è autenticato, reindirizza alla dashboard
    localStorage.setItem('user', JSON.stringify(authStore.user) )
    navigateTo('/dashboard')
  } else if (authStore.error) {
    // Se c'è un errore, mostra il messaggio di errore
    console.error('Error during authentication:', authStore.error)
  } 
})
</script>

<template>
  <div class="container">
    <div v-if="authStore.isLoading" class="loading">
      <span>Autenticazione in corso...</span>
    </div>
    <div v-else-if="authStore.error" class="error">
      {{ authStore.error }}
    </div>

    <div v-else-if="authStore.user" class="success">
      
      <h1>Benvenuto, {{ authStore.user.name }}!</h1>
      <p>Sei stato autenticato con successo.</p>
      <p>Puoi ora tornare alla tua dashboard.</p>
      <button @click="authStore.logout">Logout</button> 

    </div>
  </div>
</template>
