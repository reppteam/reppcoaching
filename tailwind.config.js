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
        foreground: '#000000',
        card: '#ffffff',
        'card-foreground': '#000000',
        popover: '#ffffff',
        'popover-foreground': '#000000',
        primary: '#3399cc',
        'primary-foreground': '#ffffff',
        secondary: '#E3F2FD',
        'secondary-foreground': '#1565C0',
        muted: '#ececf0',
        'muted-foreground': '#666666',
        accent: '#E3F2FD',
        'accent-foreground': '#1565C0',
        destructive: '#d4183d',
        'destructive-foreground': '#ffffff',
        border: 'rgba(0, 0, 0, 0.1)',
        input: 'transparent',
        'input-background': '#f3f3f5',
        'switch-background': '#cbced4',
        ring: '#3399cc',
        'chart-1': '#3399cc',
        'chart-2': '#42A5F5',
        'chart-3': '#64B5F6',
        'chart-4': '#90CAF9',
        'chart-5': '#BBDEFB',
        sidebar: '#F8F9FA',
        'sidebar-foreground': '#000000',
        'sidebar-primary': '#3399cc',
        'sidebar-primary-foreground': '#ffffff',
        'sidebar-accent': '#E3F2FD',
        'sidebar-accent-foreground': '#1565C0',
        'sidebar-border': 'oklch(0.922 0 0)',
        'sidebar-ring': '#3399cc',
        'brand-blue': '#3399cc',
        'brand-blue-light': '#42A5F5',
        'brand-blue-dark': '#1565C0',
        'brand-gray': '#666666',
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