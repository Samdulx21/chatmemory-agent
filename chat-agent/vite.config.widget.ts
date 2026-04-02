import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Output para el widget embebible
    outDir: 'dist/widget',

    // Generar sourcemaps para debugging
    sourcemap: true,

    // Configuración para library mode
    lib: {
      entry: resolve(__dirname, 'src/widget/index.tsx'),
      name: 'EduChatWidget',
      formats: ['iife'], // Immediately Invoked Function Expression
      fileName: 'chat-widget',
    },

    rollupOptions: {
      // Incluir React y ReactDOM en el bundle (no external)
      external: [],

      output: {
        // Configuración para optimizar el tamaño
        manualChunks: undefined,

        // Inline assets pequeños
        inlineDynamicImports: true,

        // Nombres de archivos consistentes
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
      },
    },

    // Optimizaciones
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Mantener algunos logs para debugging
        drop_debugger: true,
      },
    },

    // Tamaño máximo de chunk (1MB para incluir React)
    chunkSizeWarningLimit: 1000,

    // Copiar archivos estáticos
    copyPublicDir: true,
  },

  // Configuración de resolve
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  // Definir variables de entorno
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})