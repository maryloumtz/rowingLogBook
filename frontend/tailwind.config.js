/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#10212b',
        foam: '#eef7f4',
        surge: '#2f7f6d',
        tide: '#c7e6dc',
        ember: '#ef8354'
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif']
      },
      boxShadow: {
        panel: '0 20px 50px rgba(16, 33, 43, 0.12)'
      }
    }
  },
  plugins: []
};
