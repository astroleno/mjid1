import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    chunkSizeWarningLimit: 1000, // 增加chunk大小警告限制
    rollupOptions: {
      output: {
        manualChunks: {
          // 将Three.js相关库分离到单独的chunk
          'three': ['three'],
          'gsap': ['gsap'],
          'lenis': ['@studio-freight/lenis']
        }
      }
    }
  }
});
