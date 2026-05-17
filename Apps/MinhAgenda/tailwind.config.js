/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sincronia Palette
        "sinc-bg": "#fdf9f0",
        "sinc-surface": "#fdf9f0",
        "sinc-primary": "#5e5e5b",
        "sinc-on-surface": "#1c1c16",
        "sinc-outline": "#c7c7bf",
        "sinc-inverse": "#32302a",
        
        // Minimalist Palette
        "aes-bg": "#F9F7F2",
        "aes-text": "#2C332C",
        "aes-text-dim": "#7C857C",
        "aes-accent": "#B6D7A8",
        "aes-border": "#E5E1D8",

        // Generic Material tokens (shared)
        "primary-fixed": "#e4e2dd",
        "secondary-container": "#e6ded9",
        "on-secondary-container": "#67625e",
      },
      fontFamily: {
        display: ["EB Garamond", "serif"],
        body: ["Hanken Grotesk", "sans-serif"],
        "aes-display": ["Fraunces", "serif"],
        "aes-body": ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
