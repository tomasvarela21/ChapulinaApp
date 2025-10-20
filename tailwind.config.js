/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D67A7A',
        secondary: '#EADBD0',
        background: '#FAF7F2',
      },
    },
  },
  plugins: [],
}