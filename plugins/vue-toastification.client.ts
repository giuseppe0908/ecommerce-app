import Toast, { POSITION, type PluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

type ToastApi = {
  success: (message: string, options?: Record<string, unknown>) => void
  info: (message: string, options?: Record<string, unknown>) => void
  warning: (message: string, options?: Record<string, unknown>) => void
  error: (message: string, options?: Record<string, unknown>) => void
}
type ToastPluginInjection = {
  provide: {
    toast: ToastApi
  }
}

export default defineNuxtPlugin((nuxtApp): ToastPluginInjection => {
  const options: PluginOptions = {
    position: POSITION.TOP_RIGHT,
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
  }

  nuxtApp.vueApp.use(Toast, options)
  return {
    provide: {
      toast: nuxtApp.vueApp.config.globalProperties.$toast as ToastApi,
    },
  }
})
