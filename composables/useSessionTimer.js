import { ref, computed } from 'vue'

export function useSessionTimer(options = {}) {
  const totalDuration = Number.isFinite(options?.durationMs)
    ? Number(options.durationMs)
    : 5 * 60 * 1000

  const onExpire = typeof options?.onExpire === 'function' ? options.onExpire : () => {}

  const timeRemaining = ref(totalDuration)
  let intervalId = null

  const progress = computed(() => {
    if (totalDuration <= 0) return 0
    return Math.max(0, (timeRemaining.value / totalDuration) * 100)
  })

  const progressBarClass = computed(() => {
    if (progress.value > 50) return 'bg-green-500'
    if (progress.value > 20) return 'bg-yellow-500'
    return 'bg-red-500'
  })

  const formatTime = (time) => {
    const safeTime = Math.max(0, Number(time) || 0)
    const minutes = Math.floor(safeTime / 60 / 1000)
    const seconds = Math.floor((safeTime % (60 * 1000)) / 1000)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const resetTimer = () => {
    timeRemaining.value = totalDuration
  }

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const startTimer = () => {
    stopTimer()

    intervalId = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value -= 1000
        return
      }

      stopTimer()
      onExpire()
    }, 1000)
  }

  const handleUserActivity = () => {
    resetTimer()
  }

  const attachActivityListeners = () => {
    if (!process.client) return

    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('click', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)
  }

  const detachActivityListeners = () => {
    if (!process.client) return

    window.removeEventListener('mousemove', handleUserActivity)
    window.removeEventListener('click', handleUserActivity)
    window.removeEventListener('keydown', handleUserActivity)
  }

  return {
    timeRemaining,
    progress,
    progressBarClass,
    formatTime,
    resetTimer,
    startTimer,
    stopTimer,
    attachActivityListeners,
    detachActivityListeners,
  }
}
