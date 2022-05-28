module.exports = {
  content: ['./app/**/*.{ts,tsx,jsx,js}'],
  daisyui: {
    themes: [
      {
        turbo: {
          primary: '#2090fe',

          secondary: '#e41f50',

          accent: '#bae6fd',

          neutral: '#191D24',

          'base-100': '#2A303C',

          info: '#06b6d4',

          success: '#84cc16',

          warning: '#f59e0b',

          error: '#ef4444',
        },
      },
    ],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
};
