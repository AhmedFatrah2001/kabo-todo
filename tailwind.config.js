/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#4F46E5', // You can adjust this color for buttons, text, etc.
        secondary: '#6366F1', // Secondary color for hover states
        accent: '#22D3EE', // Accent color for highlights
        background: '#F9FAFB', // Light background
        dark: '#111827', // Dark theme for cards or contrast
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
