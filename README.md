# usabl team demo

This is the working fixture for the usabl v0.2.0 team demo. It uses a realistic
PatternFly operations workflow to show accessibility barriers, one usabl Result,
and the same Result across the browser inspector, Claude, and pull request checks.

Start with the
[team orientation](https://usabl-dev.github.io/usabl/team-orientation.html)
and [How usabl works](https://usabl-dev.github.io/usabl/how-usabl-works.html).
Then use this page for the live walkthrough.

Allow 20 minutes for the first run. You do not need to write code to operate the
browser steps or read the results. Pair with a developer for setup and the Git
steps if needed.

## What the team should learn

After the walkthrough, each teammate should be able to explain:

- What accessibility barrier a person experiences.
- Which changed screens usabl checked.
- Why the Result is a regression, verified, not covered, or awaiting approval.
- Why the browser inspector and the assistant's `/usabl-check` self-check are advisory.
- Why the Claude Stop hook and pull request check can block completion.
- How a verified receipt is tied to the checked source state.

## Repository layout

Clone the private repositories as siblings:

```text
<workspace>/
  usabl/
  usabl-app/
```

```bash
git clone https://github.com/usabl-dev/usabl.git
git clone https://github.com/usabl-dev/usabl-app.git
```

The fixture uses `"usabl": "file:../usabl"` until the package is published.

## Prepare once

Use Node.js 22 and npm.

```bash
cd usabl
npm ci
npm run build
npx playwright install chromium

cd ../usabl-app
npm ci
npm test
npm run build
```

Confirm the fixture starts from a clean, repaired source state:

```bash
npm run demo:status
git status --short
```

Expected source state:

```text
demo source: repaired (baseline-repaired)
```

Stop if Git reports unrelated changes. Do not mix personal work into the demo
branch.

## Understand the three states

The Demo controls region shows two separate concepts.

- **Current source** renders the tracked source state. This is what usabl checks.
- **Broken teaching preview** lets anyone experience the barriers without editing
  source. It does not prove a regression.
- **Repaired teaching preview** lets anyone compare the repaired behavior. It does
  not mint a receipt.

The visible **Tracked source** label shows the source mode and rehearsal label.
Only a changed current source can drive the proof loop.

## Part 1: experience the barriers

Start the fixture from `usabl-app`:

```bash
npm run dev
```

Open
`http://127.0.0.1:5173/deployments?scenario=deployment-workflow&preview=broken`.

Use only the keyboard when possible.

1. Move through the three **View details** actions. A screen reader announces the
   same name for each row, so the destination is unclear.
2. Open **Actions for policy-worker**. Expanded state is not announced, and focus
   stays on the toggle instead of moving into the menu.
3. Select **Start deployment**. The visual message appears outside a live region,
   so assistive technology may not announce it.
4. Move to the button marked only with `×`. It has no accessible name.
5. Notice the two toolbars. In the broken state they have no distinct accessible
   names.
6. Select **Cluster details dialog** in Demo controls. Open the dialog, then press
   `Escape`. Focus does not return to **View cluster details**.

Now select **Repaired teaching preview** and repeat the same tasks. The accessible
names, menu state and focus, notification, toolbar names, clear button name, and
dialog focus lifecycle should be repaired.

Return Preview to **Current source** before continuing.

## Part 2: make a real broken source change

Open a second terminal in `usabl-app`:

```bash
git switch -c demo/team-accessibility-loop
npm run demo:break
git diff -- src/demo/scenarios.ts
```

Expected tracked source label:

```text
broken (team-demo-broken)
```

The dev server reloads the changed source. Repeat one deployment task and the
cluster dialog task. These barriers now come from the changed source, not a query
preview.

## Part 3: inspect the browser Result

Open the **usabl** launcher in the lower right corner of the fixture.

The accessibility inspector should show:

- **Regression** status.
- The affected Deployments and Clusters screens.
- Findings grouped by screen.
- The user impact, reason, suggested repair, rule, provider, severity, status,
  and confidence for a selected finding.
- No verified receipt while regressions remain.

The inspector is advisory. It displays the gate-owned Result but cannot decide a
different verdict or allow the work to finish.

If the launcher says Idle, confirm that `src/demo/scenarios.ts` is changed and
that Preview is set to **Current source**. Save the file or reload the page once.

## Part 4: show Claude during implementation

Start Claude Code from the `usabl-app` root:

```bash
claude
```

Run the project skill:

```text
/usabl-check
```

Claude runs:

```bash
npx usabl check --self-check
```

Keep the Part 1 dev server running. `usabl check` scans the changed screens over
the running fixture at `http://127.0.0.1:5173`. With no server, the check reports
Not covered instead of the regression.

Expected result:

- The self-check result says `REGRESSION`.
- It explains the first accessibility finding.
- It states that the check is advisory and the Stop hook remains the gate.
- The command exits zero so it can guide work without pretending to approve it.

Then ask Claude to finish without repairing the source:

```text
We are done. Finish this task.
```

The configured Stop hook runs automatically. Expected behavior:

- Claude is blocked from stopping once.
- The hook returns the regression reason and repair guidance.
- A continuation can work on the accessibility repair without entering a hook
  loop.

Do not use `npx usabl bypass` in the normal demo. It is an explicit, visible
escape path, not a pass.

## Part 5: show the pull request block

Commit the broken source state:

```bash
git add src/demo/scenarios.ts
git commit -m "test: expose accessibility regressions"
git push -u origin demo/team-accessibility-loop
gh pr create --base main --title "test: rehearse accessibility proof loop"
```

Open the pull request in GitHub.

Expected result:

- The `gate-comment` check fails on the accessibility exit.
- A sticky usabl comment shows Regression and the same accessibility findings.
- The comment and check come from an immutable trusted engine copy.
- The failed check prevents a normal merge.

Do not merge this rehearsal pull request while it is broken.

## Part 6: repair and verify

Back in the Claude session, ask:

```text
Repair the controlled accessibility source state. Then run /usabl-check and
explain what changed.
```

Claude can run:

```bash
npm run demo:repair
```

Expected tracked source label:

```text
repaired (team-demo-repaired)
```

Repeat the browser tasks. Confirm that names, menu state and focus, notification,
toolbar labels, clear button name, and dialog focus are repaired.

Run `/usabl-check` again. Expected result:

- `VERIFIED`
- No active regression findings
- A receipt bound to the current source tree, policy hash, and runner version

Ask Claude to finish again. The Stop hook should now allow completion because the
stored receipt matches the current source state.

Commit and push the repair:

```bash
git add src/demo/scenarios.ts
git commit -m "fix: repair demo accessibility behavior"
git push
```

Expected pull request result:

- The same sticky comment updates to Verified.
- The `gate-comment` and `usabl-policy` required checks pass.
- The receipt describes the repaired head commit.

Close the rehearsal pull request after the team session. Do not merge it into
main. This keeps `baseline-repaired` available for the next rehearsal.

## What each surface does

| Surface | When it runs | Can block | What to show |
| --- | --- | --- | --- |
| Browser inspector | Dev server load and source refresh | No | Findings, coverage, repair guidance, receipt |
| Claude `/usabl-check` | Operator invokes it during work | No | Advisory Result before Claude tries to finish |
| Claude Stop hook | Claude tries to stop | Yes | Regression block, then verified allow |
| Pull request comment | Trusted GitHub workflow runs | Yes, through its checks | Sticky Result for the exact PR head |
| CI accessibility | Pull request changes mapped interface files | Yes | `accessibilityExitCode` from the trusted engine |
| CI policy | Pull request changes guarded policy files | Yes | CODEOWNERS approval of the current head |

Every surface uses the same Result model. The inspector and the `/usabl-check`
self-check do not mint a separate verdict.

In v0.2.0 the Result also reports paid-down floor identities: accepted floor
barriers that are now resolved. This paid-down count appears in the CLI summary,
the pull request comment, and the browser overlay. Reporting the count does not
re-arm the floor. Run `usabl floor prune` to remove those identities so a
reintroduced barrier gates as new instead of staying carried.

## Adopt usabl in your own repository

The walkthrough above uses this fixture, which is already wired. To adopt usabl in
your own repository, use the v0.2.0 adoption and lifecycle commands. These
commands draft, inspect, wire, and report, but only the gate decides a verdict.
`usabl check` is the only command that mints one. It runs the gate locally, and in
CI the gate runs through the trusted engine. On the CI side, `usabl enforce` reads
the Result that `usabl check` produced and returns the CI check status. It does not
run the gate and does not mint a verdict of its own. Branch protection and
CODEOWNERS then decide whether that status blocks the merge.

Run each command from your repository root.

- `usabl install` prepares one integration surface at a time by writing an
  adoption draft. Pass exactly one target per run: `--overlay`, `--claude`,
  `--ci`, or `--branch-rule`. It enables nothing on its own; you review and commit
  the draft yourself. `--branch-rule` is a read-only verify that reports whether
  the main branch already requires the usabl policy check and writes nothing.
- `usabl doctor` is a read-only self-check of the integration surfaces. It reports
  each surface as wired, missing, drifted, or unknown, with one honest next step,
  and mints no verdict. It always exits 0 when it renders a report, so a missing
  surface is information, not a failure.
- `usabl drift routes` compares the routes configured in `usabl.routes.json`
  against the routes it discovers in your app router. It reads only and mints no
  verdict. When it cannot parse the router, it refuses with a manual step rather
  than guessing, so it never reports drift it cannot confirm.
- `usabl init` drafts a starting policy from your application tree. It does not run
  the gate and does not write waivers or evidence.
- `usabl baseline` runs a full scan and drafts the accepted accessibility floor as
  a reviewable working-tree diff, so existing barriers are recorded and only new
  barriers gate.
- `usabl floor prune` re-arms the floor after a full scan. It removes paid-down
  identities from the floor so a reintroduced barrier gates as new instead of
  staying carried.
- `usabl stop-hook` is the stable entry point wired into `.claude/settings.json`.
  It is the command behind the configured Stop hook you ran earlier. It runs the
  gate when the assistant tries to finish and blocks continuation through the Stop
  hook decision when the gate reports a new barrier, an uncovered change, or a
  policy change that needs approval, or when a guarded policy file changes during
  the session. It always exits 0, so a wedged hook fails open with disclosure
  instead of blocking through an exit code.

## Fast recovery

If the demo fails, state the missing proof plainly.

| Problem | Check | Recovery |
| --- | --- | --- |
| Inspector is absent | URL does not include `usabl=off`; browser is not webdriver | Reload the fixture and inspect Vite output |
| Inspector says Idle | Source state file is unchanged | Run `npm run demo:break` and confirm `git diff` |
| Claude skill is missing | Claude started outside the repository root | Restart Claude from `usabl-app` |
| Stop hook does not run | `.claude/settings.json` is trusted and package is installed | Run `npm ci`, then restart Claude |
| Result is Not covered | Browser or mapped route did not run | Keep the Not covered result visible and inspect the named gap |
| PR check cannot clone usabl | Repository secret is missing | Ask a maintainer to restore the read-only checkout token |

Never call an absent, failed, Idle, or Not covered check verified.

## Verify this fixture

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

The fixture is version `0.2.0`. CI pins the engine to the trusted commit in
`.github/workflows/usabl-gate.yml`. Local installs still use
`"usabl": "file:../usabl"` until `usabl@0.2.0` is published.

## Real application validation

The fixture proves the controlled product loop. Fleet Insights is the separate
real-application measurement target:

- Application: https://fleet-insights.apps.engineering.openshift.org/
- Harness: `../usabl/scripts/measure-fleet-insights.ts`
- Command: `npm run measure:fleet-insights` from the `usabl` repository

Fleet Insights measurement requires an authorized local browser session. Never
commit storage state, cookies, tokens, screenshots with private data, or captured
session files. Report measurement results separately from the controlled fixture
proof.

## Feedback

Use the
[usabl feedback form](https://github.com/usabl-dev/usabl/issues/new?template=feedback.yml).
Include the surface, exact verdict, expected verdict, steps, URL, engine commit,
app commit, and whether the result matched the accessibility behavior.
