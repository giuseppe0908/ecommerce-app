<template>
  <div class="editor-shell">
    <header class="editor-header">
      <div>
        <p class="eyebrow">{{ isEditMode ? 'Modifica catalogo' : 'Nuovo prodotto' }}</p>
        <h2 class="editor-title">
          {{ isEditMode ? 'Aggiorna prodotto' : 'Crea prodotto' }}
        </h2>
      </div>
      <button type="button" class="icon-button" @click="emit('close')" aria-label="Chiudi editor">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <div v-if="isBootstrapping" class="state-panel">
      <div class="spinner" aria-hidden="true"></div>
      <p>Caricamento dati prodotto e tassonomie...</p>
    </div>

    <div v-else-if="bootstrapError" class="state-panel state-panel--error">
      <h3>Impossibile aprire l'editor</h3>
      <p>{{ bootstrapError }}</p>
    </div>

    <form v-else class="editor-form" @submit.prevent="saveProduct">
      <div v-if="formError" class="status-banner status-banner--error">
        {{ formError }}
      </div>
      <div v-if="formSuccess" class="status-banner status-banner--success">
        {{ formSuccess }}
      </div>

      <div class="editor-grid">
        <section class="panel">
          <div class="section-header">
            <h3>Dettagli prodotto</h3>
            <p>Dati principali usati nel catalogo e nella PDP.</p>
          </div>

          <div class="field-grid">
            <label class="field field--full">
              <span>Nome prodotto</span>
              <input v-model.trim="form.name" type="text" minlength="3" maxlength="255" required />
            </label>

            <label class="field field--full">
              <span>Descrizione</span>
              <textarea v-model.trim="form.description" rows="4" required></textarea>
            </label>

            <label class="field">
              <span>Categoria</span>
              <select v-model.number="form.categoryId" required>
                <option :value="null" disabled>Seleziona categoria</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>Sottocategoria</span>
              <select v-model="form.subCategoryId">
                <option value="">Nessuna</option>
                <option
                  v-for="subCategory in availableSubCategories"
                  :key="subCategory.id"
                  :value="String(subCategory.id)"
                >
                  {{ subCategory.name }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>Brand</span>
              <select v-model.number="form.brandId" required>
                <option :value="null" disabled>Seleziona brand</option>
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>Genere</span>
              <select v-model.number="form.genderId" required>
                <option :value="null" disabled>Seleziona genere</option>
                <option v-for="gender in genders" :key="gender.id" :value="gender.id">
                  {{ gender.name }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>Prezzo</span>
              <input v-model.number="form.price" type="number" min="0" step="0.01" required />
            </label>

            <label class="field">
              <span>Quantita disponibile</span>
              <input
                v-model.number="form.available_quantity"
                type="number"
                min="0"
                step="1"
                required
              />
            </label>

            <label class="field">
              <span>Codice articolo</span>
              <input v-model.trim="form.codeItem" type="text" maxlength="100" required />
            </label>

            <label class="field">
              <span>Foto cover URL</span>
              <input v-model.trim="form.photo" type="url" placeholder="https://..." required />
            </label>
          </div>
        </section>

        <aside class="panel panel--aside">
          <div class="section-header">
            <h3>Merchandising</h3>
            <p>Flag commerciali e riepilogo rapido del prodotto.</p>
          </div>

          <div class="toggle-grid">
            <label class="toggle">
              <input v-model="form.promo" type="checkbox" />
              <span>In promozione</span>
            </label>
            <label class="toggle">
              <input v-model="form.plus" type="checkbox" />
              <span>Prodotto plus</span>
            </label>
            <label class="toggle">
              <input v-model="form.newArrival" type="checkbox" />
              <span>Nuovo arrivo</span>
            </label>
            <label class="toggle">
              <input v-model="form.favorite" type="checkbox" />
              <span>Featured interno</span>
            </label>
          </div>

          <label class="field">
            <span>Sconto percentuale</span>
            <input
              v-model.number="form.percentualPromo"
              type="number"
              min="0"
              max="100"
              step="1"
              :disabled="!form.promo"
            />
          </label>

          <div class="summary-card">
            <img :src="currentPreviewImage" alt="" class="summary-image" />
            <div class="summary-content">
              <strong>{{ form.name || 'Nuovo prodotto' }}</strong>
              <span>{{ selectedBrandName || 'Brand non selezionato' }}</span>
              <span>{{ selectedCategoryName || 'Categoria non selezionata' }}</span>
              <span>{{ formattedPrice }}</span>
              <span>Stock: {{ normalizedQuantity }}</span>
            </div>
          </div>

          <p v-if="isEditMode && currentRatingLabel" class="meta-note">
            Rating corrente: {{ currentRatingLabel }}. Il rating resta derivato dalle recensioni.
          </p>
          <p v-else class="meta-note">
            Le immagini avanzate per colore si gestiscono sotto, usando i record reali di
            `ProductImage`.
          </p>
        </aside>
      </div>

      <section class="panel media-panel">
        <div class="section-header">
          <h3>Media e immagini</h3>
          <p v-if="resolvedProductId">
            Gestisci immagini generali e immagini per colore con i dati reali del catalogo.
          </p>
          <p v-else>Salva prima il prodotto per abilitare la gestione immagini per colore.</p>
        </div>

        <div v-if="mediaError" class="status-banner status-banner--error">
          {{ mediaError }}
        </div>

        <div v-if="resolvedProductId" class="media-groups">
          <div class="media-group">
            <div class="media-group-header">
              <h4>Immagini generali</h4>
              <button type="button" class="secondary-button" @click="openAddImageModal('GENERAL')">
                Aggiungi immagine
              </button>
            </div>
            <div v-if="generalImages.length" class="image-grid">
              <article v-for="image in generalImages" :key="image.id" class="image-card">
                <img :src="image.imageUrl" alt="Immagine generale prodotto" />
                <button
                  type="button"
                  class="danger-link"
                  :disabled="isUpdatingMedia"
                  @click="removeImage(image.id)"
                >
                  Rimuovi
                </button>
              </article>
            </div>
            <p v-else class="empty-copy">Nessuna immagine generale caricata.</p>
          </div>

          <div v-if="availableColors.length" class="color-groups">
            <article v-for="color in availableColors" :key="color.id" class="media-group media-group--color">
              <div class="media-group-header">
                <div class="color-heading">
                  <span class="color-dot" :style="{ backgroundColor: color.hex || '#94a3b8' }"></span>
                  <h4>{{ color.name }}</h4>
                </div>
              </div>

              <div class="color-media-grid">
                <div class="image-slot image-slot--main">
                  <div class="image-slot-header">
                    <strong>Immagine principale</strong>
                    <button
                      type="button"
                      class="secondary-button"
                      @click="openAddImageModal('MAIN', color.id)"
                    >
                      {{ getMainImageForColor(color.id) ? 'Sostituisci' : 'Aggiungi' }}
                    </button>
                  </div>
                  <div v-if="getMainImageForColor(color.id)" class="image-card image-card--main">
                    <img :src="getMainImageForColor(color.id).imageUrl" alt="Immagine principale colore" />
                    <button
                      type="button"
                      class="danger-link"
                      :disabled="isUpdatingMedia"
                      @click="removeImage(getMainImageForColor(color.id).id)"
                    >
                      Rimuovi
                    </button>
                  </div>
                  <p v-else class="empty-copy">Nessuna immagine principale per questo colore.</p>
                </div>

                <div class="image-slot">
                  <div class="image-slot-header">
                    <strong>Immagini secondarie</strong>
                    <button
                      type="button"
                      class="secondary-button"
                      @click="openAddImageModal('SECONDARY', color.id)"
                    >
                      Aggiungi
                    </button>
                  </div>
                  <div v-if="getSecondaryImagesForColor(color.id).length" class="image-grid">
                    <article
                      v-for="image in getSecondaryImagesForColor(color.id)"
                      :key="image.id"
                      class="image-card"
                    >
                      <img :src="image.imageUrl" alt="Immagine secondaria colore" />
                      <button
                        type="button"
                        class="danger-link"
                        :disabled="isUpdatingMedia"
                        @click="removeImage(image.id)"
                      >
                        Rimuovi
                      </button>
                    </article>
                  </div>
                  <p v-else class="empty-copy">Nessuna immagine secondaria per questo colore.</p>
                </div>
              </div>
            </article>
          </div>

          <p v-else class="empty-copy">Questo prodotto non ha colori associati.</p>
        </div>

        <div v-else class="empty-copy">
          Il media manager avanzato si attiva dopo il primo salvataggio del prodotto.
        </div>
      </section>

      <footer class="editor-footer">
        <button type="button" class="secondary-button secondary-button--large" @click="emit('close')">
          Annulla
        </button>
        <button type="submit" class="primary-button" :disabled="isSaving">
          <span v-if="isSaving">Salvataggio in corso...</span>
          <span v-else>{{ isEditMode ? 'Salva modifiche' : 'Crea prodotto' }}</span>
        </button>
      </footer>
    </form>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showAddImageModal" class="overlay" @click.self="closeAddImageModal">
          <div class="inline-modal">
            <h3>Aggiungi immagine</h3>
            <p class="inline-modal-copy">
              {{ pendingImageLabel }}
            </p>
            <input
              v-model.trim="pendingImageUrl"
              class="modal-input"
              type="url"
              placeholder="https://..."
              @keyup.enter="confirmAddImage"
            />
            <div class="inline-modal-actions">
              <button type="button" class="secondary-button" @click="closeAddImageModal">
                Annulla
              </button>
              <button
                type="button"
                class="primary-button"
                :disabled="!pendingImageUrl || isUpdatingMedia"
                @click="confirmAddImage"
              >
                <span v-if="isUpdatingMedia">Salvataggio...</span>
                <span v-else>Aggiungi</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'edit',
  },
  productId: {
    type: Number,
    default: null,
  },
  initialProduct: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'saved']);

