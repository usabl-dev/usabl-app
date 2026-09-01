# usabl team fixture

This is the hands-on fixture for learning usabl. It is a small React and
PatternFly operations app with deliberate accessibility barriers wired in, so you
can install usabl, run it, and watch the full accessibility proof loop end to end
on your own machine.

This page is written to be the first thing you read. Follow it top to bottom and
you will go from an empty folder to a working setup, a live accessibility
regression, and a verified repair. Every command below has been run in this
order.

Allow about 20 minutes for the first pass. You do not need to write code to
operate the walkthrough. Pair with a developer for the optional pull request step
if you like.

## What you will be able to explain afterward

- The accessibility barrier a person actually experiences.
- Which changed screens usabl checked, and why.
- Why a Result is a regression, verified, not covered, or awaiting approval.
- Why the browser inspector and the assistant `/usabl-check` self-check are
  advisory, while the Claude Stop hook and the pull request check can block.
- How a verified receipt is tied to the exact source state that was checked.

## Prerequisites

- Node.js 22 and npm. Check with `node -v` and `npm -v`.
- Git.
- About 150 MB of disk for the headless browser the scanner drives.
- Optional, for the pull request step only: the GitHub CLI (`gh`) and access to
  the `usabl-dev` organization.

## Step 1: Install

usabl is not published to a package registry yet, so the fixture uses the engine
from a sibling folder through `"usabl": "file:../usabl"`. Clone both repositories
next to each other:

```text
<your-workspace>/
  usabl/        the engine
  usabl-app/    this fixture
```

```bash
git clone https://github.com/usabl-dev/usabl.git
git clone https://github.com/usabl-dev/usabl-app.git
```

Build the engine and install the browser the scanner uses. Playwright downloads
Chromium into a shared cache, so this only happens once per machine:

```bash
cd usabl
npm ci
npm run build
npx playwright install chromium
```

Install the fixture:

```bash
cd ../usabl-app
npm ci
```

That is the whole install. If `npx playwright install chromium` reports missing
system libraries on Linux, run `npx playwright install --with-deps chromium`
instead.

## Step 2: Confirm your setup

Run these from `usabl-app`. They should all succeed before you continue.

```bash
npm run demo:status   # expect: demo source: repaired (baseline-repaired)
npm test              # unit tests for the fixture and its wiring
npm run typecheck     # tsc --noEmit
npm run lint          # oxlint
npm run build         # tsc -b && vite build
```

`demo:status` reports the tracked source state. A fresh clone starts at
`repaired (baseline-repaired)`. If it shows anything else, someone left the
fixture mid-walkthrough. Reset it to the clean baseline:

```bash
git checkout -- src/demo/scenarios.ts
```

## Step 3: Start the fixture

```bash
npm run dev
```

Open `http://127.0.0.1:5173`.

The fixture, the `usabl.config.json` file, and the scanner all use the IPv4
address `127.0.0.1`. The dev server binds `0.0.0.0` so that address always
resolves, both for your browser and for the headless browser the scanner drives.
Leave this server running for the rest of the walkthrough. The scanner cannot
reach the screens without it, and the check then reports Not covered instead of a
real Result.

### Two ideas to keep separate

The Demo controls region on the page mixes two concepts on purpose, so learn to
tell them apart:

- **Current source** renders the tracked source state. This is what usabl checks.
- **A teaching preview** (the broken or repaired preview) lets anyone experience
  the barriers or the fix through a query parameter. It never changes the tracked
  source, so it never drives a Result.

The visible **Tracked source** label always shows the real source mode and its
rehearsal label. Only a change to the current source can drive the proof loop.

## Step 4: Run the accessibility proof loop

This is the core of the fixture. You will experience a barrier, introduce it as a
real source change, and then watch usabl catch it in the browser, in the
assistant, and finally clear it on repair.

You can run every command in this step on whatever branch you cloned. The loop
reads your working tree, not a branch. The optional pull request step later is the
only part that needs its own branch.

### Experience the barriers

Open
`http://127.0.0.1:5173/deployments?scenario=deployment-workflow&preview=broken`
and use only the keyboard where possible:

1. Move through the three **View details** actions. A screen reader announces the
   same name for each row, so the destination is unclear.
