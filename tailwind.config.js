/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mc: {
          teal: '#00B2A9',
          'teal-dark': '#009490',
          cyan: '#0077C8',
          navy: '#1B2A4A',
          'navy-deep': '#0F1B33',
          lime: '#78BE20',
          'lime-light': '#A0D850',
          white: '#FFFFFF',
          gold: '#FFD700',
        },
      },
    },
  },
  plugins: [],
};