const categories = ref([]);
const brands = ref([]);
const genders = ref([]);

const isBootstrapping = ref(true);
const bootstrapError = ref('');
const isSaving = ref(false);
const formError = ref('');
const formSuccess = ref('');

const productDetail = ref(null);
const mediaState = ref({
  general: [],
  byColor: {},
});
const mediaError = ref('');
const isUpdatingMedia = ref(false);

const showAddImageModal = ref(false);
const pendingImageType = ref('GENERAL');
const pendingColorId = ref(null);
const pendingImageUrl = ref('');

const form = reactive(createEmptyForm());

const isEditMode = computed(() => props.mode === 'edit');
const resolvedProductId = computed(() => {
  if (productDetail.value?.id) return Number(productDetail.value.id);
  if (props.productId) return Number(props.productId);
  if (props.initialProduct?.id) return Number(props.initialProduct.id);
  return null;
});

const selectedCategory = computed(
  () => categories.value.find((category) => category.id === Number(form.categoryId)) || null
);
const availableSubCategories = computed(() => selectedCategory.value?.subCategories || []);
const selectedBrandName = computed(
  () => brands.value.find((brand) => brand.id === Number(form.brandId))?.name || ''
);
const selectedCategoryName = computed(() => selectedCategory.value?.name || '');
const availableColors = computed(() =>
  (productDetail.value?.productColors || [])
    .map((item) => item.color)
    .filter((color) => color?.id)
);
const generalImages = computed(() => mediaState.value.general || []);
const normalizedQuantity = computed(() => Number(form.available_quantity || 0));
const formattedPrice = computed(() =>
  Number.isFinite(Number(form.price)) ? `EUR ${Number(form.price).toFixed(2)}` : 'Prezzo non valido'
);
const currentPreviewImage = computed(() => {
  const mainColorImage = availableColors.value
    .map((color) => getMainImageForColor(color.id))
    .find(Boolean);
  return mainColorImage?.imageUrl || form.photo || 'https://placehold.co/640x640?text=Product';
});
const currentRatingLabel = computed(() => {
  const rating = productDetail.value?.rating;
  return Number.isFinite(Number(rating)) ? `${Number(rating).toFixed(1)}/5` : '';
});
const pendingImageLabel = computed(() => {
  if (pendingImageType.value === 'GENERAL') return 'Inserisci l URL di una immagine generale.';
  if (pendingImageType.value === 'MAIN') return 'Inserisci l URL della nuova immagine principale.';
  return 'Inserisci l URL della nuova immagine secondaria.';
});