2. Open **Actions for policy-worker**. The expanded state is not announced, and
   focus stays on the toggle instead of moving into the menu.
3. Select **Start deployment**. The visual message appears outside a live region,
   so assistive technology may not announce it.
4. Move to the button marked only with `×`. It has no accessible name.
5. Notice the two toolbars. In the broken state they have no distinct accessible
   names.
6. In Demo controls, open the **Cluster details dialog**, then press `Escape`.
   Focus does not return to **View cluster details**.

Now switch the preview to **Repaired** and repeat the same tasks. The names, menu
state and focus, notification, toolbar names, clear button name, and dialog focus
should all behave correctly. Return the preview to **Current source** before
continuing.

### Break the tracked source

Introduce the barriers as a real source change:

```bash
npm run demo:break
git diff -- src/demo/scenarios.ts
npm run demo:status   # expect: broken (team-demo-broken)
```

The dev server reloads the changed source. These barriers now come from the
tracked source, not from a preview query parameter.

### Inspect the browser Result

Open the **usabl** launcher in the lower right corner of the fixture. The
inspector should show:

- A **Regression** status.
- The affected **Deployments** and **Clusters** screens.
- Findings grouped by screen, with user impact, reason, suggested repair, rule,
  provider, severity, status, and confidence for a selected finding.
- No verified receipt while regressions remain.

The inspector is advisory. It displays the gate-owned Result, but it cannot decide
a different verdict or let the work finish. If it says Idle, confirm that
`src/demo/scenarios.ts` is changed and that the preview is set to Current source,
then reload the page once.

### Run the assistant self-check

From the `usabl-app` folder, start Claude Code:

```bash
claude
```

Run the project skill:

```text
/usabl-check
```

Claude runs `npx usabl check --self-check`, which scans the changed screens over
the running fixture at `http://127.0.0.1:5173`. Expect:

- The verdict `REGRESSION` with the gating findings.
- An explanation of the first accessibility finding.
- A clear statement that the self-check is advisory and the Stop hook is the gate.
- Exit code zero, so it can guide the work without pretending to approve it.

### Watch the Stop hook block the finish

Ask Claude to finish without repairing the source:

```text
We are done. Finish this task.
```

The configured Stop hook runs automatically. It is wired in
`.claude/settings.json` and runs `node node_modules/usabl/dist/stop-hook-runner.js`.
Expect:

- Claude is blocked from stopping once.
- The hook returns the regression reason and repair guidance.
- A continuation can work on the repair without entering a hook loop.

If Claude finishes without being blocked, the hook did not fire. Claude Code loads
hooks when a session starts and runs only trusted ones, so restart `claude` from
`usabl-app` and run `/hooks` to confirm the Stop hook is listed and enabled. To test
the engine on its own, with the dev server running and the source broken, run:

```bash
echo '{"stop_hook_active":false}' | node node_modules/usabl/dist/stop-hook-runner.js
```

It prints a JSON object containing `"decision":"block"` when the engine blocks. If it
does, the engine is correct and the failure is in Claude Code's hook trust or a
stale session, so restart `claude` and check `/hooks`. If it prints nothing or an
error, rebuild the engine with `cd ../usabl && npm ci && npm run build` and confirm
the dev server is running.

Do not use `npx usabl bypass` during the walkthrough. It is a visible, one-time
escape path, not a pass.

### Repair and verify

Repair the source and check again:

```bash
npm run demo:repair
npm run demo:status   # expect: repaired (team-demo-repaired)
```

Repeat one deployment task and the cluster dialog task in the browser, then run
`/usabl-check` again. Expect:

- The verdict `VERIFIED` with no active regression findings.
- A receipt bound to the current source tree, the policy hash, and the runner
  version.

Ask Claude to finish again. The Stop hook now allows completion, because the
stored receipt matches the current source state.

### Reset to the clean baseline

`demo:repair` restores the repaired behavior, but it leaves the rehearsal label
`team-demo-repaired`, so `git status` still shows `src/demo/scenarios.ts` as
changed. Return the fixture to its clean baseline so the next person starts fresh:

```bash
git checkout -- src/demo/scenarios.ts
npm run demo:status   # expect: repaired (baseline-repaired)
```

