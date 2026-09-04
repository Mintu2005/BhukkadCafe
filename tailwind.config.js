/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#f6f5f3',
          100: '#e9e6e0',
          200: '#cfc9bf',
          300: '#a89e8e',
          400: '#7a6f5d',
          500: '#5a4f40',
          600: '#3f362a',
          700: '#2a2419',
          800: '#1c1812',
          900: '#12100c',
          950: '#0a0806',
        },
        cream: {
          50: '#fefdf9',
          100: '#fdf8ed',
          200: '#f9ecd0',
          300: '#f3dca6',
          400: '#ecc271',
          500: '#e5a93f',
          600: '#d4922a',
          700: '#b06f22',
          800: '#8a561f',
          900: '#71471e',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
 },
        rust: {
          50: '#fdf4f1',
          100: '#fae5dd',
          200: '#f4c9b6',
          300: '#eba685',
          400: '#df7a52',
          500: '#d05a30',
          600: '#b74724',
          700: '#92371e',
          800: '#77301f',
          900: '#622b1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Pacifico"', 'cursive'],
        heading: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
