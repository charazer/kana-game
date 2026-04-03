import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ['browser']
  },
  base: '/kana-game/',
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Target modern browsers – avoids legacy polyfill overhead
    target: 'es2022',
    // Remove the modulepreload polyfill; all modern browsers support native
    // module preloading, so the polyfill script just wastes bytes on every load
    modulePreload: { polyfill: false },
    // Report compressed sizes during build for visibility into bundle size
    reportCompressedSize: true
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['**/*.{ts,svelte}'],
      exclude: [
        'node_modules/',
        'main.ts', // Main entry point
        'App.svelte', // Top-level orchestrator — excluded like main.ts
        'globals.d.ts',
        'assets/**', // Static asset files
        'test-setup.ts', // Test setup file
        'data/kana/**', // Kana data files
        '**/*.config.ts',
        '**/types.ts',
        '**/test-utils.ts',
        'dist/',
        'coverage/'
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      }
    }
  }
})