watch(
  () => form.categoryId,
  () => {
    const activeSubCategoryIds = availableSubCategories.value.map((item) => String(item.id));
    if (!activeSubCategoryIds.includes(String(form.subCategoryId || ''))) {
      form.subCategoryId = '';
    }
  }
);

function createEmptyForm() {
  return {
    name: '',
    description: '',
    categoryId: null,
    subCategoryId: '',
    brandId: null,
    genderId: null,
    price: 0,
    available_quantity: 0,
    codeItem: '',
    photo: '',
    promo: false,
    plus: false,
    newArrival: false,
    favorite: false,
    percentualPromo: 0,
  };
}

function extractErrorMessage(error, fallbackMessage) {
  const payloadMessage = error?.data?.message || error?.response?._data?.message;
  if (payloadMessage) return String(payloadMessage);
  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
}

function populateForm(product) {
  form.name = product?.name || '';
  form.description = product?.description || '';
  form.categoryId = product?.category?.id || product?.categoryId || null;
  form.subCategoryId = product?.subCategory?.id
    ? String(product.subCategory.id)
    : product?.subCategoryId
      ? String(product.subCategoryId)
      : '';
  form.brandId = product?.brand?.id || product?.brandId || null;
  form.genderId = product?.gender?.id || product?.genderId || null;
  form.price = Number(product?.price || 0);
  form.available_quantity = Number(product?.available_quantity || 0);
  form.codeItem = product?.codeItem || '';
  form.photo = product?.photo || '';
  form.promo = Boolean(product?.promo);
  form.plus = Boolean(product?.plus);
  form.newArrival = Boolean(product?.newArrival);
  form.favorite = Boolean(product?.favorite);
  form.percentualPromo = Number(product?.percentualPromo || 0);
}

