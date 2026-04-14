/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Dark Mode Palette
        dark: {
          bg: '#0D1117',
          card: '#161B22',
          primary: '#FFFFFF',
          secondary: '#8B949E',
          accent: 'rgb(var(--dark-accent) / <alpha-value>)',
        },
        // Light Mode Palette
        light: {
          bg: '#F6F8FA',
          card: '#FFFFFF',
          primary: '#1C1C1E',
          secondary: '#6B7280',
          accent: 'rgb(var(--light-accent) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      transitionDuration: {
        '200': '200ms',
      }
    },
  },
  plugins: [],
}
