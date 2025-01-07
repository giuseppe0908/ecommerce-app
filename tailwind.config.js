/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideToPosition: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(300px)' }, // Cambia 300px con la tua posizione finale
        },
      },
      animation: {
        slideIn: 'slideIn 0.5s ease-out forwards',
        slideToPosition: 'slideToPosition 1s ease-in-out forwards',
      },
      fontFamily: {
        montserrat: ['Montserrat', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disabilita Preflight
  },
}

