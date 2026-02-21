import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'Learning Packets',
        short_name: 'Packets',
        description: 'Offline-first learning packets',
        theme_color: '#1a1a2e',
        background_color: '#16213e',
      },
    }),
  ],
})
