# CLI test plan

The command line is the gate. `usabl check` scans the affected screens and returns
one verdict with a matching exit code. It is the only surface that mints a verdict;
every other surface renders the Result this command produced.

Read the [shared setup and verdict reference](README.md) first. `check` is the
default command, so `usabl` with no positional argument runs it. In this fixture,
call it with `npx usabl`.

## Scope

- The verdict and exit code for each of the five fixture scenarios.
- The `--json` output shape.
- The advisory `--self-check` projection.
- The `--ci` refusal without a trusted ref.
- The receipt minted on a verified run.

## Preconditions

- Shared setup complete, fixture at `baseline-repaired`.
- Dev server running at `http://127.0.0.1:5173` for every case except TC-CLI-08.

## Test cases

### TC-CLI-01: Idle on a clean tree

**Objective:** A clean tree has nothing to check, so the gate is honest about it.

**Steps:**
1. Confirm the tree is clean: `git status --short` shows nothing.
2. Run `npx usabl check; echo "exit=$?"`.

**Expected:** Verdict is idle (`null`), no findings, `exit=0`. The output says there
was no interface change to check. It does not claim verified.

- [ ] Pass

### TC-CLI-02: Regression on a new barrier

**Objective:** A new machine-checkable barrier blocks.

**Steps:**
1. `npm run demo:break`
2. `npm run demo:status` shows `broken (team-demo-broken)`.
3. Run `npx usabl check; echo "exit=$?"`.

**Expected:** Verdict `regression`, `exit=1`, eight gating findings across the
Deployments and Clusters screens. Each finding prints as a what, why, and fix line,
not a raw dump. No receipt is minted.

- [ ] Pass

### TC-CLI-03: Verified with a receipt

**Objective:** A repair that clears the barriers verifies and mints a receipt bound
to the exact source.

**Steps:**
1. From the broken state, run `npm run demo:repair`.
2. `npm run demo:status` shows `repaired (team-demo-repaired)`.
3. Run `npx usabl check; echo "exit=$?"`.

**Expected:** Verdict `verified`, `exit=0`, zero active findings. A receipt is minted
and bound to the current source tree, the policy hash, the runner version, and the
scanner versions. Running `check` again with no further change still verifies.

- [ ] Pass

### TC-CLI-04: Not covered when a surface cannot be checked

**Objective:** When the engine cannot reach a touched screen, it refuses to guess.

**Steps:**
1. `npm run demo:break`
2. Stop the dev server (`Ctrl-C` in its terminal).
3. Run `npx usabl check; echo "exit=$?"`.

**Expected:** Verdict `not_covered`, `exit=3`. The output names the screens it could
not reach and states this is honest uncertainty, not a pass. Restart the dev server
before the next case.

- [ ] Pass

### TC-CLI-05: Approval required on a guarded policy edit

**Objective:** Editing policy itself is a code-owner decision, not a check the author
can pass alone.

**Steps:**
1. Make a benign edit to a guarded file, for example add a trailing newline to
   `usabl.routes.json`, so it diverges from `HEAD`.
2. Run `npx usabl check; echo "exit=$?"`.

**Expected:** Verdict `approval_required`, `exit=2`. The output lists the dirty
guarded path and states that a code owner must review the change. Reset with
`git checkout -- usabl.routes.json`.

- [ ] Pass

### TC-CLI-06: JSON output shape

**Objective:** Machine output is stable and complete for CI and tooling.

**Steps:**
1. `npm run demo:break`
2. Run `npx usabl check --json > /tmp/usabl-result.json; echo "exit=$?"`.
3. Inspect the file, for example with `jq keys /tmp/usabl-result.json`.

**Expected:** `exit=1` (the exit code still reflects the verdict). The JSON top level
includes `schemaVersion` (`usabl.result.v1`), `verdict`, `summary`, `screens`,
`coverage`, `findings`, `receipt`, `dirtyGuardedPaths`, `exitCode`,
`accessibilityVerdict`, `accessibilityExitCode`, and `paidDownCount`. Any untrusted
page text inside findings is framed, never emitted as raw instructions.

- [ ] Pass

### TC-CLI-07: Self-check is advisory and never blocks

**Objective:** The advisory projection reports the verdict without failing the
process, so it can guide work mid-task.

**Steps:**
1. With the source still broken, run `npx usabl check --self-check; echo "exit=$?"`.

**Expected:** The message reads `usabl self-check: REGRESSION` followed by
`advisory: the stop hook is the gate.` and the summary, but `exit=0`. If the source
were verified it would report `VERIFIED` and still persist the receipt. It never
prints a block.

- [ ] Pass

### TC-CLI-08: The exit-code contract in a script

**Objective:** The five exit codes are usable directly from a shell, with no dev
server dependency for the idle and refusal paths.

**Steps:**
1. On a clean tree with the dev server stopped, run `npx usabl check; echo "exit=$?"`.
2. Run `npx usabl check --ci; echo "exit=$?"`.

**Expected:** Step 1 is idle, `exit=0`. Step 2 is a refusal, `exit=2`, with the
message that CI mode requires `--trusted-ref <git-ref>`. No browser is launched for
either path.

- [ ] Pass

### TC-CLI-09: Trusted-ref reads policy from the ref, not the working tree

**Objective:** Policy, floor, and waivers come from a trusted ref so a change cannot
rewrite its own acceptance bytes and pass.

**Steps:**
1. `npm run demo:break`
2. Run `npx usabl check --ci --trusted-ref HEAD --json > /tmp/usabl-ci.json; echo "exit=$?"`.

**Expected:** `exit=1` for the regression. The floor and waivers are read from `HEAD`
through git, not from the working tree, so an uncommitted edit to
`.usabl-evidence.json` or `.usabl-waivers.json` cannot silence the finding in this
run.

- [ ] Pass

## Reset

```bash
git checkout -- src/demo/scenarios.ts usabl.routes.json
npm run demo:status   # expect: repaired (baseline-repaired)
```

## Automated coverage

These manual cases map to engine tests in the `usabl` repository:

- `test/surfaces/cli.test.ts`: flag parsing, the `--ci` refusal, and JSON scrub.
- `test/gate/verdict.test.ts`: the verdict-to-exit-code mapping for every verdict.
- `test/run.test.ts` and `test/run-phase3.test.ts`: run sequencing, crash to exit 4,
  and trusted-ref reads.
- `test/gate/waivers.test.ts` and `test/gate/differential.test.ts`: floor and waiver
  lifecycle.
