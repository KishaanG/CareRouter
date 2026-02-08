/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Claude-inspired gradient colors
        'gradient-mint': '#C8E6E6',
        'gradient-cream': '#F5E6D3',
        'gradient-rose': '#E8D4CD',
        // Queen's colors
        'queens-navy': '#002452',
        'queens-gold': '#FDBF57',
        // Semantic colors
        'text-primary': '#1a1a1a',
        'text-secondary': '#6B7280',
        'success': '#4A7C59',
        'error': '#D64545',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        heading: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
