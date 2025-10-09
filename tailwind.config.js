/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'grey': '#799495',
        'dark-grey': '#4F6566',
        'cyan': '#3EB2ED',
        'dark-cyan': 'rgb(0, 139, 203)',
        'dark-blue': '#101225',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'sansapro': ['SansaPro', 'Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
    },
  },
  plugins: [],
}
