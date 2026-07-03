import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: { 950: '#101014', 900: '#17171d', 800: '#1f1f27', 700: '#2a2a34' },
        titanium: { 100: '#e9e7e2', 300: '#b8b5ad', 500: '#7d7a72' },
        burnt: { 400: '#e8833a', 500: '#d96b1f', 600: '#b3520f' },
        tacho: '#e33f2f',
      },
      fontFamily: {
        display: ['"Zen Kaku Gothic New"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
