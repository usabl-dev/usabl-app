import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

async function rootFile(path: string): Promise<string> {
  return readFile(path, 'utf8')
}

// Return a single job's YAML block so an assertion can target one job instead of
// the whole file. Job keys are the only two-space-indented, non-blank keys.
function jobBlock(workflow: string, jobName: string): string {
  const lines = workflow.split('\n')
  const start = lines.findIndex((line) => line.startsWith(`  ${jobName}:`))
  if (start === -1) {
    throw new Error(`job ${jobName} not found in workflow`)
  }
  let end = lines.length
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^ {2}\S/.test(lines[i] ?? '')) {
      end = i
      break
    }
  }
  return lines.slice(start, end).join('\n')
}

describe('team demo wiring', () => {
  it('pins CI to the trusted engine and splits accessibility from policy', async () => {
    const workflow = await rootFile('.github/workflows/usabl-gate.yml')
    const codeowners = await rootFile('.github/CODEOWNERS')
    expect(workflow).toContain('ref: caef8a469cb8def203d03809b33fc787420940fc')
    expect(workflow).toContain('npx playwright install --with-deps chromium')
    expect(workflow).toContain('check --ci --trusted-ref')
    expect(workflow).toContain('usabl-policy:')
    expect(workflow).toContain('if: always()')
    expect(workflow).toContain('enforce policy --trusted-ref')
    expect(workflow).toContain('enforce accessibility')
    expect(workflow).toContain('pull_request_review:')
    expect(workflow).toContain('submitted, edited, dismissed')
    expect(workflow).toContain('github.event.pull_request.base.ref')
    expect(workflow).toContain('github.event.pull_request.head.sha')
    expect(workflow).not.toContain('github.base_ref')
    expect(codeowners).toContain('@eparenti')
    expect(codeowners).toContain('usabl.config.json')
    expect(codeowners).toContain('.usabl-evidence.json')
    expect(codeowners).not.toContain('@usabl-dev')
  })

  it('runs the head-executing scan only on pull_request and re-checks policy without executing head code', async () => {
    const workflow = await rootFile('.github/workflows/usabl-gate.yml')
    const scan = jobBlock(workflow, 'gate-comment')
    const policy = jobBlock(workflow, 'usabl-policy')

    // The scan starts the fixture, and npm run dev executes PR head code. A
    // pull_request event denies secrets to fork head code, but pull_request_review
    // carries base-repo secrets, so the scan must be fenced to pull_request only.
    expect(scan).toContain('npm run dev')
    expect(scan).toContain("if: github.event_name == 'pull_request'")

    // The policy re-check also runs on review events, which carry base-repo secrets.
    // It must never check out or execute PR head code. It reads the head only as git
    // objects (refs/pull/<n>/head) and decides from trusted refs and the reviews API.
    expect(policy).not.toContain('npm run dev')
    expect(policy).not.toContain('ref: ${{ github.event.pull_request.head.sha }}')
    expect(policy).toContain('pull/')
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
