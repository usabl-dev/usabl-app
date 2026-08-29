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

## Branch protection is enforced

A repository ruleset named "Protect main" makes the gate binding on `main`. It is
active and lists no bypass actors, so it applies to everyone, including
administrators. The ruleset requires:

1. The `gate-comment` (accessibility scan) and `usabl-policy` (guarded-path and
   approval) status checks to pass before merging, with the strict setting so a
   branch must be up to date with `main` first.
2. A pull request before any change to `main`.
3. No force pushes and no branch deletion.

Guarded-path approval is enforced by the `usabl-policy` check, not by GitHub's
native code-owner review, so the ruleset itself sets no required review count.
usabl-policy reads CODEOWNERS from the trusted base ref and requires an owner
approval on the current head that is not the pull request author. A red check
blocks the merge, so the reported verdict is enforced, not advisory.

## Reporting

This is a demonstration fixture and is not a production service. Report any
issue with the gate configuration through the repository's normal review process.
