// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['@/assets/css/main.css', 'vue-toastification/dist/index.css'],
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
      githubClientId: process.env.GITHUB_CLIENT_ID,
    },
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
    jwtSecret: process.env.JWT_SECRET,
  },
  plugins: [
    '~/plugins/token-cleanup.js'
  ],
})
