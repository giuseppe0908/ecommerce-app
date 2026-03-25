// https://nuxt.com/docs/api/configuration/nuxt-config
const siteName = process.env.APP_SITE_NAME || 'Nuxt Commerce'
const vercelDeploymentHost =
  process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL || ''
const inferredVercelBaseUrl = vercelDeploymentHost
  ? `https://${vercelDeploymentHost}`
  : ''
const appBaseUrl =
  process.env.APP_BASE_URL ||
  process.env.BASE_URL ||
  inferredVercelBaseUrl ||
  'http://localhost:3000'
const aiChatEnabled = process.env.AI_CHAT_ENABLED === 'true'
const aiChatProvider = process.env.AI_CHAT_PROVIDER || 'ollama'
const aiChatModel = process.env.AI_CHAT_MODEL || 'llama3.2:1b'
const aiChatBaseUrl = process.env.AI_CHAT_BASE_URL || ''
const aiChatTimeoutMs = Number(process.env.AI_CHAT_TIMEOUT_MS || '3000')
const githubCallbackUrl =
  process.env.GITHUB_CALLBACK_URL || `${appBaseUrl}/api/auth/github/callback`

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
      aiChatEnabled,
      aiChatProvider,
    },
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    githubCallbackUrl,
    jwtSecret: process.env.JWT_SECRET,
    aiChatEnabled,
    aiChatProvider,
    aiChatModel,
    aiChatBaseUrl,
    aiChatTimeoutMs: Number.isFinite(aiChatTimeoutMs) ? aiChatTimeoutMs : 3000,
  },
  plugins: [
    '~/plugins/vue-toastification.client',
  ],
})
