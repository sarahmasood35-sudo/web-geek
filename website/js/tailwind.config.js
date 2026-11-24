tailwind.config = {
  theme: {
    extend: {
      colors: {
        // Surfaces: base → elevated → floating
        night: { DEFAULT: '#FFFFFF', 2: '#F6F5FB', 3: '#FFFFFF', 4: '#EFEDFB' },
        // Brand purples sampled from the WebGeek mark
        iris:  { 700: '#443AAE', 600: '#5A4FCF', 500: '#7064E6', 400: '#8C80F8', 300: '#B1A9FF', 100: '#E3E0FF' },
        // Text scale (dark on light)
        snow:  { DEFAULT: '#14121F', 2: '#4A4860', 3: '#6E6C82' },
        ink: '#14121F',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      spacing: { 30: '7.5rem' },
    },
  },
};
