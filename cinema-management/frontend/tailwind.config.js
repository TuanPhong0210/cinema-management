export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
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
          black: '#010101',
          studio: '#5f43b2',
          peach: '#fefdfd',
          pearl: '#b1aebb',
          martinique: '#3a3153'
        }
      }
    }
  },
  plugins: []
};
