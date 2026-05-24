import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#0a0a0f',
        'dark-secondary': '#111118',
        'dark-card': '#16161f',
        'dark-elevated': '#1c1c28',
        border: 'rgba(255, 255, 255, 0.06)',
        'border-accent': 'rgba(139, 92, 246, 0.3)',
        'text-primary': '#f0f0f5',
        'text-secondary': '#8b8b9a',
        'text-muted': '#525261',
        'accent-primary': '#7c3aed',
        'accent-secondary': '#06b6d4',
        'accent-green': '#10b981',
        'accent-amber': '#f59e0b',
        'accent-rose': '#f43f5e',
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        'jetbrains': ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        subtle: '0 4px 24px rgba(0, 0, 0, 0.3)',
        glow: '0 0 24px rgba(124, 58, 237, 0.15)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

export default config
