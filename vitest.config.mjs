import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 10000,
    globals: true,
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,ts}'],
      exclude: [
        '**/node_modules/**',
        'tests/**',
        'dist/**',
        'build/**',
        '**/config/**',
        '**/*.d.ts',
        '**/interfaces/**',
        '**/schemas/**',
        '**/shared/**',
        '**/types/**',
        '**/*.config.*',
        '**/vitest.config.*',
        '**/app.ts',
        '**/server.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
    setupFiles: ['./tests/setup.ts'],
  },
})
