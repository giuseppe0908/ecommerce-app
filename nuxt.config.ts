// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  routeRules: {
    '/admin/**': { middleware: 'auth' },
    '/dashboard': { middleware: 'auth' }
  },
  // store: true,
  modules: [
    '@pinia/nuxt',
  ],
  ssr: true,
  // Se vuoi abilitare il supporto SSR
  pinia: {
    storesDirs: ['./stores/**', './custom-folder/stores/**'],
  },
  runtimeConfig: {
    public: {
      stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY, // Chiave pubblica lato client
    },
  },
})
