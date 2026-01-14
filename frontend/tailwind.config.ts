import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tarot: {
          green: '#1a5f1f',
          lightgreen: '#2d8635',
          darkgreen: '#0f3d11',
        }
      }
    },
  },
  plugins: [],
}
export default config
