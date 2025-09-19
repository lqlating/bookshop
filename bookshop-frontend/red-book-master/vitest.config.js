import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        plugins: [vue()],
        test: {
            globals: true,
            environment: 'jsdom',
            coverage: {
                provider: 'v8',
                reporter: ['text', 'html'],
                exclude: [
                    'node_modules/**',
                    'dist/**',
                    'public/**',
                    '**/*.d.ts',
                    'src/auto-imports.d.ts',
                    'src/components.d.ts',
                    'tests/**',
                    '**/*.{test,spec}.{js,ts,jsx,tsx}',
                ],
            },
            exclude: ['node_modules', 'dist'],
            include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
    })
); 