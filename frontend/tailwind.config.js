/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        haze: {
          bg: '#EEF2EE',
          panel: '#F8FAF7',
          ink: '#152018',
          mute: '#5B6B60',
          line: '#D8E0D8',
        },
        teal: {
          DEFAULT: '#2F6F6F',
          deep: '#1E4A4A',
          soft: '#DCEAE8',
        },
        aqi: {
          good: '#4C9A6D',
          moderate: '#D8B84A',
          sensitive: '#E08A3E',
          unhealthy: '#C7574F',
          veryUnhealthy: '#7A3B5E',
          hazardous: '#4A2438',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
