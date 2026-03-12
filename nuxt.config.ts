// https://nuxt.com/docs/api/configuration/nuxt-config
const siteName = process.env.APP_SITE_NAME || 'Nuxt Commerce'
const appBaseUrl = process.env.APP_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  typescript: {
    strict: true,
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'it',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#0F1D2C' },
      ],
      title: siteName,
      titleTemplate: `%s | ${siteName}`,
    },
  },
  css: ['@/assets/css/main.css', 'vue-toastification/dist/index.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  routeRules: {
    '/admin/**': { appMiddleware: ['auth'] },
    '/dashboard': { appMiddleware: ['auth'] }
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
      appBaseUrl,
      siteName,
    },
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    githubCallbackUrl: process.env.GITHUB_CALLBACK_URL,
    jwtSecret: process.env.JWT_SECRET,
  },
  plugins: [
    '~/plugins/vue-toastification.client',
  ],
})
