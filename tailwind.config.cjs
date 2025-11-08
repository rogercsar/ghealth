const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(204, 86%, 53%)', // Softer Blue
          light: 'hsl(204, 90%, 78%)',
          dark: 'hsl(204, 80%, 43%)',
        },
        secondary: {
          DEFAULT: 'hsl(145, 63%, 42%)', // Emerald Green
        },
        accent: {
          DEFAULT: 'hsl(34, 97%, 64%)', // Vibrant Orange
        },
        'text-primary': 'hsl(217, 25%, 25%)',
        'text-muted': 'hsl(217, 15%, 55%)',
        'bg-main': 'hsl(220, 40%, 98%)',
        'bg-card': 'hsl(0, 0%, 100%)',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        serif: [...fontFamily.serif],
      },
      boxShadow: {
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    }
  },
  plugins: []
};