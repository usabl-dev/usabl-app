import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

async function rootFile(path: string): Promise<string> {
  return readFile(path, 'utf8')
}

describe('team demo wiring', () => {
  it('pins CI to the trusted engine and keeps policy enforce off the accessibility job', async () => {
    const workflow = await rootFile('.github/workflows/usabl-gate.yml')
    const codeowners = await rootFile('.github/CODEOWNERS')
    expect(workflow).toContain('ref: caef8a469cb8def203d03809b33fc787420940fc')
    expect(workflow).toContain('npx playwright install --with-deps chromium')
    expect(workflow).toContain('check --ci --trusted-ref')
    expect(workflow).toContain('usabl-policy:')
    expect(workflow).toContain('if: always()')
    expect(workflow).toContain('enforce policy --trusted-ref')
    expect(workflow).toContain('exit "${USABL_EXIT}"')
    expect(workflow).not.toContain('enforce accessibility')
    expect(codeowners).toContain('@eparenti')
    expect(codeowners).toContain('usabl.config.json')
    expect(codeowners).toContain('.usabl-evidence.json')
    expect(codeowners).not.toContain('@usabl-dev')
  })

  it('keeps the Claude mid-session check advisory and the installed Stop hook gating', async () => {
    const settings = await rootFile('.claude/settings.json')
    const skill = await rootFile('.claude/skills/usabl-check/SKILL.md')

    expect(settings).toContain('node node_modules/usabl/dist/stop-hook-runner.js')
    expect(skill).toContain('npx usabl check --self-check')
    expect(skill).toContain('This is a mid-session check. It is advisory.')
    expect(skill).toContain('The usabl Stop hook decides whether Claude can finish.')
  })

  it('documents the complete browser, Claude, pull request, and CI loop', async () => {
    const readme = await rootFile('README.md')
    const packageJson = JSON.parse(await rootFile('package.json')) as {
      scripts: Record<string, string>
    }
    const config = JSON.parse(await rootFile('usabl.config.json')) as {
      uiFileGlobs: string[]
    }

    expect(packageJson.scripts['demo:break']).toBe('node scripts/set-demo-source.mjs broken')
    expect(packageJson.scripts['demo:repair']).toBe('node scripts/set-demo-source.mjs repaired')
    expect(config.uiFileGlobs).toContain('src/demo/scenarios.ts')
    expect(readme).toContain('## Part 3: inspect the browser Result')
    expect(readme).toContain('## Part 4: show Claude during implementation')
    expect(readme).toContain('## Part 5: show the pull request block')
    expect(readme).toContain('## Part 6: repair and verify')
    expect(readme).not.toContain('overlay badge')
  })
})
