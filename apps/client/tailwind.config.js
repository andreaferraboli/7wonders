/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Card colors
                'card-brown': '#8B4513',
                'card-grey': '#6B7280',
                'card-blue': '#2563EB',
                'card-yellow': '#F59E0B',
                'card-red': '#DC2626',
                'card-green': '#16A34A',
                'card-purple': '#7C3AED',
                'card-black': '#1F2937',
                // UI colors
                'ancient-gold': '#D4A574',
                'ancient-bronze': '#CD7F32',
                'parchment': '#F5F0E8',
                'dark-marble': '#1A1A2E',
                'medium-marble': '#16213E',
                'accent-teal': '#0F969C',
            },
            fontFamily: {
                'display': ['Cinzel', 'Georgia', 'serif'],
                'body': ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'marble-texture': 'radial-gradient(ellipse at 20% 50%, #1A1A2E 0%, #0F0F23 100%)',
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.3s ease-out',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(212, 165, 116, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(212, 165, 116, 0.8)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
