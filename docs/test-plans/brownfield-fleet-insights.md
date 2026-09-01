# Brownfield onboarding test plan (Fleet Insights)

The four surface plans in this folder prove usabl on the fixture. This plan is the
brownfield path against a real Red Hat PatternFly app: Fleet Insights
(`https://fleet-insights.apps.engineering.openshift.org/`).

Read the [shared setup](README.md) and
[brownfield onboarding](https://github.com/usabl-dev/usabl/blob/main/docs/adoption-model.md#brownfield-onboarding-step-by-step)
first. File friction with the
[feedback form](https://github.com/usabl-dev/usabl/issues/new?template=feedback.yml).

## What this is and is not

The deployed dashboard is the product we want to show. `usabl init` and `usabl check`
need a local git repo and a running dev server, not only a URL. If you only have the
deployed site, stop after TC-BF-00 and say so. Do not pretend a live URL is a clone.

This plan does not replace the fixture plans. Run those on `usabl-app` first so you
already know the four verdicts.

## Scope

- Time to first honest verdict on a real PF app (H1).
- Route map quality (`init`, `drift routes`, `not_covered`).
- Floor and waivers so existing debt does not block new work.
- Finding copy a developer can act on (what, why, fix).
- Overlay and CI drafts, without requiring you to merge them.

## Preconditions

- Engine built as a sibling (`../usabl`), Chromium installed.
- Node 22.
- Access to a Fleet Insights source checkout you can run locally. Record the repo
  URL and the command that starts the app.
- A note of the local URL (host, port). Do not assume `127.0.0.1:5173`.

## Test cases

### TC-BF-00: Can we actually run it?

**Objective:** Confirm Fleet Insights is a local app usabl can drive, not only a
deployed dashboard.

**Steps:**
1. Clone or locate the Fleet Insights repo.
2. Install and start its dev server.
3. Open the local URL in a browser and confirm a PatternFly screen renders.

**Expected:** The app is reachable without VPN-only tricks the scanner cannot use.
If it is SSO-walled, headless Chromium will get a login page and every check will
be `not_covered`. Record that as a blocker, not a pass.

- [ ] Pass
- [ ] Blocked (why):

### TC-BF-01: Init does not clobber, drafts are reviewable

**Steps:**
1. From the Fleet Insights repo, link the local engine the same way the fixture
   does (`"usabl": "file:../usabl"` or `npm pack` + install).
2. `npx usabl init`
3. Read `usabl.config.json` and `usabl.routes.json`.
4. Run `npx usabl init` again without `--force`.

**Expected:** First run writes the two drafts. Second run refuses to overwrite.
`appBaseUrl` matches the real local URL. Routes look like the app, not a copy of
the fixture's Clusters/Deployments map. Log every screen `init` missed.

- [ ] Pass
- [ ] Screens missing from the draft:

### TC-BF-02: Time to first honest verdict

**Objective:** A teammate who did not build usabl gets a real answer in one sitting
([H1](https://github.com/usabl-dev/usabl/issues/105)).

**Steps:**
1. Start the Fleet Insights server.
2. Touch one interface file (a comment is enough).
3. `npx usabl check; echo "exit=$?"`
4. Record wall-clock time from `init` through this first check.

**Expected:** One of the four verdicts, never a silent pass. On a brownfield app
with no floor, `regression` (existing barriers) and `not_covered` (map gaps) are
both honest. The output is a what / why / fix line, not a JSON dump. Target under
30 minutes, including the human review of the drafts.

Time: ______ min. Verdict: ______. Exit: ______.

- [ ] Pass

### TC-BF-03: Fix the map before the app

**Steps:**
1. `npx usabl drift routes`
2. Add missing routes or re-run `npx usabl init --force` and re-review.
3. Touch a typical page component and `npx usabl check` again.

**Expected:** Drift names the screens `init` under-mapped. After the map is honest,
a typical UI change no longer returns `not_covered` for "file not in any route".
`createBrowserRouter` apps are expected to start under-mapped.

- [ ] Pass
- [ ] Remaining gaps:

### TC-BF-04: Findings are usable

**Objective:** Priya can act without opening the source of usabl itself.

**Steps:**
1. From a `regression` run, pick three findings.
2. For each, answer without looking at engine code: what does the user hit, why
   does it matter, what is the PF-idiomatic fix?
3. Mark each finding true positive, false positive, or debatable.

**Expected:** The three answers are obvious from the CLI (or overlay) text. False
positives go in the feedback form. This is the trust metric, not a WCAG completeness
audit of Fleet Insights.

- [ ] Pass
- [ ] False positives:

### TC-BF-05: Baseline so only new barriers gate

**Steps:**
1. With policy files committed (or at least clean besides the floor), `npx usabl baseline`
2. Review `.usabl-evidence.json`.
3. Touch the same interface file again with no new barrier, `npx usabl check`.

**Expected:** Baseline refuses if other guarded files are dirty. After the floor is
accepted, carried findings do not turn the verdict to `regression`. A new barrier
still does. Do not merge the floor into Fleet Insights production unless the owners
want that. A local commit on a throwaway branch is enough to prove the loop.

- [ ] Pass

### TC-BF-06: Overlay draft on a real Vite app

**Steps:**
1. `npx usabl install --overlay`
2. Apply the printed lines only if the app is Vite. If it is not Vite, record that
   and stop this case.
3. Restart the dev server, open a page, open the inspector.

**Expected:** The plugin refuses to clobber a hand-tuned config. The inspector is
advisory (`displayExitCode` 0). It never claims the work is done. Skip silently
installing into a webpack/CRA app.

- [ ] Pass
- [ ] Not Vite (note bundler):

### TC-BF-07: Doctor and CI draft, no surprise enable

**Steps:**
1. `npx usabl install --claude` and `npx usabl install --ci` as dry drafts. Do not
   turn on branch protection on the real product in this pass unless owners agree.
2. `npx usabl doctor`

**Expected:** Each install writes one surface and enables nothing by itself. Doctor
exits 0 and reports wired / missing / drifted. The CI draft still has
`PIN_TO_A_TRUSTED_USABL_COMMIT` until a human pins it.

- [ ] Pass

## Friction log

Use one row per moment you had to guess, re-read the docs, or wait.

| Step | What happened | Expected | Blocker? | Severity |
| --- | --- | --- | --- | --- |
| | | | | |

## Reset

Do not leave policy files, a floor, or overlay wiring on a shared Fleet Insights
branch unless the team asked for it. Revert with git, or keep the work on a
personal branch.

Close with the feedback form for every confusing verdict or false block.
