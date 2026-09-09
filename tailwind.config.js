/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Calibri', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
