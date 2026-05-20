import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'frontend/src'),
        },
    },
    server: {
        port: 5180,
        strictPort: true,
    },
    preview: {
        port: 4180,
        strictPort: true,
    },
    build: {
        outDir: 'dist/frontend',
        emptyOutDir: true,
    },
});
