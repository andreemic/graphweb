module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        amber: {
          400: "#FFBF69",
          500: "#FF9F1C"
        }
      }
    },
    
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
