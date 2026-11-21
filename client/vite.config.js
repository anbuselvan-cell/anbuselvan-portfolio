import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// SINGLE=1 builds one self-contained HTML file (used for the preview in chat).
const single = Boolean(process.env.SINGLE);

export default defineConfig({
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  server: {
    proxy: { '/api': 'http://localhost:5000' },
    fs: { allow: ['..'] },
  },
  build: {
    assetsInlineLimit: single ? 100000000 : 4096,
    outDir: single ? 'dist-single' : 'dist',
    chunkSizeWarningLimit: 1500,
  },
});
