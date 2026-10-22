/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4f9',
          100: '#dbe6f3',
          200: '#bdd1e7',
          300: '#8fb4d7',
          400: '#5a91c3',
          500: '#3572af',
          600: '#245892',
          700: '#1d4677',
          800: '#1a3b63',
          900: '#0f2b48',
          950: '#081728',
        },
        slate: {
          850: '#151e2e',
          950: '#0b111c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
