import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
  './src/**/*.{ts,tsx}',
  './vendor/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3ECF8E',
          dark: '#1F9D59',
          light: '#E7FFF4'
        }
      },
      boxShadow: {
        band: 'inset 0 1px 0 0 rgba(0,0,0,0.04), inset 0 -1px 0 0 rgba(0,0,0,0.06)'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)'
      },
      backgroundSize: {
  'grid-size': '24px 24px'
      }
    },
  },
  plugins: [],
} satisfies Config
