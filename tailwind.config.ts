import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { ink: '#17263c', muted: '#75849a', line: '#e8edf2', canvas: '#f6f8fa', brand: '#126b69' }, boxShadow: { card: '0 2px 12px rgba(31, 52, 77, .045)' } } },
  plugins: [],
};
export default config;
