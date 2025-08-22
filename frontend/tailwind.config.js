/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        pran: {
          red: '#D32F2F',
          blue: '#1976D2',
          green: '#388E3C',
          yellow: '#FFA000',
          
        },
        gray: {
          dark: '#212121',
          medium: '#757575',
          light: '#F5F5F5',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}