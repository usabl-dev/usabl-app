# Pull request and CI test plan

The pull request surface runs the same gate from a trusted engine checkout that pull
request head code cannot alter. It has two jobs, defined in
`.github/workflows/usabl-gate.yml`:

- **`gate-comment`** runs on every pull request. It starts the fixture, runs
  `usabl check --ci --trusted-ref origin/<base-ref>`, posts a sticky comment with the
  Result, and enforces the accessibility exit code.
- **`usabl-policy`** decides whether a change to a guarded policy file has the
  required code-owner approval of the current head. It reads policy and CODEOWNERS
  from the trusted base ref and never checks out pull request head.

Read the [shared setup and verdict reference](README.md) first. This plan needs the
GitHub CLI (`gh`) and push access to a fork or branch of `usabl-app`.

## Why the trust boundary matters

Policy, the evidence floor, and waivers are read from the trusted base ref through
git, not from the working tree of the pull request. That is what stops a pull request
from rewriting its own acceptance bytes and approving itself. The `usabl-policy` job
in particular never trusts head content: it resolves CODEOWNERS and the guarded-file
divergence from the base, and it requires a non-author owner to have approved the
exact head commit.

## Scope

- A regression pull request fails the checks and shows the Result in a comment.
- A repair push flips the comment and the checks to verified.
- A guarded policy edit requires code-owner approval of the head.
- The author cannot self-approve a policy change.
- Not covered fails honestly rather than passing.

## Preconditions

- Shared setup complete.
- You can push a branch to `usabl-app` and open a pull request against `main`.
- Branch protection makes `usabl-policy` a required check (for TC-CI-06).

## Test cases

### TC-CI-01: A regression pull request is blocked

**Steps:**
1. `git switch -C demo/team-accessibility-loop`
2. `npm run demo:break`
3. `git add src/demo/scenarios.ts && git commit -m "test: expose accessibility regressions"`
4. `git push -u origin demo/team-accessibility-loop`
5. `gh pr create --base main --title "test: rehearse accessibility proof loop"`
6. Open the pull request and watch the checks.

**Expected:** The `gate-comment` check fails on the accessibility exit code. A sticky
usabl comment shows `Regression` with the same eight findings the other surfaces
reported. The comment carries a marker so later pushes update it in place rather than
posting a new one.

- [ ] Pass

### TC-CI-02: A repair push clears the checks

**Steps:**
1. On the same branch, `npm run demo:repair`.
2. `git commit -am "fix: repair demo accessibility behavior"`
3. `git push`

**Expected:** The sticky comment updates to `Verified` and shows a receipt. Both
`gate-comment` and `usabl-policy` pass. Close the pull request without merging so the
`baseline-repaired` state stays available for the next rehearsal.

- [ ] Pass

### TC-CI-03: The verdict comes from the trusted engine, not head

**Objective:** Pull request head code cannot change the verdict.

**Steps:**
1. On a regression branch, also edit the fixture so it tries to weaken the check, for
   example change a value the app reads, then push.
2. Compare the sticky comment and checks to TC-CI-01.

**Expected:** The Result is unchanged: still `Regression`, still failing. The gate ran
from the pinned trusted engine checkout and read policy from the base ref, so head
content did not move the verdict.

- [ ] Pass

### TC-CI-04: A guarded policy edit requires owner approval

**Steps:**
1. `git switch -C demo/policy-change`
2. Edit a guarded file, for example add a route to `usabl.routes.json`.
3. Commit and push, then open a pull request.

**Expected:** The Result is `approval_required` and the `usabl-policy` check does not
pass until a CODEOWNERS owner, who is not the author, approves the current head
commit. The sticky comment states loudly that approval is required. CODEOWNERS for
these paths lists user logins only; an org-team entry fails closed.

- [ ] Pass

### TC-CI-05: The author cannot self-approve a policy change

**Steps:**
1. On the policy-change pull request from TC-CI-04, approve your own pull request.

**Expected:** `usabl-policy` still does not pass. The enforce-policy step counts only a
non-author owner's approval of the head SHA, so a self-review does not satisfy it. A
new commit also invalidates a prior approval, because approval is bound to the head
SHA.

- [ ] Pass

### TC-CI-06: Branch protection blocks the merge

**Objective:** The check has to be required for it to protect anything.

**Steps:**
1. With `usabl-policy` set as a required status check on `main`, open the regression
   pull request from TC-CI-01.
2. Attempt to merge.

**Expected:** GitHub blocks the merge until `usabl-policy` passes. This is the
difference between a check that reports and a gate that enforces.

- [ ] Pass

### TC-CI-07: Not covered fails honestly in CI

**Objective:** CI must not pass when a touched surface could not be checked.

**Steps:**
1. Push a change that touches an interface file the route map does not cover, so the
   engine cannot reach the affected screen in CI.
2. Open a pull request and watch `gate-comment`.

**Expected:** The Result is `not_covered` and the check fails rather than passing. The
comment states which surface was not covered. Fixing the route map or adding the
manual surface, then pushing, clears it.

- [ ] Pass

## Reset

```bash
git switch main
git checkout -- src/demo/scenarios.ts
```

Close any rehearsal pull requests without merging. Delete the demo branches when you
are done.

## Automated coverage

- `test/surfaces/policy-enforce.test.ts`: `enforce accessibility` exit-code echo and
  crash fail-closed; `enforce policy` CODEOWNERS-from-trusted-ref, the non-author and
  head-SHA approval rules, and the org-team fail-closed path.
- `test/surfaces/pr-comment.test.ts`: the sticky comment markdown, including the
  receipt and no-receipt cases, the loud approval-required banner, and the finding
  groups.
- `test/surfaces/integration.test.ts`: the gate and the pull request surface agree on
  the same verdict.
- `test/intake/trusted-config.test.ts`: trusted config resolution and fail-closed
  behavior.
