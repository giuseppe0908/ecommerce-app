// stores/wishlistStore.js
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { useNuxtApp } from '#app'

export const useWishlistStore = defineStore('wishlistStore', {
  state: () => ({
    wishlist: [],
    isWishlistOpen: false,
    loading: false,
    error: null,
    user: null
  }),

  getters: {
    wishlistCount: (state) => state.wishlist.length,
    isInWishlist: (state) => (productId) => {
      return state.wishlist.some(item => item.id === productId);
    },
    getFavorites: (state) => state.wishlist,
    // Nuovo getter per verificare se un prodotto è nei preferiti con animazione
    isProductFavorite: (state) => (productId) => {
      const isFavorite = state.wishlist.some(item => item.id === productId);
      return {
        isFavorite,
        animationClass: isFavorite ? 'heart-pulse' : ''
      };
    }
  },

  actions: {
     // Inizializza l'utente dallo storage
     initUser() {
        if (process.client) {
          try {
            const userStorage = localStorage.getItem('user');
            if (userStorage) {
              this.user = JSON.parse(userStorage);
            }
          } catch (error) {
            console.error('Errore nel caricamento dell\'utente:', error);
            this.user = null;
          }
        }
      },
    // Inizializza la wishlist - ora carica da API se l'utente è loggato, altrimenti da localStorage
    async initWishlist() {
      this.initUser();
      
      // Reset wishlist state before initializing to prevent data leakage between users
      this.wishlist = [];
      
      // Forza la chiusura del pannello dei preferiti all'inizializzazione
      // Assicurati che il pannello rimanga SEMPRE chiuso durante l'inizializzazione
      this.isWishlistOpen = false;
      
      if (this.user && this.user.id) {
        // Utente loggato: carica preferiti dal database
        await this.fetchUserFavorites(this.user.id);
      } else if (process.client) {
        // Utente non loggato: carica da localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          this.wishlist = JSON.parse(savedWishlist);
        }
      }
    },
    
    // Carica i preferiti di un utente dal database
    async fetchUserFavorites(userId) {
      if (!userId) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        const { data } = await useFetch(`/api/favorites?userId=${userId}`);
        if (data.value) {
          // Trasforma i dati ricevuti nel formato utilizzato dalla wishlist
          // Assicurati che la wishlist contenga solo i preferiti dell'utente corrente
          this.wishlist = data.value.map(fav => fav.product);
        } else {
          // Se non ci sono dati, assicurati che la wishlist sia vuota
          this.wishlist = [];
        }
      } catch (error) {
        console.error('Errore nel caricamento dei preferiti:', error);
        this.error = 'Impossibile caricare i preferiti';
        // In caso di errore, assicurati che la wishlist sia vuota
        this.wishlist = [];
      } finally {
        this.loading = false;
      }
    },
    
    // Gestisce l'aggiunta/rimozione di un prodotto dai preferiti
    async toggleWishlistItem(product) {

      this.initUser();
      if(this.user && this.user.id){  // Added null check here
        await this.toggleFavoriteInDb(this.user.id, product.id);
      }else{
        // Utente non loggato: mostra un messaggio
        const toast = useToast();
        toast.warning('Accedi prima di aggiungere ai preferiti');
        navigateTo('/login');
      }
    },
    
    // Aggiunge/rimuove un prodotto dai preferiti nel database
    async toggleFavoriteInDb(userId, productId) {
      if (!userId || !productId) return;
      
      this.loading = true;
      this.error = null;
      console.log(this.isInWishlist(productId));
      
      try {
        if (this.isInWishlist(productId)) {
          // Rimuovi dai preferiti
          await useFetch('/api/favorites', {
            method: 'DELETE',
            body: { userId, productId }
          });
          
          // Aggiorna lo stato locale
          this.wishlist = this.wishlist.filter(item => item.id !== productId);
        } else {
          // Aggiungi ai preferiti
          console.log(productId);
          
          const { data } = await useFetch('/api/favorites', {
            method: 'POST',
            body: { userId, productId }
          });
          
          // Se l'operazione è andata a buon fine e abbiamo ricevuto i dati del prodotto
          if (data.value?.favorite?.product) {
            this.wishlist.push(data.value.favorite.product);
          }
        }
      } catch (error) {
        console.error('Errore nella gestione dei preferiti:', error);
        this.error = 'Impossibile aggiornare i preferiti';
      } finally {
        this.loading = false;
      }
    },
    
    // Rimuove un prodotto dalla wishlist
    async removeFromWishlist(productId) {
      this.initUser();
      const userId = this.user?.id;
      
      if (userId) {
        // Utente loggato: usa l'API
        this.loading = true;
        try {
          await useFetch('/api/favorites', {
            method: 'DELETE',
            body: { userId, productId }
          });
          this.wishlist = this.wishlist.filter(item => item.id !== productId);
        } catch (error) {
          console.error('Errore nella rimozione dai preferiti:', error);
          this.error = 'Impossibile rimuovere dai preferiti';
        } finally {
          this.loading = false;
        }
        } else {
            // Utente non loggato: usa localStorage
            const index = this.wishlist.findIndex(item => item.id === productId);
            if (index !== -1) {
            this.wishlist.splice(index, 1);
            
            // Update localStorage
            if (process.client) {
                localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
            }
        }
      }
    },
    
    // Pulisce la wishlist
    async clearWishlist() {
        this.initUser();
        const userId = this.user?.id;  // Using optional chaining here

        this.loading = true;
        this.error = null;
        
        try {
            if (userId) {
            // Utente loggato: elimina tutti i preferiti dal database
            await useFetch('/api/favorites', {
                method: 'DELETE',
                body: { userId, clearAll: true }
            });
            }
            
            // Pulisci la wishlist locale
            this.wishlist = [];
            
            if (process.client && !userId) {
            // Rimuovi solo dal localStorage se non c'è un utente loggato
            localStorage.removeItem('wishlist');
            }
            
            // Feedback all'utente
            const toast = useToast();
            toast.success('Lista preferiti svuotata con successo');
        } catch (error) {
            console.error('Errore nello svuotamento della lista preferiti:', error);
            this.error = 'Impossibile svuotare la lista preferiti';
            
            // Feedback all'utente in caso di errore
            const toast = useToast();
            toast.error('Impossibile svuotare la lista preferiti');
        } finally {
            this.loading = false;
        }
        },
    
    // Mostra/nasconde il pannello laterale della wishlist
    toggleWishlistSidebar() {
      this.isWishlistOpen = !this.isWishlistOpen;
    }
  }
});