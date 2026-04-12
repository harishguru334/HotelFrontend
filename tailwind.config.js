/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hotel: {
          gold:  '#C9A84C',
          dark:  '#1a1a2e',
          navy:  '#16213e',
          blue:  '#0f3460',
          light: '#f5f0e8',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans:  ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
