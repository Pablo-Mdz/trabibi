/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C9A84C',
        teal: '#0D6E6E',
        darkbg: '#0e0e12',
        surface: '#1a1a22',
      },
      fontFamily: {
        arabic: ["'Noto Sans Arabic'", "'Arial Unicode MS'", 'sans-serif'],
      },
    },
  },
  plugins: [],
};
