/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        background: '#F8F9FA',
        'on-background': '#1F2937',

        primary: {
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
          light: '#A78BFA',
        },
        secondary: {
          DEFAULT: '#F97316',
          dark: '#EA580C',
        },
        accent: {
          DEFAULT: '#14B8A6',
        },

        card: '#FFFFFF',
        'card-foreground': '#1F2937',
        border: '#E5E7EB',

        'text-primary': '#1F2937',
        'text-muted': '#6B7280',
        'text-on-primary': '#FFFFFF',

        danger: '#DC2626',
        warning: '#F59E0B',
        success: '#16A34A',
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    }
  },
  plugins: []
};