async function loadTaxonomies() {
  const [categoryPayload, brandPayload, genderPayload] = await Promise.all([
    $fetch('/api/categories'),
    $fetch('/api/brands'),
    $fetch('/api/genders'),
  ]);

  categories.value = Array.isArray(categoryPayload) ? categoryPayload : [];
  brands.value = Array.isArray(brandPayload) ? brandPayload : [];
  genders.value = Array.isArray(genderPayload) ? genderPayload : [];
}

async function loadProductDetail() {
  if (!resolvedProductId.value) return;

  const product = await $fetch(`/api/products/${resolvedProductId.value}`);
  productDetail.value = product;
  populateForm(product);
}

async function loadMedia() {
  if (!resolvedProductId.value) {
    mediaState.value = { general: [], byColor: {} };
    return;
  }

  const payload = await $fetch(`/api/products/images?productId=${resolvedProductId.value}`);
  mediaState.value = {
    general: Array.isArray(payload?.general) ? payload.general : [],
    byColor: payload?.byColor || {},
  };
}

function getMainImageForColor(colorId) {
  return mediaState.value.byColor?.[colorId]?.main || null;
}

function getSecondaryImagesForColor(colorId) {
  return mediaState.value.byColor?.[colorId]?.secondary || [];
}

function openAddImageModal(imageType, colorId = null) {
  if (!resolvedProductId.value) return;
  pendingImageType.value = imageType;
  pendingColorId.value = colorId ? Number(colorId) : null;
  pendingImageUrl.value = '';
  mediaError.value = '';
  showAddImageModal.value = true;
}

