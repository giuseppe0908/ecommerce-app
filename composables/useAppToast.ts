import { useNuxtApp } from '#app'

type ToastFn = (message: string, options?: Record<string, unknown>) => void

type ToastApi = {
  success: ToastFn
  info: ToastFn
  warning: ToastFn
  error: ToastFn
}

const noop: ToastFn = () => {}

const fallbackToast: ToastApi = {
  success: noop,
  info: noop,
  warning: noop,
  error: noop,
}

export function useAppToast(): ToastApi {
  const nuxtApp = useNuxtApp()
  const rawToast = (nuxtApp.$toast || null) as Partial<ToastApi> | null

  if (!rawToast) {
    return fallbackToast
  }

  return {
    success: typeof rawToast.success === 'function' ? rawToast.success.bind(rawToast) : noop,
    info: typeof rawToast.info === 'function' ? rawToast.info.bind(rawToast) : noop,
    warning: typeof rawToast.warning === 'function' ? rawToast.warning.bind(rawToast) : noop,
    error: typeof rawToast.error === 'function' ? rawToast.error.bind(rawToast) : noop,
  }
}
