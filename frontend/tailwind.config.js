/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        canvas: {
          DEFAULT: '#0e0e0f',
          2: '#161618',
          3: '#1e1e21',
        },
        border: {
          DEFAULT: '#2a2a2e',
          bright: '#3d3d44',
        },
        ink: {
          DEFAULT: '#e8e8ec',
          muted: '#7a7a88',
          dim: '#4a4a55',
        },
        lime: {
          DEFAULT: '#d4f542',
          hover: '#e2ff3a',
          dim: '#1e2408',
        },
        coral: '#ff5c3a',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideToast: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.4s both',
        fadeIn: 'fadeIn 0.2s both',
        slideUp: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1) both',
        slideToast: 'slideToast 0.25s cubic-bezier(0.16,1,0.3,1) both',
        spin: 'spin 0.8s linear infinite',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
