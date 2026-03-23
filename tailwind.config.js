const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './vendor/laravel/jetstream/**/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',  // <-- React SPA
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'sa-bg':     'var(--sa-bg)',
                'sa-card':   'var(--sa-card)',
                'sa-border': 'var(--sa-border)',
                'sa-accent': 'var(--sa-accent)',
                'sa-muted':  'var(--sa-muted)',
                'sa-text':   'var(--sa-text)',
                primary: {
                    50:  '#f0fdf9',
                    100: '#ccfbef',
                    200: '#99f6de',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: 'var(--color-primary, #2563eb)',
                    700: 'var(--color-secondary, #1e40af)',
                    800: '#053f3a',
                    900: '#032e2a',
                    950: '#021f1e',
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};
