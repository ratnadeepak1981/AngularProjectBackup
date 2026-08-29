/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F2C59',
          'navy-dark': '#0A1E3D',
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          'light-blue': '#EFF6FF',
          gold: '#D97706',
          'gold-hover': '#B45309',
          surface: '#F8FAFC',
        },
        status: {
          available: {
            bg: '#DCFCE7',
            text: '#15803D',
            border: '#86EFAC',
          },
          held: {
            bg: '#FEF3C7',
            text: '#B45309',
            border: '#FDE047',
          },
          occupied: {
            bg: '#FEE2E2',
            text: '#B91C1C',
            border: '#FCA5A5',
          },
          broken: {
            bg: '#F1F5F9',
            text: '#64748B',
            border: '#CBD5E1',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
