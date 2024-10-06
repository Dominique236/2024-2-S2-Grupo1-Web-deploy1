/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: true,
  theme: {
    extend: {
      fontFamily: {
        inter: ['"Inter var"', 'sans-serif'], // Add the Inter variable font family
      },
      colors: {
        success: '#4ade80',
        danger: '#f87171',
        warningOrange: '#fb923c',
        warningYellow: '#fbbf24',
        base: '#218F8B',
        orange: '#FA691B',
        black: '#4b5563',
        turquesa: {
          300: '#56C4C3',
          400: '#2BBAB5',
          500: '#218F8B',
          600: '#286462',
          700: '#213A39',
        },
        naranja: {
          400: '#FA8C53',
          500: '#FA691B',
          600: '#DA6E33',
          700: '#BA6D43',
        },
        celeste: {
          500: '#DFEEF5',
          600: '#A3C5D5',
          700: '#74A0B5',
        }
      },
    },
  },
}

