/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telecom: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#06b6d4',
        }
      }
    },
  },
  plugins: [],
}