## Step 5: Prove it in a pull request (optional)

This step shows the same Result blocking a merge in CI. It needs its own branch.
Use `git switch -C`, which creates the branch or resets it if you have run this
before, so a repeat rehearsal never fails with "branch already exists":

```bash
git switch -C demo/team-accessibility-loop
npm run demo:break
git add src/demo/scenarios.ts
git commit -m "test: expose accessibility regressions"
git push -u origin demo/team-accessibility-loop
gh pr create --base main --title "test: rehearse accessibility proof loop"
```

Open the pull request. Expect:

- The `gate-comment` check fails on the accessibility exit.
- A sticky usabl comment shows Regression and the same findings.
- The comment and check come from a trusted, immutable engine checkout, so PR head
  code cannot alter the verdict.

Now repair and push again:

```bash
npm run demo:repair
git commit -am "fix: repair demo accessibility behavior"
git push
```

Expect the sticky comment to update to Verified and the `gate-comment` and
`usabl-policy` checks to pass. Close the pull request after the session. Do not
merge it, so `baseline-repaired` stays available for the next rehearsal. Then
return to your main branch and reset the working tree:

```bash
git switch main
git checkout -- src/demo/scenarios.ts
```

## What each surface does

Every surface renders the same Result model. Only the gate mints a verdict. The
inspector and the `/usabl-check` self-check report it but never decide a different
one.

| Surface | When it runs | Can block | What it shows |
| --- | --- | --- | --- |
| Browser inspector | Dev server load and source refresh | No | Findings, coverage, repair guidance, receipt |
| `/usabl-check` self-check | You invoke it during work | No | Advisory Result before the assistant tries to finish |
| Claude Stop hook | The assistant tries to stop | Yes | Regression block, then verified allow |
| Pull request comment | Trusted GitHub workflow runs | Through its checks | Sticky Result for the exact PR head |
| CI accessibility check | A PR changes mapped interface files | Yes | The accessibility exit code from the trusted engine |
| CI policy check | A PR changes guarded policy files | Yes | CODEOWNERS approval of the current head |

In v0.2.0 the Result also reports paid-down floor identities: accepted floor
barriers that are now resolved. This count appears in the CLI summary, the pull
request comment, and the browser inspector. Reporting it does not re-arm the
floor. Run `usabl floor prune` to remove those identities, so a reintroduced
barrier gates as new instead of staying carried.

## Surface test plans

The walkthrough above runs all four surfaces together in one pass. When you want to
test a single surface in isolation, or hand a checklist to a teammate, use the
per-surface test plans. Each one lists reproducible cases with steps and expected
results, and points to the matching automated tests.

- [Surface test plans overview](docs/test-plans/README.md): shared setup, the verdict
  and exit-code reference, and the cross-surface consistency check.
- [CLI](docs/test-plans/cli.md): the gate, `usabl check`.
- [Assistant](docs/test-plans/assistant.md): the Claude Stop hook and the
  `/usabl-check` self-check.
- [Pull request and CI](docs/test-plans/pr-and-ci.md): the `gate-comment` and
  `usabl-policy` checks.
- [Overlay](docs/test-plans/overlay.md): the advisory dev-server inspector.

## Troubleshooting

State the missing proof plainly. Never call an absent, failed, Idle, or Not
covered check verified.

| Problem | Likely cause | What to do |
| --- | --- | --- |
| Dev server will not start | Port 5173 is already in use | Stop the other process on 5173, then run `npm run dev` again |
| `demo:status` is not `baseline-repaired` | A previous run left the fixture changed | Run `git checkout -- src/demo/scenarios.ts` |
| Working tree still changed after repair | `demo:repair` uses the `team-demo-repaired` label | Run `git checkout -- src/demo/scenarios.ts` to reach `baseline-repaired` |
| Result is Not covered | The dev server is not running, or a mapped route did not load | Start `npm run dev`, keep it running, and reload the fixture |
| Inspector says Idle | The tracked source is unchanged | Run `npm run demo:break` and confirm `git diff` |
| Inspector is absent | The URL includes `usabl=off`, or the browser is a webdriver | Reload the fixture and check the Vite output |
| `/usabl-check` skill is missing | Claude started outside the repository root, or the skill was never installed | Restart `claude` from `usabl-app`; in your own repository, run `usabl install --claude-skill` to write it |
| Stop hook does not run | Claude Code has not loaded or trusted the hook, or the package is not installed | Restart `claude` from `usabl-app`, run `/hooks` to confirm the Stop hook is enabled, and run `npm ci` if the package is missing |
| `git switch -c` fails with "branch already exists" | You have run the pull request step before | Use `git switch -C` to create or reset the branch |
| Chromium fails to launch on Linux | Missing system libraries | Run `npx playwright install --with-deps chromium` |
| PR check cannot clone the engine | A repository secret is missing | Ask a maintainer to restore the read-only checkout token |

