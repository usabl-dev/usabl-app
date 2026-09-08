# Overlay test plan

The overlay is the advisory dev-server inspector. It renders the same gate-owned
Result live in the running app so a developer sees findings, coverage, repair
guidance, and the receipt while coding. It never mints or changes a verdict, and it
can never block: its displayed exit code is always 0.

Read the [shared setup and verdict reference](README.md) first. The overlay is the
Vite plugin exported as `usabl/vite`. It serves two endpoints from the dev server:

- `GET /__usabl/result` returns the advisory projection as JSON.
- `GET /__usabl/client.js` serves the inspector client module.

## What the overlay is and is not

The overlay reflects the tracked source. A teaching preview, reached with a
`preview=broken` or `preview=repaired` query parameter, lets anyone feel the barriers
or the fix, but it never changes the tracked source, so it never drives a Result. The
overlay also stays out of the way of measurement: it does not load when the URL has
`?usabl=off` or when the browser is a webdriver (an automated Playwright session), so
neither the engine nor a test can grade the badge itself.

## Scope

- Idle, regression, and verified states in the inspector and at the endpoint.
- The preview query parameter does not drive a verdict.
- `?usabl=off` and webdriver sessions skip the overlay.
- The overlay recomputes on a source change.
- The overlay is advisory and cannot block.

## Preconditions

- Shared setup complete, fixture at `baseline-repaired`.
- Dev server running at `http://127.0.0.1:5173`.
- A normal browser for the visual cases. `curl` for the endpoint cases.

## Test cases

### TC-OV-01: Idle on a clean tree

**Steps:**
1. With the tree clean, run
   `curl -s http://127.0.0.1:5173/__usabl/result | head -c 200`.
2. Open `http://127.0.0.1:5173` and open the usabl launcher in the lower right.

**Expected:** The JSON shows `"verdict":null` and `"advisory":true`. The inspector
reads Idle. A clean tree has no change to check, so there is no claim.

- [ ] Pass

### TC-OV-02: Regression on a broken source

**Steps:**
1. `npm run demo:break`
2. Set the on-page preview back to Current source, then reload.
3. Run `curl -s http://127.0.0.1:5173/__usabl/result | head -c 200`.
4. Open the inspector.

**Expected:** The JSON shows `"verdict":"regression"` and `"exitCode":1`, while
`"displayExitCode":0` because the overlay is advisory. The inspector shows Regression,
the affected Deployments and Clusters screens, nine findings with user impact and
repair guidance, and no receipt while regressions remain.

- [ ] Pass

### TC-OV-03: Verified on a repaired source

**Steps:**
1. `npm run demo:repair`
2. Reload the fixture.
3. Run `curl -s http://127.0.0.1:5173/__usabl/result | head -c 200`.

**Expected:** The JSON shows `"verdict":"verified"`, zero findings, and a receipt
bound to the current source tree. The inspector shows Verified.

- [ ] Pass

### TC-OV-04: A preview does not drive a verdict

**Objective:** The teaching preview is a feel-it aid, not a source change.

**Steps:**
1. Return the tree to the clean baseline: `git checkout -- src/demo/scenarios.ts`.
2. Open
   `http://127.0.0.1:5173/deployments?scenario=deployment-workflow&preview=broken`
   and drive it with the keyboard to feel the barriers.
3. Check the endpoint: `curl -s http://127.0.0.1:5173/__usabl/result | head -c 200`.

**Expected:** The preview shows the broken behavior on the page, but the endpoint
still reports idle (`"verdict":null`), because the tracked source did not change. Only
a change to the current source drives a Result.

- [ ] Pass

### TC-OV-05: usabl=off hides the overlay

**Steps:**
1. Open `http://127.0.0.1:5173/?usabl=off`.

**Expected:** The inspector launcher does not appear. The client module is not loaded
for this page. Removing the parameter and reloading brings it back.

- [ ] Pass

### TC-OV-06: A webdriver session skips the overlay

**Objective:** An automated browser must not load the badge, so oracles cannot grade
the overlay instead of the app.

**Steps:**
1. Run the fixture's Playwright or automated checks, or open the app in a session
   where `navigator.webdriver` is true.

**Expected:** The overlay client does not load in the automated session. The scanner
still reaches the screens; only the advisory badge is skipped.

- [ ] Pass

### TC-OV-07: The overlay recomputes on a source change

**Steps:**
1. With the overlay open and idle, run `npm run demo:break` in the terminal.

**Expected:** The dev server reloads and the inspector updates to Regression within a
moment, without a manual refresh. The plugin coalesces rapid saves into a single
recomputation.

- [ ] Pass

### TC-OV-08: The overlay is advisory and cannot block

**Objective:** The overlay reports the gate but never decides completion.

**Steps:**
1. In the regression state, read the inspector footer and the endpoint
   `displayExitCode`.

**Expected:** The footer states the view is advisory and that the Stop hook and CI
gate decide completion. `displayExitCode` is 0 even though the underlying `exitCode`
is 1. The overlay offers no control that would mark the work done.

- [ ] Pass

### TC-OV-09: Not covered in the inspector

**Steps:**
1. `npm run demo:break`
2. Load a mapped route that the scanner cannot reach, or observe the inspector while
   the dev server is restarting.

**Expected:** The inspector reads Not covered rather than pretending the surface
passed. Reloading with the server running and the source changed returns a real
Result.

- [ ] Pass

## Reset

```bash
git checkout -- src/demo/scenarios.ts
npm run demo:status   # expect: repaired (baseline-repaired)
```

## Automated coverage

- `test/surfaces/vite-plugin.test.ts`: the advisory projection with a hardcoded
  display exit code, coalesced recomputation, the two registered endpoints, and the
  guarded loader injection for `usabl=off` and webdriver.
- `test/surfaces/overlay-client.test.ts`: the accessible inspector itself, including
  focus return on Escape, and the idle, scanning, not-covered, approval, error, and
  verified-receipt states.
