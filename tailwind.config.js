/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {

    extend: {
      boxShadow:{
        'border':'0px 0px 0px 2px #504A4C',
        'thick':'0px 3px 8px rgba(0, 0, 0, 0.4)'
      },
      gridTemplateColumns: {
        // Simple 16 column grid
        '1/5': '1fr, .2fr',
        '5/1/5': '.5fr, 1fr, .5fr',
        '1-3': '.5fr .6fr',
        '1-4': '.4fr 1fr',
        '1-5': '.2fr 1fr',
      },
      fontFamily: {
        logo: ['ZCOOL QingKe HuangYou', 'cursive'],
        'title-bold': ['Gilroy-Bold', 'sans-serif'],
        'title-regular': ['Gilroy-Regular', 'sans-serif'],
        text: ['Lekton', 'sans-serif'],
        'gilroy-bold': ['Gilroy-Bold', 'sans-serif'],
        'gilroy-regular': ['Gilroy-Regular', 'sans-serif'],
        lekton: ['Lekton', 'sans-serif'],
      },
      colors: {
        white: '#fff',
        'white-off': '#F8F2E5',
        'primary-red': '#D2523C',
        'primary-red-tint': '#E2823B',
        'primary-yellow': '#F3B54F',
        'dark-gray': '#504A4C',
        gray: '#8C838A',
        dark: '#201F1C',
        black: '#000',
        'gray-100': '#BAB5B9',
        'gray-200': '#D2CFCF',
        'gray-300': '#B1ACB1',
        'gray-400': '#8C8289',
        'gray-deep': '#504A4C',
        'gray-light': '#EAE9E8',
        'yellow-light': '#EAB861',
        'yellow-deep': '#D5874A',
        'red-light': '#C35A44',
        'red-deep': '#D6513C',
        'rose-light': '#D6A196',
        'cat-gray': '#181818',
      },
      animation: {
        'progress': 'progress 5s linear infinite',
      },
      keyframes: {
        progress: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
};
