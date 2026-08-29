import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

// The engine commit the demo CI is pinned to. This is duplicated from the gate
// workflow on purpose: the test encodes the approved pin independently, so an
// unreviewed re-pin of the workflow fails here instead of drifting silently.
// Update this in lockstep with the workflow's usabl-dev/usabl checkouts.
const TRUSTED_ENGINE = 'e84b42b67bfd1dcfff2a3cd3e9f0440f4077fcbf'

async function rootFile(path: string): Promise<string> {
  return readFile(path, 'utf8')
}

// Return the ref pinned by every checkout of the usabl-dev/usabl engine repo.
// Other checkouts (the fixture's own head and base) are ignored, so this asserts
// the engine pin specifically, and catches a partial re-pin that updates one
// checkout but not the other.
function enginePins(workflow: string): string[] {
  const lines = workflow.split('\n')
  const pins: string[] = []
  lines.forEach((line, index) => {
    if (!/^\s*repository:\s*usabl-dev\/usabl\s*$/.test(line)) {
      return
    }
    for (let i = index + 1; i < Math.min(index + 6, lines.length); i += 1) {
      const match = /^\s*ref:\s*(\S+)\s*$/.exec(lines[i] ?? '')
      if (match) {
        pins.push(match[1] as string)
        break
      }
    }
  })
  return pins
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
    const pins = enginePins(workflow)
    expect(pins.length).toBeGreaterThan(0)
    expect(pins.every((ref) => ref === TRUSTED_ENGINE)).toBe(true)
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

  it('guards the gate workflow and ownership map so neither changes without a second owner review', async () => {
    const config = JSON.parse(await rootFile('usabl.config.json')) as { guardedPaths: string[] }
    const codeowners = await rootFile('.github/CODEOWNERS')

    // The gate workflow decides the merge, and CODEOWNERS decides who can approve
    // policy changes. A PR that edits either must require a CODEOWNERS review, so
    // both are guarded paths with a matching owner rule. The workflow directory is
    // guarded as a prefix so a newly added workflow file is caught too.
    expect(config.guardedPaths).toContain('.github/workflows')
    expect(config.guardedPaths).toContain('.github/CODEOWNERS')
    expect(codeowners).toContain('.github/workflows/* @eparenti')
    expect(codeowners).toContain('.github/CODEOWNERS @eparenti')
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
