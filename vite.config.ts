import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://www.my-dashboard.net:3000' // Die URL deines Express-Backends
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use './src/style/mixins' as *; @use './src/style/colors' as *;`
      }
    }
  }
})
