/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#F4F7F5',
        surface: '#FFFFFF',
        'main-text': '#1B254B',
        'secondary-text': '#8392A5',
        border: '#E8EFEA',
        sidebar: {
          DEFAULT: '#6EB887',
          hover: '#61A979',
          active: '#FFFFFF',
          dark: '#589F70',
        },
        primary: {
          DEFAULT: '#52B788',
          hover: '#409E71',
          soft: '#EAF6EE',
          50: '#F2FAF5',
          100: '#EAF6EE',
          200: '#CBEBD7',
          500: '#52B788',
          600: '#43A777',
          700: '#348A60',
          800: '#256D4B',
        },
        sage: {
          50: '#F4F8F5',
          100: '#E8F2EC',
          200: '#D2E5DA',
          300: '#B5D3C1',
          400: '#94BEA4',
          500: '#6EB887',
          600: '#589F70',
        },
        error: {
          DEFAULT: '#E53E3E',
          soft: '#FDEEEC',
          border: '#FECDCA',
          hover: '#C53030',
        },
        warning: {
          DEFAULT: '#DD6B20',
          soft: '#FEF6E9',
          border: '#FBD38D',
        },
        success: {
          DEFAULT: '#38A169',
          soft: '#E9F7EF',
          border: '#9AE6B4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        subtle: '0 2px 8px 0 rgba(27, 37, 75, 0.04)',
        card: '0 8px 24px -4px rgba(27, 37, 75, 0.06), 0 2px 6px -2px rgba(27, 37, 75, 0.02)',
        elevated: '0 16px 36px -6px rgba(27, 37, 75, 0.08), 0 6px 12px -4px rgba(27, 37, 75, 0.03)',
        floating: '0 20px 40px -8px rgba(110, 184, 135, 0.25)',
      },
    },
  },
  plugins: [],
};
