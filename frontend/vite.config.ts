/// <reference types="vitest" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            src: "/src",
        },
    },
    plugins: [react()],
    test: {
        environment: "jsdom",
    },
});
