<template>
  <div class="order-container">
    <h2>Avvia il tuo ordine</h2>
    <div class="divider"></div>
    <p>Completa i dettagli del tuo ordine per procedere con l'acquisto.</p>

    <form @submit.prevent="submitOrder">
      <div class="form-group">
        <label for="name">Nome Completo</label>
        <input type="text" id="name" v-model="order.name" required />
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
import { ref } from 'vue';

const order = ref({
  name: '',
  address: '',
  email: '',
  phone: '',
  payment: 'credit-card',
});

const submitOrder = () => {
  // Logica per inviare l'ordine
  console.log('Ordine inviato:', order.value);
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