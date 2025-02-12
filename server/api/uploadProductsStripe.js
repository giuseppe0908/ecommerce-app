// import Stripe from 'stripe';
// import products from '../../products.json' assert { type: 'json' }; // Importa i tuoi prodotti
// import dotenv from 'dotenv';

// dotenv.config(); // Carica le variabili d'ambiente dal file .env

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// async function uploadProducts() {
//   for (const product of products) {
//     try {
//       // Crea il prodotto
//       const stripeProduct = await stripe.products.create({
//         name: product.name,
//         description: product.description,
//       });

//       // Crea il prezzo associato al prodotto
//       await stripe.prices.create({
//         product: stripeProduct.id,
//         unit_amount: product.price * 100, // Stripe richiede l'importo in centesimi
//         currency: product.currency,
//       });

//       console.log(`Prodotto caricato: ${stripeProduct.name}`);
//     } catch (error) {
//       console.error(`Errore durante il caricamento del prodotto ${product.name}:`, error);
//     }
//   }
// }

// // Esegui la funzione
// uploadProducts().then(() => {
//   console.log('Tutti i prodotti sono stati caricati.');
// }).catch((error) => {
//   console.error('Errore durante il caricamento dei prodotti:', error);
// });
