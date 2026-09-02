/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff", 100: "#e0ebff", 500: "#3b6fed", 600: "#2f5bd6", 700: "#2647ad",
        },
      },
    },
  },
  plugins: [],
}