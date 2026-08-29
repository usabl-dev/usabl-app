# Security model

This repository is the usabl team fixture. It runs the usabl gate on itself, so
the gate configuration here is a working reference for how to wire usabl into a
real project. This document explains the trust model and the branch-protection
settings that make the gate binding.

## How the gate splits trusted and untrusted work

The `usabl-gate` workflow runs two jobs with different trust levels.

`gate-comment` runs the accessibility scan. The scan starts the fixture with
`npm run dev`, which executes the pull request's own code, including its Vite
config. Because that code is untrusted, this job runs only on the `pull_request`
event. A `pull_request` event from a fork receives a read-only token and no
repository secrets, so untrusted code never runs with secrets in scope.

`usabl-policy` decides the merge. It re-runs on `pull_request_review` so that a
CODEOWNERS approval or a dismissal can flip the gate. A review event runs in the
base repository's trust context and does carry secrets, so this job never checks
out or executes pull request head code. It checks out the trusted base commit,
fetches the head only as git objects, and decides from three trusted sources:

- the diff of guarded files between the trusted base ref and the head, read with
  `git show` and `git ls-tree` so no head code runs,
- the CODEOWNERS file read from the trusted base ref, not the head, and
- the pull request reviews from the GitHub API.

On a review event, `usabl-policy` consumes the accessibility Result produced by
the matching `pull_request` scan run. If no completed scan exists for that exact
head, it fails closed.

## The gate protects itself

A gate that anyone can edit in a pull request is not a gate. These paths are
listed in `usabl.config.json` under `guardedPaths`, and each has a matching owner
rule in `.github/CODEOWNERS`:

- `usabl.config.json`, `usabl.routes.json`, `.usabl-evidence.json`,
  `.usabl-waivers.json`: the policy and evidence ledgers.
- `.github/workflows`: the gate workflow itself, guarded as a directory so a
  newly added workflow file is caught, not only edits to the existing one.
- `.github/CODEOWNERS`: the ownership map that decides who can approve the paths
  above.

When a pull request changes any guarded file, `usabl-policy` requires a review
from a CODEOWNERS user on the current head. Two properties make this hard to
bypass:

- The guarded-path list and the CODEOWNERS file are both read from the trusted
  base ref. A pull request cannot shrink `guardedPaths` or add itself to
  CODEOWNERS to escape review.
- The pull request author's own approval never counts. A guarded change needs a
  second owner, so no single person can push policy changes past the gate.

## Making the gate binding with branch protection

The workflow reports status, but GitHub only blocks a merge when branch
protection requires it. To make the gate enforcing on `main`:

1. Enable branch protection on `main`.
2. Require these status checks to pass before merging:
   - `gate-comment` (the accessibility scan)
   - `usabl-policy` (the guarded-path and approval check)
3. Require a pull request before merging, and require review from Code Owners.
4. Do not allow force pushes or branch deletion.
5. Include administrators, so the gate applies to everyone.

Until branch protection is enabled the checks are advisory: they run and report,
but a red check does not block a merge. Enabling branch protection is the step
that turns the reported verdict into an enforced one.

## Reporting

This is a demonstration fixture and is not a production service. Report any
issue with the gate configuration through the repository's normal review process.