function closeAddImageModal() {
  showAddImageModal.value = false;
  pendingImageUrl.value = '';
  pendingColorId.value = null;
  pendingImageType.value = 'GENERAL';
}

async function confirmAddImage() {
  if (!resolvedProductId.value || !pendingImageUrl.value) return;

  isUpdatingMedia.value = true;
  mediaError.value = '';

  try {
    await $fetch('/api/products/images', {
      method: 'POST',
      body: {
        productId: resolvedProductId.value,
        colorId: pendingColorId.value,
        imageUrl: pendingImageUrl.value,
        imageType: pendingImageType.value,
      },
    });

    await Promise.all([loadProductDetail(), loadMedia()]);
    closeAddImageModal();
  } catch (error) {
    mediaError.value = extractErrorMessage(error, 'Errore durante il caricamento dell immagine.');
  } finally {
    isUpdatingMedia.value = false;
  }
}

async function removeImage(imageId) {
  if (!imageId) return;

  isUpdatingMedia.value = true;
  mediaError.value = '';

  try {
    await $fetch(`/api/products/images/${imageId}`, {
      method: 'DELETE',
    });
    await Promise.all([loadProductDetail(), loadMedia()]);
  } catch (error) {
    mediaError.value = extractErrorMessage(error, 'Errore durante la rimozione dell immagine.');
  } finally {
    isUpdatingMedia.value = false;
  }
}

function buildPayload() {
  const discount = form.promo ? Number(form.percentualPromo || 0) : 0;

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    categoryId: Number(form.categoryId),
    subCategoryId: form.subCategoryId ? Number(form.subCategoryId) : null,
    brandId: Number(form.brandId),
    genderId: Number(form.genderId),
    price: Number(form.price),
    available_quantity: Number(form.available_quantity),
    codeItem: form.codeItem.trim(),
    photo: form.photo.trim(),
    promo: Boolean(form.promo),
    plus: Boolean(form.plus),
    newArrival: Boolean(form.newArrival),
    favorite: Boolean(form.favorite),
    percentualPromo: discount,
  };
}

async function saveProduct() {
  isSaving.value = true;
  formError.value = '';
  formSuccess.value = '';

  try {
    const payload = buildPayload();
    const endpoint = isEditMode.value && resolvedProductId.value
      ? `/api/products/${resolvedProductId.value}`
      : '/api/products';
    const method = isEditMode.value && resolvedProductId.value ? 'PUT' : 'POST';

    const savedProduct = await $fetch(endpoint, {
      method,
      body: payload,
    });

    productDetail.value = savedProduct;
    formSuccess.value = isEditMode.value
      ? 'Prodotto aggiornato correttamente.'
      : 'Prodotto creato correttamente.';
    emit('saved', savedProduct);
  } catch (error) {
    formError.value = extractErrorMessage(error, 'Errore durante il salvataggio del prodotto.');
  } finally {
    isSaving.value = false;
  }
}

async function bootstrap() {
  isBootstrapping.value = true;
  bootstrapError.value = '';
  mediaError.value = '';

  if (props.initialProduct) {
    populateForm(props.initialProduct);
  }

  try {
    await loadTaxonomies();
    if (isEditMode.value && resolvedProductId.value) {
      await Promise.all([loadProductDetail(), loadMedia()]);
    } else {
      productDetail.value = null;
      mediaState.value = { general: [], byColor: {} };
    }
  } catch (error) {
    bootstrapError.value = extractErrorMessage(
      error,
      'Non sono riuscito a recuperare i dati necessari per l editor.'
    );
  } finally {
    isBootstrapping.value = false;
  }
}

onMounted(() => {
  bootstrap();
});
</script>

<style scoped>
.editor-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: #fff;
  border-radius: 24px;
  padding: 1.5rem;
  color: #0f172a;
}

.editor-header,
.editor-footer,
.section-header,
.media-group-header,
.image-slot-header,
.inline-modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #475569;
}

.editor-title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.1;
}

