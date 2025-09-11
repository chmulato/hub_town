/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./front.jsx"
  ],
  theme: {
    extend: {
      colors: {
        shopee: {
          50: '#fff7ed',
          500: '#f97316',
          600: '#ea580c'
        },
        mercadolivre: {
          50: '#fefce8',
          500: '#eab308',
          600: '#ca8a04'
        }
      }
    },
  },
  plugins: [],
}
