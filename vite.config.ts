import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY)
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Code split core react libs
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              // Code split heavy third-party libs
              if (id.includes('@supabase')) {
                return 'supabase-vendor';
              }
              if (id.includes('@google') || id.includes('genai')) {
                return 'google-genai-vendor';
              }
              // All other node_modules
              return 'vendor';
            }
          }
        }
      }
    }
  }
})