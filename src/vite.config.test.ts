import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readViteConfigSource(): string {
  const configPath = resolve(import.meta.dirname, '../vite.config.ts')
  return readFileSync(configPath, 'utf8')
}

describe('vite config plugin wiring', () => {
  it('includes the usabl overlay plugin', () => {
    const source = readViteConfigSource()
    expect(source).toContain("import { usablVitePluginFromConfig } from 'usabl/vite'")
    expect(source).toContain('usablVitePluginFromConfig({ cwd: import.meta.dirname })')
  })
})
