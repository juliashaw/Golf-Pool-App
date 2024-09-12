import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: [
        'backend/tests/**/*.test.js',
        'backend/services/*.mjs',
        'backend/controllers/*.mjs'
      ],
      enabled: true,
      reporter: ['text', 'html'],
    },
    environment: 'node',
  }, 
})