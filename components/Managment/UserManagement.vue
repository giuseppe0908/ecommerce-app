<template>
    <div>
      <h2>Gestione Utenti</h2>
      <button @click="showAddUserForm = true">Aggiungi Utente</button>
  
      <div v-if="showAddUserForm">
        <h3>Aggiungi Utente</h3>
        <form @submit.prevent="addUser">
          <div class="form-group">
            <label for="name">Nome</label>
            <input type="text" id="name" v-model="newUser.name" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="newUser.email" required />
          </div>
          <button type="submit">Aggiungi</button>
        </form>
      </div>
  
      <h3>Lista Utenti</h3>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.name }} - {{ user.email }}
          <button @click="editUser(user)">Modifica</button>
          <button @click="deleteUser(user.id)">Elimina</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const users = ref([
    { id: 1, name: 'Utente 1', email: 'utente1@example.com' },
    { id: 2, name: 'Utente 2', email: 'utente2@example.com' },
  ]);
  
  const newUser = ref({ name: '', email: '' });
  const showAddUserForm = ref(false);
  
  const addUser = () => {
    const newId = users.value.length ? users.value[users.value.length - 1].id + 1 : 1;
    users.value.push({ ...newUser.value, id: newId });
    newUser.value = { name: '', email: '' };
    showAddUserForm.value = false;
  };
  
  const editUser = (user) => {
    // Logica per modificare l'utente
  };
  
  const deleteUser = (id) => {
    users.value = users.value.filter(user => user.id !== id);
  };
  </script>
  
  <style scoped>
  .form-group {
    margin-bottom: 10px;
  }
  
  button {
    margin-right: 10px;
  }
  </style>