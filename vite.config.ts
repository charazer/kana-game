import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/kana-game/',
  root: 'src',
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
      exclude: [
        'node_modules/',
        'src/main.ts', // Main entry point with DOM manipulation
        'src/globals.d.ts',
        'src/test-setup.ts', // Test setup file
        'src/data/kana/**', // Kana data files
        '**/*.config.ts',
        '**/types.ts',
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
