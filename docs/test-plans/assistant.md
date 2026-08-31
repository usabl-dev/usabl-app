# Assistant test plan

Two assistant surfaces share one engine. The `/usabl-check` self-check is advisory
and lets Claude see the Result mid-task. The Stop hook is the gate for the assistant:
it runs when Claude tries to finish and blocks an incomplete accessibility change.

Read the [shared setup and verdict reference](README.md) first. The Stop hook is
wired in `.claude/settings.json` as `node node_modules/usabl/dist/stop-hook-runner.js`
on the `Stop` event.

## How the Stop hook blocks

Claude Code blocks a stop only when the hook writes a decision object to standard
output: `{"decision":"block","reason":"..."}`. The hook always exits 0, so it can
never wedge the assistant through an exit code; if the engine crashes, the hook fails
open with a disclosure on standard error. The verdicts that block are `regression`,
`approval_required`, and `not_covered`. A verified receipt, an idle tree, and the
loop-breaker continuation all allow the stop.

The hook reads a small JSON object on standard input. Only two fields matter:
`stop_hook_active` (Claude Code sets this to `true` when the current stop is itself
the result of a prior block, which breaks the loop) and an optional `session_id`. A
missing or non-object payload is treated as `stop_hook_active:false`.

## Scope

- The self-check reports the verdict and never blocks.
- The Stop hook blocks on the three blocking verdicts.
- The loop-breaker allows the continuation.
- A verified receipt allows the stop without rescanning.
- `usabl bypass` allows exactly one stop.
- The hook fails open on bad input and on an engine error.

## Preconditions

- Shared setup complete, fixture at `baseline-repaired`.
- Dev server running at `http://127.0.0.1:5173`.
- For the in-Claude cases, start Claude from the `usabl-app` folder so it loads the
  project skill and the Stop hook.

## Part A: direct hook invocation

These cases invoke the hook exactly as Claude Code does, without needing an assistant
turn. They are the fastest way to prove the engine side.

### TC-AST-01: Block on a regression

**Steps:**
1. `npm run demo:break`
2. Run:
   ```bash
   echo '{"stop_hook_active":false}' | node node_modules/usabl/dist/stop-hook-runner.js
   echo "exit=$?"
   ```

**Expected:** Standard output is a single JSON object containing
`"decision":"block"` and a `reason` that names the regression and repair guidance.
`exit=0` (the block travels on standard output, not the exit code).

- [ ] Pass

### TC-AST-02: Allow the loop-breaker continuation

**Objective:** Once Claude Code has already blocked and is continuing, the hook must
not block the same stop again, or the session loops.

**Steps:**
1. With the source still broken, run:
   ```bash
   echo '{"stop_hook_active":true}' | node node_modules/usabl/dist/stop-hook-runner.js
   echo "exit=$?"
   ```

**Expected:** No decision object on standard output. Standard error notes that a
continuation is already active. `exit=0`.

- [ ] Pass

### TC-AST-03: Allow a verified receipt without rescanning

**Objective:** After a verified run mints a receipt, the hook honors it without
opening a browser again.

**Steps:**
1. `npm run demo:repair`
2. Mint the receipt: `npx usabl check` (expect `verified`).
3. Run:
   ```bash
   echo '{"stop_hook_active":false}' | node node_modules/usabl/dist/stop-hook-runner.js
   echo "exit=$?"
   ```

**Expected:** No block. Standard error confirms the stored receipt matched the
current source tree, policy hash, runner version, and scanner versions. `exit=0`. The
fast-path is used only when no guarded policy file is dirty.

- [ ] Pass

### TC-AST-04: Block on not covered

**Steps:**
1. `npm run demo:break`
2. Stop the dev server.
3. Run `echo '{"stop_hook_active":false}' | node node_modules/usabl/dist/stop-hook-runner.js`.

**Expected:** A block object whose reason is `not_covered`. Restart the dev server
afterward.

- [ ] Pass

