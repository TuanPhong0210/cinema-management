export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        headline: ['Montserrat', 'sans-serif']
      },
      colors: {
        cinema: {
          50: '#f5f3ff',
          100: '#ede9fe',
          300: '#c4b5fd',
          500: '#7c3aed',
          700: '#5b21b6',
          900: '#24113f',
          950: '#160820'
        },
        brand: {
          black: '#15121b',
          studio: '#8b5cf6',
          peach: 'var(--client-text-primary)',
          pearl: 'var(--client-text-secondary)',
          martinique: '#211e27'
        }
      }
    }
  },
  plugins: []
};
