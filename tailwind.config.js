export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'tedx-red': 'var(--color-primary)',
        'tedx-dark': 'var(--color-dark)',
        'tedx-red-dark': 'var(--color-primary-dark)',
      }
    }
  },
  plugins: []
};
