/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}', // Add renderer/src path
    './src/index.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        pop: 'Poppins',
        patrickHand: 'Patrick Hand',
        merriweather: 'Merriweather',
        nunito: 'Nunito',
        roboslab: 'Roboto Slab',
        handwriting: 'Playwrite FR Moderne'
      },
      backgroundImage: {
        'custom-radial': 'radial-gradient(rgb(248, 175, 41), rgb(193, 225, 237))'
      }
    }
  },
  plugins: []
}