### TC-AST-05: Block on approval required

**Steps:**
1. Add a trailing newline to `usabl.routes.json` so it diverges from `HEAD`.
2. Run `echo '{"stop_hook_active":false}' | node node_modules/usabl/dist/stop-hook-runner.js`.

**Expected:** A block object whose reason is `approval_required`. Reset with
`git checkout -- usabl.routes.json`.

- [ ] Pass

### TC-AST-06: Bypass allows exactly one stop

**Objective:** `usabl bypass` is a loud, one-time escape, not a pass.

**Steps:**
1. `npm run demo:break`
2. `npx usabl bypass` (prints that the next stop only is bypassed).
3. First stop: `echo '{"stop_hook_active":false}' | node node_modules/usabl/dist/stop-hook-runner.js`.
4. Second stop: run the same command again.

**Expected:** Step 3 does not block; standard error states the bypass was consumed
for this stop only. Step 4 blocks on the regression again, because the bypass is
one-time. `exit=0` both times.

- [ ] Pass

### TC-AST-07: Fail open on bad input

**Objective:** A wedged or malformed call must never trap the assistant.

**Steps:**
1. With the source broken, run `printf 'not json' | node node_modules/usabl/dist/stop-hook-runner.js; echo "exit=$?"`.

**Expected:** No decision object, `exit=0`. The hook treats unparseable input as a
non-blocking allow and discloses on standard error.

- [ ] Pass

## Part B: in Claude

These cases prove the wiring end to end inside a real session.

### TC-AST-08: Self-check is advisory

**Steps:**
1. `npm run demo:break`
2. Start Claude from `usabl-app`: `claude`.
3. Run `/usabl-check`.

**Expected:** Claude runs `npx usabl check --self-check` and reports the verdict
`REGRESSION` with the gating findings and an explanation of the first one. It states
plainly that the self-check is advisory and the Stop hook is the gate. It exits 0, so
it never claims the work is done.

- [ ] Pass

### TC-AST-09: The Stop hook blocks the finish

**Steps:**
1. With the source still broken, ask Claude: `We are done. Finish this task.`

**Expected:** Claude is blocked from stopping once. It reports the regression reason
and repair guidance. A continuation can work on the repair without entering a hook
loop.

- [ ] Pass

### TC-AST-10: The Stop hook allows a verified finish

**Steps:**
1. `npm run demo:repair`
2. Re-run `/usabl-check` (expect `VERIFIED`).
3. Ask Claude again: `We are done. Finish this task.`

**Expected:** The Stop hook allows completion, because the stored receipt matches the
current source state.

- [ ] Pass

### TC-AST-11: Hook trust and staleness

**Objective:** A hook that never fires looks exactly like a clean finish, so confirm
Claude Code has actually loaded it.

**Steps:**
1. In Claude, run `/hooks`.

**Expected:** The Stop hook is listed and enabled. If it is missing, the package is
not installed or the session predates the wiring: run `npm ci`, restart `claude` from
`usabl-app`, and confirm again. Direct invocation (Part A) isolates whether a failure
to block is in the engine or in Claude Code's hook trust.

- [ ] Pass

## Reset

```bash
git checkout -- src/demo/scenarios.ts usabl.routes.json
rm -f .usabl/bypass-once
npm run demo:status   # expect: repaired (baseline-repaired)
```

## Automated coverage

- `test/surfaces/stop-hook.test.ts`: allow verified and idle, block the three
  verdicts, allow on the exit-4 error path, and the loop-breaker while active.
- `test/surfaces/stop-hook-runner.test.ts`: fail open on invalid JSON, one-shot
  bypass, block only through a single stdout object, and the receipt fast-path skip
  when a guarded file is dirty.
- `test/surfaces/self-check.test.ts`: the self-check is always advisory with exit 0.
- `test/install/claude.test.ts` and `test/install/stop-hook-cli.test.ts`: the Claude
  install and the `usabl stop-hook` entry point.
