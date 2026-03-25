<template>
  <div class="payment-page">
    <section class="payment-card">
      <header class="payment-card__header">
        <p class="payment-card__eyebrow">Pagamento</p>
        <h1>Completa il pagamento</h1>
        <p v-if="checkout">
          Checkout #{{ checkout.id }} · Scade il {{ formatDateTime(checkout.expiresAt) }}
        </p>
      </header>

      <div v-if="isPreparing" class="payment-state payment-state--loading">
        Stiamo preparando il pagamento sicuro...
      </div>

      <div v-else-if="pageError" class="payment-state payment-state--error">
        {{ pageError }}
      </div>

      <div v-else-if="checkout" class="payment-layout">
        <div class="payment-summary">
          <h2>Riepilogo ordine</h2>

          <ul class="payment-summary__items">
            <li v-for="item in checkout.items" :key="item.id" class="payment-summary__item">
              <div class="payment-summary__product">
                <img
                  :src="item.productPhoto || fallbackImage"
                  :alt="item.productName"
                  width="64"
                  height="64"
                />
                <div>
                  <p>{{ item.productName }}</p>
                  <span>{{ item.quantity }} x {{ formatCurrency(item.unitPrice) }}</span>
                </div>
              </div>
              <strong>{{ formatCurrency(item.lineTotal) }}</strong>
            </li>
          </ul>

          <div class="payment-summary__totals">
            <div>
              <span>Subtotale</span>
              <strong>{{ formatCurrency(checkout.amounts.subtotal) }}</strong>
            </div>
            <div>
              <span>Spedizione</span>
              <strong>{{ formatCurrency(checkout.amounts.shipping) }}</strong>
            </div>
            <div class="payment-summary__total">
              <span>Totale</span>
              <strong>{{ formatCurrency(checkout.amounts.total) }}</strong>
            </div>
          </div>

          <div class="payment-summary__customer">
            <h3>Spedizione</h3>
            <p>{{ checkout.customer.name }} {{ checkout.customer.surname }}</p>
            <p>{{ checkout.customer.address }}</p>
            <p>{{ checkout.customer.email }} · {{ checkout.customer.phone }}</p>
          </div>
        </div>

        <div class="payment-form-card">
          <div class="payment-form-card__badge">Stripe</div>
          <h2>Carta di pagamento</h2>
          <p>Il totale e stato calcolato dal server e associato al tuo checkout.</p>

          <form @submit.prevent="handleSubmit" class="payment-form">
            <div
              id="card-element"
              ref="cardElementContainer"
              class="payment-form__stripe"
            ></div>

            <button type="submit" :disabled="isSubmitting || !stripe || !clientSecret">
              {{ isSubmitting ? 'Conferma in corso...' : `Paga ${formatCurrency(checkout.amounts.total)}` }}
            </button>
          </form>

          <p v-if="paymentMessage" class="payment-form__message payment-form__message--info">
            {{ paymentMessage }}
          </p>
          <p v-if="paymentError" class="payment-form__message payment-form__message--error">
            {{ paymentError }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { loadStripe } from '@stripe/stripe-js';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRuntimeConfig } from '#app';
import { useCartStore } from '~/stores/cartStore';

useNoIndexPageSeo({
  title: 'Pagamento',
  description: 'Completa il pagamento in modo sicuro con totale calcolato dal server.',
  path: '/payment',
})

const route = useRoute();
const config = useRuntimeConfig();
const cartStore = useCartStore();
const fallbackImage = 'https://via.placeholder.com/64?text=Prodotto';

const stripe = ref(null);
const elements = ref(null);
const cardElement = ref(null);
const cardElementContainer = ref(null);
const clientSecret = ref('');
const checkout = ref(null);
const isPreparing = ref(true);
const isSubmitting = ref(false);
const pageError = ref('');
const paymentError = ref('');
const paymentMessage = ref('');

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return `${amount.toFixed(2)} €`;
}

