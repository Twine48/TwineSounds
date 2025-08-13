import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F05A28',
          dark: '#26313A',
          navy: '#2D3A46',
          light: '#F6F7F9'
        }
      },
      boxShadow: {
        card: '0 6px 28px rgba(0,0,0,0.06)'
      },
      borderRadius: {
        xl: '1rem'
      }
    },
  },
  plugins: [],
};
export default config;