## Adopt usabl in your own repository

The walkthrough above uses this fixture, which is already wired. To adopt usabl in
your own repository, use the v0.2.0 adoption and lifecycle commands. They draft,
inspect, wire, and report. Only `usabl check` mints a verdict: it runs the gate
locally, and in CI the gate runs through the trusted engine. `usabl enforce` reads
the Result that `usabl check` produced and returns the CI status. It does not run
the gate. Branch protection and CODEOWNERS then decide whether that status blocks
the merge.

Run each command from your repository root.

- `usabl install` prepares one integration surface at a time by writing an
  adoption draft. Pass exactly one target per run: `--overlay`, `--claude`,
  `--claude-skill`, `--ci`, `--docs-ci`, or `--branch-rule`. It enables nothing on
  its own; you review and commit the draft. `--claude` wires the Stop hook, while
  `--claude-skill` writes the on-demand `/usabl-check` skill (the same skill this
  fixture ships) so the assistant can run the advisory self-check during work.
  `--branch-rule` is a read-only check that reports whether the main branch already
  requires the usabl policy check, and writes nothing.
- `usabl doctor` is a read-only self-check of the integration surfaces. It reports
  each surface as wired, missing, drifted, or unknown, with one honest next step,
  and mints no verdict. It exits 0 when it renders a report, so a missing surface
  is information, not a failure.
- `usabl drift routes` compares the routes in `usabl.routes.json` against the
  routes it discovers in your app router. It reads only. When it cannot parse the
  router, it refuses with a manual step rather than guessing.
- `usabl init` drafts a starting policy from your application tree. It runs no gate
  and writes no waivers or evidence.
- `usabl baseline` runs a full scan and drafts the accepted accessibility floor as
  a reviewable working-tree diff, so existing barriers are recorded and only new
  barriers gate.
- `usabl floor prune` re-arms the floor after a full scan. It removes paid-down
  identities so a reintroduced barrier gates as new instead of staying carried.
- `usabl stop-hook` is the stable entry point wired into `.claude/settings.json`.
  It runs the gate when the assistant tries to finish and blocks continuation when
  the gate reports a new barrier, an uncovered change, or a policy change that
  needs approval. It exits 0, so a wedged hook fails open with disclosure instead
  of blocking through an exit code.

## Real application validation

The fixture proves the controlled product loop. Fleet Insights is the separate
real-application measurement target:

- Application: https://fleet-insights.apps.engineering.openshift.org/
- Harness: `../usabl/scripts/measure-fleet-insights.ts`
- Command: `npm run measure:fleet-insights`, run from the `usabl` repository

Fleet Insights measurement requires an authorized local browser session. Never
commit storage state, cookies, tokens, screenshots with private data, or captured
session files. Report measurement results separately from the controlled fixture
proof.

## Learn more

- [Team orientation](https://usabl-dev.github.io/usabl/team-orientation.html):
  the product in one read.
- [How usabl works](https://usabl-dev.github.io/usabl/how-usabl-works.html): the
  Result model, the trust boundary, and the product surfaces.

## Feedback

Use the
[usabl feedback form](https://github.com/usabl-dev/usabl/issues/new?template=feedback.yml).
Include the surface, the exact verdict, the expected verdict, the steps, the URL,
the engine commit, the app commit, and whether the Result matched the
accessibility behavior.

This fixture is version `0.2.0`. CI pins the engine to the trusted commit in
`.github/workflows/usabl-gate.yml`. Local installs use `"usabl": "file:../usabl"`
until `usabl@0.2.0` is published.
