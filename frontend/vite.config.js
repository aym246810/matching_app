import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // 開発中は '/api' へのリクエストをFlask(:5000)へ転送する。
    // これで本番と同じ相対パス '/api' をコードで使える。
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
