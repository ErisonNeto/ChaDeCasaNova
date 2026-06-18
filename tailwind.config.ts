import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada no convite virtual Jeyse & Erison:
        // papel perolado, rosé queimado, concha rosada e dourado champagne.
        champagne: '#F7EEE9',
        porcelain: '#FFF8F5',
        gold: '#D8A56E',
        sage: '#E8C8C2',
        olive: '#A8736C',
        cocoa: '#6D5148',
        blush: '#F3D6D0',
        linen: '#EFE2DC',
        rose: '#B96F68',
        roseDeep: '#8E514B',
        shell: '#F6C7B9',
        pearl: '#FAF2EF',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 24px 80px rgba(109, 81, 72, 0.14)',
        soft: '0 16px 40px rgba(109, 81, 72, 0.10)',
        glow: '0 0 0 1px rgba(185, 111, 104, .20), 0 18px 50px rgba(185, 111, 104, .18)',
      },
      backgroundImage: {
        'premium-radial': 'radial-gradient(circle at 12% 10%, rgba(243, 214, 208, .78), transparent 32%), radial-gradient(circle at 86% 14%, rgba(246, 199, 185, .42), transparent 30%), radial-gradient(circle at 50% 100%, rgba(216, 165, 110, .13), transparent 34%), linear-gradient(135deg, #fff8f5 0%, #f7eee9 48%, #fffaf7 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
