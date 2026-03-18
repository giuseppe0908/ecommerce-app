<template>
  <section class="product-management-widget">
    <header class="widget-header">
      <div>
        <h3>Snapshot catalogo</h3>
        <p>Vista rapida sullo stato prodotti senza uscire dalla dashboard admin.</p>
      </div>
      <NuxtLink to="/admin/allProducts" class="widget-link">
        Apri gestione completa
      </NuxtLink>
    </header>

    <div v-if="pending" class="widget-state">
      <div class="spinner" aria-hidden="true"></div>
      <span>Caricamento catalogo...</span>
    </div>

    <div v-else-if="errorMessage" class="widget-state widget-state--error">
      {{ errorMessage }}
    </div>

    <div v-else class="widget-body">
      <div class="stat-grid">
        <article class="stat-box">
          <strong>{{ stats.total }}</strong>
          <span>Prodotti</span>
        </article>
        <article class="stat-box">
          <strong>{{ stats.onSale }}</strong>
          <span>In promo</span>
        </article>
        <article class="stat-box">
          <strong>{{ stats.lowStock }}</strong>
          <span>Stock basso</span>
        </article>
      </div>

      <div class="list-block">
        <div class="list-header">
          <h4>Priorita stock</h4>
          <button type="button" class="refresh-button" @click="refresh">Aggiorna</button>
        </div>

        <ul v-if="lowStockProducts.length" class="product-list">
          <li v-for="product in lowStockProducts" :key="product.id" class="product-row">
            <div>
              <strong>{{ product.name }}</strong>
              <span>{{ product.brand?.name || 'Brand n/d' }}</span>
            </div>
            <span
              :class="[
                'stock-pill',
                Number(product.available_quantity) === 0 ? 'stock-pill--danger' : 'stock-pill--warning',
              ]"
            >
              {{ Number(product.available_quantity) === 0 ? 'Esaurito' : `${product.available_quantity} pezzi` }}
            </span>
          </li>
        </ul>
        <p v-else class="empty-copy">Nessun prodotto con stock critico.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const { data, pending, error, refresh } = await useFetch('/api/products');

const products = computed(() => (Array.isArray(data.value) ? data.value : []));
const stats = computed(() => ({
  total: products.value.length,
  onSale: products.value.filter((product) => product.promo).length,
  lowStock: products.value.filter(
    (product) => Number(product.available_quantity) >= 0 && Number(product.available_quantity) <= 5
  ).length,
}));

const lowStockProducts = computed(() =>
  [...products.value]
    .filter((product) => Number(product.available_quantity) >= 0 && Number(product.available_quantity) <= 5)
    .sort((left, right) => Number(left.available_quantity) - Number(right.available_quantity))
    .slice(0, 5)
);

const errorMessage = computed(
  () => error.value?.data?.message || error.value?.message || ''
);
</script>

<style scoped>
.product-management-widget {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.widget-header,
.list-header,
.product-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.widget-header h3,
.list-header h4 {
  margin: 0;
}

.widget-header p,
.empty-copy,
.product-row span {
  margin: 0.3rem 0 0;
  color: #475569;
}

.widget-link,
.refresh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  padding: 0.75rem 0.95rem;
  font-weight: 700;
  text-decoration: none;
}

.widget-link {
  background: #2563eb;
  color: #fff;
}

.refresh-button {
  border: 0;
  background: #e2e8f0;
  color: #0f172a;
  cursor: pointer;
}

.widget-body,
.list-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.stat-box {
  padding: 0.9rem;
  border-radius: 16px;
  background: #eff6ff;
}

.stat-box strong {
  display: block;
  font-size: 1.5rem;
  color: #1d4ed8;
}

.stat-box span {
  color: #475569;
}

.product-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-row {
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.product-row strong {
  display: block;
  margin-bottom: 0.15rem;
}

.stock-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.3rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 700;
}

.stock-pill--warning {
  background: #fef3c7;
  color: #92400e;
}

.stock-pill--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.widget-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 16px;
  background: #eff6ff;
  color: #1d4ed8;
}

.widget-state--error {
  background: #fef2f2;
  color: #991b1b;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(37, 99, 235, 0.18);
  border-top-color: currentColor;
  border-radius: 999px;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .widget-header,
  .list-header,
  .product-row {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
