<template>
  <div class="checkout-page">
    <section class="checkout-card">
      <header class="checkout-card__header">
        <p class="checkout-card__eyebrow">Checkout</p>
        <h1>Conferma i dati dell'ordine</h1>
        <p>Il totale verra ricalcolato dal server prima del pagamento.</p>
      </header>

      <form class="checkout-form" @submit.prevent="submitOrder">
        <div class="checkout-form__grid">
          <label class="checkout-form__field">
            <span>Nome</span>
            <input v-model.trim="order.name" type="text" autocomplete="given-name" required />
          </label>

          <label class="checkout-form__field">
            <span>Cognome</span>
            <input v-model.trim="order.surname" type="text" autocomplete="family-name" required />
          </label>

          <label class="checkout-form__field checkout-form__field--full">
            <span>Indirizzo di spedizione</span>
            <input
              v-model.trim="order.address"
              type="text"
              autocomplete="street-address"
              required
            />
          </label>

          <label class="checkout-form__field">
            <span>Email</span>
            <input v-model.trim="order.email" type="email" autocomplete="email" required />
          </label>

          <label class="checkout-form__field">
            <span>Telefono</span>
            <input v-model.trim="order.phone" type="tel" autocomplete="tel" required />
          </label>
        </div>

        <div class="checkout-summary">
          <div class="checkout-summary__header">
            <h2>Riepilogo</h2>
            <span>{{ cartStore.itemCount }} articoli</span>
          </div>

          <ul class="checkout-summary__items">
            <li v-for="item in cartStore.cart" :key="item.codeItem" class="checkout-summary__item">
              <div>
                <p>{{ item.name }}</p>
                <span>{{ item.quantity }} x {{ formatCurrency(item.price) }}</span>
              </div>
              <strong>{{ formatCurrency(item.price * item.quantity) }}</strong>
            </li>
          </ul>

          <div class="checkout-summary__totals">
            <div>
              <span>Subtotale</span>
              <strong>{{ formatCurrency(cartStore.total) }}</strong>
            </div>
            <div>
              <span>Spedizione</span>
              <strong>Calcolata al prossimo step</strong>
            </div>
          </div>
        </div>

        <button type="submit" class="checkout-form__submit" :disabled="isSubmitting || cartStore.itemCount === 0">
          {{ isSubmitting ? 'Preparazione checkout...' : 'Vai al pagamento' }}
        </button>

        <p v-if="errorMessage" class="checkout-form__message checkout-form__message--error">
          {{ errorMessage }}
        </p>
      </form>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useAuthStore } from '~/stores/authStore';
import { useCartStore } from '~/stores/cartStore';

useNoIndexPageSeo({
  title: 'Checkout',
  description: 'Conferma i dati del tuo ordine prima del pagamento.',
  path: '/order',
})

const authStore = useAuthStore();
const cartStore = useCartStore();

const isSubmitting = ref(false);
const errorMessage = ref('');
const order = ref({
  name: '',
  surname: '',
  address: '',
  email: '',
  phone: '',
});

