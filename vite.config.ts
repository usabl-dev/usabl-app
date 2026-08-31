import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { usablVitePluginFromConfig } from 'usabl/vite'

/**
 * Vite config for the local fixture app.
 * Tests run in jsdom so focus behavior can be asserted in unit tests.
 */
export default defineConfig({
  server: {
    // Bind all interfaces (0.0.0.0). Vite's default `localhost` resolves to IPv6 (::1)
    // on Node 17 and later, which the scanner cannot reach at http://127.0.0.1:5173, so
    // the check would report Not covered instead of the expected result. Binding all
    // interfaces keeps 127.0.0.1 reachable for the in-container scanner and also exposes
    // the fixture to the host when usabl runs inside a container. strictPort fails loudly
    // rather than drifting to another port and leaving the check pointed at an empty address.
    host: true,
    port: 5173,
    strictPort: true,
  },
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
