# Measurements

A running record of timings, counts, and other numbers from real test runs. The
surface plans say what to test. This file says what we actually measured, when, and
against what.

Add an entry when a run produces a number worth keeping. Do not overwrite an old
entry when a number changes. Add a new one and let the two sit next to each other,
because the change over time is the interesting part.

Every number here is measurement only. No verdict was minted, no receipt was
written, and nothing was gated. A measurement is not a verdict.

## How to record an entry

Give each entry a date, the app it ran against, the engine state, and enough of the
method that someone can reproduce it. If a number was taken with uncommitted changes
in the tree, say so. A number without its conditions is not evidence.

---

## 2026-09-01: first full scan of a brownfield app

First measurement of the engine against an application it was not built for.

### What was measured

`ansible/ansible-ui` at `devel`, commit `2c605554c`. A PatternFly 6.3.1 React
monorepo, served locally by its own Vite dev server and proxied to an Ansible
Automation Platform 2.6 classroom lab (controller 4.7.8) over an SSH tunnel.
Authenticated as `admin`. Eight screens, chosen from routes discovered in the
running application rather than guessed.

### Engine state

Working tree carried three reviewed but uncommitted changes: provider ordering by
page effect, the keyboard walk wall-clock budget anchored per run, and the walk
budget raised to 15 seconds. The numbers below were taken with those in place.

Node 22. Keyboard walk budget 15000 ms, tab cap 200.

### Scan cost

This is the number that matters for whether a CI gate is viable on an app this size.

| Screen | Time | Drafts |
| --- | --- | --- |
| `/overview` | 16.8 s | 79 |
| `/access/organizations` | 15.3 s | 59 |
| `/access/users` | 17.0 s | 67 |
| `/access/teams` | 10.0 s | 36 |
| `/execution/infrastructure/inventories` | 17.3 s | 72 |
| `/execution/infrastructure/hosts` | 16.5 s | 65 |
| `/execution/infrastructure/credentials` | 17.6 s | 72 |
| `/content/collections` | 23.4 s | 113 |
| **Total** | **134 s** | **563** |

Roughly 17 seconds per screen. The gate only scans surfaces a change touched, so a
typical change costs a fraction of the full 134 seconds.

Caveat: each screen also had a 10 second settle wait before providers ran, which is
not counted in the times above. That wait exists because `gotoReady()` waits for
network idle, and this application finishes rendering after network idle. Without
it the transcript is collected against an empty page.

### What the layers found

| Layer | Drafts |
| --- | --- |
| PatternFly rulepack | 316 |
| axe | 197 |
| Keyboard walk | 50 |

The rulepack finding more than axe on a real PatternFly application is the first
evidence that PatternFly composition mistakes are a distinct defect class, measured
somewhere other than the fixture.

| Confidence | Drafts |
| --- | --- |
| `fail` | 487 |
| `unverified` | 76 |

The 76 unverified are the honest path working outside the fixture. They gate to
`not_covered` rather than passing.

### Rules that fired

| Rule | Layer | Count |
| --- | --- | --- |
| `pf-toolbar-labeled-when-repeated` | pf | 212 |
| `pf-icon-button-name` | pf | 91 |
| `color-contrast` | axe | 83 |
| `keyboard-walk-unnamed-interactive` | walk | 50 |
| `button-name` | axe | 49 |
| `valid-lang` | axe | 30 |
| `pf-row-action-name-unique` | pf | 13 |
| `aria-valid-attr-value` | axe | 10 |
| `empty-table-header` | axe | 9 |
| `aria-required-children` | axe | 8 |
| `svg-img-alt` | axe | 4 |
| `heading-order` | axe | 2 |
| `label` | axe | 2 |

Three of the eight PatternFly rules fired. `pf-kebab-expanded-state`,
`pf-table-header-assoc`, `pf-toast-live-region`, `pf-modal-focus-return`, and
`pf-focus-into-dialog` produced nothing on these eight screens. Some of that is
surface choice, since these are list and dashboard pages with no dialog open. Open
question, not yet a finding.

### Walk budget and tab cap

Every walk completed by cycling naturally. No screen emitted
`keyboard-walk-truncated`, so neither the 15 second budget nor the 200 stop cap
bound on any of the eight screens. Both guards are currently untested against a real
screen that needs them.

### Before and after the walk fix

The same eight screens, same session, measured before and after the keyboard walk
wall-clock fix.

| | Before | After |
| --- | --- | --- |
| PatternFly rulepack | 316 | 316 |
| axe | 197 | 197 |
| Keyboard walk | 0 | 50 |
| Total | 513 | 563 |

The walk returned nothing on every screen before the fix, because its budget was
anchored when the provider was constructed rather than when each screen was walked.
The other two layers are unchanged, which is what confirms the fix added a layer
without disturbing the others.

---

## 2026-09-02: how long a real screen takes to become ready

The first measurement of readiness itself, rather than of what the scan found. It
exists because a scan of a page that has not arrived yet returns a small, plausible,
and completely wrong answer.

### What was measured

Same application, lab, and session as the entry above. Screen `/overview`, signed in
as `admin`. Navigation was timed to network idle, then the wait continued until the
total element count stopped changing, sampled four times at 500 ms.

### Engine state

Measured from the `fix/ready-waits-for-render` working tree with uncommitted changes,
using its `waitForRendered` function directly. The engine's readiness budget,
`READY_TIMEOUT_MS`, is 15000 ms.

### Result

