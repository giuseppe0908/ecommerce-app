<template>
  <div class="admin-products-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Backoffice catalogo</p>
        <h1>Gestione prodotti</h1>
        <p class="subtitle">
          Crea, aggiorna ed elimina i prodotti del catalogo con tassonomie e media coerenti.
        </p>
      </div>
      <button type="button" class="primary-button" @click="openCreateModal">
        Nuovo prodotto
      </button>
    </header>

    <section class="stats-grid">
      <article class="stat-card">
        <strong>{{ productStats.total }}</strong>
        <span>Prodotti totali</span>
      </article>
      <article class="stat-card">
        <strong>{{ productStats.onSale }}</strong>
        <span>In promozione</span>
      </article>
      <article class="stat-card">
        <strong>{{ productStats.lowStock }}</strong>
        <span>Stock basso</span>
      </article>
      <article class="stat-card">
        <strong>{{ productStats.newArrivals }}</strong>
        <span>Nuovi arrivi</span>
      </article>
    </section>

    <section class="toolbar">
      <label class="search-box">
        <span class="sr-only">Cerca prodotti</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model.trim="searchQuery"
          type="search"
          placeholder="Cerca per nome, codice, categoria o brand"
        />
      </label>

      <label class="filter-box">
        <span>Promozione</span>
        <select v-model="promoFilter">
          <option value="all">Tutti</option>
          <option value="promo">Solo promo</option>
          <option value="regular">Solo prezzo pieno</option>
        </select>
      </label>

      <label class="filter-box">
        <span>Stock</span>
        <select v-model="stockFilter">
          <option value="all">Tutti</option>
          <option value="low">Stock basso</option>
          <option value="out">Esauriti</option>
          <option value="available">Disponibili</option>
        </select>
      </label>
    </section>

    <div v-if="productsError" class="feedback feedback--error">
      {{ productsErrorMessage }}
    </div>
    <div v-if="pageFeedback" class="feedback feedback--success">
      {{ pageFeedback }}
    </div>
    <div v-if="deleteError" class="feedback feedback--error">
      {{ deleteError }}
    </div>

    <section v-if="productsPending" class="empty-state">
      <div class="spinner" aria-hidden="true"></div>
      <p>Caricamento prodotti...</p>
    </section>

    <section v-else-if="filteredProducts.length" class="products-grid">
      <article v-for="product in filteredProducts" :key="product.id" class="product-shell">
        <div class="product-card">
          <Card
            :id="product.id"
            :name="product.name"
            :img="product.photo"
            :promo="product.promo"
            :plus="product.plus"
            :price="product.price"
            :category="product.category?.name"
            :brand="product.brand?.name"
            :codeItem="product.codeItem"
            :onCardClick="preventCardNavigation"
          />

          <div class="product-meta">
            <div class="meta-row">
              <span>{{ product.brand?.name || 'Brand non assegnato' }}</span>
              <span>{{ product.category?.name || 'Categoria non assegnata' }}</span>
            </div>
            <div class="meta-row">
              <span>Codice: {{ product.codeItem }}</span>
              <span>Stock: {{ product.available_quantity }}</span>
            </div>
            <div class="meta-tags">
              <span v-if="product.newArrival" class="tag tag--info">New</span>
              <span v-if="product.promo" class="tag tag--sale">Promo</span>
              <span v-if="product.plus" class="tag tag--neutral">Plus</span>
              <span
                :class="[
                  'tag',
                  product.available_quantity === 0
                    ? 'tag--danger'
                    : product.available_quantity <= 5
                      ? 'tag--warning'
                      : 'tag--success',
                ]"
              >
                {{
                  product.available_quantity === 0
                    ? 'Esaurito'
                    : product.available_quantity <= 5
                      ? 'Stock basso'
                      : 'Disponibile'
                }}
              </span>
            </div>
          </div>

          <div class="card-actions">
            <button type="button" class="secondary-button" @click="openEditModal(product)">
              Modifica
            </button>
            <button type="button" class="danger-button" @click="openDeleteModal(product)">
              Elimina
            </button>
          </div>
        </div>
      </article>
    </section>

    <section v-else class="empty-state">
      <h2>Nessun prodotto trovato</h2>
      <p>Modifica filtri o crea un nuovo prodotto da catalogo.</p>
    </section>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showEditorModal" class="overlay" @click.self="closeEditorModal">
          <div class="editor-modal">
            <ProductEditorModal
              :mode="editorMode"
              :product-id="selectedProduct?.id || null"
              :initial-product="selectedProduct"
              @close="closeEditorModal"
              @saved="handleProductSaved"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDeleteModal" class="overlay" @click.self="closeDeleteModal">
          <div class="confirm-modal">
            <h2>Elimina prodotto</h2>
            <p>
              Stai per eliminare
              <strong>{{ productToDelete?.name }}</strong>.
              L azione rimuove il record dal catalogo.
            </p>
            <div class="confirm-actions">
              <button type="button" class="secondary-button" @click="closeDeleteModal">
                Annulla
              </button>
              <button type="button" class="danger-button" :disabled="isDeleting" @click="deleteProduct">
                <span v-if="isDeleting">Eliminazione...</span>
                <span v-else>Conferma eliminazione</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import Card from '~/components/Card.vue';
