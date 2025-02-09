<template>
  <div>
    <h1>Pagamento</h1>
    <form id="payment-form" @submit.prevent="handleSubmit">
      <div id="card-element"></div>
      <button id="submit-button" :disabled="loading || !stripe">
        {{ loading ? 'Processing...' : 'Paga ora' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { loadStripe } from '@stripe/stripe-js';
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig(); // Recupera variabili d'ambiente in Nuxt 3

const stripe = ref(null);
const elements = ref(null);
const cardElement = ref(null);
const loading = ref(false);

onMounted(async () => {
  try {
    stripe.value = await loadStripe(config.public.stripePublicKey);
    if (!stripe.value) {
      console.error("Errore: Stripe non è stato caricato correttamente.");
      return;
    }

    elements.value = stripe.value.elements();
    cardElement.value = elements.value.create('card');
    cardElement.value.mount('#card-element');
  } catch (error) {
    console.error("Errore nel caricamento di Stripe:", error);
  }
});

const handleSubmit = async () => {
  loading.value = true;

  try {
    const { clientSecret } = await $fetch('/api/payment', {
      method: 'POST',
      body: {
        amount: 1000, // Importo in centesimi (10.00 EUR)
        currency: 'eur',
        description: 'Acquisto prodotto',
      },
    });

    if (!clientSecret) {
      throw new Error("Errore: Nessun clientSecret ricevuto.");
    }

    const { error } = await stripe.value.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement.value,
      },
    });

    if (error) {
      console.error('Errore nel pagamento:', error);
      alert('Pagamento fallito: ' + error.message);
    } else {
      alert('Pagamento completato con successo!');
    }
  } catch (error) {
    console.error("Errore durante il pagamento:", error);
    alert("Si è verificato un errore. Riprova.");
  } finally {
    loading.value = false;
  }
};
</script>
