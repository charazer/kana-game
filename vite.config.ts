import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/kana-game/',
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['**/*.ts'],
      exclude: [
        'node_modules/',
        'main.ts', // Main entry point with DOM manipulation
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
