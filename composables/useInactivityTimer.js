import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/authStore'

export function useInactivityTimer() {
  const authStore = useAuthStore()
  const totalDuration = 60 * 1000 // 1 minuto in millisecondi
  const timeRemaining = ref(totalDuration)
  let interval = null

  const progress = computed(() => (timeRemaining.value / totalDuration) * 100)

  const progressBarClass = computed(() => {
    if (progress.value > 50) return 'bg-green-500'
    if (progress.value > 20) return 'bg-yellow-500'
    return 'bg-red-500'
  })

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60 / 1000)
    const seconds = Math.floor((time % (60 * 1000)) / 1000)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const resetTimer = () => {
    timeRemaining.value = totalDuration
  }

  const startTimer = () => {
    interval = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value -= 1000
      } else {
        clearInterval(interval)
        authStore.logout()
      }
    }, 1000)
  }

  const handleUserActivity = () => {
    resetTimer()
  }

  onMounted(() => {
    startTimer()
    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('click', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)
  })

  onUnmounted(() => {
    clearInterval(interval)
    window.removeEventListener('mousemove', handleUserActivity)
    window.removeEventListener('click', handleUserActivity)
    window.removeEventListener('keydown', handleUserActivity)
  })

  return {
    timeRemaining,
    progress,
    progressBarClass,
    formatTime
  }
}