| Phase | Time |
| --- | --- |
| Navigation to network idle | 12.4 s |
| Network idle to a DOM that stops changing | 13.3 s |
| Total to ready | 25.7 s |

The finished page holds 1319 elements and 124 focusable controls. This is an ordinary
dashboard, not an unusually heavy page.

The headline is the second row. More than half the wait happens after the network goes
quiet, so network idle is not a usable readiness signal for this application. It is
also the signal the engine used until now.

### What this costs today

A three round identity stability run across three screens, taken at the 15000 ms
budget, lost seven of its nine screen rounds:

| Screen | Rounds that failed |
| --- | --- |
| `/overview` | 1 and 3 |
| `/access/users` | 1, 2 and 3 |
| `/content/collections` | 1, 2 and 3 |

Every failure was `waitForLoadState: Timeout 15000ms exceeded`. Earlier runs on these
same screens completed, so the budget was never comfortably enough. It sat close enough
to the line that lab load decided the outcome. Tracked as issue 141 in the engine
repository.

Worth recording for its own sake: the harness reported these screens as inconclusive
with the reason attached, rather than reporting them as stable. A run that measures
nothing and says so is the outcome the disclosure path exists to produce.

---

## 2026-09-02: element identity is stable across repeated scans

The property the whole differential ratchet rests on. If the same unchanged page
produces different element keys on two scans, the engine reads one barrier as both
fixed and new, and every verdict built on that is noise.

### What was measured

Same application, lab, and session as the entries above. Three screens, scanned three
times each, comparing the set of element keys the differential engine would key on.

### Engine state

Engine carried the fix for unstable generated identity, which neutralizes values React
produces per mount. The readiness budget was raised locally to 60000 ms and the settle
period to 20000 ms, because this application needs 25.7 seconds to become ready and the
engine allows 15. Those two values let the scan reach a rendered page. They do not
change what is compared once it gets there.

### Result

| Screen | Round 1 | Round 2 | Round 3 | Unstable keys |
| --- | --- | --- | --- | --- |
| `/overview` | 69 | 69 | 69 | 0 |
| `/access/users` | 53 | 53 | 53 | 0 |
| `/content/collections` | 58 | 58 | 58 | 0 |

Drift rate 0 on every screen. Not one key differed across three scans.

`/access/users` is the screen that mattered. It drifted before the fix, because React
generates a fresh id on every mount and that value reached the element key, so a clean
tree could report a regression. It is now exactly stable.

The first attempt at this measurement produced no result at all. It lost seven of its
nine screen rounds to the readiness timeout recorded in the entry above. Separating the
readiness problem from the identity problem is what made this number obtainable, which
is worth remembering the next time a measurement comes back empty.

---

## 2026-09-08: the five fixture scenarios against the freeze engine

The contest freeze measurement. Every scenario in the shared setup was run once
against the frozen engine so the numbers the plans quote are numbers someone actually
produced, not numbers carried forward.

### What was measured

This fixture, at the commit that bumps the engine pin. Node 22, Chromium driven by the
engine, dev server on `http://127.0.0.1:5173`. Each scenario was produced with the
documented command, measured, and reset before the next one.

### Engine state

Engine pin moved from `e9096217358cc43d1471db9e0b277ca12a7522f9` to
`3ef810540203c46d8a70c01b22239dca7452f11e`, which is the freeze commit. Clean working
tree except where the scenario itself requires a change. No local engine edits.

### Result

| Scenario | Verdict | Exit | Findings | Affected screens |
| --- | --- | --- | --- | --- |
| Idle | `null` | 0 | 0 | none, no UI file changed |
| Regression | `regression` | 1 | 9 | deployments 7, clusters 2 |
| Verified | `verified` | 0 | 0, receipt minted | deployments, clusters |
| Not covered | `not_covered` | 3 | 0, 2 gaps | deployments, clusters |
| Approval required | `approval_required` | 2 | 0, 1 guarded path | none |

### The count that changed

The regression scenario reports **nine** blocking findings. The plans quoted eight, and
that eight is what this entry supersedes.

| | Quoted before | Measured against the freeze commit |
| --- | --- | --- |
| Regression findings | 8 | 9 |

Stated precisely, because the difference matters: the nine was measured here, twice,
once against the pre-freeze branch and once against `3ef8105`. The eight was not
re-measured. It is the number the plans carried from the era of the old pin, and no run
in this session reproduced it. So this is a corrected quote, not a measured
before-and-after of two engines.

The nine break down as seven on Deployments and two on Clusters, every one of them new,
`fail` confidence, and gating:

| Rule | Layer | Screen |
| --- | --- | --- |
| `button-name` | axe | deployments |
| `pf-icon-button-name` | pf | deployments |
| `pf-kebab-expanded-state` | pf | deployments |
| `pf-row-action-name-unique` | pf | deployments |
| `pf-toolbar-labeled-when-repeated` | pf | deployments (twice) |
| `keyboard-walk-unnamed-interactive` | walk | deployments |
| `pf-focus-into-dialog` | pf | clusters |
| `pf-modal-focus-return` | pf | clusters |

`pf-toolbar-labeled-when-repeated` firing twice on one screen is what makes the total
nine rather than eight distinct rules.

### Gate topology at the freeze

The gate workflow moved from two jobs to the three the engine's installer generates.
`usabl-required` is now the check to require. This matters for what the pull request
scenario shows: on a pure accessibility regression no guarded path diverges, so
`usabl-policy` is green and only `gate-comment` and `usabl-required` are red. The plans
previously said `usabl-policy` went red, which it does not.
