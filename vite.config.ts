import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Vite config for the local fixture app.
 * Tests run in jsdom so focus behavior can be asserted in unit tests.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
})
