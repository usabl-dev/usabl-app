import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { usablVitePluginFromConfig } from 'usabl/vite'

/**
 * Vite config for the local fixture app.
 * Tests run in jsdom so focus behavior can be asserted in unit tests.
 */
export default defineConfig({
  plugins: [
    react(),
    // The overlay only projects the gate-owned Result; usabl=off and webdriver skips stay in-engine.
    usablVitePluginFromConfig({ cwd: import.meta.dirname }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
})