function formatDateTime(value) {
  if (!value) return '';

  return new Date(value).toLocaleString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCheckoutId() {
  const queryValue = route.query.checkout;
  return typeof queryValue === 'string' && queryValue.trim() ? queryValue.trim() : '';
}

async function ensureStripeLoaded() {
  await nextTick();

  if (!cardElementContainer.value) {
    throw new Error('Il form carta non e ancora disponibile.');
  }

  if (!stripe.value) {
    if (!config.public.stripePublicKey) {
      throw new Error('Stripe non configurato lato client');
    }

    stripe.value = await loadStripe(config.public.stripePublicKey);
    if (!stripe.value) {
      throw new Error('Impossibile inizializzare Stripe');
    }
  }

  if (!elements.value) {
    elements.value = stripe.value.elements();
  }

  if (!cardElement.value) {
    cardElement.value = elements.value.create('card');
    cardElement.value.mount(cardElementContainer.value);
  }
}

async function preparePayment() {
  paymentError.value = '';
  paymentMessage.value = '';
  pageError.value = '';
  isPreparing.value = true;

  try {
    const checkoutId = getCheckoutId();
    if (!checkoutId) {
      throw new Error('Checkout non valido. Torna al riepilogo ordine.');
    }

    const response = await $fetch('/api/payment', {
      method: 'POST',
      body: {
        checkoutSessionId: checkoutId,
      },
    });

    if (response?.status === 'completed' && response?.order?.id) {
      cartStore.clearCart();
      await navigateTo({
        path: '/order/success',
        query: { orderId: response.order.id },
      });
      return;
    }

    if (!response?.clientSecret || !response?.checkout) {
      throw new Error('Impossibile preparare il pagamento per questo checkout.');
    }

    checkout.value = response.checkout;
    clientSecret.value = response.clientSecret;
    isPreparing.value = false;
    await nextTick();
    await ensureStripeLoaded();
  } catch (error) {
    pageError.value =
      error?.data?.message ||
      error?.message ||
      'Si e verificato un errore durante la preparazione del pagamento.';
  } finally {
    if (isPreparing.value) {
      isPreparing.value = false;
    }
  }
}

async function finalizePayment() {
  const checkoutId = getCheckoutId();
  const response = await $fetch('/api/payment/confirm', {
    method: 'POST',
    body: {
      checkoutSessionId: checkoutId,
    },
  });

  if (response?.status === 'completed' && response?.order?.id) {
    cartStore.clearCart();
    await navigateTo({
      path: '/order/success',
      query: { orderId: response.order.id },
    });
    return;
  }

  checkout.value = response?.checkout || checkout.value;
  paymentMessage.value =
    response?.status === 'processing'
      ? 'Pagamento ricevuto. Stiamo attendendo la conferma finale del provider.'
      : 'Pagamento confermato, ma il checkout non risulta ancora finalizzato. Aggiorna la pagina tra qualche secondo.';
}

async function handleSubmit() {
  paymentError.value = '';
  paymentMessage.value = '';

  if (!stripe.value || !cardElement.value || !clientSecret.value || !checkout.value) {
    paymentError.value = 'Pagamento non inizializzato correttamente.';
    return;
  }

  isSubmitting.value = true;

  try {
    const { error, paymentIntent } = await stripe.value.confirmCardPayment(clientSecret.value, {
      payment_method: {
        card: cardElement.value,
        billing_details: {
          name: `${checkout.value.customer.name} ${checkout.value.customer.surname}`.trim(),
          email: checkout.value.customer.email,
          phone: checkout.value.customer.phone,
        },
      },
    });

    if (error) {
      paymentError.value = error.message || 'Pagamento fallito.';
      return;
    }

    if (!paymentIntent) {
      paymentError.value = 'Conferma pagamento non disponibile.';
      return;
    }

    await finalizePayment();
  } catch (error) {
    paymentError.value =
      error?.data?.message ||
      error?.message ||
      'Si e verificato un errore durante il pagamento.';
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(async () => {
  await preparePayment();
});

onBeforeUnmount(() => {
  if (cardElement.value) {
    cardElement.value.destroy();
    cardElement.value = null;
  }
});
</script>

<style scoped>
.payment-page {
  min-height: calc(100vh - 120px);
  padding: 32px 16px;
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

.payment-card {
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
}

.payment-card__header {
  margin-bottom: 28px;
}

.payment-card__eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #0f766e;
}

.payment-card__header h1 {
  margin: 0 0 8px;
  font-size: clamp(28px, 3vw, 40px);
  color: #0f172a;
}

.payment-card__header p {
  margin: 0;
  color: #475569;
}

.payment-state {
  padding: 18px 20px;
  border-radius: 18px;
  font-weight: 600;
}

.payment-state--loading {
  background: rgba(15, 23, 42, 0.05);
  color: #0f172a;
}

.payment-state--error {
  background: rgba(220, 38, 38, 0.08);
  color: #b91c1c;
}

.payment-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 24px;
}

.payment-summary,
.payment-form-card {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 22px;
  padding: 24px;
  background: #fff;
}

.payment-summary h2,
.payment-form-card h2,
.payment-summary__customer h3 {
  margin: 0 0 14px;
  color: #0f172a;
}

.payment-summary__items {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.payment-summary__item,
.payment-summary__totals div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.payment-summary__product {
  display: flex;
  align-items: center;
  gap: 14px;
}

.payment-summary__product img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 14px;
  background: #f1f5f9;
}

.payment-summary__product p {
  margin: 0 0 4px;
  font-weight: 600;
  color: #0f172a;
}

.payment-summary__product span,
.payment-form-card p,
.payment-summary__customer p {
  margin: 0;
  color: #64748b;
}

.payment-summary__totals {
  display: grid;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.24);
}

.payment-summary__total {
  padding-top: 10px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.payment-summary__customer {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.24);
}

.payment-form-card {
  align-self: start;
  position: sticky;
  top: 24px;
}

.payment-form-card__badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 14px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.payment-form {
  display: grid;
  gap: 18px;
  margin-top: 24px;
}

.payment-form__stripe {
  min-height: 56px;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  background: #fff;
}

.payment-form button {
  padding: 16px 20px;
  border: none;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.payment-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.payment-form__message {
  margin: 16px 0 0;
  font-weight: 600;
}

.payment-form__message--info {
  color: #0f766e;
}

.payment-form__message--error {
  color: #b91c1c;
}

@media (max-width: 960px) {
  .payment-layout {
    grid-template-columns: 1fr;
  }

  .payment-form-card {
    position: static;
  }
}

@media (max-width: 640px) {
  .payment-card {
    padding: 24px 18px;
    border-radius: 18px;
  }

  .payment-summary__item,
  .payment-summary__totals div {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
