/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-main':       '#FDF8F3',   // 한지 느낌 크림
        'bg-card':       'rgba(255,255,255,0.80)',
        'primary':       '#C0392B',   // 단청 주홍
        'primary-dark':  '#962D22',
        'primary-light': '#F1948A',
        'gold':          '#D4A017',   // 황색
        'ink':           '#1A1A1A',   // 먹색
        'text-main':     '#1A1A2E',
        'text-sub':      '#8A8A9A',
        'border-glass':  'rgba(255,255,255,0.85)',
        // 오방색
        'obang-blue':    '#2B5FA5',   // 청
        'obang-red':     '#C0392B',   // 적
        'obang-yellow':  '#D4A017',   // 황
        'obang-white':   '#F5F5F0',   // 백
        'obang-black':   '#1A1A1A',   // 흑
      },
      borderRadius: {
        'squircle':    '26px',
        'squircle-lg': '36px',
      },
      boxShadow: {
        'glass':        '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glass-hover':  '0 16px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glow-red':     '0 8px 24px rgba(192,57,43,0.4)',
        'btn':          '0 4px 20px rgba(192,57,43,0.4)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
