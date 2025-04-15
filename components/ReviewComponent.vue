<template>
  <div class="reviews-container mt-8">
    <h3 class="text-xl font-semibold mb-4">Recensioni dei clienti</h3>
    
    <!-- Average rating -->
    <div class="average-rating flex items-center mb-6">
      <div class="rating-stars text-2xl mr-3">
        <span v-for="i in 5" :key="i" class="star">
          <i :class="[
            i <= Math.round(averageRating) ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-300'
          ]"></i>
        </span>
      </div>
      <div class="rating-number font-bold text-xl">
        {{ averageRating.toFixed(1) }}
      </div>
      <div class="rating-count text-gray-500 ml-2">
        ({{ reviews.length }} recensioni)
      </div>
    </div>
    
    <!-- Review list -->
    <div v-if="reviews.length > 0" class="review-list">
      <div v-for="review in reviews" :key="review.id" class="review-item border-b pb-4 mb-4">
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
              <i :class="[
                i <= review.rating ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-300'
              ]"></i>
            </span>
          </div>
        </div>
        <div class="review-title font-medium mb-1">{{ review.title }}</div>
        <div class="review-content text-gray-700">{{ review.content }}</div>
      </div>
    </div>
    
    <div v-else class="no-reviews text-center py-6 text-gray-500">
      Nessuna recensione disponibile per questo prodotto.
    </div>
    
    <!-- Write review button -->
    <div class="write-review mt-6">
      <button 
        @click="showReviewForm = !showReviewForm" 
        class="bg-[#5D758B] text-white px-4 py-2 rounded-md hover:bg-[#4a5e70] transition-colors"
      >
        {{ showReviewForm ? 'Annulla' : 'Scrivi una recensione' }}
      </button>
    </div>
    
    <!-- Review form -->
    <div v-if="showReviewForm" class="review-form mt-6 p-4 border rounded-md">
      <h4 class="text-lg font-semibold mb-3">La tua recensione</h4>
      
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
            <i :class="[
              (hoverRating || newReview.rating) >= i ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-300'
            ]"></i>
          </span>
        </div>
      </div>
      
      <div class="form-group mb-3">
        <label for="review-title" class="block mb-1">Titolo</label>
        <input 
          type="text" 
          id="review-title" 
          v-model="newReview.title"
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
          class="bg-[#5D758B] text-white px-4 py-2 rounded-md hover:bg-[#4a5e70] transition-colors"
          :disabled="!isFormValid"
        >
          Invia recensione
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  }
});

const reviews = ref([]);
const showReviewForm = ref(false);
const hoverRating = ref(0);
const newReview = ref({
  rating: 0,
  title: '',
  content: '',
  userName: 'Utente' // In a real app, get this from auth state
});

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const sum = reviews.value.reduce((total, review) => total + review.rating, 0);
  return sum / reviews.value.length;
});

const isFormValid = computed(() => {
  return newReview.value.rating > 0 && 
         newReview.value.title.trim() !== '' && 
         newReview.value.content.trim() !== '';
});

onMounted(async () => {
  await fetchReviews();
});

const fetchReviews = async () => {
  try {
    // In a real app, fetch from API
    // const { data } = await useFetch(`/api/products/${props.productId}/reviews`);
    // reviews.value = data.value || [];
    
    // For demo purposes, using mock data
    reviews.value = [
      {
        id: 1,
        userName: 'Marco',
        rating: 5,
        title: 'Ottimo prodotto!',
        content: 'Qualità eccellente, consegna rapida. Consigliatissimo!',
        createdAt: new Date(2023, 10, 15)
      },
      {
        id: 2,
        userName: 'Laura',
        rating: 4,
        title: 'Buon rapporto qualità-prezzo',
        content: 'Prodotto di buona qualità, prezzo onesto. Spedizione veloce.',
        createdAt: new Date(2023, 9, 28)
      },
      {
        id: 3,
        userName: 'Giovanni',
        rating: 3,
        title: 'Nella media',
        content: 'Prodotto nella media, niente di eccezionale ma fa il suo lavoro.',
        createdAt: new Date(2023, 8, 10)
      }
    ];
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
};

const submitReview = async () => {
  try {
    // In a real app, send to API
    // await $fetch(`/api/products/${props.productId}/reviews`, {
    //   method: 'POST',
    //   body: newReview.value
    // });
    
    // For demo purposes, just add to local array
    const newReviewObj = {
      id: reviews.value.length + 1,
      ...newReview.value,
      createdAt: new Date()
    };
    
    reviews.value.unshift(newReviewObj);
    
    // Reset form
    newReview.value = {
      rating: 0,
      title: '',
      content: '',
      userName: 'Utente'
    };
    
    showReviewForm.value = false;
    
  } catch (error) {
    console.error('Error submitting review:', error);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.star {
  display: inline-block;
  margin-right: 2px;
}
</style>