/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#A3B31A',
        accent: '#39FF8B',
        surface: '#2F3D46'
      },
      boxShadow: {
        glow: '0 0 30px rgba(163, 179, 26, 0.2)'
      }
    }
  },
  plugins: []
};
