/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'rt-blue': '#0066CC',
        'rt-orange': '#FF8C00',
        'rt-green': '#28A745',
        'rt-gray': '#6C757D',
        'rt-dark': '#212529',
      },
      spacing: {
        'touch': '44px', // Minimum touch target size
      },
      fontSize: {
        'driver': '18px', // Large readable font for drivers
        'driver-lg': '24px',
        'driver-xl': '32px',
      }
    },
  },
  plugins: [],
}