import ProductEditorModal from '~/components/Product/ProductEditorModal.vue';
import { useAuthStore } from '~/stores/authStore';

definePageMeta({
  middleware: ['auth'],
});

const authStore = useAuthStore();
onMounted(() => {
  authStore.initialize();
});

const searchQuery = ref('');
const promoFilter = ref('all');
const stockFilter = ref('all');
const pageFeedback = ref('');
const deleteError = ref('');
const showEditorModal = ref(false);
const editorMode = ref('create');
const selectedProduct = ref(null);
const showDeleteModal = ref(false);
const productToDelete = ref(null);
const isDeleting = ref(false);

const {
  data: productsData,
  pending: productsPending,
  error: productsError,
  refresh: refreshProducts,
} = await useAsyncData('admin-products', () => $fetch('/api/products'));

const products = computed(() => (Array.isArray(productsData.value) ? productsData.value : []));
const productsErrorMessage = computed(
  () => productsError.value?.data?.message || productsError.value?.message || 'Errore nel caricamento prodotti.'
);

const productStats = computed(() => {
  const items = products.value;
  return {
    total: items.length,
    onSale: items.filter((product) => product.promo).length,
    lowStock: items.filter(
      (product) => Number(product.available_quantity) > 0 && Number(product.available_quantity) <= 5
    ).length,
    newArrivals: items.filter((product) => product.newArrival).length,
  };
});

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return products.value.filter((product) => {
    const searchHaystack = [
      product.name,
      product.codeItem,
      product.category?.name,
      product.brand?.name,
      product.subCategory?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !query || searchHaystack.includes(query);

    const matchesPromo =
      promoFilter.value === 'all' ||
      (promoFilter.value === 'promo' && product.promo) ||
      (promoFilter.value === 'regular' && !product.promo);

    const quantity = Number(product.available_quantity || 0);
    const matchesStock =
      stockFilter.value === 'all' ||
      (stockFilter.value === 'low' && quantity > 0 && quantity <= 5) ||
      (stockFilter.value === 'out' && quantity === 0) ||
      (stockFilter.value === 'available' && quantity > 0);

    return matchesSearch && matchesPromo && matchesStock;
  });
});

function preventCardNavigation(event) {
  event.preventDefault();
  event.stopPropagation();
}

function resetFeedback() {
  pageFeedback.value = '';
  deleteError.value = '';
}

function openCreateModal() {
  resetFeedback();
  editorMode.value = 'create';
  selectedProduct.value = null;
  showEditorModal.value = true;
}

function openEditModal(product) {
  resetFeedback();
  editorMode.value = 'edit';
  selectedProduct.value = product;
  showEditorModal.value = true;
}

function closeEditorModal() {
  showEditorModal.value = false;
  selectedProduct.value = null;
}

function openDeleteModal(product) {
  resetFeedback();
  productToDelete.value = product;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  productToDelete.value = null;
}

async function handleProductSaved(savedProduct) {
  await refreshProducts();
  pageFeedback.value =
    editorMode.value === 'edit'
      ? `Prodotto "${savedProduct?.name || 'catalogo'}" aggiornato correttamente.`
      : `Prodotto "${savedProduct?.name || 'nuovo'}" creato correttamente.`;
  closeEditorModal();
}

