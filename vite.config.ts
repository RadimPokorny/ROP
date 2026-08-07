import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts(),
  ],
  resolve: {
    alias: {
      // Toto propojí symbol '@' se složkou 'src'
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})