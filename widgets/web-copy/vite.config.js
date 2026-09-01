import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
var rootDir = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                export: resolve(rootDir, 'export.html'),
                background: resolve(rootDir, 'src/background.ts'),
                content: resolve(rootDir, 'src/content.ts'),
            },
            output: {
                entryFileNames: function (chunk) { return "".concat(chunk.name, ".js"); },
                chunkFileNames: 'chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
            },
        },
    },
});