function toPositiveProductId(item) {
  const rawValue = item?.id ?? item?.productId ?? item?.codeItem;
  const parsed = Number.parseInt(String(rawValue), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function toPositiveQuantity(value) {
  const parsed = Number.parseInt(String(value ?? 1), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return 1;
  return parsed;
}

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return `${amount.toFixed(2)} €`;
}

function hydrateCustomerData() {
  const user = authStore.user;
  if (!user) return;

  if (!order.value.name) {
    order.value.name = user.name || '';
  }

  if (!order.value.surname) {
    order.value.surname = user.surname || '';
  }

  if (!order.value.email) {
    order.value.email = user.email || '';
  }

  if (!order.value.address) {
    order.value.address = user.address || '';
  }

  if (!order.value.phone) {
    order.value.phone = user.number || '';
  }
}

onMounted(async () => {
  cartStore.loadCartFromLocalStorage();
  await authStore.initialize();
  hydrateCustomerData();
});

watch(
  () => authStore.user,
  () => {
    hydrateCustomerData();
  },
  { immediate: true }
);

async function submitOrder() {
  errorMessage.value = '';

  if (
    !order.value.name ||
    !order.value.surname ||
    !order.value.address ||
    !order.value.email ||
    !order.value.phone
  ) {
    errorMessage.value = 'Compila tutti i campi obbligatori.';
    return;
  }

  if (cartStore.itemCount === 0) {
    errorMessage.value = 'Il carrello e vuoto. Aggiungi almeno un prodotto prima del checkout.';
    return;
  }

  const products = cartStore.cart
    .map((item) => {
      const id = toPositiveProductId(item);
      if (!id) return null;
      return {
        id,
        quantity: toPositiveQuantity(item.quantity),
      };
    })
    .filter((item) => item !== null);

  if (products.length === 0) {
    errorMessage.value = 'Il carrello contiene articoli non validi.';
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await $fetch('/api/order/order', {
      method: 'POST',
      body: {
        name: order.value.name,
        surname: order.value.surname,
        address: order.value.address,
        email: order.value.email,
        phone: order.value.phone,
        products,
      },
    });

    const checkoutId = response?.checkout?.id;
    if (!checkoutId) {
      throw new Error('Checkout non valido');
    }

    await navigateTo({
      path: '/payment',
      query: { checkout: checkoutId },
    });
  } catch (error) {
    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      'Si e verificato un errore durante la preparazione del checkout.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: calc(100vh - 120px);
  padding: 32px 16px;
  background:
    radial-gradient(circle at top left, rgba(17, 24, 39, 0.06), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

.checkout-card {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
}

.checkout-card__header {
  margin-bottom: 24px;
}

.checkout-card__header h1 {
  margin: 0 0 8px;
  font-size: clamp(28px, 3vw, 40px);
  color: #0f172a;
}

.checkout-card__header p {
  margin: 0;
  color: #475569;
}

.checkout-card__eyebrow {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #0f766e;
}

.checkout-form {
  display: grid;
  gap: 24px;
}

.checkout-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.checkout-form__field {
  display: grid;
  gap: 8px;
  color: #0f172a;
  font-weight: 600;
}

.checkout-form__field input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: #fff;
  color: #0f172a;
  font-weight: 500;
}

.checkout-form__field input:focus {
  outline: none;
  border-color: #0f766e;
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
}

.checkout-form__field--full {
  grid-column: 1 / -1;
}

.checkout-summary {
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 20px;
  padding: 20px;
  background: #f8fafc;
}

.checkout-summary__header,
.checkout-summary__item,
.checkout-summary__totals div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.checkout-summary__header {
  align-items: baseline;
  margin-bottom: 18px;
}

.checkout-summary__header h2 {
  margin: 0;
  color: #0f172a;
}

.checkout-summary__header span,
.checkout-summary__item span {
  color: #64748b;
}

.checkout-summary__items {
  display: grid;
  gap: 14px;
  margin: 0 0 18px;
  padding: 0;
  list-style: none;
}

.checkout-summary__item p {
  margin: 0 0 2px;
  font-weight: 600;
  color: #0f172a;
}

.checkout-summary__totals {
  display: grid;
  gap: 10px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.24);
}

.checkout-form__submit {
  padding: 16px 20px;
  border: none;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.checkout-form__submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.checkout-form__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkout-form__message {
  margin: 0;
  font-weight: 600;
}

.checkout-form__message--error {
  color: #b91c1c;
}

@media (max-width: 768px) {
  .checkout-card {
    padding: 24px 18px;
    border-radius: 18px;
  }

  .checkout-form__grid {
    grid-template-columns: 1fr;
  }

  .checkout-form__field--full {
    grid-column: auto;
  }

  .checkout-summary__header,
  .checkout-summary__item,
  .checkout-summary__totals div {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
