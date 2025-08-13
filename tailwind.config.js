const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
 colors: {
        background: '#ffffff',
        foreground: 'oklch(0.145 0 0)',
        card: '#ffffff',
        'card-foreground': 'oklch(0.145 0 0)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.145 0 0)',
        primary: '#1E88E5',
        'primary-foreground': '#ffffff',
        secondary: '#E3F2FD',
        'secondary-foreground': '#1565C0',
        muted: '#ececf0',
        'muted-foreground': '#717182',
        accent: '#E3F2FD',
        'accent-foreground': '#1565C0',
        destructive: '#d4183d',
        'destructive-foreground': '#ffffff',
        border: 'rgba(0, 0, 0, 0.1)',
        input: 'transparent',
        'input-background': '#f3f3f5',
        'switch-background': '#cbced4',
        ring: '#1E88E5',
        'chart-1': '#1E88E5',
        'chart-2': '#42A5F5',
        'chart-3': '#64B5F6',
        'chart-4': '#90CAF9',
        'chart-5': '#BBDEFB',
        sidebar: '#F8F9FA',
        'sidebar-foreground': 'oklch(0.145 0 0)',
        'sidebar-primary': '#1E88E5',
        'sidebar-primary-foreground': '#ffffff',
        'sidebar-accent': '#E3F2FD',
        'sidebar-accent-foreground': '#1565C0',
        'sidebar-border': 'oklch(0.922 0 0)',
        'sidebar-ring': '#1E88E5',
        'brand-blue': '#1E88E5',
        'brand-blue-light': '#42A5F5',
        'brand-blue-dark': '#1565C0',
        'brand-gray': '#6B7280',
        'brand-gray-light': '#9CA3AF',
      },
      boxShadow: {
        ringCustom: '0 0 0 2px var(--ring)',
        ringSidebarCustom: '0 0 0 2px var(--sidebar-ring)',
      },
      borderColor: {
        borderCustom: 'var(--border)',
        borderSidebarCustom: 'var(--sidebar-border)',
        brandBlue: 'var(--brand-blue)',
      },
    },
  },
  plugins: [
    plugin(function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'bg-var': (value) => ({
            'background-color': `var(--${value})`,
          }),
          'text-var': (value) => ({
            'color': `var(--${value})`,
          }),
        },
        { values: theme('colors') }
      );
    })
  ],
};