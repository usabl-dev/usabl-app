import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { usablVitePluginFromConfig } from 'usabl/vite'

/**
 * Vite config for the local fixture app.
 * Tests run in jsdom so focus behavior can be asserted in unit tests.
 */
export default defineConfig({
  server: {
    // Bind IPv4 on all interfaces (0.0.0.0). usabl.config.json and the runbook target
    // http://127.0.0.1:5173, and the scanner opens that IPv4 address in a headless
    // browser. Vite's default `localhost`, and `host: true`, listen on IPv6 (::) only;
    // that dual-stacks on some systems but not others, so the scanner's IPv4 request is
    // refused and the check reports Not covered. Binding 0.0.0.0 always serves 127.0.0.1
    // for the scanner and the browser, and also exposes the fixture on the LAN address.
    // strictPort fails loudly rather than drifting to another port and leaving the check
    // pointed at an empty address.
    host: '0.0.0.0',
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
