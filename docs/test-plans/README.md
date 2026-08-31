# Surface test plans

usabl runs one deterministic engine and shows the result on four surfaces. These
test plans check each surface on its own, then check that they all agree. They use
this fixture, so every case is reproducible on a clean clone.

- [CLI test plan](cli.md): the gate, `usabl check`. The only surface that mints a verdict.
- [Assistant test plan](assistant.md): the Claude Stop hook and the `/usabl-check` self-check.
- [Pull request and CI test plan](pr-and-ci.md): the `gate-comment` and `usabl-policy` checks.
- [Overlay test plan](overlay.md): the advisory dev-server inspector.

The full operational walkthrough is the [team demo runbook](../../README.md). Read it
first if you have never run the loop. These plans assume you can already start the
fixture and drive the demo state.

## What each surface may do

Only the gate decides a verdict. Every other surface renders the same gate-owned
Result and reports it honestly. Two surfaces can block, two are advisory.

| Surface | Runs when | Can block | Mints a verdict |
| --- | --- | --- | --- |
| CLI (`usabl check`) | You run it | Yes, by exit code | Yes, this is the gate |
| Claude Stop hook | The assistant tries to stop | Yes, by a stdout decision object | No, it runs the gate |
| `/usabl-check` self-check | You invoke it during work | No, always exits 0 | No, advisory projection |
| Pull request and CI | A PR opens or updates | Yes, through required checks | No, a trusted engine runs the gate |
| Overlay inspector | Dev-server load and source refresh | No, advisory display | No |

## The verdicts and exit codes

Every `usabl check` ends in one verdict with one exit code. The exit code is the
contract that scripts and CI depend on.

| Verdict | Exit code | Meaning |
| --- | --- | --- |
| Verified | 0 | No new gating barrier on the touched surfaces, coverage complete. A receipt is minted. |
| Idle (verdict is `null`) | 0 | Nothing to check, for example a clean tree with no interface change. |
| Regression | 1 | A new machine-checkable barrier appeared. The change is blocked. |
| Approval required | 2 | A guarded policy file diverged from the trusted ref, so a code owner must decide. |
| Not covered | 3 | A touched surface could not be checked, so the engine refuses to guess. |
| Crash | 4 | The engine hit an error. It fails open with disclosure rather than blocking silently. |

A refusal, such as `--ci` without `--trusted-ref`, also exits 2. Exit code 5 is
reserved for an opt-in judgment soft-gate and the default install never emits it.

## Shared setup

Run these once before any plan.

1. Clone both repositories as siblings, build the engine, and install the browser the
   scanner drives. This follows Step 1 of the [team demo runbook](../../README.md).

   ```bash
   cd usabl && npm ci && npm run build && npx playwright install chromium
   cd ../usabl-app && npm ci
   ```

2. Confirm the fixture is at its clean baseline. All plans start here.

   ```bash
   npm run demo:status   # expect: demo source: repaired (baseline-repaired)
   git status --short    # expect: nothing (clean tree)
   ```

   If `demo:status` is not `baseline-repaired`, reset with
   `git checkout -- src/demo/scenarios.ts`.

3. For every surface except the CLI static path, start the dev server and leave it
   running. The scanner drives a real browser against it.

   ```bash
   npm run dev           # serves http://127.0.0.1:5173
   ```

## The five fixture scenarios

Each plan drives the surface through some of these five states. Produce a state, run
the surface, then reset before the next case.

| Scenario | Produce it | Expected verdict | Reset |
| --- | --- | --- | --- |
| Idle | Clean baseline tree, no change | `null` (idle), exit 0 | Already clean |
| Regression | `npm run demo:break` | `regression`, exit 1, eight findings | `git checkout -- src/demo/scenarios.ts` |
| Verified | `npm run demo:break` then `npm run demo:repair` | `verified`, exit 0, receipt minted | `git checkout -- src/demo/scenarios.ts` |
| Not covered | Break the source, then stop the dev server, or touch an interface file the route map does not know | `not_covered`, exit 3 | Restart the server, `git checkout` the file |
| Approval required | Edit a guarded policy file, for example `usabl.routes.json` | `approval_required`, exit 2 | `git checkout -- usabl.routes.json` |

The guarded policy files in this fixture are `usabl.config.json`,
`usabl.routes.json`, `.usabl-evidence.json`, and `.usabl-waivers.json`, plus
`.github/workflows/*` and `.github/CODEOWNERS`. Editing any of them so it diverges
from the trusted ref forces `approval_required`.

## Cross-surface consistency

The headline invariant: for one working tree, every surface reports the same verdict.
After you finish the four surface plans, run this end-to-end check with the source
broken and the dev server running.

| Step | Command or action | Expected |
| --- | --- | --- |
| Break the source | `npm run demo:break` | `demo:status` shows `broken (team-demo-broken)` |
| CLI | `npx usabl check; echo "exit=$?"` | `regression`, `exit=1` |
| Overlay | `curl -s http://127.0.0.1:5173/__usabl/result` | `"verdict":"regression"` |
| Self-check | `/usabl-check` in Claude | `REGRESSION`, advisory, exit 0 |
| Stop hook | `echo '{"stop_hook_active":false}' \| node node_modules/usabl/dist/stop-hook-runner.js` | stdout contains `"decision":"block"` |
| Pull request | Push the break to a branch and open a PR | `gate-comment` fails, `usabl-policy` red |
| Repair | `npm run demo:repair` | Every surface flips to `verified` or allow |

If any surface disagrees while the tree is identical, that is a defect. Capture the
disagreeing surface, the verdict each one showed, and the engine commit, then file it
with the [feedback form](https://github.com/usabl-dev/usabl/issues/new?template=feedback.yml).

## Reset after any plan

Return the fixture to the clean baseline so the next run starts fresh.

```bash
git checkout -- src/demo/scenarios.ts
npm run demo:status   # expect: repaired (baseline-repaired)
```

Stop the dev server when you are done.
