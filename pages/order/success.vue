<template>
  <div class="order-success-page">
    <section class="order-success-card">
      <div class="order-success-card__badge">Pagamento completato</div>
      <h1>Ordine confermato</h1>
      <p v-if="orderId">
        Il tuo ordine <strong>#{{ orderId }}</strong> e stato registrato correttamente.
      </p>
      <p v-else>
        Il tuo ordine e stato registrato correttamente.
      </p>

      <div class="order-success-card__actions">
        <NuxtLink to="/dashboard" class="order-success-card__button order-success-card__button--primary">
          Vai ai tuoi ordini
        </NuxtLink>
        <NuxtLink to="/product" class="order-success-card__button order-success-card__button--secondary">
          Continua lo shopping
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
useNoIndexPageSeo({
  title: 'Ordine confermato',
  description: 'Conferma finale del pagamento e registrazione dell ordine completate.',
  path: '/order/success',
})

const route = useRoute();
const orderId = computed(() => {
  const queryValue = route.query.orderId;
  return typeof queryValue === 'string' && queryValue.trim() ? queryValue.trim() : '';
});
</script>

<style scoped>
.order-success-page {
  min-height: calc(100vh - 120px);
  padding: 32px 16px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.12), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

.order-success-card {
  width: min(640px, 100%);
  padding: 40px 32px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
  text-align: center;
}

.order-success-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.order-success-card h1 {
  margin: 0 0 12px;
  font-size: clamp(30px, 4vw, 46px);
  color: #0f172a;
}

.order-success-card p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.order-success-card__actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.order-success-card__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  padding: 14px 18px;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.order-success-card__button:hover {
  transform: translateY(-1px);
}

.order-success-card__button--primary {
  background: #0f172a;
  color: #fff;
}

.order-success-card__button--secondary {
  background: #fff;
  color: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.4);
}
</style>
