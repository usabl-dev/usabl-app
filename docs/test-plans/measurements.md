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
