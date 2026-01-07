import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/main.ts', // Main entry point with DOM manipulation
        'src/globals.d.ts',
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
