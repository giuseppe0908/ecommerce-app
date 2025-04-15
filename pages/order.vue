<template>
  <div class="order-container">
    <h2>Avvia il tuo ordine</h2>
    <div class="divider"></div>
    <p>Completa i dettagli del tuo ordine per procedere con l'acquisto.</p>

    <form @submit.prevent="submitOrder">
      <div class="form-group">
        <label for="name">Nome</label>
        <input type="text" id="name" v-model="order.name" required />
      </div>

      <div class="form-group">
        <label for="surname">Cognome</label>
        <input type="text" id="surname" v-model="order.surname" required />
      </div>

      <div class="form-group">
        <label for="address">Indirizzo di Spedizione</label>
        <input type="text" id="address" v-model="order.address" required />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="order.email" required />
      </div>

      <div class="form-group">
        <label for="phone">Numero di Telefono</label>
        <input type="tel" id="phone" v-model="order.phone" required />
      </div>

      <div class="form-group">
        <label for="payment">Metodo di Pagamento</label>
        <select id="payment" v-model="order.payment" required>
          <option value="credit-card">Carta di Credito</option>
          <option value="paypal">PayPal</option>
          <option value="bank-transfer">Bonifico Bancario</option>
        </select>
      </div>

      <button type="submit" class="submit-button">Completa Ordine</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Recupera i prodotti dal localStorage
const lsItems = JSON.parse(localStorage.getItem('carrello')) || [];
// Estrai gli ID e le quantità dei prodotti
const products = lsItems.map(item => ({ id: item.id, quantity: item.quantity }));
// Recupera il prezzo totale e fai il cast a intero
const prezzo = parseInt(localStorage.getItem('prezzototal'))
const order = ref({
  name: '',
  surname: '',
  address: '',
  email: '',
  phone: '',
  payment: 'credit-card',
  products: products,
  totalPrice: prezzo,
});

// Funzione per controllare se l'utente è registrato e compilare i campi
const checkUserData = () => {
  if (process.client) {
    // Controlla se esiste un utente nel localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Compila i campi del form con i dati dell'utente
        order.value.name = user.name || '';
        order.value.surname = user.surname || '';
        order.value.email = user.email || '';
        // Se l'utente ha un indirizzo salvato, compila anche quello
        if (user.address) {
          order.value.address = user.address;
        }
        // Se l'utente ha un numero di telefono salvato, compila anche quello
        if (user.number) {
          order.value.phone = user.number;
        }
      } catch (error) {
        console.error('Errore nel parsing dei dati utente:', error);
      }
    }
  }
};

// Esegui il controllo quando il componente viene montato
onMounted(() => {
  checkUserData();
});

const submitOrder = async () => {
  // Controlla che tutti i campi siano riempiti
  if (!order.value.name.trim() || !order.value.surname.trim() || !order.value.address.trim() || !order.value.email.trim() || !order.value.phone.trim()) {
    alert("Per favore, compila tutti i campi.");
    return;
  }
  console.log('Ordine inviato:', order.value);
  try {
    const response = await fetch("/api/order/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Assicurati che il corpo sia interpretato come JSON
      },
      body: JSON.stringify(order.value), // Serializza il form come JSON
    });
    if (!response.ok) {
      throw new Error('Errore durante l\'invio dell\'ordine');
    }

    const result = await response.json();
    console.log('Ordine inviato con successo:', result);

    // Resetta il carrello e l'ordine
    localStorage.removeItem('carrello');
    localStorage.removeItem('prezzototal');
    order.value = {
      fullName: '',
      address: '',
      email: '',
      phone: '',
      payment: 'credit-card',
      products: [],
      totalPrice: 0,
    };

    alert('Ordine completato con successo!');
  } catch (error) {
    console.error('Errore:', error);
    alert('Si è verificato un errore durante l\'invio dell\'ordine.');
  }
};
</script>

<style scoped>
.order-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.divider {
  height: 2px;
  background-color: #ddd;
  margin: 20px 0;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.submit-button:hover {
  background-color: #0056b3;
}
</style>