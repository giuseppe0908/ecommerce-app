<template>
  <div class="reviews-container mt-8">
    <h3 class="text-xl font-semibold mb-4">Recensioni dei clienti</h3>

    <div v-if="isLoading" class="text-sm text-gray-500 mb-6">
      Caricamento recensioni...
    </div>

    <div class="average-rating flex items-center mb-6">
      <div class="rating-stars text-2xl mr-3">
        <span v-for="i in 5" :key="i" class="star">
          <i
            :class="[
              i <= Math.round(averageRatingComputed) ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-300',
            ]"
          ></i>
        </span>
      </div>
      <div class="rating-number font-bold text-xl">
        {{ averageRatingComputed.toFixed(1) }}
      </div>
      <div class="rating-count text-gray-500 ml-2">
        ({{ reviews.length }} recensioni)
      </div>
    </div>

    <div v-if="reviews.length > 0" class="review-list">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="review-item border-b pb-4 mb-4"
      >
        <div class="review-header flex justify-between items-center mb-2">
          <div class="reviewer-info flex items-center">
            <div class="avatar bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-3">
              <span class="text-gray-600 font-bold">{{ review.userName.charAt(0).toUpperCase() }}</span>
            </div>
            <div>
              <div class="reviewer-name font-semibold">{{ review.userName }}</div>
              <div class="review-date text-sm text-gray-500">{{ formatDate(review.createdAt) }}</div>
            </div>
          </div>
          <div class="review-rating">
            <span v-for="i in 5" :key="i" class="star">
              <i :class="[i <= review.rating ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-300']"></i>
            </span>
          </div>
        </div>
        <div class="review-content text-gray-700 whitespace-pre-line">{{ review.comment }}</div>
      </div>
    </div>

    <div v-else class="no-reviews text-center py-6 text-gray-500">
      Nessuna recensione disponibile per questo prodotto.
    </div>

    <div class="write-review mt-6">
      <button
        @click="toggleReviewForm"
        class="bg-[#5D758B] text-white px-4 py-2 rounded-md hover:bg-[#4a5e70] transition-colors"
      >
        {{ showReviewForm ? 'Annulla' : 'Scrivi una recensione' }}
      </button>
    </div>

    <div v-if="showReviewForm" class="review-form mt-6 p-4 border rounded-md">
      <h4 class="text-lg font-semibold mb-3">La tua recensione</h4>

      <div v-if="formError" class="text-sm text-red-600 mb-3">
        {{ formError }}
      </div>

      <div class="form-group mb-3">
        <label class="block mb-1">Valutazione</label>
        <div class="rating-input flex">
          <span
            v-for="i in 5"
            :key="i"
            class="star text-2xl cursor-pointer"
            @click="newReview.rating = i"
            @mouseover="hoverRating = i"
            @mouseleave="hoverRating = 0"
          >
            <i
              :class="[
                (hoverRating || newReview.rating) >= i ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-300',
              ]"
            ></i>
          </span>
        </div>
      </div>

      <div class="form-group mb-3">
        <label for="review-title" class="block mb-1">Titolo (opzionale)</label>
        <input
          id="review-title"
          v-model="newReview.title"
          type="text"
          class="w-full p-2 border rounded-md"
          placeholder="Riassumi la tua esperienza"
        />
      </div>

      <div class="form-group mb-3">
        <label for="review-content" class="block mb-1">Recensione</label>
        <textarea
          id="review-content"
          v-model="newReview.content"
          class="w-full p-2 border rounded-md"
          rows="4"
          placeholder="Condividi la tua esperienza con questo prodotto"
        ></textarea>
      </div>

      <div class="form-actions">
        <button
          @click="submitReview"
          class="bg-[#5D758B] text-white px-4 py-2 rounded-md hover:bg-[#4a5e70] transition-colors disabled:opacity-70"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? 'Invio...' : 'Invia recensione' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { navigateTo } from '#app'
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/authStore'

const props = defineProps({
  productId: {
    type: [String, Number],
    required: true,
  },
  reviews: {
    type: Array,
    default: () => [],
  },
  averageRating: {
    type: Number,
    default: 0,
  },
})

const authStore = useAuthStore()
const reviews = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const showReviewForm = ref(false)
const hoverRating = ref(0)
const formError = ref('')

const newReview = ref({
  rating: 0,
  title: '',
  content: '',
})

function normalizeReview(review) {
  const userName = review?.user?.name || review?.userName || review?.user?.email || 'Utente'
  return {
    id: review?.id ?? `${Date.now()}-${Math.random()}`,
    userName,
    rating: Number(review?.rating || 0),
    comment: String(review?.comment || review?.content || '').trim(),
    createdAt: review?.createdAt || new Date().toISOString(),
  }
}

function normalizeReviewList(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((review) => normalizeReview(review))
    .filter((review) => review.comment.length > 0)
}

const averageRatingComputed = computed(() => {
  if (reviews.value.length === 0) {
    return Number(props.averageRating) || 0
  }

  const sum = reviews.value.reduce((total, review) => total + review.rating, 0)
  return sum / reviews.value.length
})

const isFormValid = computed(() => {
  return newReview.value.rating > 0 && newReview.value.content.trim().length > 0
})

watch(
  () => props.reviews,
  (value) => {
    const normalized = normalizeReviewList(value)
    if (normalized.length > 0) {
      reviews.value = normalized
    }
  },
  { immediate: true }
)

async function fetchReviews() {
  isLoading.value = true

  try {
    const response = await $fetch(`/api/reviews/${props.productId}`)
    reviews.value = normalizeReviewList(response)
  } catch {
    reviews.value = []
  } finally {
    isLoading.value = false
  }
}

function toggleReviewForm() {
  formError.value = ''
  showReviewForm.value = !showReviewForm.value
}

function resetForm() {
  newReview.value = {
    rating: 0,
    title: '',
    content: '',
  }
  hoverRating.value = 0
  formError.value = ''
}

async function submitReview() {
  formError.value = ''

  if (!authStore.isAuthenticated) {
    formError.value = 'Devi effettuare il login per inviare una recensione.'
    navigateTo('/login')
    return
  }

  isSubmitting.value = true

  const title = newReview.value.title.trim()
  const content = newReview.value.content.trim()
  const comment = title ? `${title}\n${content}` : content

  try {
    await $fetch('/api/reviews', {
      method: 'POST',
      body: {
        productId: Number(props.productId),
        rating: newReview.value.rating,
        comment,
      },
    })

    await fetchReviews()
    resetForm()
    showReviewForm.value = false
  } catch (error) {
    formError.value = error?.data?.message || "Impossibile inviare la recensione."
  } finally {
    isSubmitting.value = false
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(async () => {
  if (process.client && !authStore.isInitialized) {
    await authStore.initialize()
  }

  if (reviews.value.length === 0) {
    await fetchReviews()
  }
})
</script>

<style scoped>
.star {
  display: inline-block;
  margin-right: 2px;
}
</style>
