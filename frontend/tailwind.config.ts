import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          50: '#FBF9F5',
          100: '#E8EFE9',
          800: '#1B382B',
          900: '#142A20',
          accent: '#C5A059',
        },
      },
    },
  },
  plugins: [],
};

export default config;