async function deleteProduct() {
  if (!productToDelete.value?.id) return;

  isDeleting.value = true;
  deleteError.value = '';

  try {
    await $fetch(`/api/products/${productToDelete.value.id}`, {
      method: 'DELETE',
    });
    await refreshProducts();
    pageFeedback.value = `Prodotto "${productToDelete.value.name}" eliminato correttamente.`;
    closeDeleteModal();
  } catch (error) {
    deleteError.value =
      error?.data?.message || error?.response?._data?.message || 'Errore durante l eliminazione.';
  } finally {
    isDeleting.value = false;
  }
}
</script>

<style scoped>
.admin-products-page {
  min-height: 100vh;
  padding: 2rem;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  color: #0f172a;
}

.page-header,
.toolbar,
.stats-grid,
.card-actions,
.meta-row,
.confirm-actions {
  display: flex;
  gap: 1rem;
}

.page-header {
  align-items: end;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1;
}

.subtitle {
  max-width: 760px;
  margin: 0.6rem 0 0;
  color: #475569;
  line-height: 1.6;
}

.stats-grid {
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.stat-card {
  flex: 1 1 180px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.05);
}

.stat-card strong {
  font-size: 1.8rem;
}

.stat-card span {
  color: #475569;
}

.toolbar {
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.search-box,
.filter-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #dbeafe;
  padding: 0.85rem 1rem;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
}

.search-box {
  flex: 1 1 380px;
}

.search-box svg {
  width: 1.2rem;
  height: 1.2rem;
  color: #64748b;
}

.search-box input,
.filter-box select {
  width: 100%;
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
}

.search-box input:focus,
.filter-box select:focus {
  outline: none;
}

.filter-box {
  flex: 0 0 180px;
  justify-content: space-between;
}

.filter-box span {
  font-size: 0.88rem;
  font-weight: 700;
  color: #475569;
}

.feedback,
.empty-state {
  border-radius: 20px;
  padding: 1rem 1.1rem;
  margin-bottom: 1rem;
}

.feedback--error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.feedback--success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-height: 220px;
  text-align: center;
  background: rgba(255, 255, 255, 0.86);
  border: 1px dashed #cbd5e1;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(37, 99, 235, 0.18);
  border-top-color: #1d4ed8;
  border-radius: 999px;
  animation: spin 0.9s linear infinite;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.2rem;
}

.product-shell {
  display: flex;
}

.product-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.8rem;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.08);
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0 0.25rem;
}

.meta-row {
  justify-content: space-between;
  flex-wrap: wrap;
  color: #475569;
  font-size: 0.92rem;
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.28rem 0.62rem;
  font-size: 0.76rem;
  font-weight: 700;
}

.tag--info {
  background: #dbeafe;
  color: #1d4ed8;
}

.tag--sale {
  background: #fee2e2;
  color: #b91c1c;
}

.tag--neutral {
  background: #e2e8f0;
  color: #334155;
}

.tag--warning {
  background: #fef3c7;
  color: #92400e;
}

.tag--danger {
  background: #fecaca;
  color: #991b1b;
}

.tag--success {
  background: #dcfce7;
  color: #166534;
}

.card-actions {
  margin-top: auto;
}

.primary-button,
.secondary-button,
.danger-button {
  border: 0;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;
}

.primary-button {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
}

.secondary-button {
  flex: 1;
  background: #e2e8f0;
  color: #0f172a;
}

.danger-button {
  flex: 1;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
}

.primary-button:hover,
.secondary-button:hover,
.danger-button:hover {
  transform: translateY(-1px);
}

.primary-button:disabled,
.secondary-button:disabled,
.danger-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(10px);
}

.editor-modal {
  width: min(1120px, 100%);
  max-height: 92vh;
  overflow: auto;
}

.confirm-modal {
  width: min(440px, 100%);
  background: #fff;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.24);
}

.confirm-modal h2 {
  margin: 0 0 0.75rem;
}

.confirm-modal p {
  margin: 0 0 1.2rem;
  color: #475569;
  line-height: 1.6;
}

.confirm-actions {
  justify-content: flex-end;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .admin-products-page {
    padding: 1rem;
  }

  .page-header,
  .toolbar,
  .card-actions,
  .confirm-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-box {
    flex: 1 1 auto;
  }
}
</style>