.icon-button,
.secondary-button,
.primary-button,
.danger-link {
  border: 0;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;
}

.icon-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: #eef2ff;
  color: #312e81;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-button svg {
  width: 1.2rem;
  height: 1.2rem;
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
  gap: 1.25rem;
}

.panel {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
}

.panel--aside {
  align-self: start;
}

.section-header {
  align-items: start;
  margin-bottom: 1rem;
}

.section-header h3,
.media-group-header h4,
.image-slot-header strong,
.inline-modal h3 {
  margin: 0;
}

.section-header p,
.meta-note,
.empty-copy,
.inline-modal-copy {
  margin: 0.35rem 0 0;
  color: #475569;
  line-height: 1.5;
}

.field-grid,
.toggle-grid,
.color-media-grid,
.media-groups,
.color-groups {
  display: grid;
  gap: 1rem;
}

.field-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field--full {
  grid-column: 1 / -1;
}

.field span {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.field input,
.field select,
.field textarea,
.modal-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0.8rem 0.9rem;
  font: inherit;
  background: #fff;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus,
.modal-input:focus {
  outline: none;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.toggle-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 1rem;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.8rem 0.9rem;
  background: #fff;
  font-weight: 600;
}

.summary-card {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 0.9rem;
  align-items: center;
  background: #eff6ff;
  border-radius: 18px;
  padding: 0.9rem;
}

.summary-image {
  width: 92px;
  height: 92px;
  border-radius: 16px;
  object-fit: cover;
  background: #e2e8f0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.summary-content span {
  color: #475569;
  font-size: 0.92rem;
}

.media-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.media-group {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1rem;
  background: #fff;
}

.media-group--color {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.color-heading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.color-dot {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.color-media-grid {
  grid-template-columns: minmax(0, 1fr);
}

.image-slot {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
}

.image-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.65rem;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
}

.image-card img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 10px;
  background: #e2e8f0;
}

.image-card--main img {
  aspect-ratio: 4 / 5;
}

.secondary-button,
.primary-button {
  border-radius: 12px;
  padding: 0.78rem 1rem;
  font-weight: 700;
}

.secondary-button {
  background: #e2e8f0;
  color: #0f172a;
}

.secondary-button--large {
  min-width: 140px;
}

.primary-button {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
}

.danger-link {
  background: transparent;
  color: #b91c1c;
  padding: 0;
  font-weight: 700;
  text-align: left;
}

.primary-button:disabled,
.secondary-button:disabled,
.danger-link:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.primary-button:hover:not(:disabled),
.secondary-button:hover:not(:disabled),
.icon-button:hover,
.danger-link:hover:not(:disabled) {
  transform: translateY(-1px);
}

.status-banner,
.state-panel {
  border-radius: 16px;
  padding: 0.95rem 1rem;
}

.status-banner--error,
.state-panel--error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.status-banner--success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.state-panel {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.spinner {
  width: 1.1rem;
  height: 1.1rem;
  border: 2px solid rgba(37, 99, 235, 0.25);
  border-top-color: #1d4ed8;
  border-radius: 999px;
  animation: spin 0.9s linear infinite;
}

.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(8px);
  z-index: 1200;
  padding: 1rem;
}

.inline-modal {
  width: min(460px, 100%);
  background: #fff;
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 25px 80px rgba(15, 23, 42, 0.3);
}

.inline-modal-copy {
  margin-bottom: 1rem;
}

.modal-input {
  margin-bottom: 1rem;
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

@media (max-width: 980px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .editor-shell {
    padding: 1rem;
  }

  .field-grid,
  .toggle-grid {
    grid-template-columns: 1fr;
  }

  .editor-footer,
  .inline-modal-actions,
  .media-group-header,
  .image-slot-header,
  .section-header,
  .editor-header {
    align-items: stretch;
    flex-direction: column;
  }

  .summary-card {
    grid-template-columns: 1fr;
  }

  .summary-image {
    width: 100%;
    height: 180px;
  }
}
</style>
