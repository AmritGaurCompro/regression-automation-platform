/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      /*
       * ─── Color System ─────────────────────────────────────────────
       * All colors reference CSS variables so the dark/light themes
       * in style.css drive everything. No hard-coded hex values here.
       * ──────────────────────────────────────────────────────────────
       */
      colors: {
        /* Shadcn/UI semantic tokens */
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',

        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',

        /* ─── Surface scale ─────────────────────────────────────── */
        /* Use these to replace the old #161b26 / #1c2333 etc hex values */
        surface: {
          0: 'hsl(var(--surface-0))',  /* page canvas — deepest */
          1: 'hsl(var(--surface-1))',  /* card */
          2: 'hsl(var(--surface-2))',  /* input / code block */
          3: 'hsl(var(--surface-3))',  /* hover */
          4: 'hsl(var(--surface-4))',  /* active / selected */
        },

        /* ─── Status semantic colors ────────────────────────────── */
        status: {
          passed:  'hsl(var(--status-passed))',
          failed:  'hsl(var(--status-failed))',
          running: 'hsl(var(--status-running))',
          queued:  'hsl(var(--status-queued))',
          new:     'hsl(var(--status-new))',
        },

        /* ─── Chart colors ──────────────────────────────────────── */
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      fontSize: {
        /* Slightly tighter scale for dense developer UI */
        '2xs': ['0.65rem',  { lineHeight: '1rem' }],
        'xs':  ['0.75rem',  { lineHeight: '1.125rem' }],
        'sm':  ['0.8125rem',{ lineHeight: '1.25rem' }],
        'base':['0.9375rem',{ lineHeight: '1.5rem' }],
      },

      /* ─── Box shadows ──────────────────────────────────────────── */
      boxShadow: {
        'surface':    '0 1px 3px 0 hsl(222 28% 4% / 0.4), 0 1px 2px -1px hsl(222 28% 4% / 0.4)',
        'surface-md': '0 4px 12px 0 hsl(222 28% 4% / 0.5), 0 2px 4px -2px hsl(222 28% 4% / 0.4)',
        'surface-lg': '0 12px 32px 0 hsl(222 28% 4% / 0.6), 0 4px 8px -4px hsl(222 28% 4% / 0.4)',
        'glow-cyan':  '0 0 0 1px hsl(199 89% 48% / 0.2), 0 0 12px hsl(199 89% 48% / 0.15), 0 0 32px hsl(199 89% 48% / 0.08)',
        'glow-cyan-sm':'0 0 0 1px hsl(199 89% 48% / 0.25), 0 0 8px hsl(199 89% 48% / 0.2)',
        'inset-top':  'inset 0 1px 0 0 hsl(214 32% 91% / 0.06)',
      },

      /* ─── Animations ───────────────────────────────────────────── */
      keyframes: {
        'fade-slide-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'hsl(199 89% 48% / 0.4)' },
          '50%':       { borderColor: 'hsl(199 89% 48% / 0.85)' },
        },
        'run-pulse': {
          '0%':   { boxShadow: '0 0 0 0 hsl(38 90% 52% / 0.5)' },
          '70%':  { boxShadow: '0 0 0 8px hsl(38 90% 52% / 0)' },
          '100%': { boxShadow: '0 0 0 0 hsl(38 90% 52% / 0)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-slide-in': 'fade-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'border-glow':   'border-glow 2s ease-in-out infinite',
        'run-pulse':     'run-pulse 1.8s ease-out infinite',
        'spin-slow':     'spin-slow 2s linear infinite',
      },

      /* ─── Spacing tweaks for dense UI ──────────────────────────